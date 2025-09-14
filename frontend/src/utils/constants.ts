export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login/',
    LOGOUT: '/auth/logout/',
    REFRESH: '/auth/refresh/',
    PROFILE: '/auth/profile/',
    CHANGE_PASSWORD: '/auth/change-password/',
    FORGOT_PASSWORD: '/auth/forgot-password/',
    RESET_PASSWORD: '/auth/reset-password/',
  },
  CREDIT_SCORING: {
    APPLICATIONS: '/credit-scoring/applications/',
    SCORES: '/credit-scoring/scores/',
    CALCULATE: '/credit-scoring/calculate/',
    BULK_CALCULATE: '/credit-scoring/bulk-calculate/',
    PSYCHOMETRIC: '/credit-scoring/psychometric/',
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard/',
    METRICS: '/analytics/metrics/',
    TRENDS: '/analytics/trends/',
    PERFORMANCE: '/analytics/performance/',
  },
  REPORTS: {
    GENERATE: '/reports/generate/',
    LIST: '/reports/',
    DOWNLOAD: '/reports/download/',
    TEMPLATES: '/reports/templates/',
  },
} as const;

export const BUSINESS_TYPES = {
  HIGH: {
    value: 3,
    label: 'High Risk',
    categories: [
      'Grocery Shop', 'Cosmetics', 'Medicine', 'Clothing Shop',
      'Wholesalers', 'Bakery', 'Restaurant', 'Library', 'Hardware',
      'Sanitary', 'Tea Stall', 'Motor Parts', 'Sports Shop',
      'Tailor', 'Shoe Seller', 'Plastic Items', 'Garage',
      'Super Shop', 'Mobile Shop', 'Accessories', 'Servicing'
    ]
  },
  MEDIUM: {
    value: 2,
    label: 'Medium Risk',
    categories: [
      'Salon', 'Ladies Parlor', 'Poultry Shop', 'Vegetable Shop'
    ]
  },
  LOW: {
    value: 1,
    label: 'Low Risk',
    categories: []
  },
  RED_FLAG: {
    value: 0,
    label: 'Red Flag',
    categories: [
      'Wood Shop', 'Sub Contract Factory', 'Gold Ornaments Seller'
    ]
  }
} as const;

export const FI_TYPES = {
  SUPPLIER: { value: 5, label: 'Supplier' },
  MFI: { value: 6, label: 'MFI' },
  NBFI: { value: 8, label: 'NBFI' },
  BANK: { value: 9, label: 'Bank' },
  DRUTOLOAN: { value: 10, label: 'Drutoloan' }
} as const;

export const GRADES = {
  A: { 
    label: 'Grade A',
    color: '#10B981',
    description: 'Excellent creditworthiness',
    minScore: 65,
    adjustment: 'ONE SLAB UP'
  },
  B: { 
    label: 'Grade B',
    color: '#3B82F6',
    description: 'Good creditworthiness',
    minScore: 51,
    adjustment: 'SAME SLAB'
  },
  C: { 
    label: 'Grade C',
    color: '#F59E0B',
    description: 'Fair creditworthiness',
    minScore: 35,
    adjustment: 'ONE SLAB DOWN'
  },
  R: { 
    label: 'Rejected',
    color: '#EF4444',
    description: 'Poor creditworthiness',
    minScore: 0,
    adjustment: 'REJECTED'
  }
} as const;

export const RISK_LEVELS = {
  LOW: { 
    label: 'Low Risk',
    color: '#10B981',
    range: [0, 0.15],
    description: 'Minimal default risk'
  },
  MEDIUM: { 
    label: 'Medium Risk',
    color: '#F59E0B',
    range: [0.15, 0.30],
    description: 'Moderate default risk'
  },
  HIGH: { 
    label: 'High Risk',
    color: '#F97316',
    range: [0.30, 0.50],
    description: 'Significant default risk'
  },
  VERY_HIGH: { 
    label: 'Very High Risk',
    color: '#EF4444',
    range: [0.50, 1.0],
    description: 'Extremely high default risk'
  }
} as const;

export const APPLICATION_STATUS = {
  PENDING: { label: 'Pending', color: '#6B7280' },
  PROCESSING: { label: 'Processing', color: '#3B82F6' },
  COMPLETED: { label: 'Completed', color: '#10B981' },
  REJECTED: { label: 'Rejected', color: '#EF4444' }
} as const;

export const REPAYMENT_STATUS = {
  ON_TIME: { label: 'On Time', color: '#10B981', score: 10 },
  OVERDUE_3_DAYS: { label: 'Overdue 3 Days', color: '#F59E0B', score: 7 },
  OVERDUE_7_DAYS: { label: 'Overdue 7+ Days', color: '#F97316', score: 5 },
  DEFAULT: { label: 'Default', color: '#EF4444', score: 0 }
} as const;

export const SELLER_TYPES = {
  WHOLESALER: { label: 'Wholesaler', score: 2 },
  RETAILER: { label: 'Retailer', score: 1 }
} as const;

export const GUARANTOR_CATEGORIES = {
  STRONG: { label: 'Strong', score: 4, color: '#10B981' },
  MEDIUM: { label: 'Medium', score: 2, color: '#F59E0B' },
  WEAK: { label: 'Weak', score: 0, color: '#EF4444' }
} as const;

export const RESIDENCY_STATUS = {
  PERMANENT: { label: 'Permanent', score: 3 },
  TEMPORARY: { label: 'Temporary', score: 0 }
} as const;

// Scoring weights and thresholds
export const SCORING_CONFIG = {
  WEIGHTS: {
    DATA_POINTS: 30,
    CREDIT_RATIOS: 20,
    BORROWER_ATTRIBUTES: 48,
    PSYCHOMETRIC: 2
  },
  
  DATA_POINTS: {
    FINANCIAL_DISCIPLINE: 35,
    BUSINESS_PERFORMANCE: 45,
    COMPLIANCE: 20
  },
  
  BORROWER_ATTRIBUTES: {
    CHARACTER: 25,
    CAPITAL: 15,
    CAPACITY: 30,
    COLLATERAL: 25,
    CONDITIONS: 5
  },
  
  RATIO_THRESHOLDS: {
    PROFITABILITY: {
      WHOLESALER: 3,
      RETAILER: 10
    },
    DEBT_BURDEN: 60,
    LEVERAGE: 60,
    INTEREST_INCOME: 10,
    LIQUIDITY: 20,
    CURRENT: 60
  }
} as const;

// UI Constants
export const CHART_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#06B6D4', '#84CC16', '#F97316', '#EC4899', '#6B7280'
] as const;

export const TABLE_PAGE_SIZES = [10, 20, 50, 100] as const;

export enum DATE_FORMATS {
    SHORT = 'SHORT',
    LONG = 'LONG',
    WITH_TIME = 'WITH_TIME',
    TIME_ONLY = 'TIME_ONLY',
    ISO = 'ISO'
  }  

export const CURRENCY_FORMAT = {
  LOCALE: 'bn-BD',
  CURRENCY: 'BDT',
  DISPLAY: 'symbol'
} as const;

// Validation Constants
export const VALIDATION_RULES = {
  PHONE: /^(\+88|88)?(01[3-9]\d{8})$/,
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  NATIONAL_ID: /^\d{10}$|^\d{13}$|^\d{17}$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  AMOUNT: /^\d+(\.\d{1,2})?$/,
  PERCENTAGE: /^(100(\.0{1,2})?|[1-9]?\d(\.\d{1,2})?)$/
} as const;

export const MIN_VALUES = {
  LOAN_AMOUNT: 10000,
  MONTHLY_INCOME: 5000,
  DAILY_SALES: 500,
  YEARS_OF_OPERATION: 0,
  YEARS_OF_RESIDENCY: 0
} as const;

export const MAX_VALUES = {
  LOAN_AMOUNT: 10000000,
  MONTHLY_INCOME: 5000000,
  DAILY_SALES: 500000,
  YEARS_OF_OPERATION: 50,
  YEARS_OF_RESIDENCY: 100,
  PERCENTAGE: 100
} as const;

// Report Types
export const REPORT_TYPES = {
  SCORE_BREAKDOWN: 'score_breakdown',
  RISK_ASSESSMENT: 'risk_assessment',
  PORTFOLIO_ANALYSIS: 'portfolio_analysis',
  PERFORMANCE_METRICS: 'performance_metrics',
  TREND_ANALYSIS: 'trend_analysis',
  COMPARATIVE_ANALYSIS: 'comparative_analysis',
  REGULATORY_COMPLIANCE: 'regulatory_compliance'
} as const;

export const REPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  JSON: 'json'
} as const;

// Psychometric Test Constants
export const PSYCHOMETRIC_DIMENSIONS = {
  TIME_DISCIPLINE: { weight: 20, max_score: 20 },
  IMPULSE_PLANNING: { weight: 20, max_score: 20 },
  HONESTY_RESPONSIBILITY: { weight: 20, max_score: 20 },
  RESILIENCE: { weight: 20, max_score: 20 },
  FUTURE_ORIENTATION: { weight: 20, max_score: 20 }
} as const;

export const PSYCHOMETRIC_BANDS = {
  HIGH: { range: [90, 100], adjustment: 5, label: 'High repayment mindset' },
  MODERATE: { range: [80, 89], adjustment: 2, label: 'Moderate mindset' },
  AVERAGE: { range: [60, 79], adjustment: 0, label: 'Average mindset' },
  WEAK: { range: [40, 59], adjustment: -2, label: 'Weak traits' },
  HIGH_RISK: { range: [0, 39], adjustment: -5, label: 'High-risk behavior' }
} as const;

// System Configuration Keys
export const CONFIG_KEYS = {
  SCORING_WEIGHTS: 'scoring_weights',
  GRADE_THRESHOLDS: 'grade_thresholds',
  RATIO_THRESHOLDS: 'ratio_thresholds',
  MAX_LOAN_MULTIPLIER: 'max_loan_multiplier',
  INTEREST_RATE_RANGES: 'interest_rate_ranges',
  PSYCHOMETRIC_ENABLED: 'psychometric_enabled',
  AI_PREDICTIONS_ENABLED: 'ai_predictions_enabled'
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  INVALID_AMOUNT: 'Please enter a valid amount',
  MIN_AMOUNT: (min: number) => `Amount must be at least ${min}`,
  MAX_AMOUNT: (max: number) => `Amount cannot exceed ${max}`,
  NETWORK_ERROR: 'Network error. Please check your connection and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied.',
  NOT_FOUND: 'The requested resource was not found.'
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  APPLICATION_SUBMITTED: 'Application submitted successfully',
  SCORE_CALCULATED: 'Credit score calculated successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  PASSWORD_CHANGED: 'Password changed successfully',
  REPORT_GENERATED: 'Report generated successfully',
  DATA_EXPORTED: 'Data exported successfully'
} as const;

// Feature Flags
export const FEATURES = {
  PSYCHOMETRIC_TEST: 'psychometric_test',
  AI_SUGGESTIONS: 'ai_suggestions',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  BULK_PROCESSING: 'bulk_processing',
  REAL_TIME_MONITORING: 'real_time_monitoring',
  AUTOMATED_REPORTS: 'automated_reports'
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  LAST_ROUTE: 'last_route'
} as const;

// Route Paths
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  APPLICATIONS: '/applications',
  CREDIT_SCORING: '/credit-scoring',
  ANALYTICS: '/analytics',
  REPORTS: '/reports',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  HELP: '/help'
} as const;

export default {
  API_ENDPOINTS,
  BUSINESS_TYPES,
  FI_TYPES,
  GRADES,
  RISK_LEVELS,
  APPLICATION_STATUS,
  REPAYMENT_STATUS,
  SCORING_CONFIG,
  VALIDATION_RULES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES
};