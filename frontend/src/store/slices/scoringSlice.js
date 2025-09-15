import { createSlice } from '@reduxjs/toolkit';
const initialState = {
    applications: [],
    currentApplication: null,
    applicationsLoading: false,
    applicationsError: null,
    scores: [],
    currentScore: null,
    scoresLoading: false,
    scoresError: null,
    filters: {},
    pagination: {
        page: 1,
        pageSize: 20,
        total: 0,
        totalPages: 0
    },
    selectedApplications: [],
    searchQuery: '',
    sortField: null,
    sortDirection: 'desc',
    isCalculating: false,
    calculationProgress: 0,
    bulkCalculationStatus: {}
};
const scoringSlice = createSlice({
    name: 'scoring',
    initialState,
    reducers: {
        // Applications actions
        setApplicationsLoading: (state, action) => {
            state.applicationsLoading = action.payload;
            if (action.payload) {
                state.applicationsError = null;
            }
        },
        setApplicationsSuccess: (state, action) => {
            state.applicationsLoading = false;
            state.applicationsError = null;
            state.applications = action.payload.results;
            state.pagination = {
                page: action.payload.current_page,
                pageSize: action.payload.page_size,
                total: action.payload.count,
                totalPages: action.payload.total_pages
            };
        },
        setApplicationsError: (state, action) => {
            state.applicationsLoading = false;
            state.applicationsError = action.payload;
        },
        setCurrentApplication: (state, action) => {
            state.currentApplication = action.payload;
        },
        addApplication: (state, action) => {
            state.applications.unshift(action.payload);
            state.pagination.total += 1;
        },
        updateApplication: (state, action) => {
            var _a;
            const index = state.applications.findIndex(app => app.id === action.payload.id);
            if (index !== -1) {
                state.applications[index] = action.payload;
            }
            if (((_a = state.currentApplication) === null || _a === void 0 ? void 0 : _a.id) === action.payload.id) {
                state.currentApplication = action.payload;
            }
        },
        removeApplication: (state, action) => {
            var _a;
            state.applications = state.applications.filter(app => app.id !== action.payload);
            state.pagination.total -= 1;
            if (((_a = state.currentApplication) === null || _a === void 0 ? void 0 : _a.id) === action.payload) {
                state.currentApplication = null;
            }
        },
        // Scores actions
        setScoresLoading: (state, action) => {
            state.scoresLoading = action.payload;
            if (action.payload) {
                state.scoresError = null;
            }
        },
        setScoresSuccess: (state, action) => {
            state.scoresLoading = false;
            state.scoresError = null;
            state.scores = action.payload;
        },
        setScoresError: (state, action) => {
            state.scoresLoading = false;
            state.scoresError = action.payload;
        },
        setCurrentScore: (state, action) => {
            state.currentScore = action.payload;
        },
        addScore: (state, action) => {
            const existingIndex = state.scores.findIndex(score => score.application === action.payload.application);
            if (existingIndex !== -1) {
                state.scores[existingIndex] = action.payload;
            }
            else {
                state.scores.unshift(action.payload);
            }
        },
        // Filter and search actions
        setFilters: (state, action) => {
            state.filters = Object.assign(Object.assign({}, state.filters), action.payload);
            state.pagination.page = 1;
        },
        clearFilters: (state) => {
            state.filters = {};
            state.searchQuery = '';
            state.pagination.page = 1;
        },
        setSearchQuery: (state, action) => {
            state.searchQuery = action.payload;
            state.pagination.page = 1;
        },
        setPagination: (state, action) => {
            if (action.payload.page !== undefined) {
                state.pagination.page = action.payload.page;
            }
            if (action.payload.pageSize !== undefined) {
                state.pagination.pageSize = action.payload.pageSize;
            }
        },
        setSort: (state, action) => {
            state.sortField = action.payload.field;
            state.sortDirection = action.payload.direction;
        },
        // Selection actions
        setSelectedApplications: (state, action) => {
            state.selectedApplications = action.payload;
        },
        toggleApplicationSelection: (state, action) => {
            const appId = action.payload;
            const index = state.selectedApplications.indexOf(appId);
            if (index === -1) {
                state.selectedApplications.push(appId);
            }
            else {
                state.selectedApplications.splice(index, 1);
            }
        },
        selectAllApplications: (state) => {
            state.selectedApplications = state.applications.map(app => app.id);
        },
        clearSelection: (state) => {
            state.selectedApplications = [];
        },
        // Calculation actions
        setCalculating: (state, action) => {
            state.isCalculating = action.payload;
            if (!action.payload) {
                state.calculationProgress = 0;
            }
        },
        setCalculationProgress: (state, action) => {
            state.calculationProgress = Math.max(0, Math.min(100, action.payload));
        },
        setBulkCalculationStatus: (state, action) => {
            state.bulkCalculationStatus = Object.assign(Object.assign({}, state.bulkCalculationStatus), action.payload);
        },
        updateBulkCalculationStatus: (state, action) => {
            state.bulkCalculationStatus[action.payload.applicationId] = action.payload.status;
        },
        clearBulkCalculationStatus: (state) => {
            state.bulkCalculationStatus = {};
        },
        // Reset state
        resetScoringState: (state) => {
            return Object.assign({}, initialState);
        },
        // Clear errors
        clearErrors: (state) => {
            state.applicationsError = null;
            state.scoresError = null;
        }
    }
});
export const { 
// Applications
setApplicationsLoading, setApplicationsSuccess, setApplicationsError, setCurrentApplication, addApplication, updateApplication, removeApplication, 
// Scores
setScoresLoading, setScoresSuccess, setScoresError, setCurrentScore, addScore, 
// Filters and search
setFilters, clearFilters, setSearchQuery, setPagination, setSort, 
// Selection
setSelectedApplications, toggleApplicationSelection, selectAllApplications, clearSelection, 
// Calculation
setCalculating, setCalculationProgress, setBulkCalculationStatus, updateBulkCalculationStatus, clearBulkCalculationStatus, 
// Utils
resetScoringState, clearErrors } = scoringSlice.actions;
// Selectors
export const selectScoring = (state) => state.scoring;
export const selectApplications = (state) => state.scoring.applications;
export const selectCurrentApplication = (state) => state.scoring.currentApplication;
export const selectApplicationsLoading = (state) => state.scoring.applicationsLoading;
export const selectApplicationsError = (state) => state.scoring.applicationsError;
export const selectScores = (state) => state.scoring.scores;
export const selectCurrentScore = (state) => state.scoring.currentScore;
export const selectScoresLoading = (state) => state.scoring.scoresLoading;
export const selectFilters = (state) => state.scoring.filters;
export const selectPagination = (state) => state.scoring.pagination;
export const selectSearchQuery = (state) => state.scoring.searchQuery;
export const selectSelectedApplications = (state) => state.scoring.selectedApplications;
export const selectIsCalculating = (state) => state.scoring.isCalculating;
export const selectCalculationProgress = (state) => state.scoring.calculationProgress;
export const selectBulkCalculationStatus = (state) => state.scoring.bulkCalculationStatus;
// Derived selectors
export const selectFilteredApplicationsCount = (state) => {
    return state.scoring.pagination.total;
};
export const selectHasApplicationsSelected = (state) => {
    return state.scoring.selectedApplications.length > 0;
};
export const selectSelectedApplicationsCount = (state) => {
    return state.scoring.selectedApplications.length;
};
export const selectApplicationById = (state, applicationId) => {
    return state.scoring.applications.find(app => app.id === applicationId);
};
export const selectScoreByApplicationId = (state, applicationId) => {
    return state.scoring.scores.find(score => score.application === applicationId);
};
export default scoringSlice.reducer;
