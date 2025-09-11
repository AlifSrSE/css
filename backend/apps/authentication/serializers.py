from rest_framework import serializers
from .models import User, UserActivity
import re

class UserRegistrationSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150, min_length=3)
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    first_name = serializers.CharField(max_length=50, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=50, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    department = serializers.CharField(max_length=100, required=False, allow_blank=True)
    
    def validate_username(self, value):
        if not re.match(r'^[a-zA-Z0-9_]+$', value):
            raise serializers.ValidationError("Username can only contain letters, numbers, and underscores.")
        
        if User.objects(username=value).first():
            raise serializers.ValidationError("Username already exists.")
        return value
    
    def validate_email(self, value):
        if User.objects(email=value).first():
            raise serializers.ValidationError("Email already registered.")
        return value
    
    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one number.")
        
        return value
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError("Passwords do not match.")
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        password = validated_data.pop('password')
        
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user

class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')
        
        if not username or not password:
            raise serializers.ValidationError("Both username and password are required.")
        
        user = User.objects(username=username).first() or User.objects(email=username).first()
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        
        if not user.is_active:
            raise serializers.ValidationError("Account is deactivated.")
        
        if user.is_account_locked():
            raise serializers.ValidationError("Account is temporarily locked. Please try again later.")
        
        if not user.check_password(password):
            user.failed_login_attempts += 1
            if user.failed_login_attempts >= 5:
                user.lock_account(30)  # Lock for 30 minutes
            user.save()
            raise serializers.ValidationError("Invalid credentials.")
        
        # Reset failed attempts on successful login
        if user.failed_login_attempts > 0:
            user.failed_login_attempts = 0
            user.save()
        
        attrs['user'] = user
        return attrs

class UserSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    username = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    first_name = serializers.CharField(max_length=50, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=50, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    department = serializers.CharField(max_length=100, required=False, allow_blank=True)
    role = serializers.CharField(read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    is_verified = serializers.BooleanField(read_only=True)
    date_joined = serializers.DateTimeField(read_only=True)
    last_login = serializers.DateTimeField(read_only=True)
    avatar = serializers.CharField(required=False, allow_blank=True)
    
    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=8, write_only=True)
    new_password_confirm = serializers.CharField(write_only=True)
    
    def validate_new_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        
        if not re.search(r'\d', value):
            raise serializers.ValidationError("Password must contain at least one number.")
        
        return value
    
    def validate(self, attrs):
        if attrs['new_password'] != attrs['new_password_confirm']:
            raise serializers.ValidationError("New passwords do not match.")
        return attrs

class UserActivitySerializer(serializers.Serializer):
    action = serializers.CharField()
    resource = serializers.CharField(required=False, allow_blank=True)
    details = serializers.DictField(required=False)
    timestamp = serializers.DateTimeField(read_only=True)
    ip_address = serializers.CharField(required=False, allow_blank=True)
    user_agent = serializers.CharField(required=False, allow_blank=True)
    user = serializers.CharField(read_only=True)
    user_role = serializers.CharField(read_only=True)
    user_department = serializers.CharField(read_only=True)
    user_email = serializers.CharField(read_only=True)
    user_phone = serializers.CharField(read_only=True)
    user_full_name = serializers.CharField(read_only=True)
    user_avatar = serializers.CharField(read_only=True)
    user_is_verified = serializers.BooleanField(read_only=True)
    user_is_active = serializers.BooleanField(read_only=True)
    user_date_joined = serializers.DateTimeField(read_only=True)
    user_last_login = serializers.DateTimeField(read_only=True)
    user_failed_login_attempts = serializers.IntegerField(read_only=True)
    user_account_locked_until = serializers.DateTimeField(read_only=True)
    user_profile = serializers.DictField(read_only=True)
    user_additional_info = serializers.DictField(read_only=True)
    user_permissions = serializers.ListField(child=serializers.CharField(), read_only=True)
    user_groups = serializers.ListField(child=serializers.CharField(), read_only=True)
    user_last_activity = serializers.DateTimeField(read_only=True)
    user_total_activities = serializers.IntegerField(read_only=True)
    user_recent_activities = serializers.ListField(child=serializers.DictField(), read_only=True)
    
