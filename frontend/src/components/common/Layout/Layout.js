import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../Navigation/Sidebar';
import { Header } from '../Navigation/Header';
export const Layout = () => {
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 flex", children: [_jsx(Sidebar, {}), _jsxs("div", { className: "flex-1 flex flex-col", children: [_jsx(Header, {}), _jsx("main", { className: "flex-1 overflow-auto", children: _jsx("div", { className: "p-6", children: _jsx(Outlet, {}) }) })] })] }));
};
