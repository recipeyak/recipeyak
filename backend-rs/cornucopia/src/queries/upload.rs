// This file was generated with `cornucopia`. Do not modify.

#[derive(Debug)]
pub struct InsertUploadParams<T1: crate::StringSql, T2: crate::StringSql, T3: crate::StringSql> {
    pub created_by_id: i32,
    pub bucket: T1,
    pub key: T2,
    pub recipe_id: Option<i32>,
    pub profile_id: Option<i32>,
    pub content_type: T3,
}
#[derive(Clone, Copy, Debug)]
pub struct CompleteUploadParams {
    pub id: i32,
    pub user_id: i32,
}
#[derive(Clone, Copy, Debug)]
pub struct SetProfileUploadParams {
    pub upload_id: i32,
    pub user_id: i32,
}
#[derive(Debug, Clone, PartialEq)]
pub struct CompleteUpload {
    pub id: i32,
    pub key: String,
    pub content_type: String,
    pub profile_id: Option<i32>,
}
pub struct CompleteUploadBorrowed<'a> {
    pub id: i32,
    pub key: &'a str,
    pub content_type: &'a str,
    pub profile_id: Option<i32>,
}
impl<'a> From<CompleteUploadBorrowed<'a>> for CompleteUpload {
    fn from(
        CompleteUploadBorrowed {
            id,
            key,
            content_type,
            profile_id,
        }: CompleteUploadBorrowed<'a>,
    ) -> Self {
        Self {
            id,
            key: key.into(),
            content_type: content_type.into(),
            profile_id,
        }
    }
}
use crate::client::async_::GenericClient;
use futures::{self, StreamExt, TryStreamExt};
pub struct I32Query<'c, 'a, 's, C: GenericClient, T, const N: usize> {
    client: &'c C,
    params: [&'a (dyn postgres_types::ToSql + Sync); N],
    query: &'static str,
    cached: Option<&'s tokio_postgres::Statement>,
    extractor: fn(&tokio_postgres::Row) -> Result<i32, tokio_postgres::Error>,
    mapper: fn(i32) -> T,
}
impl<'c, 'a, 's, C, T: 'c, const N: usize> I32Query<'c, 'a, 's, C, T, N>
where
    C: GenericClient,
{
    pub fn map<R>(self, mapper: fn(i32) -> R) -> I32Query<'c, 'a, 's, C, R, N> {
        I32Query {
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
pub struct CompleteUploadQuery<'c, 'a, 's, C: GenericClient, T, const N: usize> {
    client: &'c C,
    params: [&'a (dyn postgres_types::ToSql + Sync); N],
    query: &'static str,
    cached: Option<&'s tokio_postgres::Statement>,
    extractor: fn(&tokio_postgres::Row) -> Result<CompleteUploadBorrowed, tokio_postgres::Error>,
    mapper: fn(CompleteUploadBorrowed) -> T,
}
impl<'c, 'a, 's, C, T: 'c, const N: usize> CompleteUploadQuery<'c, 'a, 's, C, T, N>
where
    C: GenericClient,
{
    pub fn map<R>(
        self,
        mapper: fn(CompleteUploadBorrowed) -> R,
    ) -> CompleteUploadQuery<'c, 'a, 's, C, R, N> {
        CompleteUploadQuery {
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
pub struct InsertUploadStmt(&'static str, Option<tokio_postgres::Statement>);
/// CommonInfo's `created` default and `modified` auto_now are set by Django,
/// not the database.
pub fn insert_upload() -> InsertUploadStmt {
    InsertUploadStmt(
        "INSERT INTO core_upload (created_by_id, bucket, key, recipe_id, profile_id, content_type, completed, created, modified) VALUES ($1, $2, $3, $4, $5, $6, false, now(), now()) RETURNING id",
        None,
    )
}
impl InsertUploadStmt {
    pub async fn prepare<'a, C: GenericClient>(
        mut self,
        client: &'a C,
    ) -> Result<Self, tokio_postgres::Error> {
        self.1 = Some(client.prepare(self.0).await?);
        Ok(self)
    }
    pub fn bind<
        'c,
        'a,
        's,
        C: GenericClient,
        T1: crate::StringSql,
        T2: crate::StringSql,
        T3: crate::StringSql,
    >(
        &'s self,
        client: &'c C,
        created_by_id: &'a i32,
        bucket: &'a T1,
        key: &'a T2,
        recipe_id: &'a Option<i32>,
        profile_id: &'a Option<i32>,
        content_type: &'a T3,
    ) -> I32Query<'c, 'a, 's, C, i32, 6> {
        I32Query {
            client,
            params: [
                created_by_id,
                bucket,
                key,
                recipe_id,
                profile_id,
                content_type,
            ],
            query: self.0,
            cached: self.1.as_ref(),
            extractor: |row| Ok(row.try_get(0)?),
            mapper: |it| it,
        }
    }
}
impl<'c, 'a, 's, C: GenericClient, T1: crate::StringSql, T2: crate::StringSql, T3: crate::StringSql>
    crate::client::async_::Params<
        'c,
        'a,
        's,
        InsertUploadParams<T1, T2, T3>,
        I32Query<'c, 'a, 's, C, i32, 6>,
        C,
    > for InsertUploadStmt
{
    fn params(
        &'s self,
        client: &'c C,
        params: &'a InsertUploadParams<T1, T2, T3>,
    ) -> I32Query<'c, 'a, 's, C, i32, 6> {
        self.bind(
            client,
            &params.created_by_id,
            &params.bucket,
            &params.key,
            &params.recipe_id,
            &params.profile_id,
            &params.content_type,
        )
    }
}
pub struct CompleteUploadStmt(&'static str, Option<tokio_postgres::Statement>);
pub fn complete_upload() -> CompleteUploadStmt {
    CompleteUploadStmt(
        "UPDATE core_upload SET completed = true, modified = now() WHERE id = $1 AND created_by_id = $2 RETURNING id, key, content_type, profile_id",
        None,
    )
}
impl CompleteUploadStmt {
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
        id: &'a i32,
        user_id: &'a i32,
    ) -> CompleteUploadQuery<'c, 'a, 's, C, CompleteUpload, 2> {
        CompleteUploadQuery {
            client,
            params: [id, user_id],
            query: self.0,
            cached: self.1.as_ref(),
            extractor: |
                row: &tokio_postgres::Row,
            | -> Result<CompleteUploadBorrowed, tokio_postgres::Error> {
                Ok(CompleteUploadBorrowed {
                    id: row.try_get(0)?,
                    key: row.try_get(1)?,
                    content_type: row.try_get(2)?,
                    profile_id: row.try_get(3)?,
                })
            },
            mapper: |it| CompleteUpload::from(it),
        }
    }
}
impl<'c, 'a, 's, C: GenericClient>
    crate::client::async_::Params<
        'c,
        'a,
        's,
        CompleteUploadParams,
        CompleteUploadQuery<'c, 'a, 's, C, CompleteUpload, 2>,
        C,
    > for CompleteUploadStmt
{
    fn params(
        &'s self,
        client: &'c C,
        params: &'a CompleteUploadParams,
    ) -> CompleteUploadQuery<'c, 'a, 's, C, CompleteUpload, 2> {
        self.bind(client, &params.id, &params.user_id)
    }
}
pub struct SetProfileUploadStmt(&'static str, Option<tokio_postgres::Statement>);
pub fn set_profile_upload() -> SetProfileUploadStmt {
    SetProfileUploadStmt(
        "UPDATE core_myuser SET profile_upload_id = $1, last_updated = current_date WHERE id = $2",
        None,
    )
}
impl SetProfileUploadStmt {
    pub async fn prepare<'a, C: GenericClient>(
        mut self,
        client: &'a C,
    ) -> Result<Self, tokio_postgres::Error> {
        self.1 = Some(client.prepare(self.0).await?);
        Ok(self)
    }
    pub async fn bind<'c, 'a, 's, C: GenericClient>(
        &'s self,
        client: &'c C,
        upload_id: &'a i32,
        user_id: &'a i32,
    ) -> Result<u64, tokio_postgres::Error> {
        client.execute(self.0, &[upload_id, user_id]).await
    }
}
impl<'a, C: GenericClient + Send + Sync>
    crate::client::async_::Params<
        'a,
        'a,
        'a,
        SetProfileUploadParams,
        std::pin::Pin<
            Box<dyn futures::Future<Output = Result<u64, tokio_postgres::Error>> + Send + 'a>,
        >,
        C,
    > for SetProfileUploadStmt
{
    fn params(
        &'a self,
        client: &'a C,
        params: &'a SetProfileUploadParams,
    ) -> std::pin::Pin<
        Box<dyn futures::Future<Output = Result<u64, tokio_postgres::Error>> + Send + 'a>,
    > {
        Box::pin(self.bind(client, &params.upload_id, &params.user_id))
    }
}
