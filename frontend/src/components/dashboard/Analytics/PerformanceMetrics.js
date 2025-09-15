import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Layout/Card';
import { cn } from '../../../utils/cn';
export const PerformanceMetrics = ({ data, loading = false, }) => {
    if (loading) {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Model Performance" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: [1, 2, 3, 4].map((i) => (_jsxs("div", { className: "animate-pulse", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-1/4 mb-2" }), _jsx("div", { className: "h-8 bg-gray-200 rounded" })] }, i))) }) })] }));
    }
    const getMetricStatus = (value, threshold = 0.8) => {
        if (value >= threshold)
            return 'excellent';
        if (value >= threshold - 0.1)
            return 'good';
        if (value >= threshold - 0.2)
            return 'fair';
        return 'poor';
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'excellent': return 'text-green-600';
            case 'good': return 'text-blue-600';
            case 'fair': return 'text-yellow-600';
            case 'poor': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };
    const getStatusIcon = (status) => {
        switch (status) {
            case 'excellent': return _jsx(CheckCircle, { className: "h-5 w-5 text-green-600" });
            case 'good': return _jsx(TrendingUp, { className: "h-5 w-5 text-blue-600" });
            case 'fair': return _jsx(AlertTriangle, { className: "h-5 w-5 text-yellow-600" });
            case 'poor': return _jsx(AlertTriangle, { className: "h-5 w-5 text-red-600" });
            default: return _jsx(Target, { className: "h-5 w-5 text-gray-600" });
        }
    };
    const accuracyStatus = getMetricStatus(data.model_accuracy);
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Target, { className: "h-5 w-5" }), "Model Performance Overview"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "flex items-center justify-center mb-2", children: getStatusIcon(accuracyStatus) }), _jsxs("div", { className: cn('text-3xl font-bold', getStatusColor(accuracyStatus)), children: [(data.model_accuracy * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "Overall Accuracy" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-3xl font-bold text-orange-600", children: [(data.false_positive_rate * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "False Positive Rate" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-3xl font-bold text-blue-600", children: [(data.false_negative_rate * 100).toFixed(1), "%"] }), _jsx("p", { className: "text-sm text-gray-600", children: "False Negative Rate" })] })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Performance by Grade" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: Object.entries(data.precision_by_grade).map(([grade, precision]) => {
                                const recall = data.recall_by_grade[grade];
                                const f1Score = (2 * precision * recall) / (precision + recall);
                                return (_jsxs("div", { className: "flex items-center justify-between p-4 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: cn('w-8 h-8 rounded-full flex items-center justify-center text-white font-medium', grade === 'A' ? 'bg-green-600' :
                                                        grade === 'B' ? 'bg-blue-600' :
                                                            grade === 'C' ? 'bg-yellow-600' : 'bg-red-600'), children: grade }), _jsxs("span", { className: "font-medium", children: ["Grade ", grade] })] }), _jsxs("div", { className: "flex gap-6 text-sm", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "font-semibold", children: [(precision * 100).toFixed(1), "%"] }), _jsx("div", { className: "text-gray-600", children: "Precision" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "font-semibold", children: [(recall * 100).toFixed(1), "%"] }), _jsx("div", { className: "text-gray-600", children: "Recall" })] }), _jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "font-semibold", children: [(f1Score * 100).toFixed(1), "%"] }), _jsx("div", { className: "text-gray-600", children: "F1-Score" })] })] })] }, grade));
                            }) }) })] })] }));
};
