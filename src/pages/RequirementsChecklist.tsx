import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Progress } from '../../components/ui/progress';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Search, Filter, CheckCircle, XCircle, Clock, AlertTriangle, Eye, AlertCircle, ArrowRight, FileText, BarChart3 } from 'lucide-react';
import { mockRequirements } from '../utils/mockData';
import { APIService } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Requirement, Project } from '../types';

const RequirementsChecklist: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [requirements, setRequirements] = useState<Requirement[]>(mockRequirements);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      loadRequirements(selectedProjectId);
    }
  }, [selectedProjectId]);

  const loadProjects = async () => {
    try {
      const response = await APIService.getProjects();
      const projectList = response.projects || [];
      setProjects(projectList);
      
      // Auto-select first project if available
      if (projectList.length > 0) {
        setSelectedProjectId(projectList[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const loadRequirements = async (projectId: string) => {
    try {
      setLoading(true);
      const response = await APIService.getRequirements(projectId);
      const reqList = response.requirements || [];
      
      // If no requirements from backend, use mock data for demonstration
      setRequirements(reqList.length > 0 ? reqList : mockRequirements);
    } catch (err) {
      console.error('Error loading requirements:', err);
      // Fallback to mock data if backend fails
      setRequirements(mockRequirements);
    } finally {
      setLoading(false);
    }
  };

  const filteredRequirements = requirements.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || req.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'non-compliant': return <XCircle className="h-5 w-5 text-red-500" />;
      case 'partial': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default: return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  const statusCounts = requirements.reduce((acc, req) => {
    acc[req.status] = (acc[req.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const overallProgress = Math.round(
    ((statusCounts.compliant || 0) / requirements.length) * 100
  );

  return (
    <Layout title="Requirements Checklist">
      <div className="p-6 space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Requirements</p>
                  <p className="text-2xl font-bold">{requirements.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Compliant</p>
                  <p className="text-2xl font-bold text-green-600">{statusCounts.compliant || 0}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Non-Compliant</p>
                  <p className="text-2xl font-bold text-red-600">{statusCounts['non-compliant'] || 0}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold">{overallProgress}%</p>
                </div>
                <Progress value={overallProgress} className="w-8 h-8" />
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

        {/* Report Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select QC Report</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a report to check requirements" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>Requirements Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search requirements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="compliant">Compliant</SelectItem>
                  <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : !selectedProjectId ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Please select a report to check requirements</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRequirements.map((requirement) => (
                <div key={requirement.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(requirement.status)}
                        <h3 className="font-medium text-gray-900">{requirement.title}</h3>
                        <Badge className={getPriorityColor(requirement.priority)}>
                          {requirement.priority}
                        </Badge>
                        <Badge className={getStatusColor(requirement.status)}>
                          {requirement.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-3">{requirement.description}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>Category: {requirement.category}</span>
                          {requirement.section && <span>Section: {requirement.section}</span>}
                          {requirement.assignee && <span>Assignee: {requirement.assignee}</span>}
                          {requirement.confidence && (
                            <span>Confidence: {Math.round(requirement.confidence * 100)}%</span>
                          )}
                        </div>
                        
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedRequirement(requirement)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Details
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>{requirement.title}</DialogTitle>
                            </DialogHeader>
                            
                            {selectedRequirement && (
                              <div className="space-y-4">
                                <Tabs defaultValue="details" className="w-full">
                                  <TabsList>
                                    <TabsTrigger value="details">Details</TabsTrigger>
                                    <TabsTrigger value="evidence">Evidence</TabsTrigger>
                                    <TabsTrigger value="gaps">Gaps & Actions</TabsTrigger>
                                  </TabsList>
                                  
                                  <TabsContent value="details" className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-sm font-medium">Status</label>
                                        <div className="flex items-center space-x-2 mt-1">
                                          {getStatusIcon(selectedRequirement.status)}
                                          <Badge className={getStatusColor(selectedRequirement.status)}>
                                            {selectedRequirement.status}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Priority</label>
                                        <div className="mt-1">
                                          <Badge className={getPriorityColor(selectedRequirement.priority)}>
                                            {selectedRequirement.priority}
                                          </Badge>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Category</label>
                                        <p className="text-sm mt-1">{selectedRequirement.category}</p>
                                      </div>
                                      <div>
                                        <label className="text-sm font-medium">Section</label>
                                        <p className="text-sm mt-1">{selectedRequirement.section || 'N/A'}</p>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <label className="text-sm font-medium">Description</label>
                                      <p className="text-sm mt-1">{selectedRequirement.description}</p>
                                    </div>
                                  </TabsContent>
                                  
                                  <TabsContent value="evidence" className="space-y-4">
                                    <div>
                                      <label className="text-sm font-medium">Evidence Found</label>
                                      <Textarea 
                                        value={selectedRequirement.evidence || 'No evidence documented'}
                                        readOnly
                                        className="mt-1"
                                        rows={4}
                                      />
                                    </div>
                                    
                                    {selectedRequirement.confidence && (
                                      <div>
                                        <label className="text-sm font-medium">Confidence Score</label>
                                        <div className="mt-1">
                                          <Progress value={selectedRequirement.confidence * 100} />
                                          <p className="text-sm text-gray-600 mt-1">
                                            {Math.round(selectedRequirement.confidence * 100)}% confident in this assessment
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </TabsContent>
                                  
                                  <TabsContent value="gaps" className="space-y-4">
                                    {selectedRequirement.gaps && selectedRequirement.gaps.length > 0 && (
                                      <div>
                                        <label className="text-sm font-medium">Identified Gaps</label>
                                        <ul className="list-disc list-inside space-y-1 mt-1">
                                          {selectedRequirement.gaps.map((gap, index) => (
                                            <li key={index} className="text-sm text-red-600">{gap}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    
                                    {selectedRequirement.recommendations && selectedRequirement.recommendations.length > 0 && (
                                      <div>
                                        <label className="text-sm font-medium">Recommendations</label>
                                        <ul className="list-disc list-inside space-y-1 mt-1">
                                          {selectedRequirement.recommendations.map((rec, index) => (
                                            <li key={index} className="text-sm text-blue-600">{rec}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </TabsContent>
                                </Tabs>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </div>
                </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Next Steps Actions */}
        {!loading && selectedProjectId && requirements.length > 0 && (
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2 text-blue-600" />
                Next: Review Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-6">
                Continue with the QC workflow by reviewing suggestions and generating your report.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={() => navigate('/compliance')}
                  className="flex items-center justify-between p-6 h-auto bg-white hover:bg-blue-50 text-gray-900 border border-blue-200 hover:border-blue-300"
                  variant="outline"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="h-6 w-6 text-blue-600" />
                    <div className="text-left">
                      <div>Review Suggestions</div>
                      <div className="text-sm text-gray-600">Get AI-powered improvement recommendations</div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5" />
                </Button>

                <Button 
                  onClick={() => navigate('/compliance-report')}
                  className="flex items-center justify-between p-6 h-auto bg-white hover:bg-green-50 text-gray-900 border border-green-200 hover:border-green-300"
                  variant="outline"
                >
                  <div className="flex items-center space-x-3">
                    <BarChart3 className="h-6 w-6 text-green-600" />
                    <div className="text-left">
                      <div>Your QC Report</div>
                      <div className="text-sm text-gray-600">View final quality assessment</div>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default RequirementsChecklist;