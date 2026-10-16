//! A pooled client that reports each query to Sentry as a `db.prepare` span
//! followed by a `db` span for its execution.

use std::future::Future;
use std::sync::Mutex;

use cornucopia::client::GenericClient;
use deadpool_postgres::{Client, ClientWrapper, Object, Pool, PoolError};
use sentry::protocol::SpanStatus;
use tokio_postgres::types::{BorrowToSql, ToSql};
use tokio_postgres::{Client as PgClient, Error, Row, RowStream, Statement, ToStatement};

pub struct Db {
    client: Client,
    /// `Statement` doesn't expose its SQL, so `prepare`, which the generated
    /// queries call right before executing, keeps it for the `db` span.
    sql: Mutex<Option<String>>,
}

impl Db {
    /// Spans the checkout so time spent waiting on the pool or opening a
    /// connection isn't hidden in the parent span.
    pub async fn get(pool: &Pool) -> Result<Self, PoolError> {
        let span = sentry::configure_scope(|scope| scope.get_span())
            .map(|parent| parent.start_child("db.connection", "pool.get"));
        let result = pool.get().await;
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
        Ok(Self {
            client: result?,
            sql: Mutex::new(None),
        })
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

impl GenericClient for Db {
    fn stmt_cache() -> bool {
        true
    }
    async fn prepare(&self, query: &str) -> Result<Statement, Error> {
        let span = Self::start_span("db.prepare", query);
        let cache = &self.client.statement_cache;
        let cache_size = cache.size();
        let result = ClientWrapper::prepare_cached(&self.client, query).await;
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
        self.traced(PgClient::execute(&self.client, query, params))
            .await
    }
    async fn query_one<T>(
        &self,
        statement: &T,
        params: &[&(dyn ToSql + Sync)],
    ) -> Result<Row, Error>
    where
        T: ?Sized + ToStatement + Sync + Send,
    {
        self.traced(PgClient::query_one(&self.client, statement, params))
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
        self.traced(PgClient::query_opt(&self.client, statement, params))
            .await
    }
    async fn query<T>(&self, query: &T, params: &[&(dyn ToSql + Sync)]) -> Result<Vec<Row>, Error>
    where
        T: ?Sized + ToStatement + Sync + Send,
    {
        self.traced(PgClient::query(&self.client, query, params))
            .await
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
        self.traced(PgClient::query_raw(&self.client, statement, params))
            .await
    }
}
