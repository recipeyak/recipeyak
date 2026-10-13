// This file was generated with `cornucopia`. Do not modify.

#[derive(Clone, Copy, Debug)]
pub struct ScheduledRecipesParams {
    pub team_id: i32,
    pub calendar_id: i32,
    pub start: chrono::NaiveDate,
    pub end: chrono::NaiveDate,
}
#[derive(Debug, Clone, PartialEq)]
pub struct ScheduledRecipes {
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
pub struct ScheduledRecipesBorrowed<'a> {
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
impl<'a> From<ScheduledRecipesBorrowed<'a>> for ScheduledRecipes {
    fn from(
        ScheduledRecipesBorrowed {
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
        }: ScheduledRecipesBorrowed<'a>,
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
pub struct ScheduledRecipesQuery<'c, 'a, 's, C: GenericClient, T, const N: usize> {
    client: &'c C,
    params: [&'a (dyn postgres_types::ToSql + Sync); N],
    query: &'static str,
    cached: Option<&'s tokio_postgres::Statement>,
    extractor: fn(&tokio_postgres::Row) -> Result<ScheduledRecipesBorrowed, tokio_postgres::Error>,
    mapper: fn(ScheduledRecipesBorrowed) -> T,
}
impl<'c, 'a, 's, C, T: 'c, const N: usize> ScheduledRecipesQuery<'c, 'a, 's, C, T, N>
where
    C: GenericClient,
{
    pub fn map<R>(
        self,
        mapper: fn(ScheduledRecipesBorrowed) -> R,
    ) -> ScheduledRecipesQuery<'c, 'a, 's, C, R, N> {
        ScheduledRecipesQuery {
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
    ) -> ScheduledRecipesQuery<'c, 'a, 's, C, ScheduledRecipes, 4> {
        ScheduledRecipesQuery {
            client,
            params: [team_id, calendar_id, start, end],
            query: self.0,
            cached: self.1.as_ref(),
            extractor: |
                row: &tokio_postgres::Row,
            | -> Result<ScheduledRecipesBorrowed, tokio_postgres::Error> {
                Ok(ScheduledRecipesBorrowed {
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
            mapper: |it| ScheduledRecipes::from(it),
        }
    }
}
impl<'c, 'a, 's, C: GenericClient>
    crate::client::async_::Params<
        'c,
        'a,
        's,
        ScheduledRecipesParams,
        ScheduledRecipesQuery<'c, 'a, 's, C, ScheduledRecipes, 4>,
        C,
    > for ScheduledRecipesStmt
{
    fn params(
        &'s self,
        client: &'c C,
        params: &'a ScheduledRecipesParams,
    ) -> ScheduledRecipesQuery<'c, 'a, 's, C, ScheduledRecipes, 4> {
        self.bind(
            client,
            &params.team_id,
            &params.calendar_id,
            &params.start,
            &params.end,
        )
    }
}
