from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password
from datetime import datetime, timedelta
import logging

from .models import User, UserActivity, UserSession
from .serializers import (
    UserLoginSerializer, UserRegistrationSerializer, 
    UserSerializer, PasswordChangeSerializer, UserActivitySerializer
)

logger = logging.getLogger(__name__)

class RegisterView(APIView):
    """User registration view"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Log registration activity
            UserActivity(
                user=user,
                action='register',
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                details={'registration_method': 'direct'}
            ).save()
            
            return Response({
                'success': True,
                'message': 'User registered successfully',
                'data': {
                    'user_id': str(user.id),
                    'username': user.username,
                    'email': user.email
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class LoginView(APIView):
    """User login view"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            
            # Update last login
            user.last_login = datetime.utcnow()
            user.last_activity = datetime.utcnow()
            user.save()
            
            # Generate JWT tokens
            refresh = RefreshToken()
            refresh['user_id'] = str(user.id)
            refresh['username'] = user.username
            refresh['role'] = user.role
            
            # Create session record
            session = UserSession(
                user=user,
                session_token=str(refresh.access_token),
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                expires_at=datetime.utcnow() + timedelta(hours=1)
            )
            session.save()
            
            # Log login activity
            UserActivity(
                user=user,
                action='login',
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                details={'login_method': 'password'}
            ).save()
            
            return Response({
                'success': True,
                'message': 'Login successful',
                'data': {
                    'access_token': str(refresh.access_token),
                    'refresh_token': str(refresh),
                    'user': {
                        'id': str(user.id),
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'role': user.role,
                        'is_verified': user.is_verified
                    }
                }
            })
        
        return Response({
            'success': False,
            'errors': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class LogoutView(APIView):
    """User logout view"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Get user from request
            user_id = request.user.get('user_id')  # From JWT payload
            user = User.objects(id=user_id).first()
            
            if user:
                # Deactivate user sessions
                UserSession.objects(user=user, is_active=True).update(is_active=False)
                
                # Log logout activity
                UserActivity(
                    user=user,
                    action='logout',
                    ip_address=self.get_client_ip(request),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    details={'logout_method': 'manual'}
                ).save()
            
            return Response({
                'success': True,
                'message': 'Logout successful'
            })
        
        except Exception as e:
            logger.error(f"Logout error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Logout failed'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip

class ProfileView(APIView):
    """User profile view"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user profile"""
        try:
            user_id = request.user.get('user_id')
            user = User.objects(id=user_id).first()
            
            if not user:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            serializer = UserSerializer(user)
            return Response({
                'success': True,
                'data': serializer.data
            })
        
        except Exception as e:
            logger.error(f"Profile fetch error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to fetch profile'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    def put(self, request):
        """Update user profile"""
        try:
            user_id = request.user.get('user_id')
            user = User.objects(id=user_id).first()
            
            if not user:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            serializer = UserSerializer(user, data=request.data, partial=True)
            if serializer.is_valid():
                updated_user = serializer.save()
                
                # Log profile update
                UserActivity(
                    user=user,
                    action='update_profile',
                    details={'updated_fields': list(request.data.keys())}
                ).save()
                
                return Response({
                    'success': True,
                    'message': 'Profile updated successfully',
                    'data': UserSerializer(updated_user).data
                })
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            logger.error(f"Profile update error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to update profile'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ChangePasswordView(APIView):
    """Change password view"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            user_id = request.user.get('user_id')
            user = User.objects(id=user_id).first()
            
            if not user:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            serializer = PasswordChangeSerializer(data=request.data)
            if serializer.is_valid():
                # Verify current password
                if not user.check_password(serializer.validated_data['current_password']):
                    return Response({
                        'success': False,
                        'message': 'Current password is incorrect'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Set new password
                user.set_password(serializer.validated_data['new_password'])
                user.save()
                
                # Log password change
                UserActivity(
                    user=user,
                    action='change_password',
                    details={'method': 'profile_update'}
                ).save()
                
                # Invalidate all user sessions
                UserSession.objects(user=user, is_active=True).update(is_active=False)
                
                return Response({
                    'success': True,
                    'message': 'Password changed successfully. Please login again.'
                })
            
            return Response({
                'success': False,
                'errors': serializer.errors
            }, status=status.HTTP_400_BAD_REQUEST)
        
        except Exception as e:
            logger.error(f"Password change error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to change password'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
class UserActivityView(APIView):
    """User activity logs view"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get user activity logs"""
        try:
            user_id = request.user.get('user_id')
            user = User.objects(id=user_id).first()
            
            if not user:
                return Response({
                    'success': False,
                    'message': 'User not found'
                }, status=status.HTTP_404_NOT_FOUND)
            
            activities = UserActivity.objects(user=user).order_by('-timestamp')[:100]
            serializer = UserActivitySerializer(activities, many=True)
            
            return Response({
                'success': True,
                'data': serializer.data
            })
        
        except Exception as e:
            logger.error(f"User activity fetch error: {str(e)}")
            return Response({
                'success': False,
                'message': 'Failed to fetch user activities'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        