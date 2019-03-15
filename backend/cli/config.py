def setup_django():
    import os
    from dotenv import load_dotenv
    import django

    load_dotenv()
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")
    django.setup(set_prefix=False)
