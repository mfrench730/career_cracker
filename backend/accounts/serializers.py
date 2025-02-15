from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile


class UserSignupSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=True)  # Add this line
    full_name = serializers.CharField(required=True)
    major = serializers.CharField(required=True)
    education_level = serializers.CharField(required=True)
    experience_level = serializers.CharField(required=True)
    preferred_interview_type = serializers.ListField(child=serializers.CharField(), required=True)
    preferred_language = serializers.CharField(required=True)
    resume_url = serializers.URLField(required=True)
    
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ["username", "full_name", "email", "password", "major", "education_level", "experience_level", "preferred_interview_type", "preferred_language", "resume_url"]

    def validate_email(self, value):
        """Check if email is unique"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already in use.")
        return value

    def create(self, validated_data):
        """Create a new user with hashed password and profile"""
        password = validated_data.pop("password")
        full_name = validated_data.pop("full_name")

        username = validated_data.pop("username")  # Get the username
        email = validated_data.pop("email")

        # Create user
        user = User.objects.create_user(username=username, email=email, password=password)  # Store username separately

        # Create user profile
        UserProfile.objects.create(user=user, full_name=full_name, **validated_data)

        return user

    def validate_username(self, value):
        """Check if username is unique"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username is already taken.")
        return value
