from django.db import models
from django.contrib.auth.models import User






#ali created it
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    major = models.CharField(max_length=255)
    education_level = models.CharField(max_length=255)
    experience_level = models.CharField(max_length=255)
    preferred_interview_type = models.JSONField()
    preferred_language = models.CharField(max_length=255)
    resume_url = models.URLField(null=True, blank=True)
    
    def __str__(self):
        return self.full_name

####################################################

# Create your models here.
class TestModel(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    age = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class TestModel2(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    age = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class TestModel3(models.Model):
    name = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    age = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
