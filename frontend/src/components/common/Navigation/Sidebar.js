import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, BarChart3, Users, Settings, Target, TrendingUp, Shield, } from 'lucide-react';
import { useSelector } from 'react-redux';
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
export const Sidebar = () => {
    const user = useSelector((state) => state.auth.user);
    const isAdmin = (user === null || user === void 0 ? void 0 : user.role) === 'admin';
    return (_jsxs("div", { className: "bg-white w-64 min-h-screen border-r border-gray-200", children: [_jsxs("div", { className: "flex items-center px-6 py-4 border-b border-gray-200", children: [_jsx(Target, { className: "h-8 w-8 text-blue-600" }), _jsx("span", { className: "ml-2 text-xl font-bold text-gray-900", children: "CreditScore" })] }), _jsxs("nav", { className: "mt-6", children: [_jsx("div", { className: "px-3", children: navigation.map((item) => (_jsxs(NavLink, { to: item.href, className: ({ isActive }) => cn('flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors', isActive
                                ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'), children: [_jsx(item.icon, { className: "mr-3 h-5 w-5" }), item.name] }, item.name))) }), isAdmin && (_jsxs("div", { className: "mt-8", children: [_jsx("div", { className: "px-6 py-2", children: _jsx("h3", { className: "text-xs font-semibold text-gray-500 uppercase tracking-wider", children: "Administration" }) }), _jsx("div", { className: "px-3", children: adminNavigation.map((item) => (_jsxs(NavLink, { to: item.href, className: ({ isActive }) => cn('flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors', isActive
                                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'), children: [_jsx(item.icon, { className: "mr-3 h-5 w-5" }), item.name] }, item.name))) })] })), _jsx("div", { className: "mt-8 px-3", children: _jsxs("div", { className: "bg-green-50 p-3 rounded-md", children: [_jsxs("div", { className: "flex items-center", children: [_jsx(Shield, { className: "h-5 w-5 text-green-600" }), _jsx("span", { className: "ml-2 text-sm font-medium text-green-800", children: "System Healthy" })] }), _jsx("p", { className: "mt-1 text-xs text-green-600", children: "All services operational" })] }) })] })] }));
};
