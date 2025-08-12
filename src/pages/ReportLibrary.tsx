import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Plus, Search, MoreHorizontal, Calendar, User, BookOpen, Trash2, Edit, AlertCircle, ArrowRight, CheckSquare, FileText, Upload, Eye, BarChart3 } from 'lucide-react';
import { APIService } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Project } from '../types';

const ReportLibrary: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newReport, setNewReport] = useState({
    name: '',
    description: '',
    documentType: '',
    assignee: ''
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await APIService.getProjects();
      setReports(response.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(report =>
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    report.assignee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getQualityScore = (compliance: number) => {
    if (compliance >= 90) return { color: 'text-green-600', label: 'Excellent' };
    if (compliance >= 70) return { color: 'text-yellow-600', label: 'Good' };
    if (compliance >= 50) return { color: 'text-orange-600', label: 'Fair' };
    return { color: 'text-red-600', label: 'Poor' };
  };

  const handleCreateReport = async () => {
    if (!newReport.name.trim()) return;

    try {
      setError('');
      const response = await APIService.createProject({
        name: newReport.name,
        description: newReport.description,
        documentType: newReport.documentType || 'Quality Assessment',
        assignee: newReport.assignee || user?.name || 'Unassigned'
      });

      setReports(prev => [response.project, ...prev]);
      setNewReport({ name: '', description: '', documentType: '', assignee: '' });
      setIsCreateDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create report');
    }
  };

  const deleteReport = async (id: string) => {
    try {
      setError('');
      await APIService.deleteProject(id);
      setReports(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete report');
    }
  };

  const reportStats = {
    total: reports.length,
    active: reports.filter(p => p.status === 'active').length,
    completed: reports.filter(p => p.status === 'completed').length,
    avgQuality: Math.round(reports.reduce((sum, p) => sum + p.compliance, 0) / reports.length) || 0
  };

  return (
    <Layout title="Report Library">
      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Reports</p>
                  <p className="text-2xl font-bold">{reportStats.total}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{reportStats.active}</p>
                </div>
                <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-blue-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{reportStats.completed}</p>
                </div>
                <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                  <div className="h-3 w-3 bg-green-600 rounded-full"></div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Quality Score</p>
                  <p className={`text-2xl font-bold ${getQualityScore(reportStats.avgQuality).color}`}>
                    {reportStats.avgQuality}%
                  </p>
                </div>
                <Progress value={reportStats.avgQuality} className="w-8 h-8" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Actions and Search */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>QC Reports</CardTitle>
              <Button onClick={() => navigate('/document-upload')}>
                <Plus className="h-4 w-4 mr-2" />
                New Report
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <Card key={i}>
                    <CardContent className="p-6">
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                        <div className="h-2 bg-gray-200 rounded w-full"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredReports.map((report) => {
                  const qualityScore = getQualityScore(report.compliance);
                  return (
                    <Card key={report.id} className="hover:shadow-md transition-all hover:border-blue-300 cursor-pointer group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-700">{report.name}</h3>
                            <Badge className={getStatusColor(report.status)}>
                              {report.status}
                            </Badge>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Report Actions</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-2">
                                <Button 
                                  variant="ghost" 
                                  className="w-full justify-start"
                                  onClick={() => navigate('/requirements-checklist')}
                                >
                                  <CheckSquare className="h-4 w-4 mr-2" />
                                  View Requirements
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  className="w-full justify-start"
                                  onClick={() => navigate('/compliance')}
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Review Suggestions
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  className="w-full justify-start"
                                  onClick={() => navigate('/compliance-report')}
                                >
                                  <BarChart3 className="h-4 w-4 mr-2" />
                                  View QC Report
                                </Button>
                                <Button variant="ghost" className="w-full justify-start">
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit Report
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  className="w-full justify-start text-red-600 hover:text-red-700"
                                  onClick={() => deleteReport(report.id)}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete Report
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {report.description}
                        </p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-500">Quality Score</span>
                            <div className="flex items-center space-x-2">
                              <span className={`font-medium ${qualityScore.color}`}>
                                {report.compliance}%
                              </span>
                              <Badge variant="outline" className={qualityScore.color}>
                                {qualityScore.label}
                              </Badge>
                            </div>
                          </div>
                          <Progress value={report.compliance} className="h-2" />
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <User className="h-4 w-4 mr-1" />
                            {report.assignee}
                          </div>
                          
                          <div className="flex items-center text-sm text-gray-500">
                            <Calendar className="h-4 w-4 mr-1" />
                            {new Date(report.lastActivity).toLocaleDateString()}
                          </div>
                          
                          <div className="pt-2 border-t flex items-center justify-between">
                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                              {report.documentType}
                            </span>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/compliance');
                                }}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Review
                              </Button>
                              <Button 
                                size="sm" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate('/compliance-report');
                                }}
                              >
                                <BarChart3 className="h-3 w-3 mr-1" />
                                Report
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {filteredReports.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No reports found</h3>
                <p className="mt-1 text-sm text-gray-500 mb-6">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first QC report.'}
                </p>
                {!searchTerm && (
                  <div className="flex justify-center space-x-4">
                    <Button 
                      onClick={() => navigate('/document-upload')}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Document
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ReportLibrary;