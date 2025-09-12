from mongoengine import Document, fields
from datetime import datetime
import hashlib
import secrets

class User(Document):
    username = fields.StringField(required=True, unique=True, max_length=150)
    email = fields.EmailField(required=True, unique=True)
    password_hash = fields.StringField(required=True)
    first_name = fields.StringField(max_length=50)
    last_name = fields.StringField(max_length=50)
    
    # Role-based access
    ROLE_CHOICES = (
        ('admin', 'Administrator'),
        ('analyst', 'Credit Analyst'), 
        ('viewer', 'Viewer'),
        ('manager', 'Manager'),
    )
    role = fields.StringField(choices=ROLE_CHOICES, default='viewer')
    
    # Status fields
    is_active = fields.BooleanField(default=True)
    is_verified = fields.BooleanField(default=False)
    
    # Timestamps
    date_joined = fields.DateTimeField(default=datetime.utcnow)
    last_login = fields.DateTimeField()
    last_activity = fields.DateTimeField()
    
    # Profile fields
    phone = fields.StringField(max_length=20)
    department = fields.StringField(max_length=100)
    avatar = fields.StringField()
    
    # Security fields
    failed_login_attempts = fields.IntField(default=0)
    account_locked_until = fields.DateTimeField()
    password_reset_token = fields.StringField()
    password_reset_expires = fields.DateTimeField()
    
    meta = {
        'collection': 'users',
        'indexes': ['username', 'email', 'role', 'is_active']
    }
    
    def __str__(self):
        return f"{self.username} ({self.get_full_name()})"
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}".strip()
    
    def get_short_name(self):
        return self.first_name or self.username
    
    def set_password(self, raw_password):
        import bcrypt
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(raw_password.encode('utf-8'), salt).decode('utf-8')
    
    def check_password(self, raw_password):
        import bcrypt
        return bcrypt.checkpw(raw_password.encode('utf-8'), self.password_hash.encode('utf-8'))
    
    def is_account_locked(self):
        if self.account_locked_until:
            return datetime.utcnow() < self.account_locked_until
        return False
    
    def lock_account(self, minutes=30):
        from datetime import timedelta
        self.account_locked_until = datetime.utcnow() + timedelta(minutes=minutes)
        self.save()
    
    def unlock_account(self):
        self.account_locked_until = None
        self.failed_login_attempts = 0
        self.save()
    
    def generate_password_reset_token(self):
        from datetime import timedelta
        self.password_reset_token = secrets.token_urlsafe(32)
        self.password_reset_expires = datetime.utcnow() + timedelta(hours=24)
        self.save()
        return self.password_reset_token
    
    def has_permission(self, permission):
        role_permissions = {
            'admin': ['view', 'create', 'edit', 'delete', 'manage_users', 'view_reports', 'export'],
            'manager': ['view', 'create', 'edit', 'view_reports', 'export'],
            'analyst': ['view', 'create', 'edit', 'view_reports'],
            'viewer': ['view', 'view_reports'],
        }
        return permission in role_permissions.get(self.role, [])

class UserSession(Document):
    user = fields.ReferenceField(User, required=True)
    session_token = fields.StringField(required=True, unique=True)
    ip_address = fields.StringField()
    user_agent = fields.StringField()
    created_at = fields.DateTimeField(default=datetime.utcnow)
    expires_at = fields.DateTimeField(required=True)
    is_active = fields.BooleanField(default=True)
    
    meta = {
        'collection': 'user_sessions',
        'indexes': ['user', 'session_token', 'expires_at']
    }

class UserActivity(Document):
    user = fields.ReferenceField(User, required=True)
    action = fields.StringField(required=True)  # login, logout, create_application, etc.
    resource = fields.StringField()  # application_id, report_id, etc.
    ip_address = fields.StringField()
    user_agent = fields.StringField()
    details = fields.DictField()
    timestamp = fields.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'user_activities',
        'indexes': ['user', 'action', 'timestamp']
    }
class PasswordPolicy(Document):
    min_length = fields.IntField(default=8)
    require_uppercase = fields.BooleanField(default=True)
    require_lowercase = fields.BooleanField(default=True)
    require_numbers = fields.BooleanField(default=True)
    require_special = fields.BooleanField(default=True)
    password_history_count = fields.IntField(default=5)  # Number of previous passwords to remember
    last_updated = fields.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'password_policies'
    }
class PasswordHistory(Document):
    user = fields.ReferenceField(User, required=True)
    password_hash = fields.StringField(required=True)
    changed_at = fields.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'password_histories',
        'indexes': ['user', 'changed_at']
    }
    def save(self, *args, **kwargs):
        # Ensure only the latest N password histories are kept
        super().save(*args, **kwargs)
        history_count = PasswordPolicy.objects.first().password_history_count
        histories = PasswordHistory.objects(user=self.user).order_by('-changed_at')
        if histories.count() > history_count:
            for history in histories[history_count:]:
                history.delete()

class AuditLog(Document):
    user = fields.ReferenceField(User)
    action = fields.StringField(required=True)  # 'user_login', 'password_change', etc.
    resource = fields.StringField()  # e.g., user_id, application_id
    details = fields.DictField()
    ip_address = fields.StringField()
    user_agent = fields.StringField()
    timestamp = fields.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'audit_logs',
        'indexes': ['user', 'action', 'timestamp']
    }
    def __str__(self):
        user_str = self.user.username if self.user else "System"
        return f"{self.timestamp.isoformat()} | {user_str} | {self.action}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Optionally, implement log rotation or archiving here if needed
class RolePermission(Document):
    role = fields.StringField(required=True, unique=True)
    permissions = fields.ListField(fields.StringField())
    
    meta = {
        'collection': 'role_permissions'
    }
    def add_permission(self, permission):
        if permission not in self.permissions:
            self.permissions.append(permission)
            self.save()
    def remove_permission(self, permission):
        if permission in self.permissions:
            self.permissions.remove(permission)
            self.save()
    def has_permission(self, permission):
        return permission in self.permissions
    @classmethod
    def get_permissions_for_role(cls, role):
        role_perm = cls.objects(role=role).first()
        if role_perm:
            return role_perm.permissions
        return []
class TwoFactorAuth(Document):
    user = fields.ReferenceField(User, required=True, unique=True)
    secret_key = fields.StringField(required=True)
    is_enabled = fields.BooleanField(default=False)
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'two_factor_auth',
        'indexes': ['user']
    }
    
    def enable(self):
        self.is_enabled = True
        self.updated_at = datetime.utcnow()
        self.save()
    
    def disable(self):
        self.is_enabled = False
        self.updated_at = datetime.utcnow()
        self.save()
    
    @staticmethod
    def generate_secret_key():
        return secrets.token_urlsafe(16)
    def verify_token(self, token):
        import pyotp
        totp = pyotp.TOTP(self.secret_key)
        return totp.verify(token)
class UserNotificationSettings(Document):
    user = fields.ReferenceField(User, required=True, unique=True)
    email_notifications = fields.BooleanField(default=True)
    sms_notifications = fields.BooleanField(default=False)
    push_notifications = fields.BooleanField(default=False)
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'user_notification_settings',
        'indexes': ['user']
    }
    
    def update_settings(self, email=None, sms=None, push=None):
        if email is not None:
            self.email_notifications = email
        if sms is not None:
            self.sms_notifications = sms
        if push is not None:
            self.push_notifications = push
        self.updated_at = datetime.utcnow()
        self.save()
class UserAPIToken(Document):
    user = fields.ReferenceField(User, required=True)
    token = fields.StringField(required=True, unique=True)
    created_at = fields.DateTimeField(default=datetime.utcnow)
    expires_at = fields.DateTimeField()
    is_active = fields.BooleanField(default=True)
    
    meta = {
        'collection': 'user_api_tokens',
        'indexes': ['user', 'token', 'expires_at']
    }
    
    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)
    
    def is_token_valid(self):
        return self.is_active and datetime.utcnow() < self.expires_at
    
    def revoke(self):
        self.is_active = False
        self.save()
class UserPreferences(Document):
    user = fields.ReferenceField(User, required=True, unique=True)
    preferences = fields.DictField()  # e.g., {'theme': 'dark', 'items_per_page': 20}
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'user_preferences',
        'indexes': ['user']
    }
    
    def update_preferences(self, new_preferences: dict):
        self.preferences.update(new_preferences)
        self.updated_at = datetime.utcnow()
        self.save()
    def get_preference(self, key, default=None):
        return self.preferences.get(key, default)
class UserLoginAttempt(Document):
    user = fields.ReferenceField(User)
    username = fields.StringField()
    ip_address = fields.StringField()
    user_agent = fields.StringField()
    was_successful = fields.BooleanField(required=True)
    timestamp = fields.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'user_login_attempts',
        'indexes': ['user', 'username', 'ip_address', 'timestamp']
    }
    def __str__(self):
        user_str = self.user.username if self.user else self.username
        status = "SUCCESS" if self.was_successful else "FAILURE"
        return f"{self.timestamp.isoformat()} | {user_str} | {status}"
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Optionally, implement logic to lock account after multiple failed attempts
        if not self.was_successful and self.user:
            self.user.failed_login_attempts += 1
            if self.user.failed_login_attempts >= 5:
                self.user.lock_account(30)
            self.user.save()
        elif self.was_successful and self.user:
            if self.user.failed_login_attempts > 0:
                self.user.failed_login_attempts = 0
                self.user.save()
class UserDataExportRequest(Document):
    user = fields.ReferenceField(User, required=True)
    requested_at = fields.DateTimeField(default=datetime.utcnow)
    completed_at = fields.DateTimeField()
    status = fields.StringField(choices=['pending', 'in_progress', 'completed', 'failed'], default='pending')
    export_file_path = fields.StringField()  # Path to the exported data file
    requested_by_ip = fields.StringField()
    requested_by_user_agent = fields.StringField()
    
    meta = {
        'collection': 'user_data_export_requests',
        'indexes': ['user', 'status', 'requested_at']
    }
    
    def mark_in_progress(self):
        self.status = 'in_progress'
        self.save()
    
    def mark_completed(self, file_path):
        self.status = 'completed'
        self.export_file_path = file_path
        self.completed_at = datetime.utcnow()
        self.save()
    
    def mark_failed(self):
        self.status = 'failed'
        self.completed_at = datetime.utcnow()
        self.save()
class UserDataImportRequest(Document):
    user = fields.ReferenceField(User, required=True)
    requested_at = fields.DateTimeField(default=datetime.utcnow)
    completed_at = fields.DateTimeField()
    status = fields.StringField(choices=['pending', 'in_progress', 'completed', 'failed'], default='pending')
    import_file_path = fields.StringField()  # Path to the imported data file
    requested_by_ip = fields.StringField()
    requested_by_user_agent = fields.StringField()
    errors = fields.ListField(fields.StringField())  # List of errors encountered during import
    
    meta = {
        'collection': 'user_data_import_requests',
        'indexes': ['user', 'status', 'requested_at']
    }
    
    def mark_in_progress(self):
        self.status = 'in_progress'
        self.save()
    
    def mark_completed(self):
        self.status = 'completed'
        self.completed_at = datetime.utcnow()
        self.save()
    
    def mark_failed(self, error_list):
        self.status = 'failed'
        self.errors = error_list
        self.completed_at = datetime.utcnow()
        self.save()
class UserAccountDeletionRequest(Document):
    user = fields.ReferenceField(User, required=True)
    requested_at = fields.DateTimeField(default=datetime.utcnow)
    completed_at = fields.DateTimeField()
    status = fields.StringField(choices=['pending', 'in_progress', 'completed', 'failed'], default='pending')
    reason = fields.StringField()
    requested_by_ip = fields.StringField()
    requested_by_user_agent = fields.StringField()
    
    meta = {
        'collection': 'user_account_deletion_requests',
        'indexes': ['user', 'status', 'requested_at']
    }
    
    def mark_in_progress(self):
        self.status = 'in_progress'
        self.save()
    
    def mark_completed(self):
        self.status = 'completed'
        self.completed_at = datetime.utcnow()
        self.user.is_active = False  # Deactivate the user account
        self.user.save()
        self.save()
    
    def mark_failed(self):
        self.status = 'failed'
        self.completed_at = datetime.utcnow()
        self.save()
class UserSessionHistory(Document):
    user = fields.ReferenceField(User, required=True)
    session_token = fields.StringField(required=True)
    ip_address = fields.StringField()
    user_agent = fields.StringField()
    login_at = fields.DateTimeField(default=datetime.utcnow)
    logout_at = fields.DateTimeField()
    was_active = fields.BooleanField(default=True)  # Indicates if the session was active or terminated
    
    meta = {
        'collection': 'user_session_history',
        'indexes': ['user', 'session_token', 'login_at']
    }
    
    def mark_logout(self):
        self.logout_at = datetime.utcnow()
        self.was_active = False
        self.save()
    def session_duration(self):
        if self.logout_at:
            return (self.logout_at - self.login_at).total_seconds()
        return (datetime.utcnow() - self.login_at).total_seconds()
class UserLinkedAccount(Document):
    user = fields.ReferenceField(User, required=True)
    provider = fields.StringField(required=True)  # e.g., 'google', 'facebook'
    provider_user_id = fields.StringField(required=True)  # User ID from the provider
    linked_at = fields.DateTimeField(default=datetime.utcnow)
    is_active = fields.BooleanField(default=True)
    
    meta = {
        'collection': 'user_linked_accounts',
        'indexes': ['user', 'provider', 'provider_user_id']
    }
    
    def unlink(self):
        self.is_active = False
        self.save()
    def relink(self):
        self.is_active = True
        self.linked_at = datetime.utcnow()
        self.save()
class UserSecurityQuestion(Document):
    user = fields.ReferenceField(User, required=True, unique=True)
    question_1 = fields.StringField(required=True)
    answer_1_hash = fields.StringField(required=True)
    question_2 = fields.StringField(required=True)
    answer_2_hash = fields.StringField(required=True)
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'user_security_questions',
        'indexes': ['user']
    }
    
    def set_answers(self, answer_1, answer_2):
        import bcrypt
        self.answer_1_hash = bcrypt.hashpw(answer_1.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        self.answer_2_hash = bcrypt.hashpw(answer_2.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        self.updated_at = datetime.utcnow()
        self.save()
    
    def verify_answers(self, answer_1, answer_2):
        import bcrypt
        is_answer_1_correct = bcrypt.checkpw(answer_1.encode('utf-8'), self.answer_1_hash.encode('utf-8'))
        is_answer_2_correct = bcrypt.checkpw(answer_2.encode('utf-8'), self.answer_2_hash.encode('utf-8'))
        return is_answer_1_correct and is_answer_2_correct
class UserAPIAccessLog(Document):
    user = fields.ReferenceField(User)
    api_endpoint = fields.StringField(required=True)
    http_method = fields.StringField(required=True)  # GET, POST, PUT, DELETE, etc.
    ip_address = fields.StringField()
    user_agent = fields.StringField()
    request_headers = fields.DictField()
    request_body = fields.DictField()
    response_status = fields.IntField()
    response_body = fields.DictField()
    timestamp = fields.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'user_api_access_logs',
        'indexes': ['user', 'api_endpoint', 'http_method', 'timestamp']
    }
    
    def __str__(self):
        user_str = self.user.username if self.user else "Anonymous"
        return f"{self.timestamp.isoformat()} | {user_str} | {self.http_method} {self.api_endpoint} | {self.response_status}"
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Optionally, implement log rotation or archiving here if needed
class UserActivitySummary(Document):
    user = fields.ReferenceField(User, required=True, unique=True)
    total_logins = fields.IntField(default=0)
    last_login_at = fields.DateTimeField()
    total_actions = fields.IntField(default=0)
    last_action_at = fields.DateTimeField()
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'user_activity_summaries',
        'indexes': ['user']
    }
    
    def record_login(self):
        self.total_logins += 1
        self.last_login_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.save()
    
    def record_action(self):
        self.total_actions += 1
        self.last_action_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.save()
    @classmethod
    def get_or_create_summary(cls, user):
        summary = cls.objects(user=user).first()
        if not summary:
            summary = cls(user=user)
            summary.save()
        return summary
class UserDataExportLog(Document):
    user = fields.ReferenceField(User, required=True)
    export_type = fields.StringField(required=True)  # e.g., 'full_data', 'activity_log'
    requested_at = fields.DateTimeField(default=datetime.utcnow)
    completed_at = fields.DateTimeField()
    status = fields.StringField(choices=['pending', 'in_progress', 'completed', 'failed'], default='pending')
    file_path = fields.StringField()  # Path to the exported file
    requested_by_ip = fields.StringField()
    requested_by_user_agent = fields.StringField()
    error_message = fields.StringField()
    
    meta = {
        'collection': 'user_data_export_logs',
        'indexes': ['user', 'status', 'requested_at']
    }
    
    def mark_in_progress(self):
        self.status = 'in_progress'
        self.save()
    
    def mark_completed(self, file_path):
        self.status = 'completed'
        self.file_path = file_path
        self.completed_at = datetime.utcnow()
        self.save()
    
    def mark_failed(self, error_message):
        self.status = 'failed'
        self.error_message = error_message
        self.completed_at = datetime.utcnow()
        self.save()
class UserDataImportLog(Document):
    user = fields.ReferenceField(User, required=True)
    import_type = fields.StringField(required=True)  # e.g., 'full_data', 'activity_log'
    requested_at = fields.DateTimeField(default=datetime.utcnow)
    completed_at = fields.DateTimeField()
    status = fields.StringField(choices=['pending', 'in_progress', 'completed', 'failed'], default='pending')
    file_path = fields.StringField()  # Path to the imported file
    requested_by_ip = fields.StringField()
    requested_by_user_agent = fields.StringField()
    error_message = fields.StringField()
    
    meta = {
        'collection': 'user_data_import_logs',
        'indexes': ['user', 'status', 'requested_at']
    }
    
    def mark_in_progress(self):
        self.status = 'in_progress'
        self.save()
    
    def mark_completed(self):
        self.status = 'completed'
        self.completed_at = datetime.utcnow()
        self.save()
    
    def mark_failed(self, error_message):
        self.status = 'failed'
        self.error_message = error_message
        self.completed_at = datetime.utcnow()
        self.save()
class UserAccountRecoveryRequest(Document):
    user = fields.ReferenceField(User, required=True)
    requested_at = fields.DateTimeField(default=datetime.utcnow)
    completed_at = fields.DateTimeField()
    status = fields.StringField(choices=['pending', 'in_progress', 'completed', 'failed'], default='pending')
    recovery_method = fields.StringField(choices=['email', 'sms', 'security_questions'], required=True)
    requested_by_ip = fields.StringField()
    requested_by_user_agent = fields.StringField()
    error_message = fields.StringField()
    
    meta = {
        'collection': 'user_account_recovery_requests',
        'indexes': ['user', 'status', 'requested_at']
    }
    
    def mark_in_progress(self):
        self.status = 'in_progress'
        self.save()
    
    def mark_completed(self):
        self.status = 'completed'
        self.completed_at = datetime.utcnow()
        self.save()
    
    def mark_failed(self, error_message):
        self.status = 'failed'
        self.error_message = error_message
        self.completed_at = datetime.utcnow()
        self.save()
class UserLoginNotification(Document):
    user = fields.ReferenceField(User, required=True)
    ip_address = fields.StringField()
    user_agent = fields.StringField()
    login_at = fields.DateTimeField(default=datetime.utcnow)
    notification_sent = fields.BooleanField(default=False)
    notification_sent_at = fields.DateTimeField()
    
    meta = {
        'collection': 'user_login_notifications',
        'indexes': ['user', 'login_at']
    }
    
    def mark_notification_sent(self):
        self.notification_sent = True
        self.notification_sent_at = datetime.utcnow()
        self.save()
    @classmethod
    def log_login(cls, user, ip_address, user_agent):
        login_notification = cls(user=user, ip_address=ip_address, user_agent=user_agent)
        login_notification.save()
        return login_notification
class UserPasswordChangeLog(Document):
    user = fields.ReferenceField(User, required=True)
    changed_at = fields.DateTimeField(default=datetime.utcnow)
    changed_by = fields.ReferenceField(User)  # Who made the change, could be self or admin
    ip_address = fields.StringField()
    user_agent = fields.StringField()
    
    meta = {
        'collection': 'user_password_change_logs',
        'indexes': ['user', 'changed_at']
    }
    
    def __str__(self):
        changer = self.changed_by.username if self.changed_by else "Self"
        return f"{self.changed_at.isoformat()} | {self.user.username} | Changed by: {changer}"
    
    @classmethod
    def log_password_change(cls, user, changed_by=None, ip_address=None, user_agent=None):
        log_entry = cls(user=user, changed_by=changed_by, ip_address=ip_address, user_agent=user_agent)
        log_entry.save()
        return log_entry
class UserAccountLockLog(Document):
    user = fields.ReferenceField(User, required=True)
    locked_at = fields.DateTimeField(default=datetime.utcnow)
    unlocked_at = fields.DateTimeField()
    locked_by = fields.ReferenceField(User)  # Who locked the account, could be self or admin
    reason = fields.StringField()
    ip_address = fields.StringField()
    user_agent = fields.StringField()
    
    meta = {
        'collection': 'user_account_lock_logs',
        'indexes': ['user', 'locked_at']
    }
    
    def mark_unlocked(self):
        self.unlocked_at = datetime.utcnow()
        self.save()
    
    @classmethod
    def log_account_lock(cls, user, locked_by=None, reason=None, ip_address=None, user_agent=None):
        log_entry = cls(user=user, locked_by=locked_by, reason=reason, ip_address=ip_address, user_agent=user_agent)
        log_entry.save()
        return log_entry
class UserAccountUnlockLog(Document):
    user = fields.ReferenceField(User, required=True)
    unlocked_at = fields.DateTimeField(default=datetime.utcnow)
    unlocked_by = fields.ReferenceField(User)  # Who unlocked the account, could be self or admin
    reason = fields.StringField()
    ip_address = fields.StringField()
    user_agent = fields.StringField()
    
    meta = {
        'collection': 'user_account_unlock_logs',
        'indexes': ['user', 'unlocked_at']
    }
    
    @classmethod
    def log_account_unlock(cls, user, unlocked_by=None, reason=None, ip_address=None, user_agent=None):
        log_entry = cls(user=user, unlocked_by=unlocked_by, reason=reason, ip_address=ip_address, user_agent=user_agent)
        log_entry.save()
        return log_entry
class UserEmailChangeRequest(Document):
    user = fields.ReferenceField(User, required=True)
    new_email = fields.EmailField(required=True)
    requested_at = fields.DateTimeField(default=datetime.utcnow)
    completed_at = fields.DateTimeField()
    status = fields.StringField(choices=['pending', 'in_progress', 'completed', 'failed'], default='pending')
    requested_by_ip = fields.StringField()
    requested_by_user_agent = fields.StringField()
    error_message = fields.StringField()
    
    meta = {
        'collection': 'user_email_change_requests',
        'indexes': ['user', 'status', 'requested_at']
    }
    
    def mark_in_progress(self):
        self.status = 'in_progress'
        self.save()
    
    def mark_completed(self):
        self.status = 'completed'
        self.completed_at = datetime.utcnow()
        self.user.email = self.new_email
        self.user.save()
        self.save()
    
    def mark_failed(self, error_message):
        self.status = 'failed'
        self.error_message = error_message
        self.completed_at = datetime.utcnow()
        self.save()
class UserEmailChangeLog(Document):
    user = fields.ReferenceField(User, required=True)
    old_email = fields.EmailField(required=True)
    new_email = fields.EmailField(required=True)
    changed_at = fields.DateTimeField(default=datetime.utcnow)
    changed_by = fields.ReferenceField(User)  # Who made the change, could be self or admin
    ip_address = fields.StringField()
    user_agent = fields.StringField()
    
    meta = {
        'collection': 'user_email_change_logs',
        'indexes': ['user', 'changed_at']
    }
    
    def __str__(self):
        changer = self.changed_by.username if self.changed_by else "Self"
        return f"{self.changed_at.isoformat()} | {self.user.username} | Email changed from {self.old_email} to {self.new_email} | Changed by: {changer}"
    
    @classmethod
    def log_email_change(cls, user, old_email, new_email, changed_by=None, ip_address=None, user_agent=None):
        log_entry = cls(user=user, old_email=old_email, new_email=new_email, changed_by=changed_by, ip_address=ip_address, user_agent=user_agent)
        log_entry.save()
        return log_entry
class UserProfileUpdateLog(Document):
    user = fields.ReferenceField(User, required=True)
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    updated_by = fields.ReferenceField(User)  # Who made the update, could be self or admin
    changes = fields.DictField()  # e.g., {'first_name': {'old': 'John', 'new': 'Johnny'}}
    ip_address = fields.StringField()
    user_agent = fields.StringField()
    
    meta = {
        'collection': 'user_profile_update_logs',
        'indexes': ['user', 'updated_at']
    }
    
    def __str__(self):
        updater = self.updated_by.username if self.updated_by else "Self"
        return f"{self.updated_at.isoformat()} | {self.user.username} | Updated by: {updater} | Changes: {self.changes}"
    
    @classmethod
    def log_profile_update(cls, user, changes, updated_by=None, ip_address=None, user_agent=None):
        log_entry = cls(user=user, changes=changes, updated_by=updated_by, ip_address=ip_address, user_agent=user_agent)
        log_entry.save()
        return log_entry
class UserActivityReport(Document):
    user = fields.ReferenceField(User, required=True)
    report_type = fields.StringField(choices=['daily', 'weekly', 'monthly'], required=True)
    generated_at = fields.DateTimeField(default=datetime.utcnow)
    report_data = fields.DictField()  # e.g., {'total_logins': 10, 'actions': [...]}
    generated_by = fields.ReferenceField(User)  # Who generated the report
    ip_address = fields.StringField()
    user_agent = fields.StringField()
    
    meta = {
        'collection': 'user_activity_reports',
        'indexes': ['user', 'report_type', 'generated_at']
    }
    
    def __str__(self):
        generator = self.generated_by.username if self.generated_by else "System"
        return f"{self.generated_at.isoformat()} | {self.user.username} | {self.report_type} report | Generated by: {generator}"
    
    @classmethod
    def generate_report(cls, user, report_type, report_data, generated_by=None, ip_address=None, user_agent=None):
        report_entry = cls(user=user, report_type=report_type, report_data=report_data, generated_by=generated_by, ip_address=ip_address, user_agent=user_agent)
        report_entry.save()
        return report_entry
class UserSessionToken(Document):
    user = fields.ReferenceField(User, required=True)
    token = fields.StringField(required=True, unique=True)
    created_at = fields.DateTimeField(default=datetime.utcnow)
    expires_at = fields.DateTimeField()
    is_active = fields.BooleanField(default=True)
    ip_address = fields.StringField()
    user_agent = fields.StringField()
    
    meta = {
        'collection': 'user_session_tokens',
        'indexes': ['user', 'token', 'expires_at']
    }
    
    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)
    
    def is_token_valid(self):
        return self.is_active and datetime.utcnow() < self.expires_at
    
    def revoke(self):
        self.is_active = False
        self.save()
class UserAPIRateLimit(Document):
    user = fields.ReferenceField(User, required=True)
    api_endpoint = fields.StringField(required=True)
    time_window_start = fields.DateTimeField(required=True)
    request_count = fields.IntField(default=0)
    max_requests = fields.IntField(required=True)  # Max requests allowed in the time window
    time_window_seconds = fields.IntField(required=True)  # Duration of the time window in seconds
    
    meta = {
        'collection': 'user_api_rate_limits',
        'indexes': ['user', 'api_endpoint', 'time_window_start']
    }
    
    def increment_request_count(self):
        self.request_count += 1
        self.save()
    
    def is_rate_limited(self):
        return self.request_count >= self.max_requests
    
    @classmethod
    def get_or_create_rate_limit(cls, user, api_endpoint, max_requests, time_window_seconds):
        from datetime import timedelta
        now = datetime.utcnow()
        window_start = now - timedelta(seconds=time_window_seconds)
        rate_limit = cls.objects(user=user, api_endpoint=api_endpoint, time_window_start__gte=window_start).first()
        if not rate_limit:
            rate_limit = cls(user=user, api_endpoint=api_endpoint, time_window_start=now, max_requests=max_requests, time_window_seconds=time_window_seconds)
            rate_limit.save()
        return rate_limit
class UserDataAccessRequest(Document):
    user = fields.ReferenceField(User, required=True)
    data_type = fields.StringField(required=True)  # e.g., 'personal_info', 'activity_log'
    requested_at = fields.DateTimeField(default=datetime.utcnow)
    completed_at = fields.DateTimeField()
    status = fields.StringField(choices=['pending', 'in_progress', 'completed', 'denied'], default='pending')
    reason_for_request = fields.StringField()
    approved_by = fields.ReferenceField(User)  # Who approved the request
    requested_by_ip = fields.StringField()
    requested_by_user_agent = fields.StringField()
    error_message = fields.StringField()
    
    meta = {
        'collection': 'user_data_access_requests',
        'indexes': ['user', 'status', 'requested_at']
    }
    
    def mark_in_progress(self):
        self.status = 'in_progress'
        self.save()
    
    def mark_completed(self):
        self.status = 'completed'
        self.completed_at = datetime.utcnow()
        self.save()
    
    def mark_denied(self, reason):
        self.status = 'denied'
        self.error_message = reason
        self.completed_at = datetime.utcnow()
        self.save()
class UserDataAccessLog(Document):
    user = fields.ReferenceField(User, required=True)
    data_type = fields.StringField(required=True)  # e.g., 'personal_info', 'activity_log'
    accessed_at = fields.DateTimeField(default=datetime.utcnow)
    accessed_by = fields.ReferenceField(User)  # Who accessed the data
    ip_address = fields.StringField()
    user_agent = fields.StringField()
    purpose = fields.StringField()  # Reason for accessing the data
    
    meta = {
        'collection': 'user_data_access_logs',
        'indexes': ['user', 'data_type', 'accessed_at']
    }
    
    def __str__(self):
        accessor = self.accessed_by.username if self.accessed_by else "Self"
        return f"{self.accessed_at.isoformat()} | {self.user.username} | Accessed by: {accessor} | Data type: {self.data_type} | Purpose: {self.purpose}"
    
    @classmethod
    def log_data_access(cls, user, data_type, accessed_by=None, ip_address=None, user_agent=None, purpose=None):
        log_entry = cls(user=user, data_type=data_type, accessed_by=accessed_by, ip_address=ip_address, user_agent=user_agent, purpose=purpose)
        log_entry.save()
        return log_entry
class UserAccountMergeRequest(Document):
    primary_user = fields.ReferenceField(User, required=True)
    secondary_user = fields.ReferenceField(User, required=True)
    requested_at = fields.DateTimeField(default=datetime.utcnow)
    completed_at = fields.DateTimeField()
    status = fields.StringField(choices=['pending', 'in_progress', 'completed', 'failed'], default='pending')
    reason_for_merge = fields.StringField()
    approved_by = fields.ReferenceField(User)  # Who approved the merge
    requested_by_ip = fields.StringField()
    requested_by_user_agent = fields.StringField()
    error_message = fields.StringField()
    
    meta = {
        'collection': 'user_account_merge_requests',
        'indexes': ['primary_user', 'secondary_user', 'status', 'requested_at']
    }
    
    def mark_in_progress(self):
        self.status = 'in_progress'
        self.save()
    
    def mark_completed(self):
        self.status = 'completed'
        self.completed_at = datetime.utcnow()
        # Implement logic to merge accounts here
        self.save()
    
    def mark_failed(self, reason):
        self.status = 'failed'
        self.error_message = reason
        self.completed_at = datetime.utcnow()
        self.save()

from datetime import datetime
import secrets
from mongoengine import Document, fields
class User(Document):
    username = fields.StringField(required=True, unique=True, max_length=150)
    email = fields.EmailField(required=True, unique=True)
    first_name = fields.StringField(max_length=30)
    last_name = fields.StringField(max_length=30)
    password_hash = fields.StringField(required=True)
    
    # Role choices
    role = fields.StringField(choices=['admin', 'manager', 'analyst', 'viewer'], default='viewer')
    is_active = fields.BooleanField(default=True)
    is_staff = fields.BooleanField(default=False)
    date_joined = fields.DateTimeField(default=datetime.utcnow)
    last_login = fields.DateTimeField()
    # Profile fields
    profile_picture = fields.StringField()  # URL or path to profile picture
    bio = fields.StringField(max_length=500)
    location = fields.StringField(max_length=100)
    website = fields.URLField()
    # Security fields
    failed_login_attempts = fields.IntField(default=0)
    account_locked_until = fields.DateTimeField()
    password_reset_token = fields.StringField()
    password_reset_expires = fields.DateTimeField()
    # Preferences
    language = fields.StringField(default='en')
    timezone = fields.StringField(default='UTC')
    # Meta information
    meta = {
        'collection': 'users',
        'indexes': ['username', 'email']
    }
    def set_password(self, raw_password):
        import bcrypt
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(raw_password.encode('utf-8'), salt).decode('utf-8')
    def check_password(self, raw_password):
        import bcrypt
        return bcrypt.checkpw(raw_password.encode('utf-8'), self.password_hash.encode('utf-8'))
    def is_account_locked(self):
        if self.account_locked_until:
            return datetime.utcnow() < self.account_locked_until
        return False
    def increment_failed_login(self):
        self.failed_login_attempts += 1
        self.save()
        if self.failed_login_attempts >= 5:
            self.lock_account(30)
    def lock_account(self, minutes):
        from datetime import timedelta
        self.account_locked_until = datetime.utcnow() + timedelta(minutes=minutes)
        self.failed_login_attempts = 0
        self.save()
    def unlock_account(self):
        self.account_locked_until = None
        self.failed_login_attempts = 0
        self.save()
    def generate_password_reset_token(self):
        self.password_reset_token = secrets.token_urlsafe(32)
        from datetime import timedelta
        self.password_reset_expires = datetime.utcnow() + timedelta(hours=1)
        self.save()
        return self.password_reset_token
    def clear_password_reset_token(self):
        self.password_reset_token = None
        self.password_reset_expires = None
        self.save()
    def has_permission(self, permission):
        role_permissions = {
            'admin': ['view', 'edit', 'delete', 'manage_users', 'view_reports'],
            'manager': ['view', 'edit', 'view_reports'],
            'analyst': ['view', 'view_reports'],
            'viewer': ['view', 'view_reports'],
        }
        return permission in role_permissions.get(self.role, [])
class UserSession(Document):
    user = fields.ReferenceField(User, required=True)
    session_token = fields.StringField(required=True, unique=True)
    created_at = fields.DateTimeField(default=datetime.utcnow)
    expires_at = fields.DateTimeField()
    ip_address = fields.StringField()
    user_agent = fields.StringField()
    is_active = fields.BooleanField(default=True)
    meta = {
        'collection': 'user_sessions',
        'indexes': ['user', 'session_token', 'expires_at']
    }
    def save(self, *args, **kwargs):
        if not self.session_token:
            self.session_token = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)
    def is_session_valid(self):
        return self.is_active and datetime.utcnow() < self.expires_at
    def revoke(self):
        self.is_active = False
        self.save()
class PasswordPolicy(Document):
    min_length = fields.IntField(default=8)
    max_length = fields.IntField(default=128)
    require_uppercase = fields.BooleanField(default=True)
    require_lowercase = fields.BooleanField(default=True)
    require_numbers = fields.BooleanField(default=True)
    require_special_characters = fields.BooleanField(default=True)
    password_history_count = fields.IntField(default=5)  # Number of previous passwords to remember
    password_expiration_days = fields.IntField(default=90)  # Days before password expires
    meta = {
        'collection': 'password_policies'
    }
    @classmethod
    def get_policy(cls):
        policy = cls.objects.first()
        if not policy:
            policy = cls()
            policy.save()
        return policy
    def validate_password(self, password):
        import re
        if len(password) < self.min_length or len(password) > self.max_length:
            return False, f"Password must be between {self.min_length} and {self.max_length} characters."
        if self.require_uppercase and not re.search(r'[A-Z]', password):
            return False, "Password must contain at least one uppercase letter."
        if self.require_lowercase and not re.search(r'[a-z]', password):
            return False, "Password must contain at least one lowercase letter."
        if self.require_numbers and not re.search(r'[0-9]', password):
            return False, "Password must contain at least one number."
        if self.require_special_characters and not re.search(r'[\W_]', password):
            return False, "Password must contain at least one special character."
        return True, "Password is valid."
class UserActionLog(Document):
    user = fields.ReferenceField(User)
    action = fields.StringField(required=True)  # e.g., 'login', 'logout', 'password_change'
    ip_address = fields.StringField()
    user_agent = fields.StringField()
    timestamp = fields.DateTimeField(default=datetime.utcnow)
    meta = {
        'collection': 'user_action_logs',
        'indexes': ['user', 'action', 'timestamp']
    }
    def __str__(self):
        user_str = self.user.username if self.user else "Anonymous"
        return f"{self.timestamp.isoformat()} | {user_str} | {self.action}"
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Optionally, implement log rotation or archiving here if needed
class RolePermission(Document):
    role = fields.StringField(choices=['admin', 'manager', 'analyst', 'viewer'], required=True, unique=True)
    permissions = fields.ListField(fields.StringField())  # e.g., ['view', 'edit', 'delete']
    meta = {
        'collection': 'role_permissions',
        'indexes': ['role']
    }
    def add_permission(self, permission):
        if permission not in self.permissions:
            self.permissions.append(permission)
            self.save()
    def remove_permission(self, permission):
        if permission in self.permissions:
            self.permissions.remove(permission)
            self.save()
    def has_permission(self, permission):
        return permission in self.permissions
    @classmethod
    def get_permissions_for_role(cls, role):
        role_perm = cls.objects(role=role).first()
        if role_perm:
            return role_perm.permissions
        return []
class UserTwoFactorAuth(Document):
    user = fields.ReferenceField(User, required=True, unique=True)
    is_enabled = fields.BooleanField(default=False)
    secret_key = fields.StringField()  # Secret key for TOTP
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    
    meta = {
        'collection': 'user_two_factor_auth',
        'indexes': ['user']
    }
    
    def enable_2fa(self):
        self.is_enabled = True
        self.secret_key = self.generate_secret_key()
        self.updated_at = datetime.utcnow()
        self.save()
    
    def disable_2fa(self):
        self.is_enabled = False
        self.secret_key = None
        self.updated_at = datetime.utcnow()
        self.save()
    def generate_secret_key(self):
        import pyotp
        return pyotp.random_base32()
    def verify_token(self, token):
        import pyotp
        if not self.is_enabled or not self.secret_key:
            return False
        totp = pyotp.TOTP(self.secret_key)
        return totp.verify(token)
class UserAPIToken(Document):
    user = fields.ReferenceField(User, required=True)
    token = fields.StringField(required=True, unique=True)
    created_at = fields.DateTimeField(default=datetime.utcnow)
    expires_at = fields.DateTimeField()
    is_active = fields.BooleanField(default=True)
    ip_address = fields.StringField()
    user_agent = fields.StringField()
    meta = {
        'collection': 'user_api_tokens',
        'indexes': ['user', 'token', 'expires_at']
    }
    def save(self, *args, **kwargs):
        if not self.token:
            self.token = secrets.token_urlsafe(32)
        super().save(*args, **kwargs)
    def is_token_valid(self):
        return self.is_active and datetime.utcnow() < self.expires_at
class UserPreferences(Document):
    user = fields.ReferenceField(User, required=True, unique=True)
    preferences = fields.DictField()  # e.g., {'theme': 'dark', 'notifications': True}
    created_at = fields.DateTimeField(default=datetime.utcnow)
    updated_at = fields.DateTimeField(default=datetime.utcnow)
    meta = {
        'collection': 'user_preferences',
        'indexes': ['user']
    }
    def set_preference(self, key, value):
        self.preferences[key] = value
        self.updated_at = datetime.utcnow()
        self.save()
    def get_preference(self, key, default=None):
        return self.preferences.get(key, default)
class UserLoginAttempt(Document):
    user = fields.ReferenceField(User)
    username = fields.StringField()  # Username attempted
    ip_address = fields.StringField()
    user_agent = fields.StringField()
    timestamp = fields.DateTimeField(default=datetime.utcnow)
    was_successful = fields.BooleanField(default=False)
    meta = {
        'collection': 'user_login_attempts',
        'indexes': ['user', 'username', 'timestamp', 'was_successful']
    }
    def __str__(self):
        user_str = self.user.username if self.user else self.username
        status = "SUCCESS" if self.was_successful else "FAILURE"
        return f"{self.timestamp.isoformat()} | {user_str} | {status} | IP: {self.ip_address}"
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        # Optionally, implement log rotation or archiving here if needed
        if not self.was_successful and self.user:
            self.user.increment_failed_login()
        elif self.was_successful and self.user:
            self.user.last_login = datetime.utcnow()
            self.user.failed_login_attempts = 0
            self.user.account_locked_until = None
            self.user.save()
class UserDataExportRequest(Document):
    user = fields.ReferenceField(User, required=True)
    requested_at = fields.DateTimeField(default=datetime.utcnow)
    completed_at = fields.DateTimeField()
    status = fields.StringField(choices=['pending', 'in_progress', 'completed', 'failed'], default='pending')
    export_file_path = fields.StringField()  # Path to the exported data file
    requested_by_ip = fields.StringField()
    requested_by_user_agent = fields.StringField()
    error_message = fields.StringField()
    meta = {
        'collection': 'user_data_export_requests',
        'indexes': ['user', 'status', 'requested_at']
    }
    def mark_in_progress(self):
        self.status = 'in_progress'
        self.save()
    def mark_completed(self, file_path):
        self.status = 'completed'
        self.export_file_path = file_path
        self.completed_at = datetime.utcnow()
        self.save()
    def mark_failed(self, error_message):
        self.status = 'failed'
        self.error_message = error_message
        self.completed_at = datetime.utcnow()
        self.save()
class UserDataImportRequest(Document):
    user = fields.ReferenceField(User, required=True)
    requested_at = fields.DateTimeField(default=datetime.utcnow)
    completed_at = fields.DateTimeField()
    status = fields.StringField(choices=['pending', 'in_progress', 'completed', 'failed'], default='pending')
    import_file_path = fields.StringField()  # Path to the imported data file
    requested_by_ip = fields.StringField()
    requested_by_user_agent = fields.StringField()
    errors = fields.ListField(fields.StringField())  # List of errors encountered during import
    meta = {
        'collection': 'user_data_import_requests',
        'indexes': ['user', 'status', 'requested_at']
    }
    def mark_in_progress(self):
        self.status = 'in_progress'
        self.save()
    def mark_completed(self):
        self.status = 'completed'
        self.completed_at = datetime.utcnow()
        self.save()