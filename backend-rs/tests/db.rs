//! Transactions on the traced `Db`.

mod common;

use common::{TestDb, create_team, query_one};
use cornucopia::client::GenericClient;
use recipeyak::db::DbPool;

async fn team_count(db: &TestDb) -> i64 {
    query_one(db, "SELECT count(*) FROM core_team", &[])
        .await
        .get(0)
}

const INSERT_TEAM: &str =
    "INSERT INTO core_team (name, created, modified) VALUES ('Household', now(), now())";

#[tokio::test]
async fn transaction_commits() {
    let db = TestDb::new().await;
    let mut conn = DbPool::new(db.clone()).get().await.unwrap();

    let tx = conn.transaction().await.unwrap();
    tx.execute(INSERT_TEAM, &[]).await.unwrap();
    tx.commit().await.unwrap();

    assert_eq!(team_count(&db).await, 1);
}

#[tokio::test]
async fn transaction_rolls_back_when_dropped() {
    let db = TestDb::new().await;
    create_team(&db, "Existing").await;
    let mut conn = DbPool::new(db.clone()).get().await.unwrap();

    {
        let tx = conn.transaction().await.unwrap();
        tx.execute(INSERT_TEAM, &[]).await.unwrap();
        // An early return with `?` drops it the same way.
    }

    assert_eq!(team_count(&db).await, 1);
    // The connection is usable again afterwards.
    conn.execute(INSERT_TEAM, &[]).await.unwrap();
    assert_eq!(team_count(&db).await, 2);
}
