--: Note(created_by_name?, created_by_profile_key?, primary_image_id?)
--: NoteAttachment(background_url?)
--: Reaction(user_name?, user_profile_key?)

--! note : Note
SELECT
    n.id,
    n.text,
    n.created,
    n.modified,
    u.id AS created_by_id,
    u.name AS created_by_name,
    u.email::text AS created_by_email,
    profile.key AS created_by_profile_key,
    r.primary_image_id
FROM core_note n
JOIN core_recipe r ON r.id = n.recipe_id
JOIN core_myuser u ON u.id = n.created_by_id
LEFT JOIN core_upload profile ON profile.id = u.profile_upload_id
WHERE n.id = :id;

--! note_attachments : NoteAttachment
SELECT id, key, content_type, background_url
FROM core_upload
WHERE note_id = :note_id
ORDER BY id;

--! note_reactions : Reaction
--- The model's `ordering = ["-created"]`.
SELECT
    re.id,
    re.emoji,
    re.note_id,
    re.created,
    u.id AS user_id,
    u.name AS user_name,
    u.email::text AS user_email,
    profile.key AS user_profile_key
FROM core_reaction re
JOIN core_myuser u ON u.id = re.created_by_id
LEFT JOIN core_upload profile ON profile.id = u.profile_upload_id
WHERE re.note_id = :note_id
ORDER BY re.created DESC;

--! reaction : Reaction
SELECT
    re.id,
    re.emoji,
    re.note_id,
    re.created,
    u.id AS user_id,
    u.name AS user_name,
    u.email::text AS user_email,
    profile.key AS user_profile_key
FROM core_reaction re
JOIN core_myuser u ON u.id = re.created_by_id
LEFT JOIN core_upload profile ON profile.id = u.profile_upload_id
WHERE re.id = :id;

--! team_note
--- `filter_notes(team=team).get(pk=...)`
SELECT n.created_by_id, n.recipe_id
FROM core_note n
JOIN core_recipe r ON r.id = n.recipe_id
WHERE n.id = :id AND r.team_id = :team_id;

--! insert_note
--- Only adds notes to recipes that belong to the team, like
--- `get_object_or_404(filter_recipes(team=team), ...)`.
INSERT INTO core_note (text, created_by_id, last_modified_by_id, recipe_id, created, modified)
SELECT :text, :user_id, :user_id, r.id, now(), now()
FROM core_recipe r
WHERE r.id = :recipe_id AND r.team_id = :team_id
RETURNING id;

--! update_note (text?)
UPDATE core_note
SET text = COALESCE(:text, text), modified = now()
WHERE id = :id;

--! insert_note_version
--- `save_note_version`, which records the note before it's changed.
INSERT INTO note_historical (note_id, actor_id, text, upload_ids, created, modified)
SELECT n.id, :actor_id, n.text, ARRAY(SELECT id FROM core_upload WHERE note_id = n.id), now(), now()
FROM core_note n
WHERE n.id = :note_id;

--! attach_uploads
--- Like Django's `QuerySet.update`, this doesn't touch `modified`.
UPDATE core_upload
SET note_id = :note_id
WHERE id = ANY(:upload_ids) AND created_by_id = :user_id;

--! detach_uploads
UPDATE core_upload SET note_id = NULL WHERE note_id = :note_id;

-- The foreign keys don't cascade in the database, so deleting a note
-- deletes its reactions and versions and detaches its uploads first, like
-- Django does.

--! delete_note_reactions
DELETE FROM core_reaction WHERE note_id = :note_id;

--! delete_note_versions
DELETE FROM note_historical WHERE note_id = :note_id;

--! delete_note
DELETE FROM core_note WHERE id = :id;

--! insert_reaction
--- Returns the existing reaction when the user already reacted with the
--- emoji. The no-op update is so `RETURNING` includes it.
INSERT INTO core_reaction (emoji, created_by_id, note_id, created, modified)
VALUES (:emoji, :user_id, :note_id, now(), now())
ON CONFLICT ON CONSTRAINT one_reaction_per_user
DO UPDATE SET emoji = EXCLUDED.emoji
RETURNING id;

--! delete_reaction : (team_id?)
DELETE FROM core_reaction re
USING core_note n, core_recipe r
WHERE re.id = :id
  AND re.created_by_id = :user_id
  AND n.id = re.note_id
  AND r.id = n.recipe_id
RETURNING r.id AS recipe_id, r.team_id;
