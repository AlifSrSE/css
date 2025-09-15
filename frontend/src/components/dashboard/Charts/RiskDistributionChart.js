import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Layout/Card';
const RISK_COLORS = {
    'LOW': '#10B981',
    'MEDIUM': '#F59E0B',
    'HIGH': '#F97316',
    'VERY HIGH': '#EF4444',
};
export const RiskDistributionChart = ({ data, loading = false, }) => {
    if (loading) {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Risk Distribution" }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-64 flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) }) })] }));
    }
    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (_jsxs("div", { className: "bg-white p-3 border rounded-lg shadow-lg", children: [_jsxs("p", { className: "font-medium", children: [label, " Risk"] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Count: ", data.count, " (", data.percentage.toFixed(1), "%)"] })] }));
        }
        return null;
    };
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Risk Distribution" }) }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: data, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "risk" }), _jsx(YAxis, {}), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}) }), _jsx(Bar, { dataKey: "count", fill: "#8884d8", children: data.map((entry, index) => (_jsx(Bar, { fill: RISK_COLORS[entry.risk] }, `bar-${index}`))) })] }) }) })] }));
};
