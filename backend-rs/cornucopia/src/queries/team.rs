// This file was generated with `cornucopia`. Do not modify.

#[derive(Clone, Copy, Debug)]
pub struct IsActiveMemberParams {
    pub team_id: i32,
    pub user_id: i32,
}
use crate::client::async_::GenericClient;
use futures::{self, StreamExt, TryStreamExt};
pub struct BoolQuery<'c, 'a, 's, C: GenericClient, T, const N: usize> {
    client: &'c C,
    params: [&'a (dyn postgres_types::ToSql + Sync); N],
    query: &'static str,
    cached: Option<&'s tokio_postgres::Statement>,
    extractor: fn(&tokio_postgres::Row) -> Result<bool, tokio_postgres::Error>,
    mapper: fn(bool) -> T,
}
impl<'c, 'a, 's, C, T: 'c, const N: usize> BoolQuery<'c, 'a, 's, C, T, N>
where
    C: GenericClient,
{
    pub fn map<R>(self, mapper: fn(bool) -> R) -> BoolQuery<'c, 'a, 's, C, R, N> {
        BoolQuery {
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
pub struct IsActiveMemberStmt(&'static str, Option<tokio_postgres::Statement>);
pub fn is_active_member() -> IsActiveMemberStmt {
    IsActiveMemberStmt(
        "SELECT EXISTS ( SELECT 1 FROM core_team t JOIN core_membership m ON m.team_id = t.id WHERE t.id = $1 AND m.user_id = $2 AND m.is_active )",
        None,
    )
}
impl IsActiveMemberStmt {
    pub async fn prepare<'a, C: GenericClient>(
        mut self,
        client: &'a C,
    ) -> Result<Self, tokio_postgres::Error> {
        self.1 = Some(client.prepare(self.0).await?);
        Ok(self)
    }
    pub fn bind<'c, 'a, 's, C: GenericClient>(
        &'s self,
        client: &'c C,
        team_id: &'a i32,
        user_id: &'a i32,
    ) -> BoolQuery<'c, 'a, 's, C, bool, 2> {
        BoolQuery {
            client,
            params: [team_id, user_id],
            query: self.0,
            cached: self.1.as_ref(),
            extractor: |row| Ok(row.try_get(0)?),
            mapper: |it| it,
        }
    }
}
impl<'c, 'a, 's, C: GenericClient>
    crate::client::async_::Params<
        'c,
        'a,
        's,
        IsActiveMemberParams,
        BoolQuery<'c, 'a, 's, C, bool, 2>,
        C,
    > for IsActiveMemberStmt
{
    fn params(
        &'s self,
        client: &'c C,
        params: &'a IsActiveMemberParams,
    ) -> BoolQuery<'c, 'a, 's, C, bool, 2> {
        self.bind(client, &params.team_id, &params.user_id)
    }
}
