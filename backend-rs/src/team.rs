use sqlx::PgPool;

use crate::auth::AuthUser;
use crate::error::ApiError;

/// Port of `recipeyak.models.get_team`, returns the id of the user's
/// currently selected team.
pub async fn get_team_id(pool: &PgPool, user: &AuthUser) -> Result<i32, ApiError> {
    let team_id = user.schedule_team_id.ok_or(ApiError::NotFound)?;
    let is_member = sqlx::query_scalar!(
        r#"
        SELECT EXISTS (
            SELECT 1
            FROM core_membership
            WHERE user_id = $1
              AND team_id = $2
              AND is_active
        ) AS "exists!"
        "#,
        user.id,
        team_id
    )
    .fetch_one(pool)
    .await?;
    if !is_member {
        return Err(ApiError::NotFound);
    }
    Ok(team_id)
}
