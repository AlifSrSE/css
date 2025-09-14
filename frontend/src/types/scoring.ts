export interface BorrowerInfo {
  full_name: string;
  phone: string;
  email?: string;
  national_id: string;
  address: string;
  residency_status: 'permanent' | 'temporary';
  years_of_residency?: number;
  previous_occupation?: string;
  guarantor_category?: 'strong' | 'medium' | 'weak';
}

export interface BusinessData {
  business_name: string;
  business_type: string;
  business_category?: number;
  years_of_operation?: number;
  trade_license_age?: number;
  seller_type?: 'wholesaler' | 'retailer';
  average_daily_sales?: number;
  last_month_sales?: number;
  sales_history_12m_avg?: number;
  other_income_last_month?: number;
  inventory_value_present?: number;
  product_purchase_last_month?: number;
  stock_history_12m_avg?: number;
  total_expense_last_month?: number;
  salary_expense_last_month?: number;
  rent_utility_expense_last_month?: number;
  expense_history_12m_avg?: number;
  personal_expense?: number;
  cash_on_delivery_12m_avg?: number;
  deliveries_last_month?: number;
  rent_advance?: number;
  rent_deed_period?: number;
}

export interface LoanInfo {
  fi_name: string;
  fi_type: 'supplier' | 'mfi' | 'nbfi' | 'bank' | 'drutoloan';
  loan_type?: string;
  loan_amount: number;
  tenure_years: number;
  outstanding_loan: number;
  monthly_installment: number;
  overdue_amount?: number;
  repayment_status: 'on_time' | 'overdue_3_days' | 'overdue_7_days' | 'default';
  repaid_percentage: number;
}

export interface FinancialData {
  bank_transaction_volume_1y?: number;
  mfs_transaction_volume_monthly?: number;
  existing_loans: LoanInfo[];
  total_assets?: number;
  cash_equivalent?: number;
  monthly_income?: number;
}

export interface CreditApplication {
  id?: string;
  application_id: string;
  borrower_info: BorrowerInfo;
  business_data: BusinessData;
  financial_data: FinancialData;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  loan_amount_requested?: number;
  loan_purpose?: string;
  created_at?: string;
  updated_at?: string;
}

export interface RatioScore {
  ratio_name: string;
  ratio_value: number;
  score: number;
  band: 'green' | 'amber' | 'red';
  threshold_met: boolean;
}

export interface RedFlag {
  flag_type: 'hard' | 'soft';
  flag_name: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  impact: string;
}

export interface PsychometricResult {
  question_responses: Record<string, any>;
  time_discipline_score: number;
  impulse_planning_score: number;
  honesty_responsibility_score: number;
  resilience_score: number;
  future_orientation_score: number;
  total_score: number;
  adjustment_points: number;
  test_duration_minutes: number;
}

export interface CreditScore {
  id: string;
  application: string;
  data_points_score: number;
  data_points_breakdown: Record<string, any>;
  credit_ratios_score: number;
  credit_ratios_breakdown: RatioScore[];
  borrower_attributes_score: number;
  borrower_attributes_breakdown: Record<string, any>;
  psychometric_result?: PsychometricResult;
  total_points: number;
  grade: 'A' | 'B' | 'C' | 'R';
  loan_slab_adjustment: string;
  risk_level: 'low' | 'medium' | 'high' | 'very_high';
  default_probability: number;
  red_flags: RedFlag[];
  recommendations: string[];
  max_loan_amount: number;
  recommended_interest_rate?: number;
  recommended_tenure_months?: number;
  calculated_at: string;
  calculated_by: string;
  version: string;
}

export interface PsychometricQuestion {
  id: string;
  dimension: string;
  question: string;
  options: Array<{
    id: number;
    text: string;
  }>;
  max_score: number;
}

export interface PsychometricResponse {
  question_id: string;
  selected_option: number;
  timestamp: string;
}

export interface PsychometricTestSession {
  session_id: string;
  start_time: string;
  end_time?: string;
  responses: Record<string, PsychometricResponse>;
  is_completed: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  results: T[];
  count: number;
  next?: string;
  previous?: string;
  page_size: number;
  current_page: number;
  total_pages: number;
}

export interface DashboardStats {
  total_applications: number;
  pending_applications: number;
  completed_applications: number;
  rejected_applications: number;
  average_score: number;
  grade_distribution: Record<string, number>;
  risk_distribution: Record<string, number>;
  monthly_trends: Array<{
    month: string;
    applications: number;
    avg_score: number;
    approval_rate: number;
  }>;
}

export interface ScoreBreakdownReport {
  application_id: string;
  borrower_name: string;
  final_score: number;
  grade: string;
  component_scores: {
    data_points: {
      score: number;
      percentage: number;
      components: Record<string, number>;
    };
    credit_ratios: {
      score: number;
      percentage: number;
      ratios: RatioScore[];
    };
    borrower_attributes: {
      score: number;
      percentage: number;
      components: Record<string, number>;
    };
    psychometric?: {
      score: number;
      adjustment: number;
      profile: Record<string, number>;
    };
  };
  risk_assessment: {
    level: string;
    probability: number;
    factors: string[];
  };
  recommendations: string[];
}

export interface ApplicationFormData {
  borrower_info: {
    full_name: string;
    phone: string;
    national_id: string;
    address: string;
    residency_status: 'permanent' | 'temporary';
    email?: string;
    years_of_residency?: number;
    guarantor_category?: 'strong' | 'medium' | 'weak';
  };
  business_data: {
    business_name: string;
    business_type: string;
    seller_type?: 'wholesaler' | 'retailer';
    years_of_operation?: number;
    average_daily_sales?: number;
    last_month_sales?: number;
    inventory_value_present?: number;
    total_expense_last_month?: number;
    personal_expense?: number;
    rent_advance?: number;
  };
  financial_data: {
    monthly_income?: number;
    bank_transaction_volume_1y?: number;
    mfs_transaction_volume_monthly?: number;
    total_assets?: number;
    existing_loans: Array<{
      fi_name: string;
      fi_type: 'supplier' | 'mfi' | 'nbfi' | 'bank' | 'drutoloan';
      loan_amount: number;
      outstanding_loan: number;
      monthly_installment: number;
      repaid_percentage: number;
      repayment_status: 'on_time' | 'overdue_3_days' | 'overdue_7_days' | 'default';
    }>;
  };
  loan_details?: {
    amount_requested?: number;
    purpose?: string;
  };
}

export interface FormErrors {
  [key: string]: string | FormErrors;
}

export interface FormValidationResult {
  is_valid: boolean;
  errors: FormErrors;
  warnings: string[];
}

export interface ApplicationFilters {
  status?: string;
  grade?: string;
  risk_level?: string;
  date_from?: string;
  date_to?: string;
  search_query?: string;
  business_type?: string;
  loan_amount_min?: number;
  loan_amount_max?: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface ScoreDisplayProps {
  score: CreditScore;
  showDetails?: boolean;
  compact?: boolean;
}

export interface ApplicationFormProps {
  onSubmit: (data: ApplicationFormData) => void;
  initialData?: Partial<ApplicationFormData>;
  isLoading?: boolean;
  errors?: FormErrors;
}

export interface PsychometricTestProps {
  onComplete: (responses: Record<string, PsychometricResponse>) => void;
  questions: PsychometricQuestion[];
  isLoading?: boolean;
}

export interface AuthState {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
  } | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ScoringState {
  applications: CreditApplication[];
  currentApplication: CreditApplication | null;
  currentScore: CreditScore | null;
  isLoading: boolean;
  error: string | null;
  filters: ApplicationFilters;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export interface ReportsState {
  availableReports: string[];
  currentReport: any | null;
  isGenerating: boolean;
  error: string | null;
}