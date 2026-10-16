--! session_user : (schedule_team_id?, pinned_calendar_id?)
SELECT u.id, u.schedule_team_id, u.pinned_calendar_id
FROM user_sessions_session s
JOIN core_myuser u ON u.id = s.user_id
WHERE s.session_key = :session_key AND s.expire_date > now();

--! user_detail : (name?, schedule_team_id?, pinned_calendar_id?, profile_upload_key?)
--- The fields of `serialize_user`, with `select_related("profile_upload")`.
SELECT
    u.id,
    u.name,
    u.email::text AS email,
    u.theme AS theme_day,
    u.theme_night,
    u.theme_mode,
    u.schedule_team_id,
    u.pinned_calendar_id,
    profile.key AS profile_upload_key
FROM core_myuser u
LEFT JOIN core_upload profile ON profile.id = u.profile_upload_id
WHERE u.id = :user_id;
