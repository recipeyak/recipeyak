--! insert_upload (recipe_id?, profile_id?)
--- CommonInfo's `created` default and `modified` auto_now are set by Django,
--- not the database.
INSERT INTO core_upload (created_by_id, bucket, key, recipe_id, profile_id, content_type, completed, created, modified)
VALUES (:created_by_id, :bucket, :key, :recipe_id, :profile_id, :content_type, false, now(), now())
RETURNING id;

--! complete_upload
--- Also sets the upload as the user's avatar when it's for their profile.
WITH upload AS (
    UPDATE core_upload
    SET completed = true, modified = now()
    WHERE id = :id AND created_by_id = :user_id
    RETURNING id, key, content_type, profile_id
), profile AS (
    UPDATE core_myuser u
    SET profile_upload_id = upload.id, last_updated = current_date
    FROM upload
    WHERE u.id = upload.profile_id
)
SELECT id, key, content_type FROM upload;
