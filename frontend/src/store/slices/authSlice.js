import { createSlice } from '@reduxjs/toolkit';
import { STORAGE_KEYS } from '../../utils/constants';
const initialState = {
    user: null,
    token: localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN),
    refreshToken: localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN),
    isAuthenticated: false,
    isLoading: false,
    error: null
};
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        // Login actions
        loginStart: (state) => {
            state.isLoading = true;
            state.error = null;
        },
        loginSuccess: (state, action) => {
            state.isLoading = false;
            state.error = null;
            state.user = action.payload.user;
            state.token = action.payload.access_token;
            state.refreshToken = action.payload.refresh_token;
            state.isAuthenticated = true;
            // Store in localStorage
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload.access_token);
            localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, action.payload.refresh_token);
        },
        loginFailure: (state, action) => {
            state.isLoading = false;
            state.error = action.payload;
            state.isAuthenticated = false;
        },
        // Logout
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.refreshToken = null;
            state.isAuthenticated = false;
            state.error = null;
            // Clear localStorage
            localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
        },
        // Token refresh
        refreshTokenSuccess: (state, action) => {
            state.token = action.payload.access_token;
            localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload.access_token);
        },
        // Update user profile
        updateUserProfile: (state, action) => {
            if (state.user) {
                state.user = Object.assign(Object.assign({}, state.user), action.payload);
            }
        },
        // Set authentication status (used on app initialization)
        setAuthStatus: (state, action) => {
            state.isAuthenticated = action.payload.isAuthenticated;
            if (action.payload.user) {
                state.user = action.payload.user;
            }
        },
        // Clear error
        clearError: (state) => {
            state.error = null;
        },
        // Set loading
        setLoading: (state, action) => {
            state.isLoading = action.payload;
        }
    }
});
export const { loginStart, loginSuccess, loginFailure, logout, refreshTokenSuccess, updateUserProfile, setAuthStatus, clearError, setLoading } = authSlice.actions;
// Selectors
export const selectAuth = (state) => state.auth;
export const selectCurrentUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthError = (state) => state.auth.error;
export const selectAuthLoading = (state) => state.auth.isLoading;
// Helper selectors
export const selectUserRole = (state) => { var _a; return (_a = state.auth.user) === null || _a === void 0 ? void 0 : _a.role; };
export const selectUserPermissions = (state) => {
    var _a;
    const role = (_a = state.auth.user) === null || _a === void 0 ? void 0 : _a.role;
    // Define permissions based on role
    const rolePermissions = {
        admin: [
            'view_applications', 'create_applications', 'edit_applications', 'delete_applications',
            'view_reports', 'export_data', 'manage_users', 'admin_settings',
            'approve_loans', 'override_scores'
        ],
        analyst: [
            'view_applications', 'create_applications', 'edit_applications',
            'view_reports', 'export_data', 'approve_loans'
        ],
        viewer: [
            'view_applications', 'view_reports'
        ]
    };
    return role ? rolePermissions[role] || [] : [];
};
export const selectCanAccess = (state, permission) => {
    const permissions = selectUserPermissions(state);
    return permissions.includes(permission);
};
export default authSlice.reducer;
