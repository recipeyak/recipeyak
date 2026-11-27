//! Port of `recipeyak.api.upload_complete_view`.
//!
//! POST /api/v1/upload/{upload_id}/complete

use axum::extract::State;
use cornucopia::client::Params as _;
use cornucopia::queries::upload::{CompleteUploadParams, complete_upload};
use serde::Serialize;
use utoipa::ToSchema;

use crate::AppState;
use crate::db::Db;
use crate::error::{ApiError, OrNotFound};
use crate::extract::user::User;
use crate::extract::{Json, Path};
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
    db: Db,
    Path(upload_id): Path<i32>,
) -> Result<Json<UploadCompleteResponse>, ApiError> {
    let upload = complete_upload()
        .params(
            &db,
            &CompleteUploadParams {
                id: upload_id,
                user_id: user.id,
            },
        )
        .opt()
        .await?
        .or_not_found()?;

    Ok(Json(UploadCompleteResponse {
        id: upload.id.to_string(),
        url: public_url(&state.config.storage_url, &upload.key),
        content_type: upload.content_type,
    }))
}
