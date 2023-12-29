# Generated by Django 3.2.9 on 2023-12-29 18:30

import django.db.models.deletion
import django.utils.timezone
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("recipeyak", "0125_auto_20231229_1805"),
    ]

    operations = [
        migrations.CreateModel(
            name="RecipeIndexQueue",
            fields=[
                ("created", models.DateTimeField(default=django.utils.timezone.now)),
                ("modified", models.DateTimeField(auto_now=True)),
                ("id", models.AutoField(primary_key=True, serialize=False)),
                (
                    "recipe",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        to="recipeyak.recipe",
                    ),
                ),
            ],
            options={
                "db_table": "recipe_index_queue",
            },
        ),
        migrations.RunSQL(
            """
CREATE OR REPLACE FUNCTION update_core_recipe_indexing()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO recipe_index_queue (created, modified, recipe_id)
    VALUES (now(), now(), OLD.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
                          
CREATE TRIGGER recipe_modified_trigger
AFTER INSERT OR UPDATE OR DELETE ON core_recipe
FOR EACH ROW
EXECUTE FUNCTION update_core_recipe_indexing();
""",
            """
DROP TRIGGER recipe_modified_trigger on  core_recipe;
DROP function update_core_recipe_indexing;
""",
        ),
        migrations.RunSQL(
            """
CREATE OR REPLACE FUNCTION update_core_ingredient_indexing()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO recipe_index_queue (created, modified, recipe_id)
    VALUES (now(), now(), OLD.recipe_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
                          
CREATE TRIGGER ingredient_modified_trigger
AFTER INSERT OR UPDATE OR DELETE ON core_ingredient
FOR EACH ROW
EXECUTE FUNCTION update_core_ingredient_indexing();
""",
            """
DROP TRIGGER ingredient_modified_trigger on  core_ingredient;
DROP function update_core_ingredient_indexing;
""",
        ),
        migrations.RunSQL(
            """
CREATE OR REPLACE FUNCTION notify_index_updated()
RETURNS TRIGGER AS $$
BEGIN
    notify recipe_enqueued_for_indexing;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
                          
CREATE TRIGGER notify_index_updated_trigger
AFTER INSERT OR UPDATE ON recipe_index_queue
FOR EACH STATEMENT
EXECUTE FUNCTION notify_index_updated();
""",
            """
DROP TRIGGER notify_index_updated_trigger on recipe_index_queue;
DROP function notify_index_updated;

""",
        ),
    ]
