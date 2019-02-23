from django.contrib.postgres.operations import CreateExtension


class PgStatStatements(CreateExtension):
    def __init__(self):
        self.name = "pg_stat_statements"
