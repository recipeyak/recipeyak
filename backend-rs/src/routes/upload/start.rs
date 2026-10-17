//! Port of `recipeyak.api.upload_start_view`.
//!
//! POST /api/v1/upload/

use std::collections::BTreeMap;

use axum::Json;
use axum::extract::State;
use axum::http::StatusCode;
use cornucopia::queries::recipe::recipe_exists;
use cornucopia::queries::upload::insert_upload;
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;

use crate::AppState;
use crate::error::ApiError;
use crate::extract::team::Team;
use crate::extract::user::User;

#[derive(Deserialize, ToSchema, Default, PartialEq)]
#[serde(rename_all = "lowercase")]
pub enum UploadPurpose {
    #[default]
    Recipe,
    Profile,
}

#[derive(Deserialize, ToSchema)]
#[serde(deny_unknown_fields)]
pub struct UploadStartParams {
    file_name: String,
    content_type: String,
    content_length: i64,
    #[serde(default)]
    #[schema(required = false)]
    recipe_id: Option<i32>,
    #[serde(default)]
    #[schema(required = false)]
    purpose: UploadPurpose,
}

#[derive(Serialize, ToSchema)]
pub struct UploadStartResponse {
    id: i32,
    upload_url: String,
    upload_headers: BTreeMap<String, String>,
}

#[utoipa::path(
    post,
    path = "/api/v1/upload/",
    operation_id = "UploadStart",
    request_body = UploadStartParams,
    responses((status = 200, description = "Successful response.", body = UploadStartResponse)),
)]
pub async fn start_view(
    State(state): State<AppState>,
    user: User,
    team: Team,
    Json(params): Json<UploadStartParams>,
) -> Result<Json<UploadStartResponse>, ApiError> {
    let (recipe_id, profile_id) = match (params.purpose, params.recipe_id) {
        (UploadPurpose::Recipe, None) => {
            return Err(ApiError::Validation(
                "recipe_id is required when purpose is recipe".into(),
            ));
        }
        (UploadPurpose::Profile, Some(_)) => {
            return Err(ApiError::Validation(
                "recipe_id is not allowed when purpose is profile".into(),
            ));
        }
        (UploadPurpose::Recipe, Some(recipe_id)) => (Some(recipe_id), None),
        (UploadPurpose::Profile, None) => (None, Some(user.id)),
    };

    let client = state.pool.get().await?;
    if let Some(recipe_id) = recipe_id {
        let exists = recipe_exists()
            .bind(&client, &recipe_id, &team.id)
            .one()
            .await?;
        if !exists {
            return Err(ApiError::Api {
                code: "recipe_not_found",
                message: "Could not find recipe with provided ID.",
                status: StatusCode::BAD_REQUEST,
            });
        }
    }

    // uuid4().hex
    let key = format!(
        "{}/{:032x}/{}",
        user.id,
        rand::random::<u128>(),
        params.file_name
    );
    let s3 = &state.config.s3;
    let id = insert_upload()
        .bind(
            &client,
            &user.id,
            &s3.bucket,
            &key,
            &recipe_id,
            &profile_id,
            &params.content_type,
        )
        .one()
        .await?;

    let db_id = id.to_string();
    let upload_url = s3
        .presign_put_object(&key, params.content_length, &params.content_type, &db_id)
        .await
        .map_err(ApiError::Internal)?;

    Ok(Json(UploadStartResponse {
        id,
        upload_url,
        upload_headers: BTreeMap::from([("x-amz-meta-db_id".to_string(), db_id)]),
    }))
}
