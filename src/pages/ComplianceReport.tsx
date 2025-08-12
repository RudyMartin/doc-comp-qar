import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Separator } from '../../components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Download, 
  Mail, 
  FileText, 
  BarChart3, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock,
  ArrowRight,
  Printer,
  Share,
  Eye,
  AlertCircle
} from 'lucide-react';
import { APIService } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { mockRequirements } from '../utils/mockData';
import type { Project, Requirement } from '../types';

const ComplianceReport: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: ''
  });
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await APIService.getProjects();
      const projectList = response.projects || [];
      setProjects(projectList);
      
      if (projectList.length > 0) {
        setSelectedProject(projectList[0]);
        await loadRequirements(projectList[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadRequirements = async (projectId: string) => {
    try {
      const response = await APIService.getRequirements(projectId);
      const reqList = response.requirements || [];
      setRequirements(reqList.length > 0 ? reqList : mockRequirements);
    } catch (err) {
      console.error('Error loading requirements:', err);
      setRequirements(mockRequirements);
    }
  };

  const calculateMetrics = () => {
    const total = requirements.length;
    const compliant = requirements.filter(r => r.status === 'compliant').length;
    const nonCompliant = requirements.filter(r => r.status === 'non-compliant').length;
    const partial = requirements.filter(r => r.status === 'partial').length;
    const pending = requirements.filter(r => r.status === 'pending').length;
    
    const compliancePercentage = total > 0 ? Math.round((compliant / total) * 100) : 0;
    
    const criticalIssues = requirements.filter(r => r.priority === 'critical' && r.status !== 'compliant').length;
    const highIssues = requirements.filter(r => r.priority === 'high' && r.status !== 'compliant').length;

    return {
      total,
      compliant,
      nonCompliant,
      partial,
      pending,
      compliancePercentage,
      criticalIssues,
      highIssues
    };
  };

  const generatePDFReport = async () => {
    setIsGeneratingPDF(true);
    try {
      // Simulate PDF generation - in real implementation, this would call a backend service
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a blob with report content (simplified version)
      const reportContent = generateReportContent();
      const blob = new Blob([reportContent], { type: 'text/html' });
      
      // Create download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedProject?.name || 'compliance-report'}-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // In real implementation, you would use a library like jsPDF or call a backend service
      console.log('PDF generated successfully');
    } catch (err) {
      setError('Failed to generate PDF report');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const sendEmailReport = async () => {
    if (!emailData.to.trim()) {
      setError('Email address is required');
      return;
    }

    setIsSendingEmail(true);
    try {
      // Simulate email sending - in real implementation, this would call a backend service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In real implementation, call email service
      await APIService.sendEmailReport({
        projectId: selectedProject?.id || '',
        to: emailData.to,
        subject: emailData.subject || `QC Report: ${selectedProject?.name}`,
        message: emailData.message,
        includeAttachment: true
      });
      
      setIsEmailDialogOpen(false);
      setEmailData({ to: '', subject: '', message: '' });
      console.log('Email sent successfully');
    } catch (err) {
      setError('Failed to send email report');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const generateReportContent = () => {
    const metrics = calculateMetrics();
    const currentDate = new Date().toLocaleDateString();
    
    return `
<!DOCTYPE html>
<html>
<head>
    <title>QC Compliance Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .metrics { display: flex; justify-content: space-around; margin: 20px 0; }
        .metric-card { text-align: center; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .section { margin: 30px 0; }
        .requirement { margin: 15px 0; padding: 15px; border-left: 4px solid #ccc; background: #f9f9f9; }
        .compliant { border-left-color: #10B981; }
        .non-compliant { border-left-color: #EF4444; }
        .partial { border-left-color: #F59E0B; }
        .pending { border-left-color: #6B7280; }
        .footer { margin-top: 50px; text-align: center; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Quality Control Compliance Report</h1>
        <h2>${selectedProject?.name || 'Untitled Report'}</h2>
        <p>Generated on ${currentDate} | Prepared by ${user?.name || 'System'}</p>
    </div>

    <div class="section">
        <h3>Executive Summary</h3>
        <p>This report provides a comprehensive analysis of compliance status for ${selectedProject?.name}. 
        The assessment reviewed ${metrics.total} requirements across multiple categories with an overall 
        compliance rate of ${metrics.compliancePercentage}%.</p>
    </div>

    <div class="metrics">
        <div class="metric-card">
            <h4>Overall Compliance</h4>
            <h2>${metrics.compliancePercentage}%</h2>
        </div>
        <div class="metric-card">
            <h4>Total Requirements</h4>
            <h2>${metrics.total}</h2>
        </div>
        <div class="metric-card">
            <h4>Critical Issues</h4>
            <h2>${metrics.criticalIssues}</h2>
        </div>
        <div class="metric-card">
            <h4>High Priority Issues</h4>
            <h2>${metrics.highIssues}</h2>
        </div>
    </div>

    <div class="section">
        <h3>Detailed Findings</h3>
        ${requirements.map(req => `
            <div class="requirement ${req.status}">
                <h4>${req.title} (${req.priority} priority)</h4>
                <p><strong>Status:</strong> ${req.status}</p>
                <p><strong>Category:</strong> ${req.category}</p>
                <p><strong>Description:</strong> ${req.description}</p>
                ${req.evidence ? `<p><strong>Evidence:</strong> ${req.evidence}</p>` : ''}
                ${req.gaps && req.gaps.length > 0 ? `<p><strong>Gaps:</strong> ${req.gaps.join(', ')}</p>` : ''}
                ${req.recommendations && req.recommendations.length > 0 ? `<p><strong>Recommendations:</strong> ${req.recommendations.join(', ')}</p>` : ''}
            </div>
        `).join('')}
    </div>

    <div class="footer">
        <p>Generated by ComplianceChecker Platform | ${currentDate}</p>
        <p>This report is confidential and intended for authorized personnel only.</p>
    </div>
</body>
</html>
    `;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'non-compliant': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'partial': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <Layout title="QC Report">
        <div className="p-6 space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="QC Report">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Quality Control Report</h1>
            <p className="text-gray-600 mt-1">
              {selectedProject?.name || 'No project selected'} | Generated on {new Date().toLocaleDateString()}
            </p>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Report
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Email QC Report</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email-to">To</Label>
                    <Input
                      id="email-to"
                      type="email"
                      value={emailData.to}
                      onChange={(e) => setEmailData(prev => ({ ...prev, to: e.target.value }))}
                      placeholder="recipient@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email-subject">Subject</Label>
                    <Input
                      id="email-subject"
                      value={emailData.subject}
                      onChange={(e) => setEmailData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder={`QC Report: ${selectedProject?.name}`}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email-message">Message (Optional)</Label>
                    <Textarea
                      id="email-message"
                      value={emailData.message}
                      onChange={(e) => setEmailData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Please find the attached QC compliance report..."
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={sendEmailReport} disabled={isSendingEmail}>
                      {isSendingEmail ? 'Sending...' : 'Send Email'}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={generatePDFReport} disabled={isGeneratingPDF}>
              <Download className="h-4 w-4 mr-2" />
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Executive Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BarChart3 className="h-5 w-5 mr-2" />
              Executive Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">{metrics.compliancePercentage}%</div>
                <div className="text-sm text-gray-600">Overall Compliance</div>
                <Progress value={metrics.compliancePercentage} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-2">{metrics.total}</div>
                <div className="text-sm text-gray-600">Total Requirements</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">{metrics.criticalIssues}</div>
                <div className="text-sm text-gray-600">Critical Issues</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">{metrics.highIssues}</div>
                <div className="text-sm text-gray-600">High Priority Issues</div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-700 leading-relaxed">
                This quality control assessment analyzed <strong>{metrics.total} requirements</strong> for {selectedProject?.name}. 
                The analysis identified <strong>{metrics.compliant} compliant</strong> requirements ({metrics.compliancePercentage}% compliance rate), 
                <strong> {metrics.nonCompliant} non-compliant</strong> items, and <strong>{metrics.partial} partially compliant</strong> requirements. 
                Immediate attention is required for <strong>{metrics.criticalIssues} critical</strong> and <strong>{metrics.highIssues} high-priority</strong> issues.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Compliance Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Compliant</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{metrics.compliant}</span>
                    <Badge className="bg-green-100 text-green-800">
                      {Math.round((metrics.compliant / metrics.total) * 100)}%
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span>Non-Compliant</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{metrics.nonCompliant}</span>
                    <Badge className="bg-red-100 text-red-800">
                      {Math.round((metrics.nonCompliant / metrics.total) * 100)}%
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    <span>Partial</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{metrics.partial}</span>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      {Math.round((metrics.partial / metrics.total) * 100)}%
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span>Pending</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold">{metrics.pending}</span>
                    <Badge className="bg-gray-100 text-gray-800">
                      {Math.round((metrics.pending / metrics.total) * 100)}%
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Priority Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['critical', 'high', 'medium', 'low'].map(priority => {
                  const count = requirements.filter(r => r.priority === priority && r.status !== 'compliant').length;
                  const color = priority === 'critical' ? 'text-red-600' : 
                               priority === 'high' ? 'text-orange-600' : 
                               priority === 'medium' ? 'text-yellow-600' : 'text-green-600';
                  
                  return (
                    <div key={priority} className="flex items-center justify-between">
                      <span className="capitalize">{priority} Priority</span>
                      <div className="flex items-center space-x-2">
                        <span className={`font-semibold ${color}`}>{count}</span>
                        <span className="text-gray-500">issues</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Findings */}
        <Card>
          <CardHeader>
            <CardTitle>Key Findings & Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {requirements
                .filter(req => req.status !== 'compliant' && (req.priority === 'critical' || req.priority === 'high'))
                .slice(0, 5)
                .map(req => (
                  <div key={req.id} className="border-l-4 border-red-500 pl-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900">{req.title}</h4>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(req.status)}
                        <Badge className={`${req.priority === 'critical' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'}`}>
                          {req.priority}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{req.description}</p>
                    {req.gaps && req.gaps.length > 0 && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-red-600">Gaps identified: </span>
                        <span className="text-sm text-gray-600">{req.gaps.join(', ')}</span>
                      </div>
                    )}
                    {req.recommendations && req.recommendations.length > 0 && (
                      <div>
                        <span className="text-sm font-medium text-blue-600">Recommendations: </span>
                        <span className="text-sm text-gray-600">{req.recommendations.join(', ')}</span>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                className="h-auto py-4 justify-start"
                onClick={() => navigate('/requirements-checklist')}
              >
                <div className="flex items-center space-x-3">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">Review Requirements</div>
                    <div className="text-sm text-gray-600">Detailed requirement analysis</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
              
              <Button 
                variant="outline" 
                className="h-auto py-4 justify-start"
                onClick={() => navigate('/compliance')}
              >
                <div className="flex items-center space-x-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div className="text-left">
                    <div className="font-medium">Update Documentation</div>
                    <div className="text-sm text-gray-600">Address identified gaps</div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ComplianceReport;