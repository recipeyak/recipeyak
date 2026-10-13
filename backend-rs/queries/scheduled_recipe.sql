--! scheduled_recipes : (recipe_author?, recipe_archived_at?, image_id?, image_key?, image_background_url?, created_by_id?, created_by_name?, created_by_email?, created_by_profile_key?)
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
