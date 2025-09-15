import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { CheckCircle, XCircle, Lightbulb, TrendingUp, DollarSign, Clock, Shield, Target, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../common/Layout/Card';
import { Button } from '../../common/Forms/Button';
import { cn } from '../../../utils/cn';
export const RecommendationPanel = ({ score, className, onAcceptRecommendation, onRejectRecommendation, }) => {
    const [acceptedRecommendations, setAcceptedRecommendations] = useState(new Set());
    const [rejectedRecommendations, setRejectedRecommendations] = useState(new Set());
    const handleAccept = (id) => {
        setAcceptedRecommendations(prev => new Set(prev).add(id));
        onAcceptRecommendation === null || onAcceptRecommendation === void 0 ? void 0 : onAcceptRecommendation(id);
    };
    const handleReject = (id) => {
        setRejectedRecommendations(prev => new Set(prev).add(id));
        onRejectRecommendation === null || onRejectRecommendation === void 0 ? void 0 : onRejectRecommendation(id);
    };
    // Generate recommendations based on score
    const generateRecommendations = () => {
        const recommendations = [];
        // Grade-based approval recommendations
        if (score.grade === 'A') {
            recommendations.push({
                id: 'grade-a-approval',
                type: 'approval',
                title: 'Approve with Premium Terms',
                description: 'Excellent credit profile qualifies for best available terms and increased loan limits.',
                priority: 'high',
                impact: 'Positive customer experience, competitive advantage',
                implementation: 'Process immediately with reduced documentation requirements'
            });
            recommendations.push({
                id: 'grade-a-upsell',
                type: 'enhancement',
                title: 'Offer Additional Financial Products',
                description: 'High-quality borrower suitable for cross-selling opportunities.',
                priority: 'medium',
                impact: 'Increased revenue potential and customer relationship depth',
                implementation: 'Present additional product options during loan processing'
            });
        }
        if (score.grade === 'B') {
            recommendations.push({
                id: 'grade-b-approval',
                type: 'approval',
                title: 'Approve with Standard Terms',
                description: 'Good credit profile suitable for standard loan processing.',
                priority: 'high',
                impact: 'Balanced risk-return profile',
                implementation: 'Process with standard documentation and verification'
            });
        }
        if (score.grade === 'C') {
            recommendations.push({
                id: 'grade-c-conditional',
                type: 'terms',
                title: 'Conditional Approval with Enhanced Terms',
                description: 'Require additional collateral or guarantor for risk mitigation.',
                priority: 'high',
                impact: 'Reduced risk exposure while maintaining business opportunity',
                implementation: 'Negotiate additional security before final approval'
            });
            recommendations.push({
                id: 'grade-c-monitoring',
                type: 'monitoring',
                title: 'Implement Enhanced Monitoring',
                description: 'Establish monthly check-ins and performance tracking.',
                priority: 'high',
                impact: 'Early detection of potential issues',
                implementation: 'Set up automated alerts and regular review schedule'
            });
        }
        if (score.grade === 'R') {
            recommendations.push({
                id: 'grade-r-rejection',
                type: 'approval',
                title: 'Decline Application',
                description: 'Risk profile exceeds acceptable thresholds for current loan products.',
                priority: 'high',
                impact: 'Protects portfolio quality and profitability',
                implementation: 'Communicate decision with improvement suggestions'
            });
            recommendations.push({
                id: 'grade-r-alternative',
                type: 'enhancement',
                title: 'Suggest Alternative Solutions',
                description: 'Offer financial counseling or alternative products if available.',
                priority: 'medium',
                impact: 'Maintains customer relationship and future opportunity',
                implementation: 'Provide referrals to business development or financial education programs'
            });
        }
        // Risk-based recommendations
        if (score.risk_level === 'high' || score.risk_level === 'very_high') {
            recommendations.push({
                id: 'high-risk-mitigation',
                type: 'terms',
                title: 'Implement Risk Mitigation Measures',
                description: 'Require additional documentation, collateral, or co-signers.',
                priority: 'high',
                impact: 'Reduces potential losses while enabling business',
                implementation: 'Document specific requirements before proceeding'
            });
        }
        // Ratio-based recommendations
        const redRatios = score.credit_ratios_breakdown.filter(ratio => ratio.band === 'red');
        if (redRatios.length > 0) {
            recommendations.push({
                id: 'ratio-improvement',
                type: 'monitoring',
                title: 'Monitor Financial Ratio Improvements',
                description: `${redRatios.length} financial ratios are below acceptable thresholds.`,
                priority: 'medium',
                impact: 'Improved financial health over time',
                implementation: 'Establish ratio improvement targets and review quarterly'
            });
        }
        // Loan amount recommendations
        if (score.max_loan_amount > 0) {
            const requestedAmount = 500000; // This would come from application data
            if (score.max_loan_amount < requestedAmount) {
                recommendations.push({
                    id: 'amount-adjustment',
                    type: 'terms',
                    title: 'Adjust Loan Amount',
                    description: `Recommend loan amount of ${score.max_loan_amount.toLocaleString()} BDT based on risk assessment.`,
                    priority: 'high',
                    impact: 'Aligns loan size with repayment capacity',
                    implementation: 'Present counter-offer with justification'
                });
            }
        }
        return recommendations;
    };
    const recommendations = generateRecommendations();
    const getRecommendationIcon = (type) => {
        switch (type) {
            case 'approval': return _jsx(CheckCircle, { className: "h-5 w-5" });
            case 'terms': return _jsx(DollarSign, { className: "h-5 w-5" });
            case 'monitoring': return _jsx(Shield, { className: "h-5 w-5" });
            case 'enhancement': return _jsx(TrendingUp, { className: "h-5 w-5" });
            default: return _jsx(Lightbulb, { className: "h-5 w-5" });
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };
    const getTypeColor = (type) => {
        switch (type) {
            case 'approval': return 'text-green-600';
            case 'terms': return 'text-blue-600';
            case 'monitoring': return 'text-orange-600';
            case 'enhancement': return 'text-purple-600';
            default: return 'text-gray-600';
        }
    };
    return (_jsxs("div", { className: cn('space-y-6', className), children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Lightbulb, { className: "h-5 w-5 text-yellow-600" }), "Recommendations Summary"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-blue-600", children: recommendations.length }), _jsx("p", { className: "text-sm text-gray-600", children: "Total Recommendations" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-red-600", children: recommendations.filter(r => r.priority === 'high').length }), _jsx("p", { className: "text-sm text-gray-600", children: "High Priority" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-green-600", children: acceptedRecommendations.size }), _jsx("p", { className: "text-sm text-gray-600", children: "Accepted" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-2xl font-bold text-gray-600", children: recommendations.length - acceptedRecommendations.size - rejectedRecommendations.size }), _jsx("p", { className: "text-sm text-gray-600", children: "Pending" })] })] }) })] }), _jsx("div", { className: "space-y-4", children: recommendations.map((recommendation) => {
                    const isAccepted = acceptedRecommendations.has(recommendation.id);
                    const isRejected = rejectedRecommendations.has(recommendation.id);
                    const isPending = !isAccepted && !isRejected;
                    return (_jsx(Card, { className: cn('transition-all duration-200', isAccepted && 'border-green-200 bg-green-50', isRejected && 'border-red-200 bg-red-50 opacity-75', isPending && 'hover:shadow-md'), children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3 mb-2", children: [_jsx("div", { className: getTypeColor(recommendation.type), children: getRecommendationIcon(recommendation.type) }), _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: recommendation.title }), _jsx("span", { className: cn('text-xs px-2 py-1 rounded-full font-medium uppercase', recommendation.priority === 'high' ? 'bg-red-100 text-red-800' :
                                                            recommendation.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-green-100 text-green-800'), children: recommendation.priority }), isAccepted && (_jsx(CheckCircle, { className: "h-5 w-5 text-green-600" })), isRejected && (_jsx(XCircle, { className: "h-5 w-5 text-red-600" }))] }), _jsx("p", { className: "text-gray-700 mb-4", children: recommendation.description }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("strong", { className: "text-gray-900", children: "Impact:" }), _jsx("p", { className: "text-gray-600 mt-1", children: recommendation.impact })] }), _jsxs("div", { children: [_jsx("strong", { className: "text-gray-900", children: "Implementation:" }), _jsx("p", { className: "text-gray-600 mt-1", children: recommendation.implementation })] })] })] }), _jsxs("div", { className: "ml-4 flex flex-col gap-2", children: [isPending && (_jsxs(_Fragment, { children: [_jsx(Button, { size: "sm", onClick: () => handleAccept(recommendation.id), className: "min-w-[100px]", children: "Accept" }), _jsx(Button, { size: "sm", variant: "outline", onClick: () => handleReject(recommendation.id), className: "min-w-[100px]", children: "Reject" })] })), isAccepted && (_jsxs("div", { className: "text-center", children: [_jsx("span", { className: "text-sm text-green-600 font-medium", children: "Accepted" }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => setAcceptedRecommendations(prev => {
                                                            const newSet = new Set(prev);
                                                            newSet.delete(recommendation.id);
                                                            return newSet;
                                                        }), className: "mt-1", children: "Undo" })] })), isRejected && (_jsxs("div", { className: "text-center", children: [_jsx("span", { className: "text-sm text-red-600 font-medium", children: "Rejected" }), _jsx(Button, { size: "sm", variant: "ghost", onClick: () => setRejectedRecommendations(prev => {
                                                            const newSet = new Set(prev);
                                                            newSet.delete(recommendation.id);
                                                            return newSet;
                                                        }), className: "mt-1", children: "Undo" })] }))] })] }) }) }, recommendation.id));
                }) }), (acceptedRecommendations.size > 0 || rejectedRecommendations.size > 0) && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Target, { className: "h-5 w-5" }), "Action Summary"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [acceptedRecommendations.size > 0 && (_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-green-900 mb-2", children: "Accepted Recommendations:" }), _jsx("ul", { className: "space-y-1", children: recommendations
                                                .filter(r => acceptedRecommendations.has(r.id))
                                                .map(r => (_jsxs("li", { className: "text-sm text-green-800 flex items-center gap-2", children: [_jsx(CheckCircle, { className: "h-4 w-4" }), r.title] }, r.id))) })] })), _jsxs("div", { className: "flex gap-4 pt-4 border-t", children: [_jsxs(Button, { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4" }), "Generate Action Plan"] }), _jsxs(Button, { variant: "outline", className: "flex items-center gap-2", children: [_jsx(Clock, { className: "h-4 w-4" }), "Schedule Follow-up"] })] })] }) })] }))] }));
};
