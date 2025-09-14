import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthState, User, LoginResponse } from '../../types/auth';
import { STORAGE_KEYS } from '../../utils/constants';

const initialState: AuthState = {
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
    
    loginSuccess: (state, action: PayloadAction<LoginResponse>) => {
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
    
    loginFailure: (state, action: PayloadAction<string>) => {
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
    refreshTokenSuccess: (state, action: PayloadAction<{ access_token: string }>) => {
      state.token = action.payload.access_token;
      localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, action.payload.access_token);
    },

    // Update user profile
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    // Set authentication status (used on app initialization)
    setAuthStatus: (state, action: PayloadAction<{ isAuthenticated: boolean; user?: User }>) => {
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
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    }
  }
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  refreshTokenSuccess,
  updateUserProfile,
  setAuthStatus,
  clearError,
  setLoading
} = authSlice.actions;

// Selectors
export const selectAuth = (state: { auth: AuthState }) => state.auth;
export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;

// Helper selectors
export const selectUserRole = (state: { auth: AuthState }) => state.auth.user?.role;
export const selectUserPermissions = (state: { auth: AuthState }) => {
  const role = state.auth.user?.role;
  
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

export const selectCanAccess = (state: { auth: AuthState }, permission: string) => {
  const permissions = selectUserPermissions(state);
  return permissions.includes(permission);
};

export default authSlice.reducer;