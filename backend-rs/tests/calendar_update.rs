//! PATCH /api/v1/calendar/{scheduled_recipe_id}/

mod common;

use axum::http::StatusCode;
use chrono::NaiveDate;
use common::{Account, Setup, create_calendar, create_recipe, query_one, schedule_recipe, setup};
use serde_json::json;

fn date(s: &str) -> NaiveDate {
    s.parse().unwrap()
}

#[tokio::test]
async fn moves_scheduled_recipe() {
    let Setup { db, account, app } = setup().await;
    let recipe_id = create_recipe(&db, account.team_id, "Pancakes").await;
    let scheduled_id = schedule_recipe(&db, &account, recipe_id, date("2026-10-05")).await;

    let response = app
        .patch(
            &format!("/api/v1/calendar/{scheduled_id}/"),
            json!({"on": "2026-10-09"}),
        )
        .await;

    assert_eq!(response.status, StatusCode::OK);
    let on: NaiveDate = query_one(
        &db,
        "SELECT \"on\" FROM core_scheduledrecipe WHERE id = $1",
        &[&scheduled_id],
    )
    .await
    .get(0);
    assert_eq!(on, date("2026-10-09"));
}

#[tokio::test]
async fn records_schedule_event_with_previous_date() {
    let Setup { db, account, app } = setup().await;
    let recipe_id = create_recipe(&db, account.team_id, "Pancakes").await;
    let scheduled_id = schedule_recipe(&db, &account, recipe_id, date("2026-10-05")).await;

    app.patch(
        &format!("/api/v1/calendar/{scheduled_id}/"),
        json!({"on": "2026-10-09"}),
    )
    .await;

    let event = query_one(
        &db,
        "SELECT before_on, after_on, actor_id FROM schedule_event WHERE scheduled_recipe_id = $1",
        &[&scheduled_id],
    )
    .await;
    assert_eq!(
        (
            event.get::<_, NaiveDate>(0),
            event.get::<_, NaiveDate>(1),
            event.get::<_, i32>(2)
        ),
        (date("2026-10-05"), date("2026-10-09"), account.user_id)
    );
}

#[tokio::test]
async fn publishes_moved_scheduled_recipe() {
    let Setup { db, account, app } = setup().await;
    let recipe_id = create_recipe(&db, account.team_id, "Pancakes").await;
    let scheduled_id = schedule_recipe(&db, &account, recipe_id, date("2026-10-05")).await;

    let response = app
        .patch(
            &format!("/api/v1/calendar/{scheduled_id}/"),
            json!({"on": "2026-10-09"}),
        )
        .await;

    let published = app.ably.published();
    assert_eq!(published.len(), 1);
    assert_eq!(published[0].name, "scheduled_recipe_updated");
    assert_eq!(published[0].data, response.json());
}

#[tokio::test]
async fn scheduled_recipe_on_another_calendar_is_not_found() {
    let Setup { db, account, app } = setup().await;
    let other_calendar = Account {
        calendar_id: create_calendar(&db, account.team_id, "Lunches").await,
        ..account
    };
    let recipe_id = create_recipe(&db, account.team_id, "Pancakes").await;
    let scheduled_id = schedule_recipe(&db, &other_calendar, recipe_id, date("2026-10-05")).await;

    let response = app
        .patch(
            &format!("/api/v1/calendar/{scheduled_id}/"),
            json!({"on": "2026-10-09"}),
        )
        .await;

    assert_eq!(response.status, StatusCode::NOT_FOUND);
    let events: i64 = query_one(&db, "SELECT count(*) FROM schedule_event", &[])
        .await
        .get(0);
    assert_eq!(events, 0);
    assert!(app.ably.published().is_empty());
}
