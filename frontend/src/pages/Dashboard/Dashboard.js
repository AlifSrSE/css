import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Tabs, TabsList, TabsTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from '@/components/ui';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, } from 'recharts';
import { TrendingUp, TrendingDown, Users, AlertTriangle, CheckCircle, FileText, Calendar, Download, } from 'lucide-react';
import { useGetDashboardStatsQuery } from '../../store/api/scoringApi';
import { useGetAnalyticsQuery } from '../../store/api/analyticsApi';
import { useGetPerformanceMetricsQuery } from '../../store/api/analyticsApi';
const Dashboard = () => {
    const [dateRange, setDateRange] = useState('6m');
    const [selectedFilter, setSelectedFilter] = useState('all');
    // Fetch dashboard data
    const { data: dashboardStats, isLoading: statsLoading } = useGetDashboardStatsQuery({ date_range: dateRange });
    const { data: analytics, isLoading: analyticsLoading } = useGetAnalyticsQuery({
        date_from: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString(),
        date_to: new Date().toISOString(),
    });
    const { data: performanceMetrics } = useGetPerformanceMetricsQuery({ period: dateRange });
    // Mock data for demonstration (replace with real data from API)
    const mockStats = {
        total_applications: 1247,
        pending_applications: 89,
        completed_applications: 1034,
        rejected_applications: 124,
        average_score: 67.8,
        grade_distribution: { A: 234, B: 456, C: 344, R: 213 },
        risk_distribution: { low: 345, medium: 489, high: 267, very_high: 146 },
        monthly_trends: [
            { month: 'Jan', applications: 98, avg_score: 65.2, approval_rate: 78 },
            { month: 'Feb', applications: 112, avg_score: 66.8, approval_rate: 81 },
            { month: 'Mar', applications: 134, avg_score: 68.1, approval_rate: 83 },
            { month: 'Apr', applications: 156, avg_score: 67.5, approval_rate: 79 },
            { month: 'May', applications: 189, avg_score: 69.2, approval_rate: 85 },
            { month: 'Jun', applications: 203, avg_score: 68.9, approval_rate: 82 },
        ],
    };
    const stats = dashboardStats || mockStats;
    // Prepare chart data
    const gradeData = Object.entries(stats.grade_distribution).map(([grade, count]) => ({
        grade,
        count,
        percentage: (count / stats.total_applications) * 100,
    }));
    const riskData = Object.entries(stats.risk_distribution).map(([risk, count]) => ({
        risk: risk.replace('_', ' ').toUpperCase(),
        count,
        percentage: (count / stats.total_applications) * 100,
    }));
    const COLORS = {
        A: '#10B981', // Green
        B: '#3B82F6', // Blue  
        C: '#F59E0B', // Yellow
        R: '#EF4444', // Red
        LOW: '#10B981',
        MEDIUM: '#F59E0B',
        HIGH: '#F97316',
        'VERY HIGH': '#EF4444',
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('bn-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
        }).format(amount);
    };
    if (statsLoading) {
        return (_jsx("div", { className: "flex items-center justify-center h-64", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" }) }));
    }
    return (_jsxs("div", { className: "space-y-6 p-6", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Credit Scoring Dashboard" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Monitor loan applications and scoring performance" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Select, { value: dateRange, onValueChange: setDateRange, children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, { placeholder: "Period" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "1m", children: "Last Month" }), _jsx(SelectItem, { value: "3m", children: "Last 3 Months" }), _jsx(SelectItem, { value: "6m", children: "Last 6 Months" }), _jsx(SelectItem, { value: "1y", children: "Last Year" })] })] }), _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export"] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [_jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Applications" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: stats.total_applications.toLocaleString() })] }), _jsx(FileText, { className: "h-8 w-8 text-blue-600" })] }), _jsxs("div", { className: "mt-4 flex items-center text-sm", children: [_jsx(TrendingUp, { className: "h-4 w-4 text-green-600 mr-1" }), _jsx("span", { className: "text-green-600", children: "+12.5%" }), _jsx("span", { className: "text-gray-600 ml-1", children: "from last month" })] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Average Score" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: stats.average_score.toFixed(1) })] }), _jsx(Users, { className: "h-8 w-8 text-green-600" })] }), _jsxs("div", { className: "mt-4 flex items-center text-sm", children: [_jsx(TrendingUp, { className: "h-4 w-4 text-green-600 mr-1" }), _jsx("span", { className: "text-green-600", children: "+3.2%" }), _jsx("span", { className: "text-gray-600 ml-1", children: "from last month" })] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Completed Applications" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: stats.completed_applications.toLocaleString() })] }), _jsx(CheckCircle, { className: "h-8 w-8 text-green-600" })] }), _jsxs("div", { className: "mt-4 flex items-center text-sm", children: [_jsx(TrendingUp, { className: "h-4 w-4 text-green-600 mr-1" }), _jsx("span", { className: "text-green-600", children: "+8.7%" }), _jsx("span", { className: "text-gray-600 ml-1", children: "from last month" })] })] }) }), _jsx(Card, { children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Rejected Applications" }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: stats.rejected_applications.toLocaleString() })] }), _jsx(AlertTriangle, { className: "h-8 w-8 text-red-600" })] }), _jsxs("div", { className: "mt-4 flex items-center text-sm", children: [_jsx(TrendingDown, { className: "h-4 w-4 text-red-600 mr-1" }), _jsx("span", { className: "text-red-600", children: "-4.3%" }), _jsx("span", { className: "text-gray-600 ml-1", children: "from last month" })] })] }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-6", children: [_jsxs(Card, { className: "lg:col-span-2", children: [_jsxs(CardHeader, { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Monthly Trends" }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Calendar, { className: "h-4 w-4 text-gray-600" }), _jsx("span", { className: "text-sm text-gray-600", children: "Last 6 Months" })] })] }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(LineChart, { data: stats.monthly_trends, margin: { top: 20, right: 30, left: 0, bottom: 0 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "month" }), _jsx(YAxis, { yAxisId: "left", orientation: "left", stroke: "#8884d8" }), _jsx(YAxis, { yAxisId: "right", orientation: "right", stroke: "#82ca9d" }), _jsx(Tooltip, {}), _jsx(Legend, {}), _jsx(Line, { yAxisId: "left", type: "monotone", dataKey: "applications", stroke: "#8884d8", activeDot: { r: 8 }, name: "Applications" }), _jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "avg_score", stroke: "#82ca9d", name: "Avg. Score" }), _jsx(Line, { yAxisId: "right", type: "monotone", dataKey: "approval_rate", stroke: "#ffc658", name: "Approval Rate (%)" })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Grade Distribution" }) }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: gradeData, dataKey: "count", nameKey: "grade", cx: "50%", cy: "50%", outerRadius: 80, fill: "#8884d8", label: ({ grade, percentage }) => `${grade}: ${percentage.toFixed(1)}%`, children: gradeData.map((entry) => (_jsx(Cell, { fill: COLORS[entry.grade] }, `cell-${entry.grade}`))) }), _jsx(Tooltip, {})] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Risk Distribution" }) }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: riskData, dataKey: "count", nameKey: "risk", cx: "50%", cy: "50%", outerRadius: 80, fill: "#82ca9d", label: ({ risk, percentage }) => `${risk}: ${percentage.toFixed(1)}%`, children: riskData.map((entry) => (_jsx(Cell, { fill: COLORS[entry.risk] }, `cell-${entry.risk}`))) }), _jsx(Tooltip, {})] }) }) })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Performance Metrics" }), _jsx(Tabs, { value: selectedFilter, onValueChange: setSelectedFilter, children: _jsxs(TabsList, { children: [_jsx(TabsTrigger, { value: "all", className: "text-sm", children: "All" }), _jsx(TabsTrigger, { value: "low", className: "text-sm", children: "Low Risk" }), _jsx(TabsTrigger, { value: "medium", className: "text-sm", children: "Medium Risk" }), _jsx(TabsTrigger, { value: "high", className: "text-sm", children: "High Risk" })] }) })] }), _jsx(CardContent, { children: performanceMetrics ? (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6", children: [_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "Model Accuracy" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900 mt-2", children: [(performanceMetrics.model_accuracy * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Overall model accuracy" })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "False Positive Rate" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900 mt-2", children: [(performanceMetrics.false_positive_rate * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Rate of false positives" })] }), _jsxs("div", { className: "p-4 border rounded-lg", children: [_jsx("h3", { className: "text-lg font-medium text-gray-900", children: "False Negative Rate" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900 mt-2", children: [(performanceMetrics.false_negative_rate * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "Rate of false negatives" })] })] })) : (_jsx("div", { className: "text-center text-gray-600", children: "No performance metrics available." })) })] })] }));
};
export default Dashboard;
