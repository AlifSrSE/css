import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '../../../utils/cn';
const statusConfig = {
    // Application statuses
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
    processing: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Processing' },
    completed: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
    rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    // Risk levels
    low: { bg: 'bg-green-100', text: 'text-green-800', label: 'Low Risk' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Medium Risk' },
    high: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'High Risk' },
    very_high: { bg: 'bg-red-100', text: 'text-red-800', label: 'Very High Risk' },
    // Grades
    A: { bg: 'bg-green-100', text: 'text-green-800', label: 'Grade A' },
    B: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Grade B' },
    C: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Grade C' },
    R: { bg: 'bg-red-100', text: 'text-red-800', label: 'Grade R' },
};
export const StatusBadge = ({ status, className }) => {
    const config = statusConfig[status];
    if (!config) {
        return _jsx("span", { className: "text-gray-600", children: status });
    }
    return (_jsx("span", { className: cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', config.bg, config.text, className), children: config.label }));
};
