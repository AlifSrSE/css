import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout, clearError } from '../store/slices/authSlice';
import { useLogoutMutation } from '../store/api/authApi';
import { PERMISSIONS } from '../types/auth';
export const useAuth = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [logoutMutation, { isLoading: isLoggingOut }] = useLogoutMutation();
    const { user, token, isAuthenticated, isLoading, error } = useSelector((state) => state.auth);
    const handleLogout = async () => {
        try {
            await logoutMutation().unwrap();
        }
        catch (error) {
            console.error('Logout API call failed:', error);
        }
        finally {
            dispatch(logout());
            navigate('/login');
        }
    };
    const hasPermission = (permission) => {
        var _a;
        if (!user)
            return false;
        const rolePermissions = {
            admin: [
                PERMISSIONS.VIEW_APPLICATIONS,
                PERMISSIONS.CREATE_APPLICATIONS,
                PERMISSIONS.EDIT_APPLICATIONS,
                PERMISSIONS.DELETE_APPLICATIONS,
                PERMISSIONS.VIEW_REPORTS,
                PERMISSIONS.EXPORT_DATA,
                PERMISSIONS.MANAGE_USERS,
                PERMISSIONS.ADMIN_SETTINGS,
                PERMISSIONS.APPROVE_LOANS,
                PERMISSIONS.OVERRIDE_SCORES
            ],
            analyst: [
                PERMISSIONS.VIEW_APPLICATIONS,
                PERMISSIONS.CREATE_APPLICATIONS,
                PERMISSIONS.EDIT_APPLICATIONS,
                PERMISSIONS.VIEW_REPORTS,
                PERMISSIONS.EXPORT_DATA,
                PERMISSIONS.APPROVE_LOANS
            ],
            viewer: [
                PERMISSIONS.VIEW_APPLICATIONS,
                PERMISSIONS.VIEW_REPORTS
            ]
        };
        return ((_a = rolePermissions[user.role]) === null || _a === void 0 ? void 0 : _a.includes(permission)) || false;
    };
    const hasRole = (role) => {
        if (!user)
            return false;
        if (Array.isArray(role)) {
            return role.includes(user.role);
        }
        return user.role === role;
    };
    const hasAnyPermission = (permissions) => {
        return permissions.some(permission => hasPermission(permission));
    };
    const hasAllPermissions = (permissions) => {
        return permissions.every(permission => hasPermission(permission));
    };
    const isAdmin = () => hasRole('admin');
    const isAnalyst = () => hasRole('analyst');
    const isViewer = () => hasRole('viewer');
    const canViewApplications = () => hasPermission(PERMISSIONS.VIEW_APPLICATIONS);
    const canCreateApplications = () => hasPermission(PERMISSIONS.CREATE_APPLICATIONS);
    const canEditApplications = () => hasPermission(PERMISSIONS.EDIT_APPLICATIONS);
    const canDeleteApplications = () => hasPermission(PERMISSIONS.DELETE_APPLICATIONS);
    const canViewReports = () => hasPermission(PERMISSIONS.VIEW_REPORTS);
    const canExportData = () => hasPermission(PERMISSIONS.EXPORT_DATA);
    const canManageUsers = () => hasPermission(PERMISSIONS.MANAGE_USERS);
    const canApproveLoans = () => hasPermission(PERMISSIONS.APPROVE_LOANS);
    const canOverrideScores = () => hasPermission(PERMISSIONS.OVERRIDE_SCORES);
    const clearAuthError = () => {
        dispatch(clearError());
    };
    const getUserDisplayName = () => {
        var _a, _b;
        if (!user)
            return 'Unknown User';
        const firstName = (_a = user.first_name) === null || _a === void 0 ? void 0 : _a.trim();
        const lastName = (_b = user.last_name) === null || _b === void 0 ? void 0 : _b.trim();
        if (firstName && lastName) {
            return `${firstName} ${lastName}`;
        }
        else if (firstName) {
            return firstName;
        }
        else if (lastName) {
            return lastName;
        }
        else {
            return user.username;
        }
    };
    const getUserInitials = () => {
        var _a, _b;
        if (!user)
            return '?';
        const firstName = (_a = user.first_name) === null || _a === void 0 ? void 0 : _a.trim();
        const lastName = (_b = user.last_name) === null || _b === void 0 ? void 0 : _b.trim();
        let initials = '';
        if (firstName)
            initials += firstName.charAt(0).toUpperCase();
        if (lastName)
            initials += lastName.charAt(0).toUpperCase();
        if (!initials && user.username) {
            initials = user.username.charAt(0).toUpperCase();
        }
        return initials || '?';
    };
    return {
        // Auth state
        user,
        token,
        isAuthenticated,
        isLoading,
        error,
        // Actions
        logout: handleLogout,
        clearError: clearAuthError,
        // Permission checks
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAllPermissions,
        // Role shortcuts
        isAdmin,
        isAnalyst,
        isViewer,
        // Permission shortcuts
        canViewApplications,
        canCreateApplications,
        canEditApplications,
        canDeleteApplications,
        canViewReports,
        canExportData,
        canManageUsers,
        canApproveLoans,
        canOverrideScores,
        // User info helpers
        getUserDisplayName,
        getUserInitials,
        // Loading states
        isLoggingOut
    };
};
