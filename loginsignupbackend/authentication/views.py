from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import login
from django.db import transaction
from .serializers import UserRegistrationSerializer, UserLoginSerializer, UserSerializer
from .models import User
from .firebase_auth import firebase_auth
import logging

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    """
    User registration endpoint
    """
    try:
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            with transaction.atomic():
                # Create user in Django
                user = serializer.save()
                
                # Try to create user in Firebase
                firebase_result = None
                try:
                    if firebase_auth.is_initialized():
                        firebase_result = firebase_auth.create_user(
                            email=user.email,
                            password=request.data.get('password'),
                            display_name=f"{user.first_name} {user.last_name}"
                        )
                        
                        if firebase_result:
                            user.firebase_uid = firebase_result['uid']
                            user.save()
                            logger.info(f"User {user.email} created in both Django and Firebase")
                        else:
                            logger.warning(f"Firebase user creation failed for {user.email}")
                    else:
                        logger.warning("Firebase not initialized, skipping Firebase user creation")
                        
                except Exception as e:
                    logger.error(f"Firebase user creation error for {user.email}: {e}")
                    # Continue without Firebase if it fails
                
                # Generate token for immediate login
                token, created = Token.objects.get_or_create(user=user)
                
                response_data = {
                    'success': True,
                    'message': 'User registered successfully',
                    'token': token.key,
                    'user': UserSerializer(user).data,
                    'firebase_status': 'success' if firebase_result else 'skipped'
                }
                
                if firebase_result:
                    response_data['firebase_uid'] = firebase_result['uid']
                
                return Response(response_data, status=status.HTTP_201_CREATED)
        else:
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Signup error: {e}")
        return Response({
            'success': False,
            'message': 'An error occurred during registration'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    User login endpoint
    """
    try:
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Login the user
            login(request, user)
            
            # Generate or get existing token
            token, created = Token.objects.get_or_create(user=user)
            
            return Response({
                'success': True,
                'message': 'Login successful',
                'token': token.key,
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
    
    except Exception as e:
        logger.error(f"Login error: {e}")
        return Response({
            'success': False,
            'message': 'An error occurred during login'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
def logout_view(request):
    """
    User logout endpoint
    """
    try:
        # Delete the token
        if hasattr(request.user, 'auth_token'):
            request.user.auth_token.delete()
        
        return Response({
            'success': True,
            'message': 'Logout successful'
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Logout error: {e}")
        return Response({
            'success': False,
            'message': 'An error occurred during logout'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
def user_profile(request):
    """
    Get current user profile
    """
    try:
        return Response({
            'success': True,
            'user': UserSerializer(request.user).data
        }, status=status.HTTP_200_OK)
    
    except Exception as e:
        logger.error(f"Profile retrieval error: {e}")
        return Response({
            'success': False,
            'message': 'An error occurred while retrieving profile'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 