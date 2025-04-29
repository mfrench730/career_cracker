from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import UserSignupSerializer, UserProfileSerializer
from .models import UserProfile

import logging
logger = logging.getLogger(__name__)

# Protected view accessible only to authenticated users
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": "You have accessed a protected route!"})

# View to handle user login and token generation
class LoginView(APIView):
    permission_classes = [AllowAny]

    # Handle preflight OPTIONS requests
    def options(self, request, *args, **kwargs):
        """Handle OPTIONS requests explicitly"""
        response = Response()
        response['Access-Control-Allow-Headers'] = 'content-type,authorization'
        response['Access-Control-Allow-Methods'] = 'POST,OPTIONS'
        return response
    
    # Handle POST request for user login
    def post(self, request):
        try:
            username = request.data.get('username', '').strip().lower()
            password = request.data.get('password', '')

            if not username or not password:
                return Response(
                    {"error": "Username and password are required."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = authenticate(username=username, password=password)
            if not user:
                return Response(
                    {"error": "Invalid username or password."},
                    status=status.HTTP_401_UNAUTHORIZED
                )

            refresh = RefreshToken.for_user(user)
            return Response({
                "message": "Login successful",
                "token": str(refresh.access_token),
                "refresh_token": str(refresh),
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Login error: {str(e)}", exc_info=True)
            return Response(
                {"error": "An error occurred during login"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# View to handle user signup and profile creation
class SignUpView(APIView):
    permission_classes = [AllowAny]
     
    # Handle POST request for user registration
    def post(self, request):
        try:
            
            serializer = UserSignupSerializer(data=request.data)
            if serializer.is_valid():
                user = serializer.save()
                
                refresh = RefreshToken.for_user(user)
                
                return Response({
                    "message": "User created successfully",
                    "token": str(refresh.access_token),
                    "refresh_token": str(refresh),
                    "user": {
                        "id": user.id,
                        "username": user.username,
                        "email": user.email
                    }
                }, status=status.HTTP_201_CREATED)
                
            return Response(
                {"error": serializer.errors}, 
                status=status.HTTP_400_BAD_REQUEST
            )
            
        except Exception as e:
            logger.error(f"Signup error: {str(e)}", exc_info=True)
            return Response(
                {"error": "An error occurred during sign-up"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# View to retrieve and update the user's profile
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    # Handle GET request to retrieve user's profile
    def get(self, request):
        """Get the current user's profile"""
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "Profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        
    # Handle PUT request to update user's profile
    def put(self, request):
        """Update the current user's profile"""
        try:
            profile = UserProfile.objects.get(user=request.user)
            serializer = UserProfileSerializer(profile, data=request.data, partial=True)
            
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            else:
                return Response(
                    {"error": serializer.errors}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        except UserProfile.DoesNotExist:
            return Response(
                {"error": "Profile not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Profile update error: {str(e)}", exc_info=True)
            return Response(
                {"error": "An error occurred while updating profile"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
