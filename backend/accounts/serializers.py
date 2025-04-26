from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile


class UserSignupSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=True)
    full_name = serializers.CharField(required=True)

    major = serializers.CharField(required=True)
    education_level = serializers.CharField(required=True)
    experience_level = serializers.CharField(required=True)
    preferred_interview_type = serializers.ListField(child=serializers.CharField(), required=True)
    preferred_language = serializers.CharField(required=True)
    
    resume_url = serializers.URLField(required=False, allow_null=True)

    target_job_title = serializers.CharField(required=False, allow_blank=True)

    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ["username", "full_name", "email", "password", "major", "education_level", "experience_level", "preferred_interview_type", "preferred_language", "resume_url",  "target_job_title"]

    def validate_email(self, value):
        """Check if email is unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already in use.")
        return value

    def create(self, validated_data):
        """Create user and profile with error handling"""
        try:
            password = validated_data.pop("password")
            profile_data = {
                "full_name": validated_data.pop("full_name"),
                "major": validated_data.pop("major"),
                "education_level": validated_data.pop("education_level"),
                "experience_level": validated_data.pop("experience_level"),
                "preferred_interview_type": validated_data.pop("preferred_interview_type"),
                "preferred_language": validated_data.pop("preferred_language"),
                "resume_url": validated_data.pop("resume_url", None),
                "target_job_title": validated_data.pop("target_job_title", None)

            }
            
            user = User.objects.create_user(
                username=validated_data["username"],
                email=validated_data["email"],
                password=password
            )
            
            UserProfile.objects.create(user=user, **profile_data)
            return user
            
        except KeyError as e:
            raise serializers.ValidationError(f"Missing required field: {str(e)}")

    def validate_username(self, value):
        """Check if username is unique"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username is already taken.")
        return value

class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source='user.email', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['username', 'email', 'full_name', 'major', 'education_level', 
                  'experience_level', 'preferred_interview_type', 'preferred_language', 
                  'resume_url', 'target_job_title']
        
    def update(self, instance, validated_data):
        """Handle preferred_interview_type field specially if needed"""
        if 'preferred_interview_type' in validated_data:
            interview_type = validated_data['preferred_interview_type']
            if isinstance(interview_type, str):
                try:
                    import json
                    validated_data['preferred_interview_type'] = json.loads(interview_type)
                except json.JSONDecodeError:
                    pass
            
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        instance.save()
        return instance