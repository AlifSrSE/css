import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Layout/Card';
import { Select } from '../../common/Forms/Select';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useGetAnalyticsQuery } from '../../../store/api/analyticsApi';
import { cn } from '../../../utils/cn';
export const TrendAnalysis = ({ className }) => {
    const [dateRange, setDateRange] = useState('6m');
    const [metric, setMetric] = useState('score');
    const [businessType, setBusinessType] = useState('');
    const { data: analytics, isLoading } = useGetAnalyticsQuery({
        date_from: getDateFromRange(dateRange),
        date_to: new Date().toISOString(),
        business_type: businessType || undefined,
    });
    const dateRangeOptions = [
        { value: '1m', label: 'Last Month' },
        { value: '3m', label: 'Last 3 Months' },
        { value: '6m', label: 'Last 6 Months' },
        { value: '1y', label: 'Last Year' },
    ];
    const metricOptions = [
        { value: 'score', label: 'Average Score' },
        { value: 'applications', label: 'Application Volume' },
        { value: 'approval_rate', label: 'Approval Rate' },
    ];
    // Mock trend data - replace with real data from analytics
    const trendData = useMemo(() => {
        if (!analytics)
            return [];
        return analytics.score_trends || [
            { date: 'Jan', avg_score: 65.2, count: 98, approval_rate: 78 },
            { date: 'Feb', avg_score: 66.8, count: 112, approval_rate: 81 },
            { date: 'Mar', avg_score: 68.1, count: 134, approval_rate: 83 },
            { date: 'Apr', avg_score: 67.5, count: 156, approval_rate: 79 },
            { date: 'May', avg_score: 69.2, count: 189, approval_rate: 85 },
            { date: 'Jun', avg_score: 68.9, count: 203, approval_rate: 82 },
        ];
    }, [analytics]);
    const getMetricValue = (item) => {
        switch (metric) {
            case 'score': return item.avg_score;
            case 'applications': return item.count;
            case 'approval_rate': return item.approval_rate;
            default: return item.avg_score;
        }
    };
    const getMetricLabel = () => {
        switch (metric) {
            case 'score': return 'Average Score';
            case 'applications': return 'Applications';
            case 'approval_rate': return 'Approval Rate (%)';
            default: return 'Value';
        }
    };
    const getMetricColor = () => {
        switch (metric) {
            case 'score': return '#8B5CF6';
            case 'applications': return '#3B82F6';
            case 'approval_rate': return '#10B981';
            default: return '#6B7280';
        }
    };
    // Calculate trend direction
    const calculateTrend = () => {
        if (trendData.length < 2)
            return { direction: 'stable', change: 0 };
        const first = getMetricValue(trendData[0]);
        const last = getMetricValue(trendData[trendData.length - 1]);
        const change = ((last - first) / first) * 100;
        return {
            direction: change > 2 ? 'up' : change < -2 ? 'down' : 'stable',
            change: Math.abs(change)
        };
    };
    const trend = calculateTrend();
    if (isLoading) {
        return (_jsx(Card, { className: className, children: _jsx(CardContent, { className: "p-6", children: _jsx("div", { className: "h-80 flex items-center justify-center", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) }) }) }));
    }
    return (_jsxs("div", { className: cn('space-y-6', className), children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "h-5 w-5" }), "Trend Analysis"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [_jsx(Select, { options: metricOptions, value: metric, onChange: (value) => setMetric(value), className: "min-w-[150px]" }), _jsx(Select, { options: dateRangeOptions, value: dateRange, onChange: setDateRange, className: "min-w-[120px]" }), _jsxs("div", { className: "flex items-center gap-2 text-sm", children: [trend.direction === 'up' ? (_jsx(TrendingUp, { className: "h-4 w-4 text-green-600" })) : trend.direction === 'down' ? (_jsx(TrendingDown, { className: "h-4 w-4 text-red-600" })) : (_jsx(BarChart3, { className: "h-4 w-4 text-gray-400" })), _jsx("span", { className: cn('font-medium', trend.direction === 'up' ? 'text-green-600' :
                                                trend.direction === 'down' ? 'text-red-600' : 'text-gray-600'), children: trend.direction === 'stable' ? 'Stable' : `${trend.change.toFixed(1)}% ${trend.direction}` }), _jsx("span", { className: "text-gray-500", children: "vs period start" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { children: [getMetricLabel(), " Trend"] }) }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 400, children: _jsxs(AreaChart, { data: trendData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date" }), _jsx(YAxis, {}), _jsx(Tooltip, { formatter: (value) => [value, getMetricLabel()], labelFormatter: (label) => `Month: ${label}` }), _jsx(Area, { type: "monotone", dataKey: metric === 'score' ? 'avg_score' : metric === 'applications' ? 'count' : 'approval_rate', stroke: getMetricColor(), fill: getMetricColor(), fillOpacity: 0.3 })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Multi-Metric Comparison" }) }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 350, children: _jsxs(LineChart, { data: trendData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "date" }), _jsx(YAxis, { yAxisId: "left" }), _jsx(YAxis, { yAxisId: "right", orientation: "right" }), _jsx(Tooltip, {}), _jsx(Legend, {}), _jsx(Line, { yAxisId: "left", type: "monotone", dataKey: "avg_score", stroke: "#8B5CF6", strokeWidth: 2, name: "Avg Score" }), _jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "count", stroke: "#3B82F6", strokeWidth: 2, name: "Applications" }), _jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "approval_rate", stroke: "#10B981", strokeWidth: 2, name: "Approval Rate (%)" })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Key Insights" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "p-4 bg-blue-50 rounded-lg", children: [_jsx("h4", { className: "font-medium text-blue-900 mb-2", children: "Performance Trends" }), _jsxs("ul", { className: "text-sm text-blue-800 space-y-1", children: [_jsxs("li", { children: ["\u2022 ", getMetricLabel(), " showing ", trend.direction, " trend over selected period"] }), _jsxs("li", { children: ["\u2022 ", trend.change.toFixed(1), "% change from period start"] }), _jsxs("li", { children: ["\u2022 ", trendData.length > 0 ? `Peak value: ${Math.max(...trendData.map(getMetricValue)).toFixed(1)}` : 'No data'] })] })] }), _jsxs("div", { className: "p-4 bg-green-50 rounded-lg", children: [_jsx("h4", { className: "font-medium text-green-900 mb-2", children: "Recommendations" }), _jsxs("ul", { className: "text-sm text-green-800 space-y-1", children: [trend.direction === 'up' && (_jsxs(_Fragment, { children: [_jsx("li", { children: "\u2022 Continue current strategies - showing positive results" }), _jsx("li", { children: "\u2022 Consider scaling successful initiatives" })] })), trend.direction === 'down' && (_jsxs(_Fragment, { children: [_jsx("li", { children: "\u2022 Review recent changes that may have impacted performance" }), _jsx("li", { children: "\u2022 Implement corrective measures to reverse trend" })] })), trend.direction === 'stable' && (_jsxs(_Fragment, { children: [_jsx("li", { children: "\u2022 Performance is stable - maintain current standards" }), _jsx("li", { children: "\u2022 Look for optimization opportunities" })] }))] })] })] }) })] })] }));
};
// Helper function
function getDateFromRange(range) {
    const now = new Date();
    let months = 6;
    switch (range) {
        case '1m':
            months = 1;
            break;
        case '3m':
            months = 3;
            break;
        case '6m':
            months = 6;
            break;
        case '1y':
            months = 12;
            break;
    }
    const date = new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
    return date.toISOString();
}
