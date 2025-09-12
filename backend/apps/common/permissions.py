from rest_framework.permissions import BasePermission
from apps.authentication.models import User

class IsAuthenticatedUser(BasePermission):
    """Permission for authenticated users only"""
    
    def has_permission(self, request, view):
        return request.user and request.user.get('user_id')

class IsAdminUser(BasePermission):
    """Permission for admin users only"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.get('user_id'):
            return False
        
        user_id = request.user.get('user_id')
        user = User.objects(id=user_id).first()
        
        return user and user.role == 'admin' and user.is_active

class IsManagerOrAdmin(BasePermission):
    """Permission for manager or admin users"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.get('user_id'):
            return False
        
        user_id = request.user.get('user_id')
        user = User.objects(id=user_id).first()
        
        return user and user.role in ['admin', 'manager'] and user.is_active

class IsAnalystOrAbove(BasePermission):
    """Permission for analyst, manager, or admin users"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.get('user_id'):
            return False
        
        user_id = request.user.get('user_id')
        user = User.objects(id=user_id).first()
        
        return user and user.role in ['admin', 'manager', 'analyst'] and user.is_active

class CanCreateApplications(BasePermission):
    """Permission to create credit applications"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.get('user_id'):
            return False
        
        user_id = request.user.get('user_id')
        user = User.objects(id=user_id).first()
        
        return user and user.has_permission('create') and user.is_active

class CanViewReports(BasePermission):
    """Permission to view reports"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.get('user_id'):
            return False
        
        user_id = request.user.get('user_id')
        user = User.objects(id=user_id).first()
        
        return user and user.has_permission('view_reports') and user.is_active

class CanExportData(BasePermission):
    """Permission to export data"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.get('user_id'):
            return False
        
        user_id = request.user.get('user_id')
        user = User.objects(id=user_id).first()
        
        return user and user.has_permission('export') and user.is_active

class CanManageUsers(BasePermission):
    """Permission to manage users"""
    
    def has_permission(self, request, view):
        if not request.user or not request.user.get('user_id'):
            return False
        
        user_id = request.user.get('user_id')
        user = User.objects(id=user_id).first()
        
        return user and user.has_permission('manage_users') and user.is_active

class ReadOnlyPermission(BasePermission):
    """Read-only permission for GET requests"""
    
    def has_permission(self, request, view):
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return request.user and request.user.get('user_id')
        return False

class IsOwnerOrReadOnly(BasePermission):
    """Permission to edit own resources or read-only for others"""
    
    def has_object_permission(self, request, view, obj):
        # Read permissions for any authenticated user
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return request.user and request.user.get('user_id')
        
        # Write permissions only to the owner
        user_id = request.user.get('user_id')
        if hasattr(obj, 'created_by'):
            return str(obj.created_by.id) == user_id
        elif hasattr(obj, 'user'):
            return str(obj.user.id) == user_id
            
        return False