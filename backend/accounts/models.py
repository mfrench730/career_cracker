from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    major = models.CharField(max_length=255)
    education_level = models.CharField(max_length=255)
    experience_level = models.CharField(max_length=255)
    preferred_interview_type = models.JSONField()
    preferred_language = models.CharField(max_length=255)
    resume_url = models.URLField(null=True, blank=True)
    target_job_title = models.CharField(max_length=255, null=True)
    
    def __str__(self):
        return self.full_name
