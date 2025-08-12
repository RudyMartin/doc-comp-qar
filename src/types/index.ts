export interface Document {
  id: string;
  title: string;
  type: 'policy' | 'program';
  content: string;
  uploadDate: string;
  size?: number;
  name?: string;
}

export interface Requirement {
  id: string | number;
  title: string;
  description: string;
  fullDescription?: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in-progress' | 'completed' | 'failed' | 'partial' | 'compliant' | 'non-compliant';
  sourceDocument?: string;
  sourceSection?: string;
  assignee?: string;
  dueDate?: string;
  notes?: string;
  evidenceCount?: number;
  commentsCount?: number;
  confidence?: number;
  evidence?: string;
  gaps?: string[];
  recommendations?: string[];
  lastUpdated?: string;
  section?: string;
  comments?: Comment[];
}

export interface Comment {
  id: number;
  author: string;
  content: string;
  timestamp: Date;
  avatar?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  documentType: string;
  assignee: string;
  status: 'active' | 'completed' | 'on-hold' | 'archived' | 'pending' | 'failed';
  compliance: number;
  lastActivity: string;
  documentTypes?: string[];
  progress?: number;
}

export interface ComplianceAnalysis {
  overallStatus: string;
  completionPercentage: number;
  requirementAnalysis: RequirementAnalysis[];
  analysisTimestamp: string;
}

export interface RequirementAnalysis {
  requirementId: string;
  status: Requirement['status'];
  confidence: number;
  evidence: string;
  gaps?: string[];
  recommendations?: string[];
}

export interface Activity {
  id: string;
  type: 'created' | 'updated' | 'completed' | 'commented' | 'uploaded' | 'exported' | 'document-upload' | 'analysis-complete' | 'requirement-mapped' | 'report-generated' | 'project-created' | 'compliance-check' | 'annotation-added' | 'deadline-approaching';
  user: string;
  action: string;
  target: string;
  title: string;
  description: string;
  details?: string;
  projectName?: string;
  projectId?: string | number;
  reportId?: string;
  timestamp: string;
}

export interface ChartData {
  name?: string;
  category?: string;
  value: number;
  compliant?: number;
  nonCompliant?: number;
  partial?: number;
  period?: string;
  compliance?: number;
}

export interface MetricsData {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: string;
  color: string;
}