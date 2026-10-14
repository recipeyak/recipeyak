// This file was generated with `cornucopia`. Do not modify.

#[derive(Clone, Copy, Debug)]
pub struct CalendarSettingsParams {
    pub team_id: i32,
    pub user_id: i32,
}
#[derive(Clone, Copy, Debug)]
pub struct UpdateCalendarSyncEnabledParams {
    pub sync_enabled: bool,
    pub team_id: i32,
    pub user_id: i32,
}
#[derive(Debug)]
pub struct UpdateCalendarSecretKeyParams<T1: crate::StringSql> {
    pub secret_key: T1,
    pub team_id: i32,
    pub user_id: i32,
}
#[derive(Debug, Clone, PartialEq)]
pub struct CalendarSettings {
    pub calendar_sync_enabled: bool,
    pub calendar_secret_key: String,
}
pub struct CalendarSettingsBorrowed<'a> {
    pub calendar_sync_enabled: bool,
    pub calendar_secret_key: &'a str,
}
impl<'a> From<CalendarSettingsBorrowed<'a>> for CalendarSettings {
    fn from(
        CalendarSettingsBorrowed {
            calendar_sync_enabled,
            calendar_secret_key,
        }: CalendarSettingsBorrowed<'a>,
    ) -> Self {
        Self {
            calendar_sync_enabled,
            calendar_secret_key: calendar_secret_key.into(),
        }
    }
}
use crate::client::async_::GenericClient;
use futures::{self, StreamExt, TryStreamExt};
pub struct CalendarSettingsQuery<'c, 'a, 's, C: GenericClient, T, const N: usize> {
    client: &'c C,
    params: [&'a (dyn postgres_types::ToSql + Sync); N],
    query: &'static str,
    cached: Option<&'s tokio_postgres::Statement>,
    extractor: fn(&tokio_postgres::Row) -> Result<CalendarSettingsBorrowed, tokio_postgres::Error>,
    mapper: fn(CalendarSettingsBorrowed) -> T,
}
impl<'c, 'a, 's, C, T: 'c, const N: usize> CalendarSettingsQuery<'c, 'a, 's, C, T, N>
where
    C: GenericClient,
{
    pub fn map<R>(
        self,
        mapper: fn(CalendarSettingsBorrowed) -> R,
    ) -> CalendarSettingsQuery<'c, 'a, 's, C, R, N> {
        CalendarSettingsQuery {
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
pub struct CalendarSettingsStmt(&'static str, Option<tokio_postgres::Statement>);
pub fn calendar_settings() -> CalendarSettingsStmt {
    CalendarSettingsStmt(
        "SELECT calendar_sync_enabled, calendar_secret_key FROM core_membership WHERE team_id = $1 AND user_id = $2",
        None,
    )
}
impl CalendarSettingsStmt {
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
    ) -> CalendarSettingsQuery<'c, 'a, 's, C, CalendarSettings, 2> {
        CalendarSettingsQuery {
            client,
            params: [team_id, user_id],
            query: self.0,
            cached: self.1.as_ref(),
            extractor: |
                row: &tokio_postgres::Row,
            | -> Result<CalendarSettingsBorrowed, tokio_postgres::Error> {
                Ok(CalendarSettingsBorrowed {
                    calendar_sync_enabled: row.try_get(0)?,
                    calendar_secret_key: row.try_get(1)?,
                })
            },
            mapper: |it| CalendarSettings::from(it),
        }
    }
}
impl<'c, 'a, 's, C: GenericClient>
    crate::client::async_::Params<
        'c,
        'a,
        's,
        CalendarSettingsParams,
        CalendarSettingsQuery<'c, 'a, 's, C, CalendarSettings, 2>,
        C,
    > for CalendarSettingsStmt
{
    fn params(
        &'s self,
        client: &'c C,
        params: &'a CalendarSettingsParams,
    ) -> CalendarSettingsQuery<'c, 'a, 's, C, CalendarSettings, 2> {
        self.bind(client, &params.team_id, &params.user_id)
    }
}
pub struct UpdateCalendarSyncEnabledStmt(&'static str, Option<tokio_postgres::Statement>);
pub fn update_calendar_sync_enabled() -> UpdateCalendarSyncEnabledStmt {
    UpdateCalendarSyncEnabledStmt(
        "UPDATE core_membership SET calendar_sync_enabled = $1, modified = now() WHERE team_id = $2 AND user_id = $3 RETURNING calendar_sync_enabled, calendar_secret_key",
        None,
    )
}
impl UpdateCalendarSyncEnabledStmt {
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
        sync_enabled: &'a bool,
        team_id: &'a i32,
        user_id: &'a i32,
    ) -> CalendarSettingsQuery<'c, 'a, 's, C, CalendarSettings, 3> {
        CalendarSettingsQuery {
            client,
            params: [sync_enabled, team_id, user_id],
            query: self.0,
            cached: self.1.as_ref(),
            extractor: |
                row: &tokio_postgres::Row,
            | -> Result<CalendarSettingsBorrowed, tokio_postgres::Error> {
                Ok(CalendarSettingsBorrowed {
                    calendar_sync_enabled: row.try_get(0)?,
                    calendar_secret_key: row.try_get(1)?,
                })
            },
            mapper: |it| CalendarSettings::from(it),
        }
    }
}
impl<'c, 'a, 's, C: GenericClient>
    crate::client::async_::Params<
        'c,
        'a,
        's,
        UpdateCalendarSyncEnabledParams,
        CalendarSettingsQuery<'c, 'a, 's, C, CalendarSettings, 3>,
        C,
    > for UpdateCalendarSyncEnabledStmt
{
    fn params(
        &'s self,
        client: &'c C,
        params: &'a UpdateCalendarSyncEnabledParams,
    ) -> CalendarSettingsQuery<'c, 'a, 's, C, CalendarSettings, 3> {
        self.bind(
            client,
            &params.sync_enabled,
            &params.team_id,
            &params.user_id,
        )
    }
}
pub struct UpdateCalendarSecretKeyStmt(&'static str, Option<tokio_postgres::Statement>);
pub fn update_calendar_secret_key() -> UpdateCalendarSecretKeyStmt {
    UpdateCalendarSecretKeyStmt(
        "UPDATE core_membership SET calendar_secret_key = $1, modified = now() WHERE team_id = $2 AND user_id = $3 RETURNING calendar_sync_enabled, calendar_secret_key",
        None,
    )
}
impl UpdateCalendarSecretKeyStmt {
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
        secret_key: &'a T1,
        team_id: &'a i32,
        user_id: &'a i32,
    ) -> CalendarSettingsQuery<'c, 'a, 's, C, CalendarSettings, 3> {
        CalendarSettingsQuery {
            client,
            params: [secret_key, team_id, user_id],
            query: self.0,
            cached: self.1.as_ref(),
            extractor: |
                row: &tokio_postgres::Row,
            | -> Result<CalendarSettingsBorrowed, tokio_postgres::Error> {
                Ok(CalendarSettingsBorrowed {
                    calendar_sync_enabled: row.try_get(0)?,
                    calendar_secret_key: row.try_get(1)?,
                })
            },
            mapper: |it| CalendarSettings::from(it),
        }
    }
}
impl<'c, 'a, 's, C: GenericClient, T1: crate::StringSql>
    crate::client::async_::Params<
        'c,
        'a,
        's,
        UpdateCalendarSecretKeyParams<T1>,
        CalendarSettingsQuery<'c, 'a, 's, C, CalendarSettings, 3>,
        C,
    > for UpdateCalendarSecretKeyStmt
{
    fn params(
        &'s self,
        client: &'c C,
        params: &'a UpdateCalendarSecretKeyParams<T1>,
    ) -> CalendarSettingsQuery<'c, 'a, 's, C, CalendarSettings, 3> {
        self.bind(client, &params.secret_key, &params.team_id, &params.user_id)
    }
}
