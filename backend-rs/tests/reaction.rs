//! POST /api/v1/notes/{note_id}/reactions/ and DELETE /api/v1/reactions/{reaction_id}/

mod common;

use axum::http::StatusCode;
use common::{
    TestApp, TestDb, add_member, create_account, create_note, create_recipe, create_team, execute,
    login, query_one,
};
use serde_json::json;

#[tokio::test]
async fn create_and_delete_reaction() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let recipe_id = create_recipe(&db, account.team_id, "Bread").await;
    let note_id = create_note(&db, recipe_id, account.user_id, "yum").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);
    let uri = format!("/api/v1/notes/{note_id}/reactions/");

    let response = app
        .post(&uri, Some(&session_key), json!({"type": "❤️"}))
        .await;
    assert_eq!(response.status, StatusCode::OK);
    let body = response.json();
    assert_eq!(body["type"], "❤️");
    assert_eq!(body["note_id"], note_id);
    assert_eq!(body["user"]["id"], account.user_id);
    let reaction_id = body["id"].as_str().unwrap().to_string();

    // Reacting again with the same emoji returns the existing reaction.
    let response = app
        .post(&uri, Some(&session_key), json!({"type": "❤️"}))
        .await;
    assert_eq!(response.status, StatusCode::OK);
    assert_eq!(response.json()["id"], reaction_id);
    let count = query_one(&db, "SELECT count(*) FROM core_reaction", &[]).await;
    assert_eq!(count.get::<_, i64>(0), 1);

    let response = app
        .delete(
            &format!("/api/v1/reactions/{reaction_id}/"),
            Some(&session_key),
        )
        .await;
    assert_eq!(response.status, StatusCode::NO_CONTENT);
    let count = query_one(&db, "SELECT count(*) FROM core_reaction", &[]).await;
    assert_eq!(count.get::<_, i64>(0), 0);

    let published = app.ably.published();
    assert_eq!(published.len(), 3);
    for message in published {
        assert_eq!(
            message.path,
            format!(
                "/channels/team:{}:recipe:{recipe_id}/messages",
                account.team_id
            )
        );
        assert_eq!(message.name, "recipe_modified");
    }
}

#[tokio::test]
async fn create_reaction_rejects_unknown_emoji() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let recipe_id = create_recipe(&db, account.team_id, "Bread").await;
    let note_id = create_note(&db, recipe_id, account.user_id, "yum").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .post(
            &format!("/api/v1/notes/{note_id}/reactions/"),
            Some(&session_key),
            json!({"type": "👍"}),
        )
        .await;

    assert!(response.status.is_client_error(), "{}", response.status);
}

#[tokio::test]
async fn react_to_other_teams_note_is_not_found() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let other = create_account(&db, "bob@example.com").await;
    let recipe_id = create_recipe(&db, other.team_id, "Bread").await;
    let note_id = create_note(&db, recipe_id, other.user_id, "secret").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .post(
            &format!("/api/v1/notes/{note_id}/reactions/"),
            Some(&session_key),
            json!({"type": "😆"}),
        )
        .await;

    assert_eq!(response.status, StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn delete_other_users_reaction_is_noop() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let other = create_account(&db, "bob@example.com").await;
    let recipe_id = create_recipe(&db, account.team_id, "Bread").await;
    let note_id = create_note(&db, recipe_id, account.user_id, "yum").await;
    let reaction = query_one(
        &db,
        "INSERT INTO core_reaction (emoji, created_by_id, note_id, created, modified)
         VALUES ('🤮', $1, $2, now(), now()) RETURNING id",
        &[&account.user_id, &note_id],
    )
    .await;
    let reaction_id: i32 = reaction.get(0);
    let session_key = login(&db, other.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .delete(
            &format!("/api/v1/reactions/{reaction_id}/"),
            Some(&session_key),
        )
        .await;

    assert_eq!(response.status, StatusCode::NO_CONTENT);
    let count = query_one(&db, "SELECT count(*) FROM core_reaction", &[]).await;
    assert_eq!(count.get::<_, i64>(0), 1);
    assert!(app.ably.published().is_empty());
}

#[tokio::test]
async fn delete_reaction_on_other_teams_recipe_is_noop() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let recipe_id = create_recipe(&db, account.team_id, "Bread").await;
    let note_id = create_note(&db, recipe_id, account.user_id, "yum").await;
    let reaction = query_one(
        &db,
        "INSERT INTO core_reaction (emoji, created_by_id, note_id, created, modified)
         VALUES ('😆', $1, $2, now(), now()) RETURNING id",
        &[&account.user_id, &note_id],
    )
    .await;
    let reaction_id: i32 = reaction.get(0);
    // Alice switches to another team, so the recipe isn't on her current team.
    let other_team = create_team(&db, "Work").await;
    add_member(&db, other_team, account.user_id).await;
    execute(
        &db,
        "UPDATE core_myuser SET schedule_team_id = $2 WHERE id = $1",
        &[&account.user_id, &other_team],
    )
    .await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .delete(
            &format!("/api/v1/reactions/{reaction_id}/"),
            Some(&session_key),
        )
        .await;

    assert_eq!(response.status, StatusCode::NO_CONTENT);
    let count = query_one(&db, "SELECT count(*) FROM core_reaction", &[]).await;
    assert_eq!(count.get::<_, i64>(0), 1);
    assert!(app.ably.published().is_empty());
}
