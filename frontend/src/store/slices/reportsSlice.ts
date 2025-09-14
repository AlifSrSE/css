import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ReportConfig, ReportStatus, ReportType, ReportFormat } from '../../types/reports';
import { DateRange } from '../../types/common';

export interface ReportsState {
  // Available report configurations
  availableReports: ReportConfig[];
  reportsLoading: boolean;
  reportsError: string | null;
  
  // Generated reports
  generatedReports: ReportStatus[];
  generatedReportsLoading: boolean;
  
  // Current report being viewed
  currentReport: any | null;
  currentReportLoading: boolean;
  currentReportError: string | null;
  
  // Report generation
  isGenerating: boolean;
  generationProgress: number;
  generationQueue: string[]; // Report IDs in queue
  
  // Filters
  filters: {
    report_type?: ReportType;
    date_range?: DateRange;
    status?: 'pending' | 'generating' | 'completed' | 'failed';
    search_query?: string;
  };
  
  // UI state
  selectedReports: string[];
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
  
  // Report templates
  templates: any[];
  templatesLoading: boolean;
}

const initialState: ReportsState = {
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
    setReportsLoading: (state, action: PayloadAction<boolean>) => {
      state.reportsLoading = action.payload;
      if (action.payload) {
        state.reportsError = null;
      }
    },
    
    setAvailableReports: (state, action: PayloadAction<ReportConfig[]>) => {
      state.reportsLoading = false;
      state.reportsError = null;
      state.availableReports = action.payload;
    },
    
    setReportsError: (state, action: PayloadAction<string>) => {
      state.reportsLoading = false;
      state.reportsError = action.payload;
    },
    
    // Generated reports actions
    setGeneratedReportsLoading: (state, action: PayloadAction<boolean>) => {
      state.generatedReportsLoading = action.payload;
    },
    
    setGeneratedReports: (state, action: PayloadAction<ReportStatus[]>) => {
      state.generatedReportsLoading = false;
      state.generatedReports = action.payload;
    },
    
    addGeneratedReport: (state, action: PayloadAction<ReportStatus>) => {
      const existingIndex = state.generatedReports.findIndex(
        report => report.id === action.payload.id
      );
      
      if (existingIndex !== -1) {
        state.generatedReports[existingIndex] = action.payload;
      } else {
        state.generatedReports.unshift(action.payload);
      }
    },
    
    updateReportStatus: (state, action: PayloadAction<{ reportId: string; status: Partial<ReportStatus> }>) => {
      const index = state.generatedReports.findIndex(
        report => report.id === action.payload.reportId
      );
      
      if (index !== -1) {
        state.generatedReports[index] = {
          ...state.generatedReports[index],
          ...action.payload.status
        };
      }
    },
    
    removeGeneratedReport: (state, action: PayloadAction<string>) => {
      state.generatedReports = state.generatedReports.filter(
        report => report.id !== action.payload
      );
      
      if (state.currentReport?.id === action.payload) {
        state.currentReport = null;
      }
    },
    
    // Current report actions
    setCurrentReportLoading: (state, action: PayloadAction<boolean>) => {
      state.currentReportLoading = action.payload;
      if (action.payload) {
        state.currentReportError = null;
      }
    },
    
    setCurrentReport: (state, action: PayloadAction<any>) => {
      state.currentReportLoading = false;
      state.currentReportError = null;
      state.currentReport = action.payload;
    },
    
    setCurrentReportError: (state, action: PayloadAction<string>) => {
      state.currentReportLoading = false;
      state.currentReportError = action.payload;
    },
    
    clearCurrentReport: (state) => {
      state.currentReport = null;
      state.currentReportError = null;
    },
    
    // Generation actions
    setGenerating: (state, action: PayloadAction<boolean>) => {
      state.isGenerating = action.payload;
      if (!action.payload) {
        state.generationProgress = 0;
      }
    },
    
    setGenerationProgress: (state, action: PayloadAction<number>) => {
      state.generationProgress = Math.max(0, Math.min(100, action.payload));
    },
    
    addToGenerationQueue: (state, action: PayloadAction<string>) => {
      if (!state.generationQueue.includes(action.payload)) {
        state.generationQueue.push(action.payload);
      }
    },
    
    removeFromGenerationQueue: (state, action: PayloadAction<string>) => {
      state.generationQueue = state.generationQueue.filter(id => id !== action.payload);
    },
    
    clearGenerationQueue: (state) => {
      state.generationQueue = [];
    },
    
    // Filter actions
    setReportFilters: (state, action: PayloadAction<{
      report_type?: ReportType;
      date_range?: DateRange;
      status?: 'pending' | 'generating' | 'completed' | 'failed';
      search_query?: string;
    }>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    
    clearReportFilters: (state) => {
      state.filters = {};
    },
    
    // Selection actions
    setSelectedReports: (state, action: PayloadAction<string[]>) => {
      state.selectedReports = action.payload;
    },
    
    toggleReportSelection: (state, action: PayloadAction<string>) => {
      const reportId = action.payload;
      const index = state.selectedReports.indexOf(reportId);
      if (index === -1) {
        state.selectedReports.push(reportId);
      } else {
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
    setReportSort: (state, action: PayloadAction<{ field: string; direction: 'asc' | 'desc' }>) => {
      state.sortField = action.payload.field;
      state.sortDirection = action.payload.direction;
    },
    
    // Template actions
    setTemplatesLoading: (state, action: PayloadAction<boolean>) => {
      state.templatesLoading = action.payload;
    },
    
    setTemplates: (state, action: PayloadAction<any[]>) => {
      state.templatesLoading = false;
      state.templates = action.payload;
    },
    
    // Reset state
    resetReportsState: (state) => {
      return { ...initialState };
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
  setReportsLoading,
  setAvailableReports,
  setReportsError,
  
  // Generated reports
  setGeneratedReportsLoading,
  setGeneratedReports,
  addGeneratedReport,
  updateReportStatus,
  removeGeneratedReport,
  
  // Current report
  setCurrentReportLoading,
  setCurrentReport,
  setCurrentReportError,
  clearCurrentReport,
  
  // Generation
  setGenerating,
  setGenerationProgress,
  addToGenerationQueue,
  removeFromGenerationQueue,
  clearGenerationQueue,
  
  // Filters
  setReportFilters,
  clearReportFilters,
  
  // Selection
  setSelectedReports,
  toggleReportSelection,
  selectAllReports,
  clearReportSelection,
  
  // Sorting
  setReportSort,
  
  // Templates
  setTemplatesLoading,
  setTemplates,
  
  // Utils
  resetReportsState,
  clearReportErrors
} = reportsSlice.actions;

// Selectors
export const selectReports = (state: { reports: ReportsState }) => state.reports;
export const selectAvailableReports = (state: { reports: ReportsState }) => state.reports.availableReports;
export const selectReportsLoading = (state: { reports: ReportsState }) => state.reports.reportsLoading;
export const selectReportsError = (state: { reports: ReportsState }) => state.reports.reportsError;

export const selectGeneratedReports = (state: { reports: ReportsState }) => state.reports.generatedReports;
export const selectGeneratedReportsLoading = (state: { reports: ReportsState }) => state.reports.generatedReportsLoading;

export const selectCurrentReport = (state: { reports: ReportsState }) => state.reports.currentReport;
export const selectCurrentReportLoading = (state: { reports: ReportsState }) => state.reports.currentReportLoading;
export const selectCurrentReportError = (state: { reports: ReportsState }) => state.reports.currentReportError;

export const selectIsGenerating = (state: { reports: ReportsState }) => state.reports.isGenerating;
export const selectGenerationProgress = (state: { reports: ReportsState }) => state.reports.generationProgress;
export const selectGenerationQueue = (state: { reports: ReportsState }) => state.reports.generationQueue;

export const selectReportFilters = (state: { reports: ReportsState }) => state.reports.filters;
export const selectSelectedReports = (state: { reports: ReportsState }) => state.reports.selectedReports;
export const selectReportSort = (state: { reports: ReportsState }) => ({
  field: state.reports.sortField,
  direction: state.reports.sortDirection
});

export const selectTemplates = (state: { reports: ReportsState }) => state.reports.templates;
export const selectTemplatesLoading = (state: { reports: ReportsState }) => state.reports.templatesLoading;

// Derived selectors
export const selectReportsByType = (state: { reports: ReportsState }, reportType: ReportType) => {
  return state.reports.generatedReports.filter(report => 
    (report as any).report_type === reportType
  );
};

export const selectCompletedReports = (state: { reports: ReportsState }) => {
  return state.reports.generatedReports.filter(report => report.status === 'completed');
};

export const selectPendingReports = (state: { reports: ReportsState }) => {
  return state.reports.generatedReports.filter(report => 
    report.status === 'pending' || report.status === 'generating'
  );
};

export const selectReportById = (state: { reports: ReportsState }, reportId: string) => {
  return state.reports.generatedReports.find(report => report.id === reportId);
};

export const selectHasReportsSelected = (state: { reports: ReportsState }) => {
  return state.reports.selectedReports.length > 0;
};

export const selectSelectedReportsCount = (state: { reports: ReportsState }) => {
  return state.reports.selectedReports.length;
};

export const selectCanGenerateReports = (state: { reports: ReportsState }) => {
  return !state.reports.isGenerating && state.reports.generationQueue.length === 0;
};

export default reportsSlice.reducer;