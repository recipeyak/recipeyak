// This file was generated with `cornucopia`. Do not modify.

#[derive(Debug, Clone, PartialEq, Copy)]
pub struct SessionUser {
    pub id: i32,
    pub schedule_team_id: Option<i32>,
    pub pinned_calendar_id: Option<i32>,
}
#[derive(Debug, Clone, PartialEq)]
pub struct UserDetail {
    pub id: i32,
    pub name: Option<String>,
    pub email: String,
    pub theme_day: String,
    pub theme_night: String,
    pub theme_mode: String,
    pub schedule_team_id: Option<i32>,
    pub pinned_calendar_id: Option<i32>,
    pub profile_upload_key: Option<String>,
}
pub struct UserDetailBorrowed<'a> {
    pub id: i32,
    pub name: Option<&'a str>,
    pub email: &'a str,
    pub theme_day: &'a str,
    pub theme_night: &'a str,
    pub theme_mode: &'a str,
    pub schedule_team_id: Option<i32>,
    pub pinned_calendar_id: Option<i32>,
    pub profile_upload_key: Option<&'a str>,
}
impl<'a> From<UserDetailBorrowed<'a>> for UserDetail {
    fn from(
        UserDetailBorrowed {
            id,
            name,
            email,
            theme_day,
            theme_night,
            theme_mode,
            schedule_team_id,
            pinned_calendar_id,
            profile_upload_key,
        }: UserDetailBorrowed<'a>,
    ) -> Self {
        Self {
            id,
            name: name.map(|v| v.into()),
            email: email.into(),
            theme_day: theme_day.into(),
            theme_night: theme_night.into(),
            theme_mode: theme_mode.into(),
            schedule_team_id,
            pinned_calendar_id,
            profile_upload_key: profile_upload_key.map(|v| v.into()),
        }
    }
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
pub struct UserDetailQuery<'c, 'a, 's, C: GenericClient, T, const N: usize> {
    client: &'c C,
    params: [&'a (dyn postgres_types::ToSql + Sync); N],
    query: &'static str,
    cached: Option<&'s tokio_postgres::Statement>,
    extractor: fn(&tokio_postgres::Row) -> Result<UserDetailBorrowed, tokio_postgres::Error>,
    mapper: fn(UserDetailBorrowed) -> T,
}
impl<'c, 'a, 's, C, T: 'c, const N: usize> UserDetailQuery<'c, 'a, 's, C, T, N>
where
    C: GenericClient,
{
    pub fn map<R>(
        self,
        mapper: fn(UserDetailBorrowed) -> R,
    ) -> UserDetailQuery<'c, 'a, 's, C, R, N> {
        UserDetailQuery {
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
pub struct UserDetailStmt(&'static str, Option<tokio_postgres::Statement>);
/// The fields of `serialize_user`, with `select_related("profile_upload")`.
pub fn user_detail() -> UserDetailStmt {
    UserDetailStmt(
        "SELECT u.id, u.name, u.email::text AS email, u.theme AS theme_day, u.theme_night, u.theme_mode, u.schedule_team_id, u.pinned_calendar_id, profile.key AS profile_upload_key FROM core_myuser u LEFT JOIN core_upload profile ON profile.id = u.profile_upload_id WHERE u.id = $1",
        None,
    )
}
impl UserDetailStmt {
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
        user_id: &'a i32,
    ) -> UserDetailQuery<'c, 'a, 's, C, UserDetail, 1> {
        UserDetailQuery {
            client,
            params: [user_id],
            query: self.0,
            cached: self.1.as_ref(),
            extractor:
                |row: &tokio_postgres::Row| -> Result<UserDetailBorrowed, tokio_postgres::Error> {
                    Ok(UserDetailBorrowed {
                        id: row.try_get(0)?,
                        name: row.try_get(1)?,
                        email: row.try_get(2)?,
                        theme_day: row.try_get(3)?,
                        theme_night: row.try_get(4)?,
                        theme_mode: row.try_get(5)?,
                        schedule_team_id: row.try_get(6)?,
                        pinned_calendar_id: row.try_get(7)?,
                        profile_upload_key: row.try_get(8)?,
                    })
                },
            mapper: |it| UserDetail::from(it),
        }
    }
}
