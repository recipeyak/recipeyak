--: ScheduledRecipe(recipe_author?, recipe_archived_at?, image_id?, image_key?, image_background_url?, created_by_id?, created_by_name?, created_by_email?, created_by_profile_key?)

--! scheduled_recipes : ScheduledRecipe
--- Same joins as the view's `select_related("recipe__primary_image",
--- "created_by__profile_upload")`, and the model's `ordering = ["-on"]`.
SELECT
    sr.id,
    sr.created,
    sr."on",
    sr.recipe_id,
    r.name AS recipe_name,
    r.author AS recipe_author,
    r.archived_at AS recipe_archived_at,
    image.id AS image_id,
    image.key AS image_key,
    image.background_url AS image_background_url,
    u.id AS created_by_id,
    u.name AS created_by_name,
    u.email::text AS created_by_email,
    profile.key AS created_by_profile_key
FROM core_scheduledrecipe sr
JOIN core_recipe r ON r.id = sr.recipe_id
LEFT JOIN core_upload image ON image.id = r.primary_image_id
LEFT JOIN core_myuser u ON u.id = sr.created_by_id
LEFT JOIN core_upload profile ON profile.id = u.profile_upload_id
WHERE sr.team_id = :team_id
  AND sr.calendar_id = :calendar_id
  AND sr."on" >= :start
  AND sr."on" <= :end
ORDER BY sr."on" DESC;

--! scheduled_recipe : ScheduledRecipe
SELECT
    sr.id,
    sr.created,
    sr."on",
    sr.recipe_id,
    r.name AS recipe_name,
    r.author AS recipe_author,
    r.archived_at AS recipe_archived_at,
    image.id AS image_id,
    image.key AS image_key,
    image.background_url AS image_background_url,
    u.id AS created_by_id,
    u.name AS created_by_name,
    u.email::text AS created_by_email,
    profile.key AS created_by_profile_key
FROM core_scheduledrecipe sr
JOIN core_recipe r ON r.id = sr.recipe_id
LEFT JOIN core_upload image ON image.id = r.primary_image_id
LEFT JOIN core_myuser u ON u.id = sr.created_by_id
LEFT JOIN core_upload profile ON profile.id = u.profile_upload_id
WHERE sr.id = :id;

--! insert_scheduled_recipe
--- Only schedules recipes that belong to the team, like
--- `get_object_or_404(filter_recipes(team=team), ...)`.
INSERT INTO core_scheduledrecipe (recipe_id, "on", team_id, calendar_id, created_by_id, created, modified)
SELECT r.id, :on, :team_id, :calendar_id, :user_id, now(), now()
FROM core_recipe r
WHERE r.id = :recipe_id AND r.team_id = :team_id
RETURNING id;

--! reschedule_recipe
--- Moves the scheduled recipe and records the change as a ScheduleEvent.
WITH old AS (
    SELECT id, "on"
    FROM core_scheduledrecipe
    WHERE id = :id AND team_id = :team_id AND calendar_id = :calendar_id
    FOR UPDATE
), updated AS (
    UPDATE core_scheduledrecipe sr
    SET "on" = :on, modified = now()
    FROM old
    WHERE sr.id = old.id
    RETURNING sr.id, old."on" AS before_on
)
INSERT INTO schedule_event (scheduled_recipe_id, before_on, after_on, actor_id, created, modified)
SELECT id, before_on, :on, :actor_id, now(), now()
FROM updated
RETURNING scheduled_recipe_id;

--! delete_scheduled_recipe
--- The foreign keys don't cascade in the database, Django deletes the
--- ScheduleEvents itself.
WITH sr AS (
    SELECT id
    FROM core_scheduledrecipe
    WHERE id = :id AND team_id = :team_id AND calendar_id = :calendar_id
), events AS (
    DELETE FROM schedule_event WHERE scheduled_recipe_id IN (SELECT id FROM sr)
)
DELETE FROM core_scheduledrecipe WHERE id IN (SELECT id FROM sr);
