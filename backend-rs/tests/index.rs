//! GET /index.html

mod common;

use axum::http::StatusCode;
use chrono::Utc;
use common::{TestApp, TestDb, create_account, create_recipe, create_user, login, schedule_recipe};
use serde_json::{Value, json};

const BOOTSTRAP_START: &str = r#"<script type="application/json" id="bootstrap">"#;

fn bootstrap(body: &[u8]) -> Value {
    let html = String::from_utf8(body.to_vec()).unwrap();
    let start = html.find(BOOTSTRAP_START).expect("no bootstrap script") + BOOTSTRAP_START.len();
    let end = start + html[start..].find("</script>").unwrap();
    serde_json::from_str(&html[start..end]).unwrap()
}

#[tokio::test]
async fn anonymous_gets_page_without_data() {
    let db = TestDb::new().await;
    let app = TestApp::new(&db);

    let response = app.get("/index.html", None).await;

    assert_eq!(response.status, StatusCode::OK);
    let html = String::from_utf8(response.body).unwrap();
    assert!(!html.contains("<!--bootstrap-->"), "{html}");
    assert!(!html.contains(BOOTSTRAP_START), "{html}");
    assert!(html.contains("<body></body>"), "{html}");
}

#[tokio::test]
async fn includes_user_and_calendar() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let recipe_id = create_recipe(&db, account.team_id, "Pancakes").await;
    let today = Utc::now().date_naive();
    let scheduled_id = schedule_recipe(&db, &account, recipe_id, today).await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app.get("/index.html", Some(&session_key)).await;

    assert_eq!(response.status, StatusCode::OK);
    let data = bootstrap(&response.body);
    assert_eq!(
        data["user"],
        json!({
            "id": account.user_id,
            "name": "alice@example.com",
            "avatar_url": "/avatar/c160f8cc69a4f0bf2b0362752353d060?d=identicon&r=g",
            "email": "alice@example.com",
            "theme_day": "light",
            "theme_night": "dark",
            "theme_mode": "single",
            "schedule_team": account.team_id,
            "calendar_id": account.calendar_id,
        })
    );
    let calendar = &data["calendar"];
    assert_eq!(calendar["team"], account.team_id);
    assert!(calendar["start"].as_str().unwrap() < today.to_string().as_str());
    assert!(calendar["end"].as_str().unwrap() > today.to_string().as_str());
    // Same response as the calendar endpoint for that range.
    let list = app
        .get(
            &format!(
                "/api/v1/calendar/?start={}&end={}",
                calendar["start"].as_str().unwrap(),
                calendar["end"].as_str().unwrap()
            ),
            Some(&session_key),
        )
        .await
        .json();
    assert_eq!(calendar["scheduledRecipes"], list["scheduledRecipes"]);
    assert_eq!(calendar["scheduledRecipes"][0]["id"], scheduled_id);
}

#[tokio::test]
async fn user_without_calendar_gets_user_only() {
    let db = TestDb::new().await;
    let user_id = create_user(&db, "alice@example.com").await;
    let session_key = login(&db, user_id).await;
    let app = TestApp::new(&db);

    let response = app.get("/index.html", Some(&session_key)).await;

    assert_eq!(response.status, StatusCode::OK);
    let data = bootstrap(&response.body);
    assert_eq!(data["user"]["id"], user_id);
    assert_eq!(data["calendar"], Value::Null);
}

#[tokio::test]
async fn escapes_html_in_user_data() {
    let db = TestDb::new().await;
    let account = create_account(&db, "alice@example.com").await;
    let name = "</script><script>alert(1)</script><!--";
    let recipe_id = create_recipe(&db, account.team_id, name).await;
    schedule_recipe(&db, &account, recipe_id, Utc::now().date_naive()).await;
    let session_key = login(&db, account.user_id).await;
    let app = TestApp::new(&db);

    let response = app.get("/index.html", Some(&session_key)).await;

    let html = String::from_utf8(response.body.clone()).unwrap();
    assert!(!html.contains("alert(1)</script>"), "{html}");
    assert!(!html.contains("<!--"), "{html}");
    let data = bootstrap(&response.body);
    assert_eq!(
        data["calendar"]["scheduledRecipes"][0]["recipe"]["name"],
        name
    );
}
