// This file was generated with `cornucopia`. Do not modify.

#[derive(Clone, Copy, Debug)]
pub struct ScheduledRecipesParams {
    pub team_id: i32,
    pub calendar_id: i32,
    pub start: chrono::NaiveDate,
    pub end: chrono::NaiveDate,
}
#[derive(Clone, Copy, Debug)]
pub struct InsertScheduledRecipeParams {
    pub on: chrono::NaiveDate,
    pub team_id: i32,
    pub calendar_id: i32,
    pub user_id: i32,
    pub recipe_id: i32,
}
#[derive(Clone, Copy, Debug)]
pub struct RescheduleRecipeParams {
    pub id: i32,
    pub team_id: i32,
    pub calendar_id: i32,
    pub on: chrono::NaiveDate,
    pub actor_id: i32,
}
#[derive(Clone, Copy, Debug)]
pub struct DeleteScheduledRecipeParams {
    pub id: i32,
    pub team_id: i32,
    pub calendar_id: i32,
}
#[derive(Debug, Clone, PartialEq)]
pub struct ScheduledRecipe {
    pub id: i32,
    pub created: chrono::DateTime<chrono::Utc>,
    pub on: chrono::NaiveDate,
    pub recipe_id: i32,
    pub recipe_name: String,
    pub recipe_author: Option<String>,
    pub recipe_archived_at: Option<chrono::DateTime<chrono::Utc>>,
    pub image_id: Option<i32>,
    pub image_key: Option<String>,
    pub image_background_url: Option<String>,
    pub created_by_id: Option<i32>,
    pub created_by_name: Option<String>,
    pub created_by_email: Option<String>,
    pub created_by_profile_key: Option<String>,
}
pub struct ScheduledRecipeBorrowed<'a> {
    pub id: i32,
    pub created: chrono::DateTime<chrono::Utc>,
    pub on: chrono::NaiveDate,
    pub recipe_id: i32,
    pub recipe_name: &'a str,
    pub recipe_author: Option<&'a str>,
    pub recipe_archived_at: Option<chrono::DateTime<chrono::Utc>>,
    pub image_id: Option<i32>,
    pub image_key: Option<&'a str>,
    pub image_background_url: Option<&'a str>,
    pub created_by_id: Option<i32>,
    pub created_by_name: Option<&'a str>,
    pub created_by_email: Option<&'a str>,
    pub created_by_profile_key: Option<&'a str>,
}
impl<'a> From<ScheduledRecipeBorrowed<'a>> for ScheduledRecipe {
    fn from(
        ScheduledRecipeBorrowed {
            id,
            created,
            on,
            recipe_id,
            recipe_name,
            recipe_author,
            recipe_archived_at,
            image_id,
            image_key,
            image_background_url,
            created_by_id,
            created_by_name,
            created_by_email,
            created_by_profile_key,
        }: ScheduledRecipeBorrowed<'a>,
    ) -> Self {
        Self {
            id,
            created,
            on,
            recipe_id,
            recipe_name: recipe_name.into(),
            recipe_author: recipe_author.map(|v| v.into()),
            recipe_archived_at,
            image_id,
            image_key: image_key.map(|v| v.into()),
            image_background_url: image_background_url.map(|v| v.into()),
            created_by_id,
            created_by_name: created_by_name.map(|v| v.into()),
            created_by_email: created_by_email.map(|v| v.into()),
            created_by_profile_key: created_by_profile_key.map(|v| v.into()),
        }
    }
}
use crate::client::async_::GenericClient;
use futures::{self, StreamExt, TryStreamExt};
pub struct ScheduledRecipeQuery<'c, 'a, 's, C: GenericClient, T, const N: usize> {
    client: &'c C,
    params: [&'a (dyn postgres_types::ToSql + Sync); N],
    query: &'static str,
    cached: Option<&'s tokio_postgres::Statement>,
    extractor: fn(&tokio_postgres::Row) -> Result<ScheduledRecipeBorrowed, tokio_postgres::Error>,
    mapper: fn(ScheduledRecipeBorrowed) -> T,
}
impl<'c, 'a, 's, C, T: 'c, const N: usize> ScheduledRecipeQuery<'c, 'a, 's, C, T, N>
where
    C: GenericClient,
{
    pub fn map<R>(
        self,
        mapper: fn(ScheduledRecipeBorrowed) -> R,
    ) -> ScheduledRecipeQuery<'c, 'a, 's, C, R, N> {
        ScheduledRecipeQuery {
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
pub struct ScheduledRecipesStmt(&'static str, Option<tokio_postgres::Statement>);
/// Same joins as the view's `select_related("recipe__primary_image",
/// "created_by__profile_upload")`, and the model's `ordering = ["-on"]`.
pub fn scheduled_recipes() -> ScheduledRecipesStmt {
    ScheduledRecipesStmt(
        "SELECT sr.id, sr.created, sr.\"on\", sr.recipe_id, r.name AS recipe_name, r.author AS recipe_author, r.archived_at AS recipe_archived_at, image.id AS image_id, image.key AS image_key, image.background_url AS image_background_url, u.id AS created_by_id, u.name AS created_by_name, u.email::text AS created_by_email, profile.key AS created_by_profile_key FROM core_scheduledrecipe sr JOIN core_recipe r ON r.id = sr.recipe_id LEFT JOIN core_upload image ON image.id = r.primary_image_id LEFT JOIN core_myuser u ON u.id = sr.created_by_id LEFT JOIN core_upload profile ON profile.id = u.profile_upload_id WHERE sr.team_id = $1 AND sr.calendar_id = $2 AND sr.\"on\" >= $3 AND sr.\"on\" <= $4 ORDER BY sr.\"on\" DESC",
        None,
    )
}
impl ScheduledRecipesStmt {
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
        calendar_id: &'a i32,
        start: &'a chrono::NaiveDate,
        end: &'a chrono::NaiveDate,
    ) -> ScheduledRecipeQuery<'c, 'a, 's, C, ScheduledRecipe, 4> {
        ScheduledRecipeQuery {
            client,
            params: [team_id, calendar_id, start, end],
            query: self.0,
            cached: self.1.as_ref(),
            extractor: |
                row: &tokio_postgres::Row,
            | -> Result<ScheduledRecipeBorrowed, tokio_postgres::Error> {
                Ok(ScheduledRecipeBorrowed {
                    id: row.try_get(0)?,
                    created: row.try_get(1)?,
                    on: row.try_get(2)?,
                    recipe_id: row.try_get(3)?,
                    recipe_name: row.try_get(4)?,
                    recipe_author: row.try_get(5)?,
                    recipe_archived_at: row.try_get(6)?,
                    image_id: row.try_get(7)?,
                    image_key: row.try_get(8)?,
                    image_background_url: row.try_get(9)?,
                    created_by_id: row.try_get(10)?,
                    created_by_name: row.try_get(11)?,
                    created_by_email: row.try_get(12)?,
                    created_by_profile_key: row.try_get(13)?,
                })
            },
            mapper: |it| ScheduledRecipe::from(it),
        }
    }
}
impl<'c, 'a, 's, C: GenericClient>
    crate::client::async_::Params<
        'c,
        'a,
        's,
        ScheduledRecipesParams,
        ScheduledRecipeQuery<'c, 'a, 's, C, ScheduledRecipe, 4>,
        C,
    > for ScheduledRecipesStmt
{
    fn params(
        &'s self,
        client: &'c C,
        params: &'a ScheduledRecipesParams,
    ) -> ScheduledRecipeQuery<'c, 'a, 's, C, ScheduledRecipe, 4> {
        self.bind(
            client,
            &params.team_id,
            &params.calendar_id,
            &params.start,
            &params.end,
        )
    }
}
pub struct ScheduledRecipeStmt(&'static str, Option<tokio_postgres::Statement>);
pub fn scheduled_recipe() -> ScheduledRecipeStmt {
    ScheduledRecipeStmt(
        "SELECT sr.id, sr.created, sr.\"on\", sr.recipe_id, r.name AS recipe_name, r.author AS recipe_author, r.archived_at AS recipe_archived_at, image.id AS image_id, image.key AS image_key, image.background_url AS image_background_url, u.id AS created_by_id, u.name AS created_by_name, u.email::text AS created_by_email, profile.key AS created_by_profile_key FROM core_scheduledrecipe sr JOIN core_recipe r ON r.id = sr.recipe_id LEFT JOIN core_upload image ON image.id = r.primary_image_id LEFT JOIN core_myuser u ON u.id = sr.created_by_id LEFT JOIN core_upload profile ON profile.id = u.profile_upload_id WHERE sr.id = $1",
        None,
    )
}
impl ScheduledRecipeStmt {
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
    ) -> ScheduledRecipeQuery<'c, 'a, 's, C, ScheduledRecipe, 1> {
        ScheduledRecipeQuery {
            client,
            params: [id],
            query: self.0,
            cached: self.1.as_ref(),
            extractor: |
                row: &tokio_postgres::Row,
            | -> Result<ScheduledRecipeBorrowed, tokio_postgres::Error> {
                Ok(ScheduledRecipeBorrowed {
                    id: row.try_get(0)?,
                    created: row.try_get(1)?,
                    on: row.try_get(2)?,
                    recipe_id: row.try_get(3)?,
                    recipe_name: row.try_get(4)?,
                    recipe_author: row.try_get(5)?,
                    recipe_archived_at: row.try_get(6)?,
                    image_id: row.try_get(7)?,
                    image_key: row.try_get(8)?,
                    image_background_url: row.try_get(9)?,
                    created_by_id: row.try_get(10)?,
                    created_by_name: row.try_get(11)?,
                    created_by_email: row.try_get(12)?,
                    created_by_profile_key: row.try_get(13)?,
                })
            },
            mapper: |it| ScheduledRecipe::from(it),
        }
    }
}
pub struct InsertScheduledRecipeStmt(&'static str, Option<tokio_postgres::Statement>);
/// Only schedules recipes that belong to the team, like
/// `get_object_or_404(filter_recipes(team=team), ...)`.
pub fn insert_scheduled_recipe() -> InsertScheduledRecipeStmt {
    InsertScheduledRecipeStmt(
        "INSERT INTO core_scheduledrecipe (recipe_id, \"on\", team_id, calendar_id, created_by_id, created, modified) SELECT r.id, $1, $2, $3, $4, now(), now() FROM core_recipe r WHERE r.id = $5 AND r.team_id = $2 RETURNING id",
        None,
    )
}
impl InsertScheduledRecipeStmt {
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
        on: &'a chrono::NaiveDate,
        team_id: &'a i32,
        calendar_id: &'a i32,
        user_id: &'a i32,
        recipe_id: &'a i32,
    ) -> I32Query<'c, 'a, 's, C, i32, 5> {
        I32Query {
            client,
            params: [on, team_id, calendar_id, user_id, recipe_id],
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
        InsertScheduledRecipeParams,
        I32Query<'c, 'a, 's, C, i32, 5>,
        C,
    > for InsertScheduledRecipeStmt
{
    fn params(
        &'s self,
        client: &'c C,
        params: &'a InsertScheduledRecipeParams,
    ) -> I32Query<'c, 'a, 's, C, i32, 5> {
        self.bind(
            client,
            &params.on,
            &params.team_id,
            &params.calendar_id,
            &params.user_id,
            &params.recipe_id,
        )
    }
}
pub struct RescheduleRecipeStmt(&'static str, Option<tokio_postgres::Statement>);
/// Moves the scheduled recipe and records the change as a ScheduleEvent.
pub fn reschedule_recipe() -> RescheduleRecipeStmt {
    RescheduleRecipeStmt(
        "WITH old AS ( SELECT id, \"on\" FROM core_scheduledrecipe WHERE id = $1 AND team_id = $2 AND calendar_id = $3 FOR UPDATE ), updated AS ( UPDATE core_scheduledrecipe sr SET \"on\" = $4, modified = now() FROM old WHERE sr.id = old.id RETURNING sr.id, old.\"on\" AS before_on ) INSERT INTO schedule_event (scheduled_recipe_id, before_on, after_on, actor_id, created, modified) SELECT id, before_on, $4, $5, now(), now() FROM updated RETURNING scheduled_recipe_id",
        None,
    )
}
impl RescheduleRecipeStmt {
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
        calendar_id: &'a i32,
        on: &'a chrono::NaiveDate,
        actor_id: &'a i32,
    ) -> I32Query<'c, 'a, 's, C, i32, 5> {
        I32Query {
            client,
            params: [id, team_id, calendar_id, on, actor_id],
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
        RescheduleRecipeParams,
        I32Query<'c, 'a, 's, C, i32, 5>,
        C,
    > for RescheduleRecipeStmt
{
    fn params(
        &'s self,
        client: &'c C,
        params: &'a RescheduleRecipeParams,
    ) -> I32Query<'c, 'a, 's, C, i32, 5> {
        self.bind(
            client,
            &params.id,
            &params.team_id,
            &params.calendar_id,
            &params.on,
            &params.actor_id,
        )
    }
}
pub struct DeleteScheduledRecipeStmt(&'static str, Option<tokio_postgres::Statement>);
/// The foreign keys don't cascade in the database, Django deletes the
/// ScheduleEvents itself.
pub fn delete_scheduled_recipe() -> DeleteScheduledRecipeStmt {
    DeleteScheduledRecipeStmt(
        "WITH sr AS ( SELECT id FROM core_scheduledrecipe WHERE id = $1 AND team_id = $2 AND calendar_id = $3 ), events AS ( DELETE FROM schedule_event WHERE scheduled_recipe_id IN (SELECT id FROM sr) ) DELETE FROM core_scheduledrecipe WHERE id IN (SELECT id FROM sr)",
        None,
    )
}
impl DeleteScheduledRecipeStmt {
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
        id: &'a i32,
        team_id: &'a i32,
        calendar_id: &'a i32,
    ) -> Result<u64, tokio_postgres::Error> {
        client.execute(self.0, &[id, team_id, calendar_id]).await
    }
}
impl<'a, C: GenericClient + Send + Sync>
    crate::client::async_::Params<
        'a,
        'a,
        'a,
        DeleteScheduledRecipeParams,
        std::pin::Pin<
            Box<dyn futures::Future<Output = Result<u64, tokio_postgres::Error>> + Send + 'a>,
        >,
        C,
    > for DeleteScheduledRecipeStmt
{
    fn params(
        &'a self,
        client: &'a C,
        params: &'a DeleteScheduledRecipeParams,
    ) -> std::pin::Pin<
        Box<dyn futures::Future<Output = Result<u64, tokio_postgres::Error>> + Send + 'a>,
    > {
        Box::pin(self.bind(client, &params.id, &params.team_id, &params.calendar_id))
    }
}
