mod common;

use axum::http::StatusCode;
use chrono::{Duration, TimeZone, Utc};
use common::TestApp;
use serde_json::json;

const PATH: &str = "/api/v1/recipes/recently_viewed";

#[tokio::test]
async fn returns_recently_viewed_recipes() {
    let app = TestApp::new().await;
    let team_id = app.create_team().await;
    let user = app.create_user(team_id).await;
    let session_key = app.login(&user).await;

    let older = app.create_recipe(team_id, "Older").await;
    let newer = app.create_recipe(team_id, "Newer").await;
    let image_id = app
        .set_primary_image(newer, "1/abc/pie.jpg", Some("data:image/jpeg;base64,abc"))
        .await;
    let archived_at = Utc.with_ymd_and_hms(2024, 1, 2, 3, 4, 5).unwrap();
    sqlx::query("UPDATE core_recipe SET archived_at = $1 WHERE id = $2")
        .bind(archived_at)
        .bind(older)
        .execute(&app.pool)
        .await
        .unwrap();

    let now = Utc::now();
    app.view_recipe(user.id, older, now - Duration::hours(1))
        .await;
    app.view_recipe(user.id, newer, now).await;

    let (res, body) = app.get(PATH, Some(&session_key)).await;

    assert_eq!(res.status(), StatusCode::OK);
    assert_eq!(
        body,
        json!([
            {
                "id": newer,
                "name": "Newer",
                "author": "Julia Child",
                "archivedAt": null,
                "primaryImage": {
                    "id": image_id,
                    "url": "https://images.example.com/1/abc/pie.jpg",
                    "backgroundUrl": "data:image/jpeg;base64,abc",
                },
            },
            {
                "id": older,
                "name": "Older",
                "author": "Julia Child",
                "archivedAt": "2024-01-02T03:04:05+00:00",
                "primaryImage": null,
            },
        ])
    );
}

#[tokio::test]
async fn limits_to_six_most_recent() {
    let app = TestApp::new().await;
    let team_id = app.create_team().await;
    let user = app.create_user(team_id).await;
    let session_key = app.login(&user).await;

    let now = Utc::now();
    let mut recipe_ids = Vec::new();
    for i in 0..8 {
        let recipe_id = app.create_recipe(team_id, &format!("Recipe {i}")).await;
        app.view_recipe(user.id, recipe_id, now - Duration::minutes(i))
            .await;
        recipe_ids.push(recipe_id);
    }

    let (res, body) = app.get(PATH, Some(&session_key)).await;

    assert_eq!(res.status(), StatusCode::OK);
    let ids: Vec<i64> = body
        .as_array()
        .unwrap()
        .iter()
        .map(|r| r["id"].as_i64().unwrap())
        .collect();
    let expected: Vec<i64> = recipe_ids[..6].iter().map(|&id| id.into()).collect();
    assert_eq!(ids, expected);
}

#[tokio::test]
async fn excludes_other_teams_and_users() {
    let app = TestApp::new().await;
    let team_id = app.create_team().await;
    let other_team_id = app.create_team().await;
    let user = app.create_user(team_id).await;
    app.add_membership(user.id, other_team_id, true).await;
    let other_user = app.create_user(team_id).await;
    let session_key = app.login(&user).await;

    let mine = app.create_recipe(team_id, "Mine").await;
    let other_team_recipe = app.create_recipe(other_team_id, "Other team").await;
    let now = Utc::now();
    app.view_recipe(user.id, mine, now).await;
    app.view_recipe(user.id, other_team_recipe, now).await;
    // a different user viewing a recipe in the same team shouldn't show up
    let only_viewed_by_other = app.create_recipe(team_id, "Theirs").await;
    app.view_recipe(other_user.id, only_viewed_by_other, now)
        .await;

    let (res, body) = app.get(PATH, Some(&session_key)).await;

    assert_eq!(res.status(), StatusCode::OK);
    let ids: Vec<i64> = body
        .as_array()
        .unwrap()
        .iter()
        .map(|r| r["id"].as_i64().unwrap())
        .collect();
    assert_eq!(ids, vec![i64::from(mine)]);
}

#[tokio::test]
async fn not_a_member_of_selected_team() {
    let app = TestApp::new().await;
    let team_id = app.create_team().await;
    let user = app.create_user(team_id).await;
    let session_key = app.login(&user).await;
    sqlx::query("UPDATE core_membership SET is_active = false WHERE user_id = $1")
        .bind(user.id)
        .execute(&app.pool)
        .await
        .unwrap();

    let (res, _) = app.get(PATH, Some(&session_key)).await;

    assert_eq!(res.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn sets_no_cache_headers() {
    let app = TestApp::new().await;
    let team_id = app.create_team().await;
    let user = app.create_user(team_id).await;
    let session_key = app.login(&user).await;

    let (res, _) = app.get(PATH, Some(&session_key)).await;

    assert_eq!(
        res.headers().get("cache-control").unwrap(),
        "no-store, no-cache, must-revalidate"
    );
}
