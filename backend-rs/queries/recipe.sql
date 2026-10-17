--! recipe_exists
--- `filter_recipes(team=team).filter(id=...)`
SELECT EXISTS (SELECT 1 FROM core_recipe WHERE id = :id AND team_id = :team_id);
