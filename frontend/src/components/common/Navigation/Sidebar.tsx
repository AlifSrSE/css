import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  Settings,
  Target,
  TrendingUp,
  Shield,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { cn } from '../../../utils/cn';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Applications', href: '/credit-scoring', icon: FileText },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
];

const adminNavigation = [
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = user?.role === 'admin';

  return (
    <div className="bg-white w-64 min-h-screen border-r border-gray-200">
      {/* Logo */}
      <div className="flex items-center px-6 py-4 border-b border-gray-200">
        <Target className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-xl font-bold text-gray-900">CreditScore</span>
      </div>

      {/* Navigation */}
      <nav className="mt-6">
        <div className="px-3">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                )
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </div>

        {/* Admin Section */}
        {isAdmin && (
          <div className="mt-8">
            <div className="px-6 py-2">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </h3>
            </div>
            <div className="px-3">
              {adminNavigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors',
                      isActive
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </div>
          </div>
        )}

        {/* Status */}
        <div className="mt-8 px-3">
          <div className="bg-green-50 p-3 rounded-md">
            <div className="flex items-center">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="ml-2 text-sm font-medium text-green-800">
                System Healthy
              </span>
            </div>
            <p className="mt-1 text-xs text-green-600">
              All services operational
            </p>
          </div>
        </div>
      </nav>
    </div>
  );
};