//! Note and reaction responses, ported from `recipeyak.api.serializers.recipe`.

use chrono::{DateTime, Utc};
use cornucopia::client::GenericClient;
use cornucopia::queries::note::{Reaction as ReactionRow, note, note_attachments, note_reactions};
use serde::{Deserialize, Serialize};
use url::Url;
use utoipa::ToSchema;

use crate::error::ApiError;
use crate::urls::{avatar_url, public_url};

#[derive(Serialize, ToSchema)]
pub struct Note {
    id: String,
    text: String,
    created_by: PublicUser,
    created: DateTime<Utc>,
    modified: DateTime<Utc>,
    attachments: Vec<NoteAttachment>,
    reactions: Vec<Reaction>,
    #[serde(rename = "type")]
    kind: NoteType,
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "lowercase")]
enum NoteType {
    Note,
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
struct NoteAttachment {
    id: String,
    url: String,
    #[schema(required)]
    background_url: Option<String>,
    content_type: String,
    is_primary: bool,
    #[serde(rename = "type")]
    kind: AttachmentType,
}

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "lowercase")]
enum AttachmentType {
    Upload,
}

#[derive(Serialize, ToSchema)]
pub struct Reaction {
    id: String,
    #[serde(rename = "type")]
    #[schema(value_type = Emoji)]
    kind: String,
    note_id: i32,
    user: PublicUser,
    created: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, ToSchema)]
pub enum Emoji {
    #[serde(rename = "❤️")]
    Heart,
    #[serde(rename = "😆")]
    Laughing,
    #[serde(rename = "🤮")]
    Vomiting,
}

impl Emoji {
    pub fn as_str(&self) -> &'static str {
        match self {
            Emoji::Heart => "❤️",
            Emoji::Laughing => "😆",
            Emoji::Vomiting => "🤮",
        }
    }
}

#[derive(Serialize, ToSchema)]
struct PublicUser {
    id: i32,
    name: String,
    email: String,
    avatar_url: String,
}

impl PublicUser {
    fn new(
        storage_url: &Url,
        id: i32,
        name: Option<String>,
        email: String,
        profile_key: Option<&str>,
    ) -> Self {
        Self {
            id,
            avatar_url: avatar_url(storage_url, &email, profile_key),
            // `user.name or user.email`
            name: name
                .filter(|n| !n.is_empty())
                .unwrap_or_else(|| email.clone()),
            email,
        }
    }
}

impl Reaction {
    pub fn from_row(row: ReactionRow, storage_url: &Url) -> Self {
        Self {
            id: row.id.to_string(),
            kind: row.emoji,
            note_id: row.note_id,
            user: PublicUser::new(
                storage_url,
                row.user_id,
                row.user_name,
                row.user_email,
                row.user_profile_key.as_deref(),
            ),
            created: row.created,
        }
    }
}

impl Note {
    pub async fn load(
        client: &impl GenericClient,
        storage_url: &Url,
        note_id: i32,
    ) -> Result<Self, ApiError> {
        let row = note().bind(client, &note_id).one().await?;
        let attachments = note_attachments().bind(client, &note_id).all().await?;
        let reactions = note_reactions().bind(client, &note_id).all().await?;

        Ok(Self {
            id: row.id.to_string(),
            text: row.text,
            created_by: PublicUser::new(
                storage_url,
                row.created_by_id,
                row.created_by_name,
                row.created_by_email,
                row.created_by_profile_key.as_deref(),
            ),
            created: row.created,
            modified: row.modified,
            attachments: attachments
                .into_iter()
                .map(|a| NoteAttachment {
                    id: a.id.to_string(),
                    url: public_url(storage_url, &a.key),
                    background_url: a.background_url,
                    content_type: a.content_type,
                    is_primary: Some(a.id) == row.primary_image_id,
                    kind: AttachmentType::Upload,
                })
                .collect(),
            reactions: reactions
                .into_iter()
                .map(|r| Reaction::from_row(r, storage_url))
                .collect(),
            kind: NoteType::Note,
        })
    }
}

/// Upload ids are strings in the API, Django 500s when they aren't integers.
pub fn parse_upload_ids(ids: &[String]) -> Result<Vec<i32>, ApiError> {
    ids.iter()
        .map(|id| {
            id.parse()
                .map_err(|_| ApiError::Validation(format!("invalid upload id: {id}")))
        })
        .collect()
}
