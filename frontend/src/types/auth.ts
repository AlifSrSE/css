export interface User {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'analyst' | 'viewer';
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: User;
  expires_in: number;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Permission {
  id: string;
  name: string;
  codename: string;
  description?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Permission[];
  description?: string;
}

export interface UserProfile {
  id: string;
  user: User;
  phone?: string;
  address?: string;
  department?: string;
  position?: string;
  avatar?: string;
  preferences: Record<string, any>;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
  confirm_password: string;
}

export interface VerifyTokenRequest {
  token: string;
}

// Permission constants
export const PERMISSIONS = {
    VIEW_APPLICATIONS: "view_applications",
    CREATE_APPLICATIONS: "create_applications",
    EDIT_APPLICATIONS: "edit_applications",
    DELETE_APPLICATIONS: "delete_applications",
    VIEW_REPORTS: "view_reports",
    EXPORT_DATA: "export_data",
    MANAGE_USERS: "manage_users",
    ADMIN_SETTINGS: "admin_settings",
    APPROVE_LOANS: "approve_loans",
    OVERRIDE_SCORES: "override_scores",
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export type PermissionValue = typeof PERMISSIONS[PermissionKey];