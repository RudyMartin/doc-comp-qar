// Helper function to safely access environment variables
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
};

export const APP_CONSTANTS = {
  APP_NAME: 'QC Reporter',
  VERSION: '1.0.0',
  DEMO_MODE: getEnvVar('DEMO_MODE') === 'true' || true, // Set to false for production with real authentication
  USE_AURORA_POSTGRES: getEnvVar('USE_AURORA_POSTGRES') === 'true' || false, // Set to true to use Aurora Postgres instead of Supabase database
  
  // Database Configuration
  DATABASE_PROVIDER: getEnvVar('USE_AURORA_POSTGRES') === 'true' ? 'aurora-postgres' : 'supabase',
  
  // Authentication Provider
  AUTH_PROVIDER: getEnvVar('AUTH_PROVIDER', 'supabase'), // 'supabase' or 'cognito'
  
  // Storage Provider
  STORAGE_PROVIDER: getEnvVar('STORAGE_PROVIDER', 'supabase'), // 'supabase' or 's3'
  
  // Environment
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  
  // API Configuration
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY', 'YOUR_API_KEY_HERE'),
  OPENAI_MODEL: getEnvVar('OPENAI_MODEL', 'gpt-4o-mini'),
  
  // Routes
  ROUTES: {
    DASHBOARD: '/dashboard',
    DOCUMENT_UPLOAD: '/document-upload',
    REQUIREMENTS_CHECKLIST: '/requirements-checklist',
    REVIEW_SUGGESTIONS: '/compliance',
    COMPLIANCE_REPORT: '/compliance-report',
    REPORT_LIBRARY: '/report-library'
  },
  
  // Local Storage Keys
  LOCAL_STORAGE_KEYS: {
    USER_PREFERENCES: 'qc_user_preferences',
    REPORT_STATE: 'qc_report_state',
    THEME: 'qc_theme'
  },
  
  // Validation Rules
  VALIDATION: {
    MIN_REPORT_NAME_LENGTH: 3,
    MAX_REPORT_NAME_LENGTH: 100,
    MAX_DESCRIPTION_LENGTH: 500,
    SUPPORTED_FILE_EXTENSIONS: ['.pdf', '.doc', '.docx', '.txt']
  }
} as const;

export const REQUIREMENT_STATUSES = [
  'pending',
  'in-progress', 
  'completed',
  'failed',
  'partial',
  'compliant',
  'non-compliant'
] as const;

export const PRIORITY_LEVELS = [
  'low',
  'medium', 
  'high',
  'critical'
] as const;

export const REPORT_STATUSES = [
  'active',
  'completed',
  'on-hold',
  'archived',
  'pending',
  'failed'
] as const;

export type RequirementStatus = typeof REQUIREMENT_STATUSES[number];
export type PriorityLevel = typeof PRIORITY_LEVELS[number];
export type ReportStatus = typeof REPORT_STATUSES[number];