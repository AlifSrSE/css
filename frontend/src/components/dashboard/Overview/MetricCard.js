import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '../../common/Layout/Card';
import { cn } from '../../../utils/cn';
export const MetricCard = ({ title, value, change, icon, className, loading = false, }) => {
    if (loading) {
        return (_jsx(Card, { className: cn('animate-pulse', className), children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-24" }), _jsx("div", { className: "h-8 bg-gray-200 rounded w-16" })] }), _jsx("div", { className: "h-8 w-8 bg-gray-200 rounded" })] }), change && (_jsx("div", { className: "mt-4 h-4 bg-gray-200 rounded w-32" }))] }) }));
    }
    return (_jsx(Card, { className: className, children: _jsxs(CardContent, { className: "p-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: title }), _jsx("p", { className: "text-3xl font-bold text-gray-900", children: value })] }), _jsx("div", { className: "text-blue-600", children: icon })] }), change && (_jsxs("div", { className: "mt-4 flex items-center text-sm", children: [change.type === 'increase' ? (_jsx(TrendingUp, { className: "h-4 w-4 text-green-600 mr-1" })) : (_jsx(TrendingDown, { className: "h-4 w-4 text-red-600 mr-1" })), _jsxs("span", { className: cn(change.type === 'increase' ? 'text-green-600' : 'text-red-600'), children: [change.value > 0 ? '+' : '', change.value, "%"] }), _jsx("span", { className: "text-gray-600 ml-1", children: change.period })] }))] }) }));
};
