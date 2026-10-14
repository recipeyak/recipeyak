// This file was generated with `cornucopia`. Do not modify.

#[derive(Clone, Copy, Debug)]
pub struct CalendarExistsParams {
    pub id: i32,
    pub team_id: i32,
}
#[derive(Debug)]
pub struct InsertCalendarParams<T1: crate::StringSql> {
    pub name: T1,
    pub team_id: i32,
}
#[derive(Clone, Copy, Debug)]
pub struct PinCalendarParams {
    pub user_id: i32,
    pub calendar_id: i32,
    pub team_id: i32,
}
#[derive(Debug, Clone, PartialEq)]
pub struct TeamCalendars {
    pub id: i32,
    pub name: String,
}
pub struct TeamCalendarsBorrowed<'a> {
    pub id: i32,
    pub name: &'a str,
}
impl<'a> From<TeamCalendarsBorrowed<'a>> for TeamCalendars {
    fn from(TeamCalendarsBorrowed { id, name }: TeamCalendarsBorrowed<'a>) -> Self {
        Self {
            id,
            name: name.into(),
        }
    }
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
pub struct TeamCalendarsQuery<'c, 'a, 's, C: GenericClient, T, const N: usize> {
    client: &'c C,
    params: [&'a (dyn postgres_types::ToSql + Sync); N],
    query: &'static str,
    cached: Option<&'s tokio_postgres::Statement>,
    extractor: fn(&tokio_postgres::Row) -> Result<TeamCalendarsBorrowed, tokio_postgres::Error>,
    mapper: fn(TeamCalendarsBorrowed) -> T,
}
impl<'c, 'a, 's, C, T: 'c, const N: usize> TeamCalendarsQuery<'c, 'a, 's, C, T, N>
where
    C: GenericClient,
{
    pub fn map<R>(
        self,
        mapper: fn(TeamCalendarsBorrowed) -> R,
    ) -> TeamCalendarsQuery<'c, 'a, 's, C, R, N> {
        TeamCalendarsQuery {
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
pub struct CalendarExistsStmt(&'static str, Option<tokio_postgres::Statement>);
pub fn calendar_exists() -> CalendarExistsStmt {
    CalendarExistsStmt(
        "SELECT EXISTS (SELECT 1 FROM core_calendar WHERE id = $1 AND team_id = $2)",
        None,
    )
}
impl CalendarExistsStmt {
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
        team_id: &'a i32,
    ) -> BoolQuery<'c, 'a, 's, C, bool, 2> {
        BoolQuery {
            client,
            params: [id, team_id],
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
        CalendarExistsParams,
        BoolQuery<'c, 'a, 's, C, bool, 2>,
        C,
    > for CalendarExistsStmt
{
    fn params(
        &'s self,
        client: &'c C,
        params: &'a CalendarExistsParams,
    ) -> BoolQuery<'c, 'a, 's, C, bool, 2> {
        self.bind(client, &params.id, &params.team_id)
    }
}
pub struct InsertCalendarStmt(&'static str, Option<tokio_postgres::Statement>);
/// CommonInfo's `created` default and `modified` auto_now are set by Django,
/// not the database.
pub fn insert_calendar() -> InsertCalendarStmt {
    InsertCalendarStmt(
        "INSERT INTO core_calendar (name, team_id, created, modified) VALUES ($1, $2, now(), now()) RETURNING id",
        None,
    )
}
impl InsertCalendarStmt {
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
        name: &'a T1,
        team_id: &'a i32,
    ) -> I32Query<'c, 'a, 's, C, i32, 2> {
        I32Query {
            client,
            params: [name, team_id],
            query: self.0,
            cached: self.1.as_ref(),
            extractor: |row| Ok(row.try_get(0)?),
            mapper: |it| it,
        }
    }
}
impl<'c, 'a, 's, C: GenericClient, T1: crate::StringSql>
    crate::client::async_::Params<
        'c,
        'a,
        's,
        InsertCalendarParams<T1>,
        I32Query<'c, 'a, 's, C, i32, 2>,
        C,
    > for InsertCalendarStmt
{
    fn params(
        &'s self,
        client: &'c C,
        params: &'a InsertCalendarParams<T1>,
    ) -> I32Query<'c, 'a, 's, C, i32, 2> {
        self.bind(client, &params.name, &params.team_id)
    }
}
pub struct TeamCalendarsStmt(&'static str, Option<tokio_postgres::Statement>);
/// The model's `ordering = ["name"]`.
pub fn team_calendars() -> TeamCalendarsStmt {
    TeamCalendarsStmt(
        "SELECT id, name FROM core_calendar WHERE team_id = $1 ORDER BY name",
        None,
    )
}
impl TeamCalendarsStmt {
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
    ) -> TeamCalendarsQuery<'c, 'a, 's, C, TeamCalendars, 1> {
        TeamCalendarsQuery {
            client,
            params: [team_id],
            query: self.0,
            cached: self.1.as_ref(),
            extractor:
                |row: &tokio_postgres::Row| -> Result<TeamCalendarsBorrowed, tokio_postgres::Error> {
                    Ok(TeamCalendarsBorrowed {
                        id: row.try_get(0)?,
                        name: row.try_get(1)?,
                    })
                },
            mapper: |it| TeamCalendars::from(it),
        }
    }
}
pub struct PinCalendarStmt(&'static str, Option<tokio_postgres::Statement>);
pub fn pin_calendar() -> PinCalendarStmt {
    PinCalendarStmt(
        "UPDATE core_myuser SET pinned_calendar_id = c.id FROM core_calendar c WHERE core_myuser.id = $1 AND c.id = $2 AND c.team_id = $3 RETURNING c.id",
        None,
    )
}
impl PinCalendarStmt {
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
        calendar_id: &'a i32,
        team_id: &'a i32,
    ) -> I32Query<'c, 'a, 's, C, i32, 3> {
        I32Query {
            client,
            params: [user_id, calendar_id, team_id],
            query: self.0,
            cached: self.1.as_ref(),
            extractor: |row| Ok(row.try_get(0)?),
            mapper: |it| it,
        }
    }
}
impl<'c, 'a, 's, C: GenericClient>
    crate::client::async_::Params<'c, 'a, 's, PinCalendarParams, I32Query<'c, 'a, 's, C, i32, 3>, C>
    for PinCalendarStmt
{
    fn params(
        &'s self,
        client: &'c C,
        params: &'a PinCalendarParams,
    ) -> I32Query<'c, 'a, 's, C, i32, 3> {
        self.bind(
            client,
            &params.user_id,
            &params.calendar_id,
            &params.team_id,
        )
    }
}
