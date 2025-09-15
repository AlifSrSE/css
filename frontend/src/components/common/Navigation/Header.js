import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Bell, Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import { UserDropdown } from './UserDropdown';
export const Header = () => {
    const user = useSelector((state) => state.auth.user);
    return (_jsx("header", { className: "bg-white border-b border-gray-200 px-6 py-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("div", { className: "flex-1 max-w-md", children: _jsxs("div", { className: "relative", children: [_jsx(Search, { className: "absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" }), _jsx("input", { type: "text", placeholder: "Search applications...", className: "w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" })] }) }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("button", { className: "p-2 text-gray-400 hover:text-gray-600 relative", children: [_jsx(Bell, { className: "h-5 w-5" }), _jsx("span", { className: "absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full" })] }), _jsx(UserDropdown, { user: user })] })] }) }));
};
