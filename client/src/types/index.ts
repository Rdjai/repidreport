// ===============================
// CORE DOMAIN TYPES
// ===============================

// Report Types
export interface Report {
  _id: string;
  reportId: string;
  reportType: "emergency" | "non-emergency";
  incidentType: string;
  title: string;
  description: string;
  location: string;
  image?: string;
  status: "pending" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  createdAt: string;
  updatedAt: string;
}

// Dashboard Report (alias for Report)
export type DashboardReport = Report;

// Stats Report (for compatibility with ReportStats component)
export interface StatsReport {
  id: string;
  status: "pending" | "in-progress" | "resolved";
  reportType: "emergency" | "normal" | string;
}

// Track Report Data
export interface ReportData {
  reportId: string;
  reportType: "emergency" | "non-emergency";
  incidentType: string;
  title: string;
  description: string;
  location: string;
  status: "pending" | "in-progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "critical";
  createdAt: string;
  updatedAt: string;
}

// Admin Types
export interface AdminUser {
  id: string;
  email: string;
  name?: string;
}

export interface AdminState {
  admin: AdminUser | null;
  setAdmin: (admin: AdminUser | null) => void;
  clearAdmin: () => void;
}

// Support Service Types
export interface SupportService {
  id: string;
  name: string;
  type:
    | "emergency"
    | "medical"
    | "mental-health"
    | "community"
    | "legal"
    | "social-services"
    | "housing"
    | "food"
    | "transportation"
    | "education"
    | "employment"
    | "financial";
  description: string;
  phone: string;
  address: string;
  hours: string;
  website?: string;
  email?: string;
  services: string[];
  isAvailable24_7: boolean;
  languages?: string[];
  accessibility?: string[];
  eligibility?: string[];
  location: {
    lat: number;
    lng: number;
    city: string;
    state: string;
    zipCode: string;
  };
  distance?: number;
}

// ===============================
// FORM DATA TYPES
// ===============================

// Submit Form Data
export interface SubmitFormData {
  reportId: string;
  reportType: "emergency" | "non-emergency" | "";
  imageFile: File | null;
  imagePreview: string | null;
  incidentType: string;
  title: string;
  description: string;
  location: string;
}

// Login Form Data
export interface LoginFormData {
  email: string;
  password: string;
}

// API Form Data (for API submission)
export interface ApiFormData {
  reportId: string;
  reportType: "emergency" | "non-emergency" | "";
  imageFile: File | null;
  imagePreview: string | null;
  incidentType: string;
  title: string;
  description: string;
  location: string;
}

// ===============================
// API RESPONSE TYPES
// ===============================

export interface ApiResponse<T = unknown> {
  status: number;
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginResponse {
  status: number;
  message: string;
  success: boolean;
  data: {
    admin: AdminUser;
    token?: string;
  };
}

export interface ReportsResponse {
  status: number;
  message: string;
  success: boolean;
  data: {
    reports: Report[];
    totalReports: number;
    currentPage?: number;
    totalPages?: number;
  };
}

export interface TrackReportResponse {
  status: number;
  message: string;
  success: boolean;
  data: {
    report: ReportData;
  };
}

export interface ImageAnalysisResponse {
  status: number;
  message: string;
  success: boolean;
  data: {
    analysis: string;
    confidence: number;
    suggestions?: string[];
  };
}

// ===============================
// COMPONENT PROPS TYPES
// ===============================

// Route Protection
export interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Admin Provider Props
export interface AdminProviderProps {
  children: React.ReactNode;
}

// Report Stats Props
export interface ReportStatsProps {
  reports: Report[] | StatsReport[];
}

// ===============================
// UI COMPONENT TYPES
// ===============================

// Button Types
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
}

// Input Types
export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

// Label Types
export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

// Badge Types
export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline";
}

// Select Types
export interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  disabled?: boolean;
}

export interface SelectContentProps {
  children: React.ReactNode;
}

export interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  disabled?: boolean;
}

export interface SelectTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export interface SelectValueProps {
  placeholder?: string;
}

// Toast Types
export type ToasterProps = React.ComponentProps<"div">;

// ===============================
// ENUM TYPES
// ===============================

export type ReportStatus = "pending" | "in-progress" | "resolved" | "closed";
export type ReportType = "emergency" | "non-emergency";
export type Priority = "low" | "medium" | "high" | "critical";

export type IncidentType =
  | "Traffic Accident"
  | "Fire Emergency"
  | "Medical Emergency"
  | "Crime"
  | "Natural Disaster"
  | "Infrastructure Issue"
  | "Environmental Hazard"
  | "Public Safety"
  | "Domestic Violence"
  | "Noise Complaint"
  | "Property Damage"
  | "Theft"
  | "Vandalism"
  | "Other";

export type SupportServiceType =
  | "emergency"
  | "medical"
  | "mental-health"
  | "community"
  | "legal"
  | "social-services"
  | "housing"
  | "food"
  | "transportation"
  | "education"
  | "employment"
  | "financial";

// ===============================
// FILTER & SEARCH TYPES
// ===============================

export interface ReportFilters {
  status?: ReportStatus;
  reportType?: ReportType;
  incidentType?: IncidentType;
  priority?: Priority;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface SortOptions {
  field: keyof Report;
  direction: "asc" | "desc";
}

export interface SearchState {
  query: string;
  filters: ReportFilters;
  sort: SortOptions;
}

// ===============================
// ERROR & LOADING TYPES
// ===============================

export interface ApiError {
  response?: {
    data?: {
      message?: string;
      error?: string;
    };
    status?: number;
  };
  message?: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

// ===============================
// STATS & ANALYTICS TYPES
// ===============================

export interface ReportStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  closed: number;
  emergency: number;
  nonEmergency: number;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string[];
    borderColor?: string[];
  }[];
}

// ===============================
// LOCATION & GEOGRAPHY TYPES
// ===============================

export interface LocationCoordinates {
  lat: number;
  lng: number;
}

export interface LocationData {
  address: string;
  coordinates?: LocationCoordinates;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

// ===============================
// UTILITY TYPES
// ===============================

// Re-export common utility types
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

export type Required<T> = {
  [P in keyof T]-?: T[P];
};

export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// ===============================
// THEME & UI STATE TYPES
// ===============================

export type Theme = "light" | "dark" | "system";

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

// ===============================
// PAGINATION TYPES
// ===============================

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNext: boolean;
  hasPrev: boolean;
}
