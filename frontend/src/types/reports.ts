import { ChartDataPoint, DateRange } from './common';
import { CreditScore, RedFlag, RatioScore } from './scoring';

export interface ReportConfig {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  parameters: ReportParameter[];
  template_id?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
}

export type ReportType = 
  | 'score_breakdown' 
  | 'risk_assessment' 
  | 'portfolio_analysis'
  | 'performance_metrics'
  | 'trend_analysis'
  | 'comparative_analysis'
  | 'regulatory_compliance';

export interface ReportParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'select' | 'multi_select';
  required: boolean;
  default_value?: any;
  options?: Array<{ label: string; value: any }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface GenerateReportRequest {
  report_type: ReportType;
  parameters: Record<string, any>;
  format: ReportFormat;
  delivery_method?: 'download' | 'email' | 'api';
  recipients?: string[];
}

export type ReportFormat = 'pdf' | 'excel' | 'csv' | 'json';

export interface ReportStatus {
  id: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number;
  created_at: string;
  completed_at?: string;
  error_message?: string;
  download_url?: string;
  expires_at?: string;
}

// Specific Report Data Structures
export interface ScoreBreakdownReport {
  summary: {
    application_id: string;
    borrower_name: string;
    final_score: number;
    grade: string;
    risk_level: string;
    generated_at: string;
  };
  
  component_analysis: {
    data_points: {
      total_score: number;
      max_possible: number;
      percentage: number;
      breakdown: {
        financial_discipline: {
          score: number;
          max_score: number;
          details: Record<string, number>;
        };
        business_performance: {
          score: number;
          max_score: number;
          details: Record<string, number>;
        };
        compliance: {
          score: number;
          max_score: number;
          details: Record<string, number>;
        };
      };
    };
    
    credit_ratios: {
      total_score: number;
      ratios: Array<RatioScore & {
        weight: number;
        contribution: number;
      }>;
    };
    
    borrower_attributes: {
      total_score: number;
      max_possible: number;
      percentage: number;
      breakdown: {
        character: { score: number; max_score: number; details: Record<string, any> };
        capital: { score: number; max_score: number; details: Record<string, any> };
        capacity: { score: number; max_score: number; details: Record<string, any> };
        collateral: { score: number; max_score: number; details: Record<string, any> };
        conditions: { score: number; max_score: number; details: Record<string, any> };
      };
    };
    
    psychometric?: {
      total_score: number;
      adjustment_points: number;
      dimension_scores: Record<string, number>;
    };
  };
  
  risk_assessment: {
    level: string;
    probability: number;
    factors: string[];
    red_flags: RedFlag[];
    mitigation_suggestions: string[];
  };
  
  recommendations: {
    loan_decision: string;
    max_amount: number;
    suggested_terms: {
      interest_rate_range: string;
      tenure_months: number;
      conditions: string[];
    };
    monitoring_requirements: string[];
  };
}

export interface PortfolioAnalysisReport {
  summary: {
    total_applications: number;
    date_range: DateRange;
    generated_at: string;
  };
  
  distribution_analysis: {
    grade_distribution: ChartDataPoint[];
    risk_distribution: ChartDataPoint[];
    business_type_distribution: ChartDataPoint[];
    loan_amount_distribution: ChartDataPoint[];
  };
  
  performance_metrics: {
    average_score: number;
    approval_rate: number;
    rejection_rate: number;
    score_trends: Array<{
      period: string;
      average_score: number;
      application_count: number;
    }>;
  };
  
  risk_insights: {
    high_risk_segments: Array<{
      segment: string;
      risk_factors: string[];
      recommendation: string;
      affected_applications: number;
    }>;
    red_flag_frequency: Array<{
      flag_name: string;
      frequency: number;
      impact_level: string;
    }>;
  };
  
  comparative_analysis?: {
    period_comparison: {
      current_period: any;
      previous_period: any;
      changes: Record<string, {
        absolute: number;
        percentage: number;
        trend: 'up' | 'down' | 'stable';
      }>;
    };
  };
}

export interface TrendAnalysisReport {
  summary: {
    analysis_period: DateRange;
    data_points: number;
    generated_at: string;
  };
  
  score_trends: {
    monthly_averages: Array<{
      month: string;
      average_score: number;
      application_count: number;
      grade_distribution: Record<string, number>;
    }>;
    
    trend_indicators: {
      overall_trend: 'improving' | 'declining' | 'stable';
      trend_strength: number;
      seasonal_patterns: string[];
    };
  };
  
  component_trends: {
    data_points_trend: Array<{ period: string; average: number }>;
    credit_ratios_trend: Array<{ period: string; average: number }>;
    borrower_attributes_trend: Array<{ period: string; average: number }>;
  };
  
  risk_evolution: {
    risk_level_trends: Record<string, Array<{ period: string; count: number }>>;
    emerging_risks: string[];
    improving_areas: string[];
  };
  
  business_insights: {
    top_performing_segments: Array<{
      segment: string;
      average_score: number;
      growth_rate: number;
    }>;
    
    areas_of_concern: Array<{
      area: string;
      decline_rate: number;
      recommended_actions: string[];
    }>;
  };
}

export interface PerformanceMetricsReport {
  summary: {
    reporting_period: DateRange;
    total_applications_processed: number;
    generated_at: string;
  };
  
  processing_metrics: {
    average_processing_time: number;
    completion_rate: number;
    error_rate: number;
    system_availability: number;
  };
  
  accuracy_metrics: {
    prediction_accuracy: number;
    false_positive_rate: number;
    false_negative_rate: number;
    model_confidence_distribution: ChartDataPoint[];
  };
  
  business_impact: {
    cost_savings: number;
    risk_reduction: number;
    efficiency_improvement: number;
    customer_satisfaction: number;
  };
  
  comparative_benchmarks: {
    industry_averages: Record<string, number>;
    performance_vs_industry: Record<string, {
      our_performance: number;
      industry_average: number;
      difference: number;
    }>;
  };
}

export interface RegulatoryComplianceReport {
  summary: {
    compliance_period: DateRange;
    regulatory_framework: string;
    generated_at: string;
  };
  
  compliance_metrics: {
    overall_compliance_score: number;
    requirement_compliance: Array<{
      requirement_id: string;
      description: string;
      compliance_status: 'compliant' | 'non_compliant' | 'partial';
      evidence: string[];
      gaps: string[];
    }>;
  };
  
  risk_assessment_compliance: {
    documentation_completeness: number;
    process_adherence: number;
    audit_trail_quality: number;
    data_governance_score: number;
  };
  
  recommendations: {
    immediate_actions: string[];
    medium_term_improvements: string[];
    policy_updates_needed: string[];
  };
  
  audit_information: {
    last_audit_date: string;
    next_audit_due: string;
    audit_findings: string[];
    remediation_status: Record<string, 'pending' | 'in_progress' | 'completed'>;
  };
}

// Report State Management
export interface ReportsState {
  available_reports: ReportConfig[];
  generated_reports: ReportStatus[];
  current_report: any | null;
  is_generating: boolean;
  is_loading: boolean;
  error: string | null;
  filters: {
    report_type?: ReportType;
    date_range?: DateRange;
    status?: string;
  };
}

// API Request/Response Types
export interface ReportListResponse {
  reports: ReportConfig[];
  generated_reports: ReportStatus[];
}

export interface GenerateReportResponse {
  report_id: string;
  status: ReportStatus;
  estimated_completion_time: string;
}

// Component Props
export interface ReportGeneratorProps {
  reportType: ReportType;
  onGenerate: (request: GenerateReportRequest) => void;
  isLoading?: boolean;
  availableFormats?: ReportFormat[];
}

export interface ReportViewerProps {
  report: any;
  reportType: ReportType;
  onExport?: (format: ReportFormat) => void;
  onShare?: () => void;
}

export interface ReportListProps {
  reports: ReportStatus[];
  onDownload: (reportId: string) => void;
  onDelete: (reportId: string) => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

// Export Templates
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  report_type: ReportType;
  config: {
    sections: Array<{
      id: string;
      title: string;
      type: 'table' | 'chart' | 'text' | 'metrics';
      config: Record<string, any>;
    }>;
    styling: {
      theme: 'default' | 'professional' | 'minimal';
      logo_url?: string;
      colors: Record<string, string>;
    };
  };
  is_default: boolean;
  created_by: string;
  created_at: string;
}