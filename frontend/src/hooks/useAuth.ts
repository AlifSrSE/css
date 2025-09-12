mport { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { useLogoutMutation } from '../store/api/authApi';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [logoutMutation] = useLogoutMutation();
  
  const { user, token, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  const handleLogout = async () => {
    try {
      await logoutMutation().unwrap();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      dispatch(logout());
      navigate('/login');
    }
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    
    const rolePermissions = {
      admin: ['view', 'create', 'edit', 'delete', 'manage_users', 'view_reports', 'export'],
      manager: ['view', 'create', 'edit', 'view_reports', 'export'],
      analyst: ['view', 'create', 'edit', 'view_