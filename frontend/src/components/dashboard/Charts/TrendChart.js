import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Layout/Card';
export const TrendChart = ({ data, loading = false }) => {
    if (loading) {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Application Trends" }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-80 flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) }) })] }));
    }
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (_jsxs("div", { className: "bg-white p-3 border rounded-lg shadow-lg", children: [_jsx("p", { className: "font-medium", children: label }), payload.map((entry, index) => (_jsxs("p", { className: "text-sm", style: { color: entry.color }, children: [entry.name, ": ", entry.value, entry.name === 'Approval Rate' ? '%' : ''] }, index)))] }));
        }
        return null;
    };
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Application Trends" }) }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(LineChart, { data: data, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "month" }), _jsx(YAxis, { yAxisId: "left" }), _jsx(YAxis, { yAxisId: "right", orientation: "right" }), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}) }), _jsx(Legend, {}), _jsx(Line, { yAxisId: "left", type: "monotone", dataKey: "applications", stroke: "#3B82F6", strokeWidth: 2, name: "Applications" }), _jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "avg_score", stroke: "#10B981", strokeWidth: 2, name: "Avg Score" }), _jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "approval_rate", stroke: "#F59E0B", strokeWidth: 2, name: "Approval Rate" })] }) }) })] }));
};
