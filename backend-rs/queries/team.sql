--! is_active_member
SELECT EXISTS (
    SELECT 1
    FROM core_team t
    JOIN core_membership m ON m.team_id = t.id
    WHERE t.id = :team_id AND m.user_id = :user_id AND m.is_active
);
