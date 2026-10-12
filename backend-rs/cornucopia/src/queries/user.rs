// This file was generated with `cornucopia`. Do not modify.

#[derive(Debug, Clone, PartialEq, Copy)]
pub struct SessionUser {
    pub id: i32,
    pub schedule_team_id: Option<i32>,
    pub pinned_calendar_id: Option<i32>,
}
use crate::client::async_::GenericClient;
use futures::{self, StreamExt, TryStreamExt};
pub struct SessionUserQuery<'c, 'a, 's, C: GenericClient, T, const N: usize> {
    client: &'c C,
    params: [&'a (dyn postgres_types::ToSql + Sync); N],
    query: &'static str,
    cached: Option<&'s tokio_postgres::Statement>,
    extractor: fn(&tokio_postgres::Row) -> Result<SessionUser, tokio_postgres::Error>,
    mapper: fn(SessionUser) -> T,
}
impl<'c, 'a, 's, C, T: 'c, const N: usize> SessionUserQuery<'c, 'a, 's, C, T, N>
where
    C: GenericClient,
{
    pub fn map<R>(self, mapper: fn(SessionUser) -> R) -> SessionUserQuery<'c, 'a, 's, C, R, N> {
        SessionUserQuery {
            client: self.client,
            params: self.params,
            query: self.query,
            cached: self.cached,
            extractor: self.extractor,
            mapper,
        }
    }
    pub async fn one(self) -> Result<T, tokio_postgres::Error> {
        let row =
            crate::client::async_::one(self.client, self.query, &self.params, self.cached).await?;
        Ok((self.mapper)((self.extractor)(&row)?))
    }
    pub async fn all(self) -> Result<Vec<T>, tokio_postgres::Error> {
        self.iter().await?.try_collect().await
    }
    pub async fn opt(self) -> Result<Option<T>, tokio_postgres::Error> {
        let opt_row =
            crate::client::async_::opt(self.client, self.query, &self.params, self.cached).await?;
        Ok(opt_row
            .map(|row| {
                let extracted = (self.extractor)(&row)?;
                Ok((self.mapper)(extracted))
            })
            .transpose()?)
    }
    pub async fn iter(
        self,
    ) -> Result<
        impl futures::Stream<Item = Result<T, tokio_postgres::Error>> + 'c,
        tokio_postgres::Error,
    > {
        let stream = crate::client::async_::raw(
            self.client,
            self.query,
            crate::slice_iter(&self.params),
            self.cached,
        )
        .await?;
        let mapped = stream
            .map(move |res| {
                res.and_then(|row| {
                    let extracted = (self.extractor)(&row)?;
                    Ok((self.mapper)(extracted))
                })
            })
            .into_stream();
        Ok(mapped)
    }
}
pub struct SessionUserStmt(&'static str, Option<tokio_postgres::Statement>);
pub fn session_user() -> SessionUserStmt {
    SessionUserStmt(
        "SELECT u.id, u.schedule_team_id, u.pinned_calendar_id FROM user_sessions_session s JOIN core_myuser u ON u.id = s.user_id WHERE s.session_key = $1 AND s.expire_date > now()",
        None,
    )
}
impl SessionUserStmt {
    pub async fn prepare<'a, C: GenericClient>(
        mut self,
        client: &'a C,
    ) -> Result<Self, tokio_postgres::Error> {
        self.1 = Some(client.prepare(self.0).await?);
        Ok(self)
    }
    pub fn bind<'c, 'a, 's, C: GenericClient, T1: crate::StringSql>(
        &'s self,
        client: &'c C,
        session_key: &'a T1,
    ) -> SessionUserQuery<'c, 'a, 's, C, SessionUser, 1> {
        SessionUserQuery {
            client,
            params: [session_key],
            query: self.0,
            cached: self.1.as_ref(),
            extractor: |row: &tokio_postgres::Row| -> Result<SessionUser, tokio_postgres::Error> {
                Ok(SessionUser {
                    id: row.try_get(0)?,
                    schedule_team_id: row.try_get(1)?,
                    pinned_calendar_id: row.try_get(2)?,
                })
            },
            mapper: |it| SessionUser::from(it),
        }
    }
}
