//! Port of `recipeyak.api.upload_complete_view`.
//!
//! POST /api/v1/upload/{upload_id}/complete

use axum::Json;
use axum::extract::{Path, State};
use cornucopia::queries::upload::{complete_upload, set_profile_upload};
use serde::Serialize;
use utoipa::ToSchema;

use crate::AppState;
use crate::error::ApiError;
use crate::extract::user::User;
use crate::urls::public_url;

#[derive(Serialize, ToSchema)]
#[serde(rename_all = "camelCase")]
pub struct UploadCompleteResponse {
    id: String,
    url: String,
    content_type: String,
}

#[utoipa::path(
    post,
    path = "/api/v1/upload/{upload_id}/complete",
    operation_id = "UploadComplete",
    params(("upload_id" = i32, Path)),
    responses((status = 200, description = "Successful response.", body = UploadCompleteResponse)),
)]
pub async fn complete_view(
    State(state): State<AppState>,
    user: User,
    Path(upload_id): Path<i32>,
) -> Result<Json<UploadCompleteResponse>, ApiError> {
    let mut client = state.pool.get().await?;
    let tx = client.transaction().await?;
    let upload = complete_upload()
        .bind(&tx, &upload_id, &user.id)
        .opt()
        .await?
        .ok_or(ApiError::NotFound)?;
    if let Some(profile_id) = upload.profile_id {
        set_profile_upload()
            .bind(&tx, &upload.id, &profile_id)
            .await?;
    }
    tx.commit().await?;

    Ok(Json(UploadCompleteResponse {
        id: upload.id.to_string(),
        url: public_url(&state.config.storage_url, &upload.key),
        content_type: upload.content_type,
    }))
}
