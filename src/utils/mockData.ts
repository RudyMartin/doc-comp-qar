import type { Project, Requirement, Activity, MetricsData, ChartData } from '../types';

export const mockProjects: Project[] = [
  {
    id: '1',
    name: 'GDPR Compliance Review',
    description: 'Comprehensive review of GDPR compliance requirements across all business processes.',
    createdAt: '2024-01-15T10:30:00Z',
    documentType: 'Privacy Policy',
    assignee: 'Sarah Johnson',
    status: 'active',
    compliance: 85,
    lastActivity: '2024-01-20T14:22:00Z',
    progress: 75,
    documentTypes: ['Privacy Policy', 'Data Processing Agreement']
  },
  {
    id: '2',
    name: 'SOC 2 Type II Audit',
    description: 'Security controls audit for SOC 2 Type II compliance certification.',
    createdAt: '2024-01-10T09:15:00Z',
    documentType: 'Security Controls',
    assignee: 'Mike Chen',
    status: 'completed',
    compliance: 92,
    lastActivity: '2024-01-18T16:45:00Z',
    progress: 100,
    documentTypes: ['Security Policy', 'Access Control Policy']
  },
  {
    id: '3',
    name: 'HIPAA Compliance Assessment',
    description: 'Healthcare data privacy and security compliance assessment.',
    createdAt: '2024-01-05T11:00:00Z',
    documentType: 'Healthcare Privacy',
    assignee: 'Dr. Emily Rodriguez',
    status: 'on-hold',
    compliance: 67,
    lastActivity: '2024-01-12T13:30:00Z',
    progress: 45,
    documentTypes: ['Privacy Notice', 'BAA Template']
  }
];

export const mockRequirements: Requirement[] = [
  {
    id: '1',
    title: 'Data Subject Rights Implementation',
    description: 'Implement processes for handling data subject requests (access, rectification, deletion)',
    category: 'Data Rights',
    priority: 'high',
    status: 'compliant',
    confidence: 0.92,
    evidence: 'Documented processes in place with automated request handling system',
    section: 'Article 15-22',
    lastUpdated: '2024-01-20T14:22:00Z',
    assignee: 'Sarah Johnson'
  },
  {
    id: '2',
    title: 'Consent Management System',
    description: 'Implement granular consent collection and management mechanisms',
    category: 'Consent',
    priority: 'critical',
    status: 'partial',
    confidence: 0.73,
    evidence: 'Basic consent forms exist but lack granularity for specific processing purposes',
    gaps: ['Granular consent options', 'Consent withdrawal mechanism'],
    recommendations: ['Implement consent management platform', 'Add clear withdrawal options'],
    section: 'Article 7',
    lastUpdated: '2024-01-19T10:15:00Z',
    assignee: 'Mike Chen'
  },
  {
    id: '3',
    title: 'Data Protection Impact Assessment',
    description: 'Conduct DPIA for high-risk processing activities',
    category: 'Risk Assessment',
    priority: 'medium',
    status: 'non-compliant',
    confidence: 0.45,
    evidence: 'No formal DPIA process documented',
    gaps: ['DPIA methodology', 'Risk assessment templates', 'Review process'],
    recommendations: ['Establish DPIA framework', 'Train team on risk assessment', 'Create review schedule'],
    section: 'Article 35',
    lastUpdated: '2024-01-18T16:30:00Z',
    assignee: 'Dr. Emily Rodriguez'
  },
  {
    id: '4',
    title: 'Breach Notification Procedures',
    description: 'Establish procedures for breach detection, assessment, and notification',
    category: 'Incident Response',
    priority: 'high',
    status: 'pending',
    confidence: 0.0,
    evidence: 'No evidence found in current documentation',
    section: 'Article 33-34',
    lastUpdated: '2024-01-17T09:45:00Z',
    assignee: 'Sarah Johnson'
  }
];

export const mockActivities: Activity[] = [
  {
    id: '1',
    type: 'document-upload',
    user: 'Sarah Johnson',
    action: 'uploaded',
    target: 'Privacy Policy v2.1',
    title: 'Document Uploaded',
    description: 'New privacy policy document uploaded for compliance review',
    projectName: 'GDPR Compliance Review',
    timestamp: '2024-01-20T14:22:00Z'
  },
  {
    id: '2',
    type: 'analysis-complete',
    user: 'System',
    action: 'completed analysis',
    target: 'SOC 2 Requirements',
    title: 'Analysis Complete',
    description: 'Automated compliance analysis completed with 92% compliance score',
    projectName: 'SOC 2 Type II Audit',
    timestamp: '2024-01-20T13:15:00Z'
  },
  {
    id: '3',
    type: 'requirement-mapped',
    user: 'Mike Chen',
    action: 'mapped requirement',
    target: 'Data Encryption Standards',
    title: 'Requirement Mapped',
    description: 'Successfully mapped encryption requirement to security controls document',
    projectName: 'SOC 2 Type II Audit',
    timestamp: '2024-01-20T11:30:00Z'
  }
];

export const mockMetrics: MetricsData[] = [
  {
    title: 'Overall Compliance',
    value: '84%',
    change: '+5%',
    changeType: 'positive',
    icon: 'Shield',
    color: 'text-green-600'
  },
  {
    title: 'Active Projects',
    value: '12',
    change: '+3',
    changeType: 'positive',
    icon: 'FolderOpen',
    color: 'text-blue-600'
  },
  {
    title: 'Requirements Reviewed',
    value: '247',
    change: '+18',
    changeType: 'positive',
    icon: 'CheckSquare',
    color: 'text-purple-600'
  },
  {
    title: 'Critical Issues',
    value: '3',
    change: '-2',
    changeType: 'positive',
    icon: 'AlertTriangle',
    color: 'text-red-600'
  }
];

export const mockComplianceData: ChartData[] = [
  { category: 'Data Protection', compliant: 85, nonCompliant: 10, partial: 5 },
  { category: 'Security Controls', compliant: 92, nonCompliant: 5, partial: 3 },
  { category: 'Access Management', compliant: 78, nonCompliant: 15, partial: 7 },
  { category: 'Incident Response', compliant: 65, nonCompliant: 25, partial: 10 },
  { category: 'Risk Assessment', compliant: 88, nonCompliant: 8, partial: 4 }
];

export const mockTrendData: ChartData[] = [
  { period: 'Jan', compliance: 75 },
  { period: 'Feb', compliance: 78 },
  { period: 'Mar', compliance: 82 },
  { period: 'Apr', compliance: 84 },
  { period: 'May', compliance: 87 },
  { period: 'Jun', compliance: 84 }
];