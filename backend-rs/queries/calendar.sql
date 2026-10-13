--! calendar_exists
SELECT EXISTS (SELECT 1 FROM core_calendar WHERE id = :id AND team_id = :team_id);

--! insert_calendar
--- CommonInfo's `created` default and `modified` auto_now are set by Django,
--- not the database.
INSERT INTO core_calendar (name, team_id, created, modified)
VALUES (:name, :team_id, now(), now())
RETURNING id;
