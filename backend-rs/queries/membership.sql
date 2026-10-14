--: CalendarSettings()

--! calendar_settings : CalendarSettings
SELECT calendar_sync_enabled, calendar_secret_key
FROM core_membership
WHERE team_id = :team_id AND user_id = :user_id;

--! update_calendar_sync_enabled : CalendarSettings
UPDATE core_membership
SET calendar_sync_enabled = :sync_enabled, modified = now()
WHERE team_id = :team_id AND user_id = :user_id
RETURNING calendar_sync_enabled, calendar_secret_key;

--! update_calendar_secret_key : CalendarSettings
UPDATE core_membership
SET calendar_secret_key = :secret_key, modified = now()
WHERE team_id = :team_id AND user_id = :user_id
RETURNING calendar_sync_enabled, calendar_secret_key;
