import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Layout/Card';
const COLORS = {
    A: '#10B981', // Green
    B: '#3B82F6', // Blue
    C: '#F59E0B', // Yellow
    R: '#EF4444', // Red
};
export const ScoreDistributionChart = ({ data, loading = false, }) => {
    if (loading) {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Grade Distribution" }) }), _jsx(CardContent, { children: _jsx("div", { className: "h-64 flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) }) })] }));
    }
    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (_jsxs("div", { className: "bg-white p-3 border rounded-lg shadow-lg", children: [_jsxs("p", { className: "font-medium", children: ["Grade ", data.grade] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Count: ", data.count, " (", data.percentage.toFixed(1), "%)"] })] }));
        }
        return null;
    };
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Grade Distribution" }) }), _jsxs(CardContent, { children: [_jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, cx: "50%", cy: "50%", labelLine: false, label: ({ grade, percentage }) => `${grade}: ${percentage.toFixed(1)}%`, outerRadius: 80, fill: "#8884d8", dataKey: "count", children: data.map((entry, index) => (_jsx(Cell, { fill: COLORS[entry.grade] }, `cell-${index}`))) }), _jsx(Tooltip, { content: _jsx(CustomTooltip, {}) }), _jsx(Legend, {})] }) }), _jsx("div", { className: "grid grid-cols-2 gap-2 mt-4", children: data.map((item) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "w-3 h-3 rounded", style: { backgroundColor: COLORS[item.grade] } }), _jsxs("span", { className: "text-sm font-medium", children: ["Grade ", item.grade] })] }), _jsx("span", { className: "text-sm", children: item.count })] }, item.grade))) })] })] }));
};
