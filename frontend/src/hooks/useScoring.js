import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import { setFilters, clearFilters, setSearchQuery, setPagination, setSort, setSelectedApplications, toggleApplicationSelection, selectAllApplications, clearSelection, setCurrentApplication, setCurrentScore } from '../store/slices/scoringSlice';
import { useGetApplicationsQuery, useCalculateCreditScoreMutation, useBulkCalculateCreditScoresMutation } from '../store/api/scoringApi';
import { useAuth } from './useAuth';
export const useScoring = () => {
    const dispatch = useDispatch();
    const { hasPermission } = useAuth();
    const { applications, currentApplication, currentScore, applicationsLoading, applicationsError, scoresLoading, filters, pagination, searchQuery, selectedApplications, sortField, sortDirection, isCalculating, calculationProgress, bulkCalculationStatus } = useSelector((state) => state.scoring);
    // API hooks
    const { data: applicationsData, isLoading: fetchingApplications, error: fetchError } = useGetApplicationsQuery(Object.assign({ page: pagination.page, page_size: pagination.pageSize, search: searchQuery, ordering: sortField ? `${sortDirection === 'desc' ? '-' : ''}${sortField}` : undefined }, filters));
    const [calculateScore, { isLoading: calculatingScore }] = useCalculateCreditScoreMutation();
    const [bulkCalculateScores, { isLoading: bulkCalculating }] = useBulkCalculateCreditScoresMutation();
    // Actions
    const updateFilters = useCallback((newFilters) => {
        dispatch(setFilters(newFilters));
    }, [dispatch]);
    const clearAllFilters = useCallback(() => {
        dispatch(clearFilters());
    }, [dispatch]);
    const updateSearchQuery = useCallback((query) => {
        dispatch(setSearchQuery(query));
    }, [dispatch]);
    const updatePagination = useCallback((page, pageSize) => {
        dispatch(setPagination({ page, pageSize }));
    }, [dispatch]);
    const updateSort = useCallback((field, direction) => {
        dispatch(setSort({ field, direction }));
    }, [dispatch]);
    const selectApplications = useCallback((applicationIds) => {
        dispatch(setSelectedApplications(applicationIds));
    }, [dispatch]);
    const toggleSelection = useCallback((applicationId) => {
        dispatch(toggleApplicationSelection(applicationId));
    }, [dispatch]);
    const selectAll = useCallback(() => {
        dispatch(selectAllApplications());
    }, [dispatch]);
    const clearSelections = useCallback(() => {
        dispatch(clearSelection());
    }, [dispatch]);
    const setCurrentApp = useCallback((application) => {
        dispatch(setCurrentApplication(application));
    }, [dispatch]);
    const setScore = useCallback((score) => {
        dispatch(setCurrentScore(score));
    }, [dispatch]);
    // Scoring operations
    const calculateCreditScore = useCallback(async (applicationId, psychometricResponses) => {
        if (!hasPermission('create_applications')) {
            throw new Error('Insufficient permissions to calculate credit scores');
        }
        try {
            const result = await calculateScore({
                application_id: applicationId,
                psychometric_responses: psychometricResponses
            }).unwrap();
            return result;
        }
        catch (error) {
            console.error('Failed to calculate credit score:', error);
            throw error;
        }
    }, [calculateScore, hasPermission]);
    const bulkCalculateCreditScores = useCallback(async (applicationIds) => {
        if (!hasPermission('create_applications')) {
            throw new Error('Insufficient permissions to calculate credit scores');
        }
        try {
            const result = await bulkCalculateScores({
                application_ids: applicationIds
            }).unwrap();
            return result;
        }
        catch (error) {
            console.error('Failed to bulk calculate credit scores:', error);
            throw error;
        }
    }, [bulkCalculateScores, hasPermission]);
    // Data transformations and computed values
    const filteredApplicationsCount = useMemo(() => {
        return (applicationsData === null || applicationsData === void 0 ? void 0 : applicationsData.count) || 0;
    }, [applicationsData]);
    const hasApplicationsSelected = useMemo(() => {
        return selectedApplications.length > 0;
    }, [selectedApplications]);
    const selectedApplicationsCount = useMemo(() => {
        return selectedApplications.length;
    }, [selectedApplications]);
    const canCalculateScores = useMemo(() => {
        return hasPermission('create_applications') && !isCalculating;
    }, [hasPermission, isCalculating]);
    const canBulkCalculate = useMemo(() => {
        return canCalculateScores && hasApplicationsSelected;
    }, [canCalculateScores, hasApplicationsSelected]);
    // Utility functions
    const getApplicationById = useCallback((applicationId) => {
        return applications.find(app => app.id === applicationId);
    }, [applications]);
    const getScoreByApplicationId = useCallback((applicationId) => {
        // This would need to be implemented based on your score data structure
        return null; // Placeholder
    }, []);
    const getApplicationStatus = useCallback((applicationId) => {
        const application = getApplicationById(applicationId);
        return (application === null || application === void 0 ? void 0 : application.status) || 'unknown';
    }, [getApplicationById]);
    const isApplicationSelected = useCallback((applicationId) => {
        return selectedApplications.includes(applicationId);
    }, [selectedApplications]);
    // Filter helpers
    const getUniqueBusinessTypes = useMemo(() => {
        const types = new Set(applications.map(app => app.business_data.business_type));
        return Array.from(types).filter(Boolean);
    }, [applications]);
    const getStatusCounts = useMemo(() => {
        return applications.reduce((counts, app) => {
            counts[app.status] = (counts[app.status] || 0) + 1;
            return counts;
        }, {});
    }, [applications]);
    // Search and filter utilities
    const searchApplications = useCallback((query) => {
        updateSearchQuery(query);
    }, [updateSearchQuery]);
    const filterByStatus = useCallback((status) => {
        updateFilters({ status });
    }, [updateFilters]);
    const filterByBusinessType = useCallback((businessType) => {
        updateFilters({ business_type: businessType });
    }, [updateFilters]);
    const filterByDateRange = useCallback((startDate, endDate) => {
        updateFilters({ date_from: startDate, date_to: endDate });
    }, [updateFilters]);
    const filterByLoanAmount = useCallback((minAmount, maxAmount) => {
        updateFilters({ loan_amount_min: minAmount, loan_amount_max: maxAmount });
    }, [updateFilters]);
    // Export functionality
    const exportApplications = useCallback(async (format = 'csv') => {
        if (!hasPermission('export_data')) {
            throw new Error('Insufficient permissions to export data');
        }
        // This would call an API endpoint for exporting
        console.log('Exporting applications in format:', format);
    }, [hasPermission]);
    const exportSelectedApplications = useCallback(async (format = 'csv') => {
        if (!hasPermission('export_data')) {
            throw new Error('Insufficient permissions to export data');
        }
        if (!hasApplicationsSelected) {
            throw new Error('No applications selected for export');
        }
        // This would call an API endpoint for exporting selected applications
        console.log('Exporting selected applications:', selectedApplications);
    }, [hasPermission, hasApplicationsSelected, selectedApplications]);
    return {
        // Data
        applications,
        currentApplication,
        currentScore,
        applicationsData,
        // Loading states
        applicationsLoading: fetchingApplications,
        applicationsError: fetchError,
        scoresLoading,
        isCalculating: calculatingScore || bulkCalculating,
        calculationProgress,
        bulkCalculationStatus,
        // Filter state
        filters,
        pagination,
        searchQuery,
        sortField,
        sortDirection,
        // Selection state
        selectedApplications,
        hasApplicationsSelected,
        selectedApplicationsCount,
        // Actions
        updateFilters,
        clearAllFilters,
        updateSearchQuery,
        updatePagination,
        updateSort,
        selectApplications,
        toggleSelection,
        selectAll,
        clearSelections,
        setCurrentApp,
        setScore,
        // Scoring operations
        calculateCreditScore,
        bulkCalculateCreditScores,
        // Computed values
        filteredApplicationsCount,
        canCalculateScores,
        canBulkCalculate,
        // Utilities
        getApplicationById,
        getScoreByApplicationId,
        getApplicationStatus,
        isApplicationSelected,
        getUniqueBusinessTypes,
        getStatusCounts,
        // Search and filter helpers
        searchApplications,
        filterByStatus,
        filterByBusinessType,
        filterByDateRange,
        filterByLoanAmount,
        // Export
        exportApplications,
        exportSelectedApplications
    };
};
