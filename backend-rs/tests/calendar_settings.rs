//! GET and PATCH /api/v1/calendar/settings/, and
//! POST /api/v1/calendar/generate_link/

mod common;

use axum::http::StatusCode;
use common::{
    TestApp, TestDb, add_member, create_account, create_user, execute, login, query_one,
    select_calendar,
};
use serde_json::json;

#[tokio::test]
async fn returns_sync_setting_and_calendar_link() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .get("/api/v1/calendar/settings/", Some(&session_key))
        .await;

    assert_eq!(response.status, StatusCode::OK);
    assert_eq!(
        response.json(),
        json!({
            "syncEnabled": false,
            "calendarLink": format!(
                "webcal://recipeyak.test/t/{}/ical/secret/schedule.ics",
                account.team_id
            ),
        })
    );
}

#[tokio::test]
async fn updates_sync_enabled() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .patch(
            "/api/v1/calendar/settings/",
            Some(&session_key),
            json!({"syncEnabled": true}),
        )
        .await;

    assert_eq!(response.status, StatusCode::OK);
    assert_eq!(response.json()["syncEnabled"], true);
    let sync_enabled: bool = query_one(
        &db,
        "SELECT calendar_sync_enabled FROM core_membership WHERE user_id = $1",
        &[&account.user_id],
    )
    .await
    .get(0);
    assert!(sync_enabled);
}

#[tokio::test]
async fn generate_link_replaces_secret_key() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app
        .post(
            "/api/v1/calendar/generate_link/",
            Some(&session_key),
            json!({}),
        )
        .await;

    assert_eq!(response.status, StatusCode::OK);
    let secret_key: String = query_one(
        &db,
        "SELECT calendar_secret_key FROM core_membership WHERE user_id = $1",
        &[&account.user_id],
    )
    .await
    .get(0);
    assert_ne!(secret_key, "secret");
    assert_eq!(
        response.json()["calendarLink"],
        format!(
            "webcal://recipeyak.test/t/{}/ical/{secret_key}/schedule.ics",
            account.team_id
        )
    );
}

#[tokio::test]
async fn returns_link_for_own_membership_on_shared_team() {
    let db = TestDb::new().await;
    let alice = create_account(&db, "alice@example.com").await;
    execute(
        &db,
        "UPDATE core_membership SET calendar_secret_key = 'alices' WHERE user_id = $1",
        &[&alice.user_id],
    )
    .await;
    let bob = create_user(&db, "bob@example.com").await;
    add_member(&db, alice.team_id, bob).await;
    select_calendar(&db, bob, alice.team_id, alice.calendar_id).await;
    let session_key = login(&db, bob).await;
    let app = TestApp::new(&db);

    let response = app
        .get("/api/v1/calendar/settings/", Some(&session_key))
        .await;

    assert_eq!(
        response.json()["calendarLink"],
        format!(
            "webcal://recipeyak.test/t/{}/ical/secret/schedule.ics",
            alice.team_id
        )
    );
}
