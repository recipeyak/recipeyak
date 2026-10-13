--! session_user : (schedule_team_id?, pinned_calendar_id?)
SELECT u.id, u.schedule_team_id, u.pinned_calendar_id
FROM user_sessions_session s
JOIN core_myuser u ON u.id = s.user_id
WHERE s.session_key = :session_key AND s.expire_date > now();
