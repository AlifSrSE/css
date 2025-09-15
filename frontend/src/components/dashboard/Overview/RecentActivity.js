import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Clock, User, FileText, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Layout/Card';
import { StatusBadge } from '../../common/Tables/StatusBadge';
import { formatDistanceToNow } from 'date-fns';
export const RecentActivity = ({ activities = [], loading = false, }) => {
    // Mock data if no activities provided
    const mockActivities = [
        {
            id: '1',
            type: 'score_calculated',
            title: 'Credit Score Calculated',
            description: 'Application APP-20241201-ABC123 scored Grade B',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            user: 'John Analyst',
            status: 'success',
        },
        {
            id: '2',
            type: 'application_created',
            title: 'New Application Submitted',
            description: 'Rahman Grocery Shop - Loan amount: ৳500,000',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            user: 'Sarah Officer',
            status: 'success',
        },
        {
            id: '3',
            type: 'report_generated',
            title: 'Report Generated',
            description: 'Monthly risk assessment report completed',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
            user: 'System',
            status: 'success',
        },
    ];
    const displayActivities = activities.length > 0 ? activities : mockActivities;
    const getActivityIcon = (type) => {
        switch (type) {
            case 'application_created':
                return _jsx(FileText, { className: "h-4 w-4 text-blue-600" });
            case 'score_calculated':
                return _jsx(CheckCircle, { className: "h-4 w-4 text-green-600" });
            case 'report_generated':
                return _jsx(FileText, { className: "h-4 w-4 text-purple-600" });
            case 'user_login':
                return _jsx(User, { className: "h-4 w-4 text-gray-600" });
            default:
                return _jsx(Clock, { className: "h-4 w-4 text-gray-400" });
        }
    };
    if (loading) {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recent Activity" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: [1, 2, 3].map((i) => (_jsxs("div", { className: "flex items-center space-x-4 animate-pulse", children: [_jsx("div", { className: "h-8 w-8 bg-gray-200 rounded-full" }), _jsxs("div", { className: "flex-1 space-y-2", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4" }), _jsx("div", { className: "h-3 bg-gray-200 rounded w-1/2" })] })] }, i))) }) })] }));
    }
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-5 w-5" }), "Recent Activity"] }) }), _jsx(CardContent, { children: displayActivities.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(Clock, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "No recent activity" })] })) : (_jsxs("div", { className: "space-y-4", children: [displayActivities.slice(0, 5).map((activity) => (_jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: "flex-shrink-0 mt-0.5", children: getActivityIcon(activity.type) }), _jsxs("div", { className: "flex-1 min-w-0", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("p", { className: "text-sm font-medium text-gray-900 truncate", children: activity.title }), activity.status && (_jsx(StatusBadge, { status: activity.status }))] }), _jsx("p", { className: "text-sm text-gray-500 truncate", children: activity.description }), _jsxs("div", { className: "flex items-center text-xs text-gray-400 mt-1", children: [_jsx(User, { className: "h-3 w-3 mr-1" }), _jsx("span", { children: activity.user }), _jsx("span", { className: "mx-2", children: "\u2022" }), _jsx("span", { children: formatDistanceToNow(activity.timestamp, { addSuffix: true }) })] })] })] }, activity.id))), displayActivities.length > 5 && (_jsx("div", { className: "text-center pt-4", children: _jsx(Button, { variant: "ghost", size: "sm", children: "View All Activity" }) }))] })) })] }));
};
