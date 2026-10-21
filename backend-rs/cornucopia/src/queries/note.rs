// This file was generated with `cornucopia`. Do not modify.

#[derive(Clone, Copy, Debug)]
pub struct NoteParams {
    pub id: i32,
    pub team_id: i32,
}
#[derive(Clone, Copy, Debug)]
pub struct ReactionParams {
    pub id: i32,
    pub team_id: i32,
}
#[derive(Clone, Copy, Debug)]
pub struct TeamNoteParams {
    pub id: i32,
    pub team_id: i32,
}
#[derive(Debug)]
pub struct InsertNoteParams<T1: crate::StringSql> {
    pub text: T1,
    pub user_id: i32,
    pub recipe_id: i32,
    pub team_id: i32,
}
#[derive(Debug)]
pub struct UpdateNoteParams<T1: crate::StringSql> {
    pub text: Option<T1>,
    pub id: i32,
}
#[derive(Clone, Copy, Debug)]
pub struct InsertNoteVersionParams {
    pub actor_id: i32,
    pub note_id: i32,
}
#[derive(Debug)]
pub struct AttachUploadsParams<T1: crate::ArraySql<Item = i32>> {
    pub note_id: i32,
    pub upload_ids: T1,
    pub user_id: i32,
}
#[derive(Debug)]
pub struct InsertReactionParams<T1: crate::StringSql> {
    pub emoji: T1,
    pub user_id: i32,
    pub note_id: i32,
}
#[derive(Clone, Copy, Debug)]
pub struct DeleteReactionParams {
    pub id: i32,
    pub user_id: i32,
    pub team_id: i32,
}
#[derive(Debug, Clone, PartialEq)]
pub struct Note {
    pub id: i32,
    pub text: String,
    pub created: chrono::DateTime<chrono::Utc>,
    pub modified: chrono::DateTime<chrono::Utc>,
    pub created_by_id: i32,
    pub created_by_name: Option<String>,
    pub created_by_email: String,
    pub created_by_profile_key: Option<String>,
    pub primary_image_id: Option<i32>,
}
pub struct NoteBorrowed<'a> {
    pub id: i32,
    pub text: &'a str,
    pub created: chrono::DateTime<chrono::Utc>,
    pub modified: chrono::DateTime<chrono::Utc>,
    pub created_by_id: i32,
    pub created_by_name: Option<&'a str>,
    pub created_by_email: &'a str,
    pub created_by_profile_key: Option<&'a str>,
    pub primary_image_id: Option<i32>,
}
impl<'a> From<NoteBorrowed<'a>> for Note {
    fn from(
        NoteBorrowed {
            id,
            text,
            created,
            modified,
            created_by_id,
            created_by_name,
            created_by_email,
            created_by_profile_key,
            primary_image_id,
        }: NoteBorrowed<'a>,
    ) -> Self {
        Self {
            id,
            text: text.into(),
            created,
            modified,
            created_by_id,
            created_by_name: created_by_name.map(|v| v.into()),
            created_by_email: created_by_email.into(),
            created_by_profile_key: created_by_profile_key.map(|v| v.into()),
            primary_image_id,
        }
    }
}
#[derive(Debug, Clone, PartialEq)]
pub struct NoteAttachment {
    pub id: i32,
    pub key: String,
    pub content_type: String,
    pub background_url: Option<String>,
}
pub struct NoteAttachmentBorrowed<'a> {
    pub id: i32,
    pub key: &'a str,
    pub content_type: &'a str,
    pub background_url: Option<&'a str>,
}
impl<'a> From<NoteAttachmentBorrowed<'a>> for NoteAttachment {
    fn from(
        NoteAttachmentBorrowed {
            id,
            key,
            content_type,
            background_url,
        }: NoteAttachmentBorrowed<'a>,
    ) -> Self {
        Self {
            id,
            key: key.into(),
            content_type: content_type.into(),
            background_url: background_url.map(|v| v.into()),
        }
    }
}
#[derive(Debug, Clone, PartialEq)]
pub struct Reaction {
    pub id: i32,
    pub emoji: String,
    pub note_id: i32,
    pub created: chrono::DateTime<chrono::Utc>,
    pub user_id: i32,
    pub user_name: Option<String>,
    pub user_email: String,
    pub user_profile_key: Option<String>,
}
pub struct ReactionBorrowed<'a> {
    pub id: i32,
    pub emoji: &'a str,
    pub note_id: i32,
    pub created: chrono::DateTime<chrono::Utc>,
    pub user_id: i32,
    pub user_name: Option<&'a str>,
    pub user_email: &'a str,
    pub user_profile_key: Option<&'a str>,
}
impl<'a> From<ReactionBorrowed<'a>> for Reaction {
    fn from(
        ReactionBorrowed {
            id,
            emoji,
            note_id,
            created,
            user_id,
            user_name,
            user_email,
            user_profile_key,
        }: ReactionBorrowed<'a>,
    ) -> Self {
        Self {
            id,
            emoji: emoji.into(),
            note_id,
            created,
            user_id,
            user_name: user_name.map(|v| v.into()),
            user_email: user_email.into(),
            user_profile_key: user_profile_key.map(|v| v.into()),
        }
    }
}
#[derive(Debug, Clone, PartialEq, Copy)]
pub struct TeamNote {
    pub created_by_id: i32,
    pub recipe_id: i32,
}
use crate::client::async_::GenericClient;
use futures::{self, StreamExt, TryStreamExt};
pub struct NoteQuery<'c, 'a, 's, C: GenericClient, T, const N: usize> {
    client: &'c C,
    params: [&'a (dyn postgres_types::ToSql + Sync); N],
    query: &'static str,
    cached: Option<&'s tokio_postgres::Statement>,
    extractor: fn(&tokio_postgres::Row) -> Result<NoteBorrowed, tokio_postgres::Error>,
    mapper: fn(NoteBorrowed) -> T,
}
impl<'c, 'a, 's, C, T: 'c, const N: usize> NoteQuery<'c, 'a, 's, C, T, N>
where
    C: GenericClient,
{
    pub fn map<R>(self, mapper: fn(NoteBorrowed) -> R) -> NoteQuery<'c, 'a, 's, C, R, N> {
        NoteQuery {
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
pub struct NoteAttachmentQuery<'c, 'a, 's, C: GenericClient, T, const N: usize> {
    client: &'c C,
    params: [&'a (dyn postgres_types::ToSql + Sync); N],
    query: &'static str,
    cached: Option<&'s tokio_postgres::Statement>,
    extractor: fn(&tokio_postgres::Row) -> Result<NoteAttachmentBorrowed, tokio_postgres::Error>,
    mapper: fn(NoteAttachmentBorrowed) -> T,
}
impl<'c, 'a, 's, C, T: 'c, const N: usize> NoteAttachmentQuery<'c, 'a, 's, C, T, N>
where
    C: GenericClient,
{
    pub fn map<R>(
        self,
        mapper: fn(NoteAttachmentBorrowed) -> R,
    ) -> NoteAttachmentQuery<'c, 'a, 's, C, R, N> {
        NoteAttachmentQuery {
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
pub struct ReactionQuery<'c, 'a, 's, C: GenericClient, T, const N: usize> {
    client: &'c C,
    params: [&'a (dyn postgres_types::ToSql + Sync); N],
    query: &'static str,
    cached: Option<&'s tokio_postgres::Statement>,
    extractor: fn(&tokio_postgres::Row) -> Result<ReactionBorrowed, tokio_postgres::Error>,
    mapper: fn(ReactionBorrowed) -> T,
}
impl<'c, 'a, 's, C, T: 'c, const N: usize> ReactionQuery<'c, 'a, 's, C, T, N>
where
    C: GenericClient,
{
    pub fn map<R>(self, mapper: fn(ReactionBorrowed) -> R) -> ReactionQuery<'c, 'a, 's, C, R, N> {
        ReactionQuery {
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
pub struct TeamNoteQuery<'c, 'a, 's, C: GenericClient, T, const N: usize> {
    client: &'c C,
    params: [&'a (dyn postgres_types::ToSql + Sync); N],
    query: &'static str,
    cached: Option<&'s tokio_postgres::Statement>,
    extractor: fn(&tokio_postgres::Row) -> Result<TeamNote, tokio_postgres::Error>,
    mapper: fn(TeamNote) -> T,
}
impl<'c, 'a, 's, C, T: 'c, const N: usize> TeamNoteQuery<'c, 'a, 's, C, T, N>
where
    C: GenericClient,
{
    pub fn map<R>(self, mapper: fn(TeamNote) -> R) -> TeamNoteQuery<'c, 'a, 's, C, R, N> {
        TeamNoteQuery {
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
pub struct NoteStmt(&'static str, Option<tokio_postgres::Statement>);
pub fn note() -> NoteStmt {
    NoteStmt(
        "SELECT n.id, n.text, n.created, n.modified, u.id AS created_by_id, u.name AS created_by_name, u.email::text AS created_by_email, profile.key AS created_by_profile_key, r.primary_image_id FROM core_note n JOIN core_recipe r ON r.id = n.recipe_id JOIN core_myuser u ON u.id = n.created_by_id LEFT JOIN core_upload profile ON profile.id = u.profile_upload_id WHERE n.id = $1 AND r.team_id = $2",
        None,
    )
}
impl NoteStmt {
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
    ) -> NoteQuery<'c, 'a, 's, C, Note, 2> {
        NoteQuery {
            client,
            params: [id, team_id],
            query: self.0,
            cached: self.1.as_ref(),
            extractor: |row: &tokio_postgres::Row| -> Result<NoteBorrowed, tokio_postgres::Error> {
                Ok(NoteBorrowed {
                    id: row.try_get(0)?,
                    text: row.try_get(1)?,
                    created: row.try_get(2)?,
                    modified: row.try_get(3)?,
                    created_by_id: row.try_get(4)?,
                    created_by_name: row.try_get(5)?,
                    created_by_email: row.try_get(6)?,
                    created_by_profile_key: row.try_get(7)?,
                    primary_image_id: row.try_get(8)?,
                })
            },
            mapper: |it| Note::from(it),
        }
    }
}
impl<'c, 'a, 's, C: GenericClient>
    crate::client::async_::Params<'c, 'a, 's, NoteParams, NoteQuery<'c, 'a, 's, C, Note, 2>, C>
    for NoteStmt
{
    fn params(
        &'s self,
        client: &'c C,
        params: &'a NoteParams,
    ) -> NoteQuery<'c, 'a, 's, C, Note, 2> {
        self.bind(client, &params.id, &params.team_id)
    }
}
pub struct NoteAttachmentsStmt(&'static str, Option<tokio_postgres::Statement>);
pub fn note_attachments() -> NoteAttachmentsStmt {
    NoteAttachmentsStmt(
        "SELECT id, key, content_type, background_url FROM core_upload WHERE note_id = $1 ORDER BY id",
        None,
    )
}
impl NoteAttachmentsStmt {
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
        note_id: &'a i32,
    ) -> NoteAttachmentQuery<'c, 'a, 's, C, NoteAttachment, 1> {
        NoteAttachmentQuery {
            client,
            params: [note_id],
            query: self.0,
            cached: self.1.as_ref(),
            extractor: |
                row: &tokio_postgres::Row,
            | -> Result<NoteAttachmentBorrowed, tokio_postgres::Error> {
                Ok(NoteAttachmentBorrowed {
                    id: row.try_get(0)?,
                    key: row.try_get(1)?,
                    content_type: row.try_get(2)?,
                    background_url: row.try_get(3)?,
                })
            },
            mapper: |it| NoteAttachment::from(it),
        }
    }
}
pub struct NoteReactionsStmt(&'static str, Option<tokio_postgres::Statement>);
/// The model's `ordering = ["-created"]`.
pub fn note_reactions() -> NoteReactionsStmt {
    NoteReactionsStmt(
        "SELECT re.id, re.emoji, re.note_id, re.created, u.id AS user_id, u.name AS user_name, u.email::text AS user_email, profile.key AS user_profile_key FROM core_reaction re JOIN core_myuser u ON u.id = re.created_by_id LEFT JOIN core_upload profile ON profile.id = u.profile_upload_id WHERE re.note_id = $1 ORDER BY re.created DESC",
        None,
    )
}
impl NoteReactionsStmt {
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
        note_id: &'a i32,
    ) -> ReactionQuery<'c, 'a, 's, C, Reaction, 1> {
        ReactionQuery {
            client,
            params: [note_id],
            query: self.0,
            cached: self.1.as_ref(),
            extractor:
                |row: &tokio_postgres::Row| -> Result<ReactionBorrowed, tokio_postgres::Error> {
                    Ok(ReactionBorrowed {
                        id: row.try_get(0)?,
                        emoji: row.try_get(1)?,
                        note_id: row.try_get(2)?,
                        created: row.try_get(3)?,
                        user_id: row.try_get(4)?,
                        user_name: row.try_get(5)?,
                        user_email: row.try_get(6)?,
                        user_profile_key: row.try_get(7)?,
                    })
                },
            mapper: |it| Reaction::from(it),
        }
    }
}
pub struct ReactionStmt(&'static str, Option<tokio_postgres::Statement>);
pub fn reaction() -> ReactionStmt {
    ReactionStmt(
        "SELECT re.id, re.emoji, re.note_id, re.created, u.id AS user_id, u.name AS user_name, u.email::text AS user_email, profile.key AS user_profile_key FROM core_reaction re JOIN core_note n ON n.id = re.note_id JOIN core_recipe r ON r.id = n.recipe_id JOIN core_myuser u ON u.id = re.created_by_id LEFT JOIN core_upload profile ON profile.id = u.profile_upload_id WHERE re.id = $1 AND r.team_id = $2",
        None,
    )
}
impl ReactionStmt {
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
    ) -> ReactionQuery<'c, 'a, 's, C, Reaction, 2> {
        ReactionQuery {
            client,
            params: [id, team_id],
            query: self.0,
            cached: self.1.as_ref(),
            extractor:
                |row: &tokio_postgres::Row| -> Result<ReactionBorrowed, tokio_postgres::Error> {
                    Ok(ReactionBorrowed {
                        id: row.try_get(0)?,
                        emoji: row.try_get(1)?,
                        note_id: row.try_get(2)?,
                        created: row.try_get(3)?,
                        user_id: row.try_get(4)?,
                        user_name: row.try_get(5)?,
                        user_email: row.try_get(6)?,
                        user_profile_key: row.try_get(7)?,
                    })
                },
            mapper: |it| Reaction::from(it),
        }
    }
}
impl<'c, 'a, 's, C: GenericClient>
    crate::client::async_::Params<
        'c,
        'a,
        's,
        ReactionParams,
        ReactionQuery<'c, 'a, 's, C, Reaction, 2>,
        C,
    > for ReactionStmt
{
    fn params(
        &'s self,
        client: &'c C,
        params: &'a ReactionParams,
    ) -> ReactionQuery<'c, 'a, 's, C, Reaction, 2> {
        self.bind(client, &params.id, &params.team_id)
    }
}
pub struct TeamNoteStmt(&'static str, Option<tokio_postgres::Statement>);
/// `filter_notes(team=team).get(pk=...)`
pub fn team_note() -> TeamNoteStmt {
    TeamNoteStmt(
        "SELECT n.created_by_id, n.recipe_id FROM core_note n JOIN core_recipe r ON r.id = n.recipe_id WHERE n.id = $1 AND r.team_id = $2",
        None,
    )
}
impl TeamNoteStmt {
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
    ) -> TeamNoteQuery<'c, 'a, 's, C, TeamNote, 2> {
        TeamNoteQuery {
            client,
            params: [id, team_id],
            query: self.0,
            cached: self.1.as_ref(),
            extractor: |row: &tokio_postgres::Row| -> Result<TeamNote, tokio_postgres::Error> {
                Ok(TeamNote {
                    created_by_id: row.try_get(0)?,
                    recipe_id: row.try_get(1)?,
                })
            },
            mapper: |it| TeamNote::from(it),
        }
    }
}
impl<'c, 'a, 's, C: GenericClient>
    crate::client::async_::Params<
        'c,
        'a,
        's,
        TeamNoteParams,
        TeamNoteQuery<'c, 'a, 's, C, TeamNote, 2>,
        C,
    > for TeamNoteStmt
{
    fn params(
        &'s self,
        client: &'c C,
        params: &'a TeamNoteParams,
    ) -> TeamNoteQuery<'c, 'a, 's, C, TeamNote, 2> {
        self.bind(client, &params.id, &params.team_id)
    }
}
pub struct InsertNoteStmt(&'static str, Option<tokio_postgres::Statement>);
/// Only adds notes to recipes that belong to the team, like
/// `get_object_or_404(filter_recipes(team=team), ...)`.
pub fn insert_note() -> InsertNoteStmt {
    InsertNoteStmt(
        "INSERT INTO core_note (text, created_by_id, last_modified_by_id, recipe_id, created, modified) SELECT $1, $2, $2, r.id, now(), now() FROM core_recipe r WHERE r.id = $3 AND r.team_id = $4 RETURNING id",
        None,
    )
}
impl InsertNoteStmt {
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
        text: &'a T1,
        user_id: &'a i32,
        recipe_id: &'a i32,
        team_id: &'a i32,
    ) -> I32Query<'c, 'a, 's, C, i32, 4> {
        I32Query {
            client,
            params: [text, user_id, recipe_id, team_id],
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
        InsertNoteParams<T1>,
        I32Query<'c, 'a, 's, C, i32, 4>,
        C,
    > for InsertNoteStmt
{
    fn params(
        &'s self,
        client: &'c C,
        params: &'a InsertNoteParams<T1>,
    ) -> I32Query<'c, 'a, 's, C, i32, 4> {
        self.bind(
            client,
            &params.text,
            &params.user_id,
            &params.recipe_id,
            &params.team_id,
        )
    }
}
pub struct UpdateNoteStmt(&'static str, Option<tokio_postgres::Statement>);
pub fn update_note() -> UpdateNoteStmt {
    UpdateNoteStmt(
        "UPDATE core_note SET text = COALESCE($1, text), modified = now() WHERE id = $2",
        None,
    )
}
impl UpdateNoteStmt {
    pub async fn prepare<'a, C: GenericClient>(
        mut self,
        client: &'a C,
    ) -> Result<Self, tokio_postgres::Error> {
        self.1 = Some(client.prepare(self.0).await?);
        Ok(self)
    }
    pub async fn bind<'c, 'a, 's, C: GenericClient, T1: crate::StringSql>(
        &'s self,
        client: &'c C,
        text: &'a Option<T1>,
        id: &'a i32,
    ) -> Result<u64, tokio_postgres::Error> {
        client.execute(self.0, &[text, id]).await
    }
}
impl<'a, C: GenericClient + Send + Sync, T1: crate::StringSql>
    crate::client::async_::Params<
        'a,
        'a,
        'a,
        UpdateNoteParams<T1>,
        std::pin::Pin<
            Box<dyn futures::Future<Output = Result<u64, tokio_postgres::Error>> + Send + 'a>,
        >,
        C,
    > for UpdateNoteStmt
{
    fn params(
        &'a self,
        client: &'a C,
        params: &'a UpdateNoteParams<T1>,
    ) -> std::pin::Pin<
        Box<dyn futures::Future<Output = Result<u64, tokio_postgres::Error>> + Send + 'a>,
    > {
        Box::pin(self.bind(client, &params.text, &params.id))
    }
}
pub struct InsertNoteVersionStmt(&'static str, Option<tokio_postgres::Statement>);
/// `save_note_version`, which records the note before it's changed.
pub fn insert_note_version() -> InsertNoteVersionStmt {
    InsertNoteVersionStmt(
        "INSERT INTO note_historical (note_id, actor_id, text, upload_ids, created, modified) SELECT n.id, $1, n.text, ARRAY(SELECT id FROM core_upload WHERE note_id = n.id), now(), now() FROM core_note n WHERE n.id = $2",
        None,
    )
}
impl InsertNoteVersionStmt {
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
        actor_id: &'a i32,
        note_id: &'a i32,
    ) -> Result<u64, tokio_postgres::Error> {
        client.execute(self.0, &[actor_id, note_id]).await
    }
}
impl<'a, C: GenericClient + Send + Sync>
    crate::client::async_::Params<
        'a,
        'a,
        'a,
        InsertNoteVersionParams,
        std::pin::Pin<
            Box<dyn futures::Future<Output = Result<u64, tokio_postgres::Error>> + Send + 'a>,
        >,
        C,
    > for InsertNoteVersionStmt
{
    fn params(
        &'a self,
        client: &'a C,
        params: &'a InsertNoteVersionParams,
    ) -> std::pin::Pin<
        Box<dyn futures::Future<Output = Result<u64, tokio_postgres::Error>> + Send + 'a>,
    > {
        Box::pin(self.bind(client, &params.actor_id, &params.note_id))
    }
}
pub struct AttachUploadsStmt(&'static str, Option<tokio_postgres::Statement>);
/// Like Django's `QuerySet.update`, this doesn't touch `modified`.
pub fn attach_uploads() -> AttachUploadsStmt {
    AttachUploadsStmt(
        "UPDATE core_upload SET note_id = $1 WHERE id = ANY($2) AND created_by_id = $3",
        None,
    )
}
impl AttachUploadsStmt {
    pub async fn prepare<'a, C: GenericClient>(
        mut self,
        client: &'a C,
    ) -> Result<Self, tokio_postgres::Error> {
        self.1 = Some(client.prepare(self.0).await?);
        Ok(self)
    }
    pub async fn bind<'c, 'a, 's, C: GenericClient, T1: crate::ArraySql<Item = i32>>(
        &'s self,
        client: &'c C,
        note_id: &'a i32,
        upload_ids: &'a T1,
        user_id: &'a i32,
    ) -> Result<u64, tokio_postgres::Error> {
        client
            .execute(self.0, &[note_id, upload_ids, user_id])
            .await
    }
}
impl<'a, C: GenericClient + Send + Sync, T1: crate::ArraySql<Item = i32>>
    crate::client::async_::Params<
        'a,
        'a,
        'a,
        AttachUploadsParams<T1>,
        std::pin::Pin<
            Box<dyn futures::Future<Output = Result<u64, tokio_postgres::Error>> + Send + 'a>,
        >,
        C,
    > for AttachUploadsStmt
{
    fn params(
        &'a self,
        client: &'a C,
        params: &'a AttachUploadsParams<T1>,
    ) -> std::pin::Pin<
        Box<dyn futures::Future<Output = Result<u64, tokio_postgres::Error>> + Send + 'a>,
    > {
        Box::pin(self.bind(client, &params.note_id, &params.upload_ids, &params.user_id))
    }
}
pub struct DetachUploadsStmt(&'static str, Option<tokio_postgres::Statement>);
pub fn detach_uploads() -> DetachUploadsStmt {
    DetachUploadsStmt(
        "UPDATE core_upload SET note_id = NULL WHERE note_id = $1",
        None,
    )
}
impl DetachUploadsStmt {
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
        note_id: &'a i32,
    ) -> Result<u64, tokio_postgres::Error> {
        client.execute(self.0, &[note_id]).await
    }
}
pub struct DeleteNoteReactionsStmt(&'static str, Option<tokio_postgres::Statement>);
pub fn delete_note_reactions() -> DeleteNoteReactionsStmt {
    DeleteNoteReactionsStmt("DELETE FROM core_reaction WHERE note_id = $1", None)
}
impl DeleteNoteReactionsStmt {
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
        note_id: &'a i32,
    ) -> Result<u64, tokio_postgres::Error> {
        client.execute(self.0, &[note_id]).await
    }
}
pub struct DeleteNoteVersionsStmt(&'static str, Option<tokio_postgres::Statement>);
pub fn delete_note_versions() -> DeleteNoteVersionsStmt {
    DeleteNoteVersionsStmt("DELETE FROM note_historical WHERE note_id = $1", None)
}
impl DeleteNoteVersionsStmt {
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
        note_id: &'a i32,
    ) -> Result<u64, tokio_postgres::Error> {
        client.execute(self.0, &[note_id]).await
    }
}
pub struct DeleteNoteStmt(&'static str, Option<tokio_postgres::Statement>);
pub fn delete_note() -> DeleteNoteStmt {
    DeleteNoteStmt("DELETE FROM core_note WHERE id = $1", None)
}
impl DeleteNoteStmt {
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
    ) -> Result<u64, tokio_postgres::Error> {
        client.execute(self.0, &[id]).await
    }
}
pub struct InsertReactionStmt(&'static str, Option<tokio_postgres::Statement>);
/// Returns the existing reaction when the user already reacted with the
/// emoji. The no-op update is so `RETURNING` includes it.
pub fn insert_reaction() -> InsertReactionStmt {
    InsertReactionStmt(
        "INSERT INTO core_reaction (emoji, created_by_id, note_id, created, modified) VALUES ($1, $2, $3, now(), now()) ON CONFLICT ON CONSTRAINT one_reaction_per_user DO UPDATE SET emoji = EXCLUDED.emoji RETURNING id",
        None,
    )
}
impl InsertReactionStmt {
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
        emoji: &'a T1,
        user_id: &'a i32,
        note_id: &'a i32,
    ) -> I32Query<'c, 'a, 's, C, i32, 3> {
        I32Query {
            client,
            params: [emoji, user_id, note_id],
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
        InsertReactionParams<T1>,
        I32Query<'c, 'a, 's, C, i32, 3>,
        C,
    > for InsertReactionStmt
{
    fn params(
        &'s self,
        client: &'c C,
        params: &'a InsertReactionParams<T1>,
    ) -> I32Query<'c, 'a, 's, C, i32, 3> {
        self.bind(client, &params.emoji, &params.user_id, &params.note_id)
    }
}
pub struct DeleteReactionStmt(&'static str, Option<tokio_postgres::Statement>);
pub fn delete_reaction() -> DeleteReactionStmt {
    DeleteReactionStmt(
        "DELETE FROM core_reaction re USING core_note n, core_recipe r WHERE re.id = $1 AND re.created_by_id = $2 AND n.id = re.note_id AND r.id = n.recipe_id AND r.team_id = $3 RETURNING r.id AS recipe_id",
        None,
    )
}
impl DeleteReactionStmt {
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
        team_id: &'a i32,
    ) -> I32Query<'c, 'a, 's, C, i32, 3> {
        I32Query {
            client,
            params: [id, user_id, team_id],
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
        DeleteReactionParams,
        I32Query<'c, 'a, 's, C, i32, 3>,
        C,
    > for DeleteReactionStmt
{
    fn params(
        &'s self,
        client: &'c C,
        params: &'a DeleteReactionParams,
    ) -> I32Query<'c, 'a, 's, C, i32, 3> {
        self.bind(client, &params.id, &params.user_id, &params.team_id)
    }
}
