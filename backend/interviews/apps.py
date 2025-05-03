# This file sets up the configuration for the 'interviews' app inside the Django project.
# It's used by Django to recognize this app and apply certain default behaviors.

from django.apps import AppConfig

# This class is the config for the interviews app.
# Django looks at this class to know how to load and manage the app.
class InterviewsConfig(AppConfig):
    # This sets the default type for primary keys in the database to BigAutoField.
    # It helps avoid integer overflow if the app gets lots of records in the future.
    default_auto_field = 'django.db.models.BigAutoField'
    
    # This tells Django the name of the app so it can link everything correctly.
    name = 'interviews'
