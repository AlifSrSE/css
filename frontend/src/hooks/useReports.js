import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { setReportFilters, clearReportFilters, setSelectedReports, toggleReportSelection, selectAllReports, clearReportSelection, setCurrentReport, setReportSort } from '../store/slices/reportsSlice';
import { useGetAvailableReportsQuery, useGetGeneratedReportsQuery, useGenerateReportMutation, useDownloadReportMutation, useDeleteReportMutation } from '../store/api/reportsApi';
import { useAuth } from './useAuth';
export const useReports = () => {
    const dispatch = useDispatch();
    const { hasPermission } = useAuth();
    const { availableReports, generatedReports, currentReport, reportsLoading, generatedReportsLoading, currentReportLoading, isGenerating, generationProgress, generationQueue, filters, selectedReports, sortField, sortDirection, templates } = useSelector((state) => state.reports);
    // API hooks
    const { data: availableReportsData, isLoading: fetchingAvailableReports } = useGetAvailableReportsQuery();
    const { data: generatedReportsData, isLoading: fetchingGeneratedReports } = useGetGeneratedReportsQuery(filters);
    const [generateReport, { isLoading: generatingReport }] = useGenerateReportMutation();
    const [downloadReport, { isLoading: downloadingReport }] = useDownloadReportMutation();
    const [deleteReport, { isLoading: deletingReport }] = useDeleteReportMutation();
    // Filter actions
    const updateFilters = useCallback((newFilters) => {
        dispatch(setReportFilters(newFilters));
    }, [dispatch]);
    const clearAllFilters = useCallback(() => {
        dispatch(clearReportFilters());
    }, [dispatch]);
    // Selection actions
    const selectReports = useCallback((reportIds) => {
        dispatch(setSelectedReports(reportIds));
    }, [dispatch]);
    const toggleSelection = useCallback((reportId) => {
        dispatch(toggleReportSelection(reportId));
    }, [dispatch]);
    const selectAll = useCallback(() => {
        dispatch(selectAllReports());
    }, [dispatch]);
    const clearSelections = useCallback(() => {
        dispatch(clearReportSelection());
    }, [dispatch]);
    // Report actions
    const setCurrentReportData = useCallback((report) => {
        dispatch(setCurrentReport(report));
    }, [dispatch]);
    const updateSort = useCallback((field, direction) => {
        dispatch(setReportSort({ field, direction }));
    }, [dispatch]);
    // Report operations
    const generateNewReport = useCallback(async (request) => {
        if (!hasPermission('view_reports')) {
            throw new Error('Insufficient permissions to generate reports');
        }
        try {
            const result = await generateReport(request).unwrap();
            return result;
        }
        catch (error) {
            console.error('Failed to generate report:', error);
            throw error;
        }
    }, [generateReport, hasPermission]);
    const downloadReportFile = useCallback(async (reportId, format) => {
        if (!hasPermission('export_data')) {
            throw new Error('Insufficient permissions to download reports');
        }
        try {
            const result = await downloadReport({ reportId, format }).unwrap();
            return result;
        }
        catch (error) {
            console.error('Failed to download report:', error);
            throw error;
        }
    }, [downloadReport, hasPermission]);
    const deleteReportFile = useCallback(async (reportId) => {
        if (!hasPermission('delete_applications')) {
            throw new Error('Insufficient permissions to delete reports');
        }
        try {
            const result = await deleteReport(reportId).unwrap();
            return result;
        }
        catch (error) {
            console.error('Failed to delete report:', error);
            throw error;
        }
    }, [deleteReport, hasPermission]);
    // Bulk operations
    const bulkDownloadReports = useCallback(async (reportIds, format = 'pdf') => {
        if (!hasPermission('export_data')) {
            throw new Error('Insufficient permissions to download reports');
        }
        const promises = reportIds.map(reportId => downloadReportFile(reportId, format));
        try {
            const results = await Promise.allSettled(promises);
            const successful = results.filter(result => result.status === 'fulfilled');
            const failed = results.filter(result => result.status === 'rejected');
            return {
                successful: successful.length,
                failed: failed.length,
                total: reportIds.length
            };
        }
        catch (error) {
            console.error('Failed to bulk download reports:', error);
            throw error;
        }
    }, [downloadReportFile, hasPermission]);
    const bulkDeleteReports = useCallback(async (reportIds) => {
        if (!hasPermission('delete_applications')) {
            throw new Error('Insufficient permissions to delete reports');
        }
        const promises = reportIds.map(reportId => deleteReportFile(reportId));
        try {
            const results = await Promise.allSettled(promises);
            const successful = results.filter(result => result.status === 'fulfilled');
            const failed = results.filter(result => result.status === 'rejected');
            return {
                successful: successful.length,
                failed: failed.length,
                total: reportIds.length
            };
        }
        catch (error) {
            console.error('Failed to bulk delete reports:', error);
            throw error;
        }
    }, [deleteReportFile, hasPermission]);
    // Computed values
    const hasReportsSelected = useMemo(() => {
        return selectedReports.length > 0;
    }, [selectedReports]);
    const selectedReportsCount = useMemo(() => {
        return selectedReports.length;
    }, [selectedReports]);
    const canGenerateReports = useMemo(() => {
        return hasPermission('view_reports') && !isGenerating;
    }, [hasPermission, isGenerating]);
    const canDownloadReports = useMemo(() => {
        return hasPermission('export_data');
    }, [hasPermission]);
    const canDeleteReports = useMemo(() => {
        return hasPermission('delete_applications');
    }, [hasPermission]);
    const completedReportsCount = useMemo(() => {
        return generatedReports.filter(report => report.status === 'completed').length;
    }, [generatedReports]);
    const pendingReportsCount = useMemo(() => {
        return generatedReports.filter(report => report.status === 'pending' || report.status === 'generating').length;
    }, [generatedReports]);
    const failedReportsCount = useMemo(() => {
        return generatedReports.filter(report => report.status === 'failed').length;
    }, [generatedReports]);
    // Utility functions
    const getReportById = useCallback((reportId) => {
        return generatedReports.find(report => report.id === reportId);
    }, [generatedReports]);
    const getReportsByType = useCallback((reportType) => {
        return generatedReports.filter(report => report.report_type === reportType);
    }, [generatedReports]);
    const getReportStatus = useCallback((reportId) => {
        const report = getReportById(reportId);
        return (report === null || report === void 0 ? void 0 : report.status) || 'unknown';
    }, [getReportById]);
    const isReportSelected = useCallback((reportId) => {
        return selectedReports.includes(reportId);
    }, [selectedReports]);
    const isReportDownloadable = useCallback((reportId) => {
        const report = getReportById(reportId);
        return (report === null || report === void 0 ? void 0 : report.status) === 'completed' && report.download_url;
    }, [getReportById]);
    // Filter helpers
    const getUniqueReportTypes = useMemo(() => {
        const types = new Set(generatedReports.map(report => report.report_type));
        return Array.from(types).filter(Boolean);
    }, [generatedReports]);
    const getStatusCounts = useMemo(() => {
        return generatedReports.reduce((counts, report) => {
            counts[report.status] = (counts[report.status] || 0) + 1;
            return counts;
        }, {});
    }, [generatedReports]);
    // Search and filter utilities
    const searchReports = useCallback((query) => {
        updateFilters({ search_query: query });
    }, [updateFilters]);
    const filterByType = useCallback((reportType) => {
        updateFilters({ report_type: reportType });
    }, [updateFilters]);
    const filterByStatus = useCallback((status) => {
        updateFilters({ status });
    }, [updateFilters]);
    const filterByDateRange = useCallback((dateRange) => {
        updateFilters({ date_range: dateRange });
    }, [updateFilters]);
    // Report template helpers
    const getAvailableTemplates = useCallback((reportType) => {
        if (!reportType)
            return templates;
        return templates.filter(template => template.report_type === reportType);
    }, [templates]);
    return {
        // Data
        availableReports,
        generatedReports,
        currentReport,
        templates,
        // Loading states
        reportsLoading: fetchingAvailableReports,
        generatedReportsLoading: fetchingGeneratedReports,
        currentReportLoading,
        isGenerating: generatingReport || isGenerating,
        generationProgress,
        generationQueue,
        // Filter state
        filters,
        sortField,
        sortDirection,
        // Selection state
        selectedReports,
        hasReportsSelected,
        selectedReportsCount,
        // Actions
        updateFilters,
        clearAllFilters,
        selectReports,
        toggleSelection,
        selectAll,
        clearSelections,
        setCurrentReportData,
        updateSort,
        // Report operations
        generateNewReport,
        downloadReportFile,
        deleteReportFile,
        bulkDownloadReports,
        bulkDeleteReports,
        // Computed values
        canGenerateReports,
        canDownloadReports,
        canDeleteReports,
        completedReportsCount,
        pendingReportsCount,
        failedReportsCount,
        // Utilities
        getReportById,
        getReportsByType,
        getReportStatus,
        isReportSelected,
        isReportDownloadable,
        getUniqueReportTypes,
        getStatusCounts,
        getAvailableTemplates,
        // Search and filter helpers
        searchReports,
        filterByType,
        filterByStatus,
        filterByDateRange
    };
};
