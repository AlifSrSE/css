import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState } from 'react';
import { FileText, Download, Settings } from 'lucide-react';
import { Button } from '../../common/Forms/Button';
import { Input } from '../../common/Forms/Input';
import { Select } from '../../common/Forms/Select';
import { Modal } from '../../common/Layout/Modal';
import { useGenerateReportMutation } from '../../../store/api/reportsApi';
import { toast } from 'react-toastify';
export const ReportGenerator = ({ onReportGenerated }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({
        report_type: 'score_breakdown',
        application_ids: [],
        format: 'pdf',
        include_charts: true,
        include_recommendations: true,
    });
    const [generateReport, { isLoading }] = useGenerateReportMutation();
    const reportTypes = [
        { value: 'score_breakdown', label: 'Score Breakdown Report' },
        { value: 'risk_assessment', label: 'Risk Assessment Report' },
        { value: 'comparative_analysis', label: 'Comparative Analysis Report' },
        { value: 'portfolio_summary', label: 'Portfolio Summary Report' },
    ];
    const formats = [
        { value: 'pdf', label: 'PDF Document' },
        { value: 'excel', label: 'Excel Spreadsheet' },
        { value: 'html', label: 'HTML Report' },
        { value: 'json', label: 'JSON Data' },
    ];
    const grades = [
        { value: '', label: 'All Grades' },
        { value: 'A', label: 'Grade A' },
        { value: 'B', label: 'Grade B' },
        { value: 'C', label: 'Grade C' },
        { value: 'R', label: 'Grade R' },
    ];
    const riskLevels = [
        { value: '', label: 'All Risk Levels' },
        { value: 'low', label: 'Low Risk' },
        { value: 'medium', label: 'Medium Risk' },
        { value: 'high', label: 'High Risk' },
        { value: 'very_high', label: 'Very High Risk' },
    ];
    const handleGenerate = async () => {
        var _a;
        try {
            if (config.application_ids.length === 0) {
                toast.error('Please specify at least one application ID');
                return;
            }
            const result = await generateReport(config).unwrap();
            toast.success('Report generated successfully!');
            onReportGenerated === null || onReportGenerated === void 0 ? void 0 : onReportGenerated(result.data.report_id);
            setIsOpen(false);
            // Auto-download if PDF
            if (config.format === 'pdf') {
                window.open(result.data.download_url, '_blank');
            }
        }
        catch (error) {
            toast.error(((_a = error.data) === null || _a === void 0 ? void 0 : _a.message) || 'Failed to generate report');
        }
    };
    const updateConfig = (updates) => {
        setConfig(prev => (Object.assign(Object.assign({}, prev), updates)));
    };
    const updateFilters = (updates) => {
        setConfig(prev => (Object.assign(Object.assign({}, prev), { filters: Object.assign(Object.assign({}, prev.filters), updates) })));
    };
    return (_jsxs(_Fragment, { children: [_jsxs(Button, { onClick: () => setIsOpen(true), className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4" }), "Generate Report"] }), _jsx(Modal, { isOpen: isOpen, onClose: () => setIsOpen(false), title: "Generate Report", size: "lg", children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Report Type" }), _jsx(Select, { options: reportTypes, value: config.report_type, onChange: (value) => updateConfig({ report_type: value }) })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-2", children: "Application IDs (comma-separated)" }), _jsx(Input, { placeholder: "APP-001, APP-002, APP-003...", value: config.application_ids.join(', '), onChange: (e) => updateConfig({
                                        application_ids: e.target.value.split(',').map(id => id.trim()).filter(Boolean)
                                    }), helperText: "Enter specific application IDs or leave empty to use filters" })] }), _jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("h3", { className: "flex items-center gap-2 font-medium mb-4", children: [_jsx(Settings, { className: "h-4 w-4" }), "Report Options"] }), _jsxs("div", { className: "space-y-4", children: [_jsx(Select, { label: "Format", options: formats, value: config.format, onChange: (value) => updateConfig({ format: value }) }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: config.include_charts, onChange: (e) => updateConfig({ include_charts: e.target.checked }), className: "mr-2" }), "Include Charts and Graphs"] }), _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: config.include_recommendations, onChange: (e) => updateConfig({ include_recommendations: e.target.checked }), className: "mr-2" }), "Include Recommendations"] })] })] })] }), _jsxs("div", { className: "flex justify-end space-x-3 pt-6 border-t", children: [_jsx(Button, { variant: "outline", onClick: () => setIsOpen(false), children: "Cancel" }), _jsxs(Button, { onClick: handleGenerate, loading: isLoading, className: "flex items-center gap-2", children: [_jsx(Download, { className: "h-4 w-4" }), "Generate Report"] })] })] }) })] }));
};
