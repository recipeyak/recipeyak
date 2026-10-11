//! GET /api/v1/calendar/

mod common;

use axum::http::StatusCode;
use chrono::NaiveDate;
use common::{
    Account, TestApp, create_account, create_calendar, create_recipe, login, schedule_recipe,
    set_primary_image,
};
use serde_json::json;
use sqlx::PgPool;

fn date(s: &str) -> NaiveDate {
    s.parse().unwrap()
}

#[sqlx::test(migrations = "tests/schema")]
async fn returns_scheduled_recipe_with_recipe_and_creator(pool: PgPool) {
    let account = create_account(&pool, "alice@example.com").await;
    let recipe_id = create_recipe(&pool, account.team_id, "Pancakes").await;
    let image_id = set_primary_image(&pool, recipe_id, "recipes/pancakes.jpg").await;
    let scheduled_id = schedule_recipe(&pool, &account, recipe_id, date("2026-10-05")).await;
    let session_key = login(&pool, account.user_id).await;
    let app = TestApp::new(pool);

    let response = app
        .get(
            "/api/v1/calendar/?start=2026-10-01&end=2026-10-07",
            Some(&session_key),
        )
        .await;

    assert_eq!(response.status, StatusCode::OK);
    let mut scheduled = response.json()["scheduledRecipes"][0].clone();
    scheduled.as_object_mut().unwrap().remove("created");
    assert_eq!(
        scheduled,
        json!({
            "id": scheduled_id,
            "createdBy": {
                "id": account.user_id,
                // falls back to the email when the user has no name
                "name": "alice@example.com",
                "avatar_url": "/avatar/c160f8cc69a4f0bf2b0362752353d060?d=identicon&r=g",
            },
            "team": account.team_id,
            "user": account.user_id,
            "recipe": {
                "id": recipe_id,
                "name": "Pancakes",
                "author": null,
                "archivedAt": null,
                "primaryImage": {
                    "id": image_id.to_string(),
                    "url": "https://images.test/recipes/pancakes.jpg",
                    "backgroundUrl": null,
                },
            },
            "on": "2026-10-05",
        })
    );
}

#[sqlx::test(migrations = "tests/schema")]
async fn returns_only_pinned_calendar_within_dates_newest_first(pool: PgPool) {
    let account = create_account(&pool, "alice@example.com").await;
    let other_calendar = Account {
        calendar_id: create_calendar(&pool, account.team_id, "Lunches").await,
        ..account
    };
    let recipe_id = create_recipe(&pool, account.team_id, "Pancakes").await;
    schedule_recipe(&pool, &account, recipe_id, date("2026-10-02")).await;
    let on_start = schedule_recipe(&pool, &account, recipe_id, date("2026-10-03")).await;
    let on_end = schedule_recipe(&pool, &account, recipe_id, date("2026-10-07")).await;
    schedule_recipe(&pool, &account, recipe_id, date("2026-10-08")).await;
    schedule_recipe(&pool, &other_calendar, recipe_id, date("2026-10-05")).await;
    let session_key = login(&pool, account.user_id).await;
    let app = TestApp::new(pool);

    let response = app
        .get(
            "/api/v1/calendar/?start=2026-10-03&end=2026-10-07",
            Some(&session_key),
        )
        .await;

    assert_eq!(response.status, StatusCode::OK);
    let ids: Vec<i64> = response.json()["scheduledRecipes"]
        .as_array()
        .unwrap()
        .iter()
        .map(|s| s["id"].as_i64().unwrap())
        .collect();
    assert_eq!(ids, [i64::from(on_end), i64::from(on_start)]);
}

#[sqlx::test(migrations = "tests/schema")]
async fn user_no_longer_on_selected_team_gets_not_found(pool: PgPool) {
    let account = create_account(&pool, "alice@example.com").await;
    sqlx::query("UPDATE core_membership SET is_active = false WHERE user_id = $1")
        .bind(account.user_id)
        .execute(&pool)
        .await
        .unwrap();
    let session_key = login(&pool, account.user_id).await;
    let app = TestApp::new(pool);

    let response = app
        .get(
            "/api/v1/calendar/?start=2026-10-01&end=2026-10-07",
            Some(&session_key),
        )
        .await;

    assert_eq!(response.status, StatusCode::NOT_FOUND);
}

#[sqlx::test(migrations = "tests/schema")]
async fn missing_dates_is_validation_error(pool: PgPool) {
    let account = create_account(&pool, "alice@example.com").await;
    let session_key = login(&pool, account.user_id).await;
    let app = TestApp::new(pool);

    let response = app.get("/api/v1/calendar/", Some(&session_key)).await;

    assert_eq!(response.status, StatusCode::BAD_REQUEST);
    assert_eq!(response.json()["error"]["code"], "validation_error");
}
