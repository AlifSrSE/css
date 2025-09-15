import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useRef, useEffect } from 'react';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../../store/slices/authSlice';
import { useLogoutMutation } from '../../../store/api/authApi';
export const UserDropdown = ({ user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [logoutMutation] = useLogoutMutation();
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    const handleLogout = async () => {
        try {
            await logoutMutation().unwrap();
            dispatch(logout());
            navigate('/login');
        }
        catch (error) {
            console.error('Logout failed:', error);
            // Force logout even if API call fails
            dispatch(logout());
            navigate('/login');
        }
    };
    if (!user)
        return null;
    return (_jsxs("div", { className: "relative", ref: dropdownRef, children: [_jsxs("button", { onClick: () => setIsOpen(!isOpen), className: "flex items-center space-x-3 text-sm text-gray-700 hover:text-gray-900", children: [_jsx("div", { className: "h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center", children: _jsx(User, { className: "h-5 w-5 text-white" }) }), _jsxs("div", { className: "text-left", children: [_jsx("p", { className: "font-medium", children: user.first_name || user.username }), _jsx("p", { className: "text-xs text-gray-500 capitalize", children: user.role })] }), _jsx(ChevronDown, { className: "h-4 w-4" })] }), isOpen && (_jsx("div", { className: "absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50", children: _jsxs("div", { className: "py-1", children: [_jsxs("div", { className: "px-4 py-2 border-b border-gray-200", children: [_jsxs("p", { className: "text-sm font-medium text-gray-900", children: [user.first_name, " ", user.last_name] }), _jsx("p", { className: "text-sm text-gray-500", children: user.email })] }), _jsxs("button", { onClick: () => {
                                setIsOpen(false);
                                navigate('/profile');
                            }, className: "flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50", children: [_jsx(Settings, { className: "mr-3 h-4 w-4" }), "Profile Settings"] }), _jsxs("button", { onClick: handleLogout, className: "flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50", children: [_jsx(LogOut, { className: "mr-3 h-4 w-4" }), "Sign Out"] })] }) }))] }));
};
