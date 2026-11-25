//! A pooled client, or a transaction on one, that reports each query to Sentry
//! as a `db.prepare` span followed by a `db` span for its execution.

use std::future::Future;
use std::sync::Mutex;

use cornucopia::client::GenericClient;
use deadpool_postgres::{Client, Object, Pool, PoolError, StatementCache, Transaction};
use sentry::protocol::SpanStatus;
use tokio_postgres::types::{BorrowToSql, ToSql};
use tokio_postgres::{
    Client as PgClient, Error, GenericClient as PgGenericClient, Row, RowStream, Statement,
    ToStatement, Transaction as PgTransaction,
};

/// Hands out [`Db`] clients so handlers keep calling `state.pool.get()`.
#[derive(Clone)]
pub struct DbPool(Pool);

impl DbPool {
    pub fn new(pool: Pool) -> Self {
        Self(pool)
    }

    /// The underlying pool, for checks like `/readiness` that shouldn't add
    /// spans.
    pub fn untraced(&self) -> &Pool {
        &self.0
    }

    /// Spans the checkout so time spent waiting on the pool or opening a
    /// connection isn't hidden in the parent span.
    pub async fn get(&self) -> Result<Db, PoolError> {
        let span = sentry::configure_scope(|scope| scope.get_span())
            .map(|parent| parent.start_child("db.connection", "pool.get"));
        let result = self.0.get().await;
        if let Some(span) = span {
            match &result {
                Ok(client) => {
                    // Deadpool counts recycles, so 0 means the pool opened
                    // this connection for us.
                    let new = Object::metrics(client).recycle_count == 0;
                    span.set_data("db.connection.new", new.into());
                    span.set_status(SpanStatus::Ok);
                }
                Err(_) => span.set_status(SpanStatus::InternalError),
            }
            span.finish();
        }
        Ok(Traced::new(result?))
    }
}

pub type Db = Traced<Client>;
pub type DbTransaction<'a> = Traced<Transaction<'a>>;

/// What [`Traced`] needs from a pooled client or a transaction.
pub trait Conn: Send + Sync {
    type Pg: PgGenericClient + Sync;
    fn pg(&self) -> &Self::Pg;
    fn statement_cache(&self) -> &StatementCache;
}

impl Conn for Client {
    type Pg = PgClient;
    fn pg(&self) -> &PgClient {
        self
    }
    fn statement_cache(&self) -> &StatementCache {
        &self.statement_cache
    }
}

impl<'a> Conn for Transaction<'a> {
    type Pg = PgTransaction<'a>;
    fn pg(&self) -> &PgTransaction<'a> {
        self
    }
    fn statement_cache(&self) -> &StatementCache {
        &self.statement_cache
    }
}

pub struct Traced<C> {
    conn: C,
    /// `Statement` doesn't expose its SQL, so `prepare`, which the generated
    /// queries call right before executing, keeps it for the `db` span.
    sql: Mutex<Option<String>>,
}

impl Db {
    /// Rolls back when dropped without calling [`Traced::commit`].
    pub async fn transaction(&mut self) -> Result<DbTransaction<'_>, Error> {
        let span = Self::start_span("db", "BEGIN");
        let result = self.conn.transaction().await;
        Self::finish_span(span, &result);
        Ok(Traced::new(result?))
    }
}

impl DbTransaction<'_> {
    pub async fn commit(self) -> Result<(), Error> {
        let span = Self::start_span("db", "COMMIT");
        let result = self.conn.commit().await;
        Self::finish_span(span, &result);
        result
    }
}

impl<C> Traced<C> {
    fn new(conn: C) -> Self {
        Self {
            conn,
            sql: Mutex::new(None),
        }
    }

    fn start_span(op: &str, sql: &str) -> Option<sentry::Span> {
        let parent = sentry::configure_scope(|scope| scope.get_span())?;
        let span = parent.start_child(op, sql);
        span.set_data("db.system", "postgresql".into());
        Some(span)
    }

    fn finish_span<T>(span: Option<sentry::Span>, result: &Result<T, Error>) {
        let Some(span) = span else { return };
        span.set_status(if result.is_ok() {
            SpanStatus::Ok
        } else {
            SpanStatus::InternalError
        });
        span.finish();
    }

    async fn traced<T>(&self, query: impl Future<Output = Result<T, Error>>) -> Result<T, Error> {
        let sql = self.sql.lock().unwrap().take();
        let span = Self::start_span("db", sql.as_deref().unwrap_or("unknown query"));
        let result = query.await;
        Self::finish_span(span, &result);
        result
    }
}

impl<C: Conn> GenericClient for Traced<C> {
    fn stmt_cache() -> bool {
        true
    }
    async fn prepare(&self, query: &str) -> Result<Statement, Error> {
        let span = Self::start_span("db.prepare", query);
        let cache = self.conn.statement_cache();
        let cache_size = cache.size();
        let result = cache.prepare(self.conn.pg().client(), query).await;
        if let Some(span) = &span {
            // A miss adds the statement, which takes a round trip to Postgres.
            span.set_data("db.prepare.cached", (cache.size() == cache_size).into());
        }
        Self::finish_span(span, &result);
        if result.is_ok() {
            *self.sql.lock().unwrap() = Some(query.to_owned());
        }
        result
    }
    async fn execute<T>(&self, query: &T, params: &[&(dyn ToSql + Sync)]) -> Result<u64, Error>
    where
        T: ?Sized + ToStatement + Sync + Send,
    {
        self.traced(self.conn.pg().execute(query, params)).await
    }
    async fn query_one<T>(
        &self,
        statement: &T,
        params: &[&(dyn ToSql + Sync)],
    ) -> Result<Row, Error>
    where
        T: ?Sized + ToStatement + Sync + Send,
    {
        self.traced(self.conn.pg().query_one(statement, params))
            .await
    }
    async fn query_opt<T>(
        &self,
        statement: &T,
        params: &[&(dyn ToSql + Sync)],
    ) -> Result<Option<Row>, Error>
    where
        T: ?Sized + ToStatement + Sync + Send,
    {
        self.traced(self.conn.pg().query_opt(statement, params))
            .await
    }
    async fn query<T>(&self, query: &T, params: &[&(dyn ToSql + Sync)]) -> Result<Vec<Row>, Error>
    where
        T: ?Sized + ToStatement + Sync + Send,
    {
        self.traced(self.conn.pg().query(query, params)).await
    }
    /// The span ends once the first response arrives, not when the stream is
    /// drained, so it undercounts for large result sets.
    async fn query_raw<T, I>(&self, statement: &T, params: I) -> Result<RowStream, Error>
    where
        T: ?Sized + ToStatement + Sync + Send,
        I: IntoIterator + Sync + Send,
        I::IntoIter: ExactSizeIterator,
        I::Item: BorrowToSql,
    {
        self.traced(self.conn.pg().query_raw(statement, params))
            .await
    }
}
