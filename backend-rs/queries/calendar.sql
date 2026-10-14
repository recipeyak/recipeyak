--! calendar_exists
SELECT EXISTS (SELECT 1 FROM core_calendar WHERE id = :id AND team_id = :team_id);

--! insert_calendar
--- CommonInfo's `created` default and `modified` auto_now are set by Django,
--- not the database.
INSERT INTO core_calendar (name, team_id, created, modified)
VALUES (:name, :team_id, now(), now())
RETURNING id;

--! team_calendars
--- The model's `ordering = ["name"]`.
SELECT id, name
FROM core_calendar
WHERE team_id = :team_id
ORDER BY name;

--! pin_calendar
UPDATE core_myuser
SET pinned_calendar_id = c.id
FROM core_calendar c
WHERE core_myuser.id = :user_id AND c.id = :calendar_id AND c.team_id = :team_id
RETURNING c.id;
