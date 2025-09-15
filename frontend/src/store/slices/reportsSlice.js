import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    availableReports: [],
    reportsLoading: false,
    reportsError: null,
    generatedReports: [],
    generatedReportsLoading: false,
    currentReport: null,
    currentReportLoading: false,
    currentReportError: null,
    isGenerating: false,
    generationProgress: 0,
    generationQueue: [],
    filters: {},
    selectedReports: [],
    sortField: 'created_at',
    sortDirection: 'desc',
    templates: [],
    templatesLoading: false
};
const reportsSlice = createSlice({
    name: 'reports',
    initialState,
    reducers: {
        // Available reports actions
        setReportsLoading: (state, action) => {
            state.reportsLoading = action.payload;
            if (action.payload) {
                state.reportsError = null;
            }
        },
        setAvailableReports: (state, action) => {
            state.reportsLoading = false;
            state.reportsError = null;
            state.availableReports = action.payload;
        },
        setReportsError: (state, action) => {
            state.reportsLoading = false;
            state.reportsError = action.payload;
        },
        // Generated reports actions
        setGeneratedReportsLoading: (state, action) => {
            state.generatedReportsLoading = action.payload;
        },
        setGeneratedReports: (state, action) => {
            state.generatedReportsLoading = false;
            state.generatedReports = action.payload;
        },
        addGeneratedReport: (state, action) => {
            const existingIndex = state.generatedReports.findIndex(report => report.id === action.payload.id);
            if (existingIndex !== -1) {
                state.generatedReports[existingIndex] = action.payload;
            }
            else {
                state.generatedReports.unshift(action.payload);
            }
        },
        updateReportStatus: (state, action) => {
            const index = state.generatedReports.findIndex(report => report.id === action.payload.reportId);
            if (index !== -1) {
                state.generatedReports[index] = Object.assign(Object.assign({}, state.generatedReports[index]), action.payload.status);
            }
        },
        removeGeneratedReport: (state, action) => {
            var _a;
            state.generatedReports = state.generatedReports.filter(report => report.id !== action.payload);
            if (((_a = state.currentReport) === null || _a === void 0 ? void 0 : _a.id) === action.payload) {
                state.currentReport = null;
            }
        },
        // Current report actions
        setCurrentReportLoading: (state, action) => {
            state.currentReportLoading = action.payload;
            if (action.payload) {
                state.currentReportError = null;
            }
        },
        setCurrentReport: (state, action) => {
            state.currentReportLoading = false;
            state.currentReportError = null;
            state.currentReport = action.payload;
        },
        setCurrentReportError: (state, action) => {
            state.currentReportLoading = false;
            state.currentReportError = action.payload;
        },
        clearCurrentReport: (state) => {
            state.currentReport = null;
            state.currentReportError = null;
        },
        // Generation actions
        setGenerating: (state, action) => {
            state.isGenerating = action.payload;
            if (!action.payload) {
                state.generationProgress = 0;
            }
        },
        setGenerationProgress: (state, action) => {
            state.generationProgress = Math.max(0, Math.min(100, action.payload));
        },
        addToGenerationQueue: (state, action) => {
            if (!state.generationQueue.includes(action.payload)) {
                state.generationQueue.push(action.payload);
            }
        },
        removeFromGenerationQueue: (state, action) => {
            state.generationQueue = state.generationQueue.filter(id => id !== action.payload);
        },
        clearGenerationQueue: (state) => {
            state.generationQueue = [];
        },
        // Filter actions
        setReportFilters: (state, action) => {
            state.filters = Object.assign(Object.assign({}, state.filters), action.payload);
        },
        clearReportFilters: (state) => {
            state.filters = {};
        },
        // Selection actions
        setSelectedReports: (state, action) => {
            state.selectedReports = action.payload;
        },
        toggleReportSelection: (state, action) => {
            const reportId = action.payload;
            const index = state.selectedReports.indexOf(reportId);
            if (index === -1) {
                state.selectedReports.push(reportId);
            }
            else {
                state.selectedReports.splice(index, 1);
            }
        },
        selectAllReports: (state) => {
            state.selectedReports = state.generatedReports.map(report => report.id);
        },
        clearReportSelection: (state) => {
            state.selectedReports = [];
        },
        // Sorting actions
        setReportSort: (state, action) => {
            state.sortField = action.payload.field;
            state.sortDirection = action.payload.direction;
        },
        // Template actions
        setTemplatesLoading: (state, action) => {
            state.templatesLoading = action.payload;
        },
        setTemplates: (state, action) => {
            state.templatesLoading = false;
            state.templates = action.payload;
        },
        // Reset state
        resetReportsState: (state) => {
            return Object.assign({}, initialState);
        },
        // Clear errors
        clearReportErrors: (state) => {
            state.reportsError = null;
            state.currentReportError = null;
        }
    }
});
export const { 
// Available reports
setReportsLoading, setAvailableReports, setReportsError, 
// Generated reports
setGeneratedReportsLoading, setGeneratedReports, addGeneratedReport, updateReportStatus, removeGeneratedReport, 
// Current report
setCurrentReportLoading, setCurrentReport, setCurrentReportError, clearCurrentReport, 
// Generation
setGenerating, setGenerationProgress, addToGenerationQueue, removeFromGenerationQueue, clearGenerationQueue, 
// Filters
setReportFilters, clearReportFilters, 
// Selection
setSelectedReports, toggleReportSelection, selectAllReports, clearReportSelection, 
// Sorting
setReportSort, 
// Templates
setTemplatesLoading, setTemplates, 
// Utils
resetReportsState, clearReportErrors } = reportsSlice.actions;
// Selectors
export const selectReports = (state) => state.reports;
export const selectAvailableReports = (state) => state.reports.availableReports;
export const selectReportsLoading = (state) => state.reports.reportsLoading;
export const selectReportsError = (state) => state.reports.reportsError;
export const selectGeneratedReports = (state) => state.reports.generatedReports;
export const selectGeneratedReportsLoading = (state) => state.reports.generatedReportsLoading;
export const selectCurrentReport = (state) => state.reports.currentReport;
export const selectCurrentReportLoading = (state) => state.reports.currentReportLoading;
export const selectCurrentReportError = (state) => state.reports.currentReportError;
export const selectIsGenerating = (state) => state.reports.isGenerating;
export const selectGenerationProgress = (state) => state.reports.generationProgress;
export const selectGenerationQueue = (state) => state.reports.generationQueue;
export const selectReportFilters = (state) => state.reports.filters;
export const selectSelectedReports = (state) => state.reports.selectedReports;
export const selectReportSort = (state) => ({
    field: state.reports.sortField,
    direction: state.reports.sortDirection
});
export const selectTemplates = (state) => state.reports.templates;
export const selectTemplatesLoading = (state) => state.reports.templatesLoading;
// Derived selectors
export const selectReportsByType = (state, reportType) => {
    return state.reports.generatedReports.filter(report => report.report_type === reportType);
};
export const selectCompletedReports = (state) => {
    return state.reports.generatedReports.filter(report => report.status === 'completed');
};
export const selectPendingReports = (state) => {
    return state.reports.generatedReports.filter(report => report.status === 'pending' || report.status === 'generating');
};
export const selectReportById = (state, reportId) => {
    return state.reports.generatedReports.find(report => report.id === reportId);
};
export const selectHasReportsSelected = (state) => {
    return state.reports.selectedReports.length > 0;
};
export const selectSelectedReportsCount = (state) => {
    return state.reports.selectedReports.length;
};
export const selectCanGenerateReports = (state) => {
    return !state.reports.isGenerating && state.reports.generationQueue.length === 0;
};
export default reportsSlice.reducer;
