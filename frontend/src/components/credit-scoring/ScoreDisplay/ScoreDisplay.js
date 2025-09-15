import { jsxs as _jsxs, jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, Tabs, TabsContent, TabsList, TabsTrigger, Alert, AlertDescription, Separator, } from '@/components/ui';
import { AlertTriangle, CheckCircle, XCircle, Info, Download, RefreshCw, Target, Shield, DollarSign, } from 'lucide-react';
import { Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';
// Color schemes for different grade levels
const gradeColors = {
    A: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-200', accent: '#10B981' },
    B: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200', accent: '#3B82F6' },
    C: { bg: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200', accent: '#F59E0B' },
    R: { bg: 'bg-red-50', text: 'text-red-800', border: 'border-red-200', accent: '#EF4444' },
};
const riskColors = {
    low: '#10B981',
    medium: '#F59E0B',
    high: '#F97316',
    very_high: '#EF4444',
};
export const ScoreDisplay = ({ score, showDetails = true, compact = false, }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [expandedSections, setExpandedSections] = useState([]);
    const gradeStyle = gradeColors[score.grade];
    const toggleSection = (section) => {
        setExpandedSections(prev => prev.includes(section)
            ? prev.filter(s => s !== section)
            : [...prev, section]);
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('bn-BD', {
            style: 'currency',
            currency: 'BDT',
            minimumFractionDigits: 0,
        }).format(amount);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    // Prepare chart data
    const componentScoreData = [
        { name: 'Data Points', value: score.data_points_score, maxValue: 100, color: '#8B5CF6' },
        { name: 'Credit Ratios', value: score.credit_ratios_score, maxValue: 100, color: '#06B6D4' },
        { name: 'Borrower Attributes', value: score.borrower_attributes_score, maxValue: 100, color: '#84CC16' },
    ];
    if (score.psychometric_result) {
        componentScoreData.push({
            name: 'Psychometric',
            value: score.psychometric_result.total_score,
            maxValue: 100,
            color: '#F97316'
        });
    }
    const riskIndicatorData = [
        { name: 'Score', value: score.total_points, maxValue: 100, color: gradeStyle.accent }
    ];
    const ratioData = score.credit_ratios_breakdown.map(ratio => ({
        name: ratio.ratio_name.replace('_', ' ').toUpperCase(),
        value: ratio.score,
        band: ratio.band,
        color: ratio.band === 'green' ? '#10B981' : ratio.band === 'amber' ? '#F59E0B' : '#EF4444'
    }));
    if (compact) {
        return (_jsx(Card, { className: `${gradeStyle.bg} ${gradeStyle.border} border-l-4`, children: _jsxs(CardContent, { className: "p-4", children: [_jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsxs("div", { className: "flex items-center gap-2 mb-2", children: [_jsxs(Badge, { className: `${gradeStyle.bg} ${gradeStyle.text}`, children: ["Grade ", score.grade] }), _jsx(Badge, { variant: "outline", children: score.risk_level.replace('_', ' ').toUpperCase() })] }), _jsx("p", { className: "text-2xl font-bold", children: score.total_points.toFixed(1) }), _jsx("p", { className: "text-sm text-gray-600", children: "Final Score" })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "text-lg font-semibold", children: formatCurrency(score.max_loan_amount) }), _jsx("p", { className: "text-sm text-gray-600", children: "Max Loan Amount" })] })] }), score.red_flags.length > 0 && (_jsxs("div", { className: "mt-3 flex items-center gap-1 text-orange-600", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsxs("span", { className: "text-sm", children: [score.red_flags.length, " risk flag(s)"] })] }))] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { className: `${gradeStyle.bg} ${gradeStyle.border} border-l-4`, children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Target, { className: "h-5 w-5" }), "Credit Score Results"] }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: ["Calculated on ", formatDate(score.calculated_at)] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export Report"] }), _jsxs(Button, { variant: "outline", size: "sm", children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Recalculate"] })] })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "relative w-24 h-24 mx-auto mb-2", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(RadialBarChart, { cx: "50%", cy: "50%", innerRadius: "60%", outerRadius: "90%", data: riskIndicatorData, children: [_jsx(RadialBar, { dataKey: "value", fill: gradeStyle.accent }), _jsx("text", { x: "50%", y: "50%", textAnchor: "middle", dominantBaseline: "middle", className: "fill-current text-lg font-bold", children: score.total_points.toFixed(1) })] }) }) }), _jsxs(Badge, { className: `${gradeStyle.bg} ${gradeStyle.text} text-lg px-3 py-1`, children: ["Grade ", score.grade] }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: score.loan_slab_adjustment })] }), _jsxs("div", { className: "flex flex-col items-center", children: [_jsx(Shield, { className: "h-8 w-8 mb-2", style: { color: riskColors[score.risk_level] } }), _jsxs(Badge, { variant: "outline", className: "mb-2", style: {
                                                borderColor: riskColors[score.risk_level],
                                                color: riskColors[score.risk_level]
                                            }, children: [score.risk_level.replace('_', ' ').toUpperCase(), " RISK"] }), _jsxs("p", { className: "text-sm text-center", children: [(score.default_probability * 100).toFixed(1), "% Default Probability"] })] }), _jsxs("div", { className: "flex flex-col items-center", children: [_jsx(DollarSign, { className: "h-8 w-8 text-green-600 mb-2" }), _jsx("p", { className: "text-lg font-semibold text-green-600", children: formatCurrency(score.max_loan_amount) }), _jsx("p", { className: "text-sm text-gray-600 text-center", children: "Maximum Loan Amount" })] }), _jsx("div", { className: "flex flex-col items-center", children: score.red_flags.length === 0 ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-8 w-8 text-green-600 mb-2" }), _jsx("p", { className: "text-sm text-green-600 text-center", children: "No Risk Flags" })] })) : (_jsxs(_Fragment, { children: [_jsx(AlertTriangle, { className: "h-8 w-8 text-orange-600 mb-2" }), _jsxs("p", { className: "text-sm text-orange-600 text-center", children: [score.red_flags.length, " Risk Flag(s)"] }), _jsxs("p", { className: "text-xs text-gray-500", children: [score.red_flags.filter(f => f.flag_type === 'critical').length, " Critical , ", score.red_flags.filter(f => f.flag_type === 'warning').length, " Warning , ", score.red_flags.filter(f => f.flag_type === 'info').length, " Info"] })] })) })] }) })] }), showDetails && (_jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "mb-4", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "components", children: "Components" }), _jsx(TabsTrigger, { value: "ratios", children: "Credit Ratios" }), score.psychometric_result && _jsx(TabsTrigger, { value: "psychometric", children: "Psychometric" }), score.red_flags.length > 0 && _jsx(TabsTrigger, { value: "red_flags", children: "Red Flags" })] }), _jsx(TabsContent, { value: "overview", children: _jsx(Card, { children: _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Final Score" }), _jsx("p", { className: "text-2xl font-bold", children: score.total_points.toFixed(1) }), _jsxs(Badge, { className: `${gradeStyle.bg} ${gradeStyle.text} mt-1`, children: ["Grade ", score.grade] })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Risk Level" }), _jsxs(Badge, { variant: "outline", style: {
                                                        borderColor: riskColors[score.risk_level],
                                                        color: riskColors[score.risk_level]
                                                    }, className: "mt-1", children: [score.risk_level.replace('_', ' ').toUpperCase(), " RISK"] }), _jsxs("p", { className: "text-sm text-gray-600 mt-1", children: [(score.default_probability * 100).toFixed(1), "% Default Probability"] })] }), _jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Max Loan Amount" }), _jsx("p", { className: "text-lg font-semibold text-green-600 mt-1", children: formatCurrency(score.max_loan_amount) })] })] }) }) }) }), _jsx(TabsContent, { value: "components", children: _jsx(Card, { children: _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: componentScoreData, margin: { top: 20, right: 30, left: 20, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "value", fill: "#8884d8", children: componentScoreData.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) })] }) }) }) }) }), _jsx(TabsContent, { value: "ratios", children: _jsx(Card, { children: _jsx(CardContent, { children: _jsx(ResponsiveContainer, { width: "100%", height: 300, children: _jsxs(BarChart, { data: ratioData, margin: { top: 20, right: 30, left: 20, bottom: 5 }, children: [_jsx(CartesianGrid, { strokeDasharray: "3 3" }), _jsx(XAxis, { dataKey: "name" }), _jsx(YAxis, {}), _jsx(Tooltip, {}), _jsx(Bar, { dataKey: "value", fill: "#8884d8", children: ratioData.map((entry, index) => (_jsx(Cell, { fill: entry.color }, `cell-${index}`))) })] }) }) }) }) }), score.psychometric_result && (_jsx(TabsContent, { value: "psychometric", children: _jsx(Card, { children: _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Psychometric Score" }), _jsx("p", { className: "text-2xl font-bold", children: score.psychometric_result.total_score.toFixed(1) })] }), _jsx(Separator, {}), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: score.psychometric_result.trait_scores.map((trait, idx) => (_jsxs("div", { className: "text-center", children: [_jsx("p", { className: "text-sm text-gray-600", children: trait.trait_name.replace('_', ' ').toUpperCase() }), _jsx("p", { className: "text-xl font-semibold", children: trait.score.toFixed(1) })] }, idx))) })] }) }) }) })), score.red_flags.length > 0 && (_jsx(TabsContent, { value: "red_flags", children: _jsx("div", { className: "space-y-4", children: score.red_flags.map((flag, idx) => {
                                const flagColor = flag.flag_type === 'critical' ? 'text-red-600' : flag.flag_type === 'warning' ? 'text-orange-600' : 'text-blue-600';
                                const FlagIcon = flag.flag_type === 'critical' ? XCircle : flag.flag_type === 'warning' ? AlertTriangle : Info;
                                return (_jsxs(Alert, { className: `${flagColor} border-l-4`, children: [_jsx(FlagIcon, { className: "h-5 w-5 flex-shrink-0" }), _jsxs(AlertDescription, { children: [_jsx("p", { className: "font-semibold", children: flag.title }), _jsx("p", { className: "text-sm", children: flag.description })] })] }, idx));
                            }) }) }))] }))] }));
};
export default ScoreDisplay;
