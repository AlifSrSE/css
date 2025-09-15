import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Plus, FileText, BarChart3, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Layout/Card';
import { Button } from '../../common/Forms/Button';
import { useNavigate } from 'react-router-dom';
export const QuickActions = () => {
    const navigate = useNavigate();
    const actions = [
        {
            title: 'New Application',
            description: 'Create a new credit application',
            icon: _jsx(Plus, { className: "h-5 w-5" }),
            onClick: () => navigate('/credit-scoring/new'),
            variant: 'default',
        },
        {
            title: 'Generate Report',
            description: 'Create credit scoring report',
            icon: _jsx(BarChart3, { className: "h-5 w-5" }),
            onClick: () => navigate('/reports/generate'),
            variant: 'outline',
        },
        {
            title: 'View Applications',
            description: 'Browse all applications',
            icon: _jsx(FileText, { className: "h-5 w-5" }),
            onClick: () => navigate('/credit-scoring'),
            variant: 'outline',
        },
        {
            title: 'Export Data',
            description: 'Download application data',
            icon: _jsx(Download, { className: "h-5 w-5" }),
            onClick: () => { }, // Handle export
            variant: 'outline',
        },
    ];
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Quick Actions" }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: actions.map((action, index) => (_jsxs(Button, { variant: action.variant, className: "h-auto p-4 flex flex-col items-start justify-start text-left", onClick: action.onClick, children: [_jsxs("div", { className: "flex items-center gap-2 mb-1", children: [action.icon, _jsx("span", { className: "font-medium", children: action.title })] }), _jsx("span", { className: "text-xs opacity-75", children: action.description })] }, index))) }) })] }));
};
