import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Layout/Card';
import { StatusBadge } from '../../common/Tables/StatusBadge';
import { Button } from '../../common/Forms/Button';
import { Download, TrendingUp, AlertTriangle } from 'lucide-react';
import { useGetScoreBreakdownQuery } from '../../../store/api/reportsApi';
import { cn } from '../../../utils/cn';
export const ScoreBreakdown = ({ applicationId, className }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const { data: breakdown, isLoading, error } = useGetScoreBreakdownQuery(applicationId);
    if (isLoading) {
        return (_jsx("div", { className: cn('space-y-4', className), children: [1, 2, 3].map((i) => (_jsx(Card, { className: "animate-pulse", children: _jsxs(CardContent, { className: "p-6", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-1/4 mb-4" }), _jsx("div", { className: "h-20 bg-gray-200 rounded" })] }) }, i))) }));
    }
    if (error || !breakdown) {
        return (_jsx(Card, { className: className, children: _jsxs(CardContent, { className: "p-6 text-center", children: [_jsx(AlertTriangle, { className: "h-12 w-12 text-red-500 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Failed to load score breakdown" })] }) }));
    }
    const componentData = [
        {
            name: 'Data Points',
            score: breakdown.component_scores.data_points.score,
            percentage: breakdown.component_scores.data_points.percentage,
            color: '#8B5CF6'
        },
        {
            name: 'Credit Ratios',
            score: breakdown.component_scores.credit_ratios.score,
            percentage: breakdown.component_scores.credit_ratios.percentage,
            color: '#06B6D4'
        },
        {
            name: '5C Attributes',
            score: breakdown.component_scores.borrower_attributes.score,
            percentage: breakdown.component_scores.borrower_attributes.percentage,
            color: '#84CC16'
        }
    ];
    if (breakdown.component_scores.psychometric) {
        componentData.push({
            name: 'Psychometric',
            score: breakdown.component_scores.psychometric.score,
            percentage: breakdown.component_scores.psychometric.adjustment,
            color: '#F97316'
        });
    }
    const ratiosData = breakdown.component_scores.credit_ratios.ratios.map(ratio => ({
        name: ratio.name.replace('_', ' ').toUpperCase(),
        value: ratio.value,
        score: ratio.score,
        band: ratio.band,
        color: ratio.band === 'green' ? '#10B981' : ratio.band === 'amber' ? '#F59E0B' : '#EF4444'
    }));
    return (_jsxs("div", { className: cn('space-y-6', className), children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx(CardTitle, { children: "Score Breakdown Report" }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["Application: ", breakdown.application_id] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(StatusBadge, { status: breakdown.grade }), _jsxs(Button, { size: "sm", variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export"] })] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold text-blue-600", children: breakdown.final_score.toFixed(1) }), _jsx("p", { className: "text-sm text-gray-600", children: "Final Score" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-2xl font-semibold text-green-600", children: ["Grade ", breakdown.grade] }), _jsx("p", { className: "text-sm text-gray-600", children: "Credit Grade" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-lg font-semibold text-orange-600", children: breakdown.risk_assessment.level.replace('_', ' ').toUpperCase() }), _jsx("p", { className: "text-sm text-gray-600", children: "Risk Level" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-lg font-semibold text-purple-600", children: [(breakdown.risk_assessment.probability * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Default Risk" })] })] }) })] }), _jsx("div", { className: "flex space-x-1", children: [
                    { key: 'overview', label: 'Overview' },
                    { key: 'components', label: 'Component Analysis' },
                    { key: 'comparison', label: 'Peer Comparison' },
                ].map((tab) => (_jsx(Button, { variant: activeTab === tab.key ? 'default' : 'ghost', size: "sm", onClick: () => setActiveTab(tab.key), children: tab.label }, tab.key))) }), activeTab === 'overview' && (_jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Score Components" }) }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: componentData, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, {}), _jsx(Tooltip, { formatter: (value, name) => [
                                                    `${value}${name === 'score' ? '' : '%'}`,
                                                    name === 'score' ? 'Score' : 'Weight'
                                                ] }), _jsx(Bar, { dataKey: "score", fill: "#8884d8" })] }) }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Score Distribution" }) }), _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(PieChart, { children: [_jsx(Pie, { data: componentData, cx: "50%", cy: "50%", outerRadius: 80, fill: "#8884d8", dataKey: "percentage", label: ({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`, children: componentData.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) }), _jsx(Tooltip, {})] }) }) })] })] })), activeTab === 'components' && (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Credit Ratios Performance" }) }), _jsxs(CardContent, { children: [_jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: ratiosData, layout: "horizontal", children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { type: "number" }), _jsx(YAxis, { dataKey: "name", type: "category", width: 100 }), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "score", fill: "#8884d8", children: ratiosData.map((entry, index) => (_jsx(Bar, { fill: entry.color }, `bar-${index}`))) })] }) }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 mt-6", children: breakdown.component_scores.credit_ratios.ratios.map((ratio, index) => (_jsxs("div", { className: "p-3 border rounded-lg", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h4", { className: "font-medium capitalize", children: ratio.name.replace('_', ' ') }), _jsx(StatusBadge, { status: ratio.band })] }), _jsxs("div", { className: "flex justify-between items-center mt-2 text-sm", children: [_jsxs("span", { children: ["Value: ", ratio.value.toFixed(2), "%"] }), _jsxs("span", { children: ["Score: ", ratio.score] })] })] }, index))) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "5C Attributes Analysis" }) }), _jsx(CardContent, { children: _jsx("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-4", children: Object.entries(breakdown.component_scores.borrower_attributes.components).map(([category, data]) => (_jsxs("div", { className: "text-center p-4 bg-gray-50 rounded-lg", children: [_jsx("h4", { className: "font-medium mb-2 capitalize", children: category }), _jsx("div", { className: "text-2xl font-bold text-green-600", children: data.score }), _jsxs("div", { className: "text-sm text-gray-600", children: ["/", data.max_score] }), _jsxs("div", { className: "text-xs text-gray-500 mt-2", children: [((data.score / data.max_score) * 100).toFixed(0), "%"] })] }, category))) }) })] }), breakdown.component_scores.psychometric && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Psychometric Assessment" }) }), _jsxs(CardContent, { children: [_jsx("div", { className: "grid grid-cols-1 md:grid-cols-5 gap-4", children: Object.entries(breakdown.component_scores.psychometric.profile).map(([dimension, score]) => (_jsxs("div", { className: "text-center p-4 bg-blue-50 rounded-lg", children: [_jsx("h4", { className: "font-medium mb-2 capitalize", children: dimension.replace('_', ' ') }), _jsxs("div", { className: "text-xl font-bold text-blue-600", children: [score, "/20"] }), _jsxs("div", { className: "text-xs text-blue-600 mt-1", children: [((score / 20) * 100).toFixed(0), "%"] })] }, dimension))) }), _jsx("div", { className: "mt-4 p-3 bg-blue-50 rounded-lg", children: _jsxs("p", { className: "text-sm text-blue-800", children: [_jsx("strong", { children: "Overall Score:" }), " ", breakdown.component_scores.psychometric.score, "/100", _jsxs("span", { className: "ml-4", children: [_jsx("strong", { children: "Adjustment:" }), " ", breakdown.component_scores.psychometric.adjustment > 0 ? '+' : '', breakdown.component_scores.psychometric.adjustment, " points"] })] }) })] })] }))] })), activeTab === 'comparison' && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "h-5 w-5" }), "Peer Comparison"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(TrendingUp, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "Peer comparison data will be available soon" }), _jsx("p", { className: "text-sm", children: "Compare this application with similar business types and loan amounts" })] }) })] })), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "h-5 w-5" }), "Risk Assessment Summary"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Risk Factors" }), breakdown.risk_assessment.factors.length === 0 ? (_jsx("p", { className: "text-green-600 text-sm", children: "No significant risk factors identified" })) : (_jsx("div", { className: "space-y-2", children: breakdown.risk_assessment.factors.map((factor, index) => (_jsxs("div", { className: "flex items-center gap-2 text-sm", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-orange-500" }), _jsx("span", { children: factor })] }, index))) }))] }), _jsxs("div", { children: [_jsx("h4", { className: "font-medium mb-3", children: "Recommendations" }), _jsx("div", { className: "space-y-2", children: breakdown.recommendations.map((recommendation, index) => (_jsxs("div", { className: "flex items-start gap-2 text-sm", children: [_jsx("div", { className: "w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" }), _jsx("span", { children: recommendation })] }, index))) })] })] }) })] })] }));
};
