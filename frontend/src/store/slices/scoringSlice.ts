import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CreditApplication, CreditScore, ApplicationFilters } from '../../types/scoring';
import { PaginatedResponse } from '../../types/common';

export interface ScoringState {
  // Applications
  applications: CreditApplication[];
  currentApplication: CreditApplication | null;
  applicationsLoading: boolean;
  applicationsError: string | null;
  
  // Credit Scores
  scores: CreditScore[];
  currentScore: CreditScore | null;
  scoresLoading: boolean;
  scoresError: string | null;
  
  // Filters and pagination
  filters: ApplicationFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  
  // UI states
  selectedApplications: string[];
  searchQuery: string;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  
  // Calculation states
  isCalculating: boolean;
  calculationProgress: number;
  bulkCalculationStatus: Record<string, 'pending' | 'processing' | 'completed' | 'failed'>;
}

const initialState: ScoringState = {
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
    setApplicationsLoading: (state, action: PayloadAction<boolean>) => {
      state.applicationsLoading = action.payload;
      if (action.payload) {
        state.applicationsError = null;
      }
    },
    
    setApplicationsSuccess: (state, action: PayloadAction<PaginatedResponse<CreditApplication>>) => {
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
    
    setApplicationsError: (state, action: PayloadAction<string>) => {
      state.applicationsLoading = false;
      state.applicationsError = action.payload;
    },
    
    setCurrentApplication: (state, action: PayloadAction<CreditApplication | null>) => {
      state.currentApplication = action.payload;
    },
    
    addApplication: (state, action: PayloadAction<CreditApplication>) => {
      state.applications.unshift(action.payload);
      state.pagination.total += 1;
    },
    
    updateApplication: (state, action: PayloadAction<CreditApplication>) => {
      const index = state.applications.findIndex(app => app.id === action.payload.id);
      if (index !== -1) {
        state.applications[index] = action.payload;
      }
      if (state.currentApplication?.id === action.payload.id) {
        state.currentApplication = action.payload;
      }
    },
    
    removeApplication: (state, action: PayloadAction<string>) => {
      state.applications = state.applications.filter(app => app.id !== action.payload);
      state.pagination.total -= 1;
      if (state.currentApplication?.id === action.payload) {
        state.currentApplication = null;
      }
    },
    
    // Scores actions
    setScoresLoading: (state, action: PayloadAction<boolean>) => {
      state.scoresLoading = action.payload;
      if (action.payload) {
        state.scoresError = null;
      }
    },
    
    setScoresSuccess: (state, action: PayloadAction<CreditScore[]>) => {
      state.scoresLoading = false;
      state.scoresError = null;
      state.scores = action.payload;
    },
    
    setScoresError: (state, action: PayloadAction<string>) => {
      state.scoresLoading = false;
      state.scoresError = action.payload;
    },
    
    setCurrentScore: (state, action: PayloadAction<CreditScore | null>) => {
      state.currentScore = action.payload;
    },
    
    addScore: (state, action: PayloadAction<CreditScore>) => {
      const existingIndex = state.scores.findIndex(score => score.application === action.payload.application);
      if (existingIndex !== -1) {
        state.scores[existingIndex] = action.payload;
      } else {
        state.scores.unshift(action.payload);
      }
    },
    
    // Filter and search actions
    setFilters: (state, action: PayloadAction<ApplicationFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    
    clearFilters: (state) => {
      state.filters = {};
      state.searchQuery = '';
      state.pagination.page = 1;
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.pagination.page = 1;
    },
    
    setPagination: (state, action: PayloadAction<{ page?: number; pageSize?: number }>) => {
      if (action.payload.page !== undefined) {
        state.pagination.page = action.payload.page;
      }
      if (action.payload.pageSize !== undefined) {
        state.pagination.pageSize = action.payload.pageSize;
      }
    },
    
    setSort: (state, action: PayloadAction<{ field: string; direction: 'asc' | 'desc' }>) => {
      state.sortField = action.payload.field;
      state.sortDirection = action.payload.direction;
    },
    
    // Selection actions
    setSelectedApplications: (state, action: PayloadAction<string[]>) => {
      state.selectedApplications = action.payload;
    },
    
    toggleApplicationSelection: (state, action: PayloadAction<string>) => {
      const appId = action.payload;
      const index = state.selectedApplications.indexOf(appId);
      if (index === -1) {
        state.selectedApplications.push(appId);
      } else {
        state.selectedApplications.splice(index, 1);
      }
    },
    
    selectAllApplications: (state) => {
      state.selectedApplications = state.applications.map(app => app.id!);
    },
    
    clearSelection: (state) => {
      state.selectedApplications = [];
    },
    
    // Calculation actions
    setCalculating: (state, action: PayloadAction<boolean>) => {
      state.isCalculating = action.payload;
      if (!action.payload) {
        state.calculationProgress = 0;
      }
    },
    
    setCalculationProgress: (state, action: PayloadAction<number>) => {
      state.calculationProgress = Math.max(0, Math.min(100, action.payload));
    },
    
    setBulkCalculationStatus: (state, action: PayloadAction<Record<string, 'pending' | 'processing' | 'completed' | 'failed'>>) => {
      state.bulkCalculationStatus = { ...state.bulkCalculationStatus, ...action.payload };
    },
    
    updateBulkCalculationStatus: (state, action: PayloadAction<{ applicationId: string; status: 'pending' | 'processing' | 'completed' | 'failed' }>) => {
      state.bulkCalculationStatus[action.payload.applicationId] = action.payload.status;
    },
    
    clearBulkCalculationStatus: (state) => {
      state.bulkCalculationStatus = {};
    },
    
    // Reset state
    resetScoringState: (state) => {
      return { ...initialState };
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
  setApplicationsLoading,
  setApplicationsSuccess,
  setApplicationsError,
  setCurrentApplication,
  addApplication,
  updateApplication,
  removeApplication,
  
  // Scores
  setScoresLoading,
  setScoresSuccess,
  setScoresError,
  setCurrentScore,
  addScore,
  
  // Filters and search
  setFilters,
  clearFilters,
  setSearchQuery,
  setPagination,
  setSort,
  
  // Selection
  setSelectedApplications,
  toggleApplicationSelection,
  selectAllApplications,
  clearSelection,
  
  // Calculation
  setCalculating,
  setCalculationProgress,
  setBulkCalculationStatus,
  updateBulkCalculationStatus,
  clearBulkCalculationStatus,
  
  // Utils
  resetScoringState,
  clearErrors
} = scoringSlice.actions;

// Selectors
export const selectScoring = (state: { scoring: ScoringState }) => state.scoring;
export const selectApplications = (state: { scoring: ScoringState }) => state.scoring.applications;
export const selectCurrentApplication = (state: { scoring: ScoringState }) => state.scoring.currentApplication;
export const selectApplicationsLoading = (state: { scoring: ScoringState }) => state.scoring.applicationsLoading;
export const selectApplicationsError = (state: { scoring: ScoringState }) => state.scoring.applicationsError;

export const selectScores = (state: { scoring: ScoringState }) => state.scoring.scores;
export const selectCurrentScore = (state: { scoring: ScoringState }) => state.scoring.currentScore;
export const selectScoresLoading = (state: { scoring: ScoringState }) => state.scoring.scoresLoading;

export const selectFilters = (state: { scoring: ScoringState }) => state.scoring.filters;
export const selectPagination = (state: { scoring: ScoringState }) => state.scoring.pagination;
export const selectSearchQuery = (state: { scoring: ScoringState }) => state.scoring.searchQuery;
export const selectSelectedApplications = (state: { scoring: ScoringState }) => state.scoring.selectedApplications;

export const selectIsCalculating = (state: { scoring: ScoringState }) => state.scoring.isCalculating;
export const selectCalculationProgress = (state: { scoring: ScoringState }) => state.scoring.calculationProgress;
export const selectBulkCalculationStatus = (state: { scoring: ScoringState }) => state.scoring.bulkCalculationStatus;

// Derived selectors
export const selectFilteredApplicationsCount = (state: { scoring: ScoringState }) => {
  return state.scoring.pagination.total;
};

export const selectHasApplicationsSelected = (state: { scoring: ScoringState }) => {
  return state.scoring.selectedApplications.length > 0;
};

export const selectSelectedApplicationsCount = (state: { scoring: ScoringState }) => {
  return state.scoring.selectedApplications.length;
};

export const selectApplicationById = (state: { scoring: ScoringState }, applicationId: string) => {
  return state.scoring.applications.find(app => app.id === applicationId);
};

export const selectScoreByApplicationId = (state: { scoring: ScoringState }, applicationId: string) => {
  return state.scoring.scores.find(score => score.application === applicationId);
};

export default scoringSlice.reducer;