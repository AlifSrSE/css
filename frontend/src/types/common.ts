export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Record<string, string[]>;
  status_code?: number;
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

export interface BaseModel {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  width?: number | string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface FilterOption {
  label: string;
  value: string | number;
  count?: number;
}

export interface SortOption {
  field: string;
  direction: 'asc' | 'desc';
  label?: string;
}

export interface SearchParams {
  q?: string;
  page?: number;
  page_size?: number;
  ordering?: string;
  [key: string]: any;
}

export interface DateRange {
  start_date: string;
  end_date: string;
}

export interface SelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
  description?: string;
  icon?: string;
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date' | 'file';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: ValidationRule[];
  help_text?: string;
  disabled?: boolean;
  readonly?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface FormErrors {
  [fieldName: string]: string | string[] | FormErrors;
}

export interface LoadingState {
  isLoading: boolean;
  isSubmitting?: boolean;
  isRefreshing?: boolean;
  error?: string | null;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  percentage?: number;
  color?: string;
  category?: string;
}

export interface MetricCard {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  icon?: string;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
}

export interface TabItem {
  key: string;
  title: string;
  icon?: string;
  badge?: string | number;
  disabled?: boolean;
  content?: React.ReactNode;
}

export interface BreadcrumbItem {
  title: string;
  href?: string;
  icon?: string;
}

export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: Array<{
    label: string;
    action: string;
    primary?: boolean;
  }>;
}

export interface SystemConfig {
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  category?: string;
  editable?: boolean;
}

// Utility types
export type Status = 'idle' | 'loading' | 'succeeded' | 'failed';

export type Theme = 'light' | 'dark' | 'system';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  coordinates?: Coordinates;
}

export interface FileUpload {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploaded_at: string;
  uploaded_by: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  changes: Record<string, any>;
  user_id: string;
  user_name: string;
  timestamp: string;
  ip_address: string;
}

// Generic component props
export interface ComponentProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  selection?: {
    selectedKeys: string[];
    onChange: (selectedKeys: string[], selectedRows: T[]) => void;
  };
  filters?: Record<string, any>;
  onFilterChange?: (filters: Record<string, any>) => void;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  actions?: Array<{
    key: string;
    label: string;
    icon?: string;
    onClick: (record: T) => void;
    disabled?: (record: T) => boolean;
  }>;
  bulkActions?: Array<{
    key: string;
    label: string;
    icon?: string;
    onClick: (selectedRows: T[]) => void;
  }>;
  emptyText?: string;
  showSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
}

// Error types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: Record<string, any>;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

// Export utility type helpers
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Constants
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_DEBOUNCE_DELAY = 300;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;