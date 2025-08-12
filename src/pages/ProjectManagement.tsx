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
import { Plus, Search, MoreHorizontal, Calendar, User, FolderOpen, Trash2, Edit, AlertCircle, ArrowRight, CheckSquare, FileText, Upload } from 'lucide-react';
import { APIService } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Project } from '../types';

const ProjectManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    documentType: '',
    assignee: ''
  });

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await APIService.getProjects();
      setProjects(response.projects || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.assignee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-red-100 text-red-800';
    }
  };

  const getComplianceColor = (compliance: number) => {
    if (compliance >= 90) return 'text-green-600';
    if (compliance >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleCreateProject = async () => {
    if (!newProject.name.trim()) return;

    try {
      setError('');
      const response = await APIService.createProject({
        name: newProject.name,
        description: newProject.description,
        documentType: newProject.documentType || 'General',
        assignee: newProject.assignee || user?.name || 'Unassigned'
      });

      setProjects(prev => [response.project, ...prev]);
      setNewProject({ name: '', description: '', documentType: '', assignee: '' });
      setIsCreateDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    }
  };

  const deleteProject = async (id: string) => {
    try {
      setError('');
      await APIService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const projectStats = {
    total: projects.length,
    active: projects.filter(p => p.status === 'active').length,
    completed: projects.filter(p => p.status === 'completed').length,
    avgCompliance: Math.round(projects.reduce((sum, p) => sum + p.compliance, 0) / projects.length)
  };

  return (
    <Layout title="Project Management">
      <div className="p-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Projects</p>
                  <p className="text-2xl font-bold">{projectStats.total}</p>
                </div>
                <FolderOpen className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-2xl font-bold text-green-600">{projectStats.active}</p>
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
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-blue-600">{projectStats.completed}</p>
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
                  <p className="text-sm text-muted-foreground">Avg. Compliance</p>
                  <p className={`text-2xl font-bold ${getComplianceColor(projectStats.avgCompliance)}`}>
                    {projectStats.avgCompliance}%
                  </p>
                </div>
                <Progress value={projectStats.avgCompliance} className="w-8 h-8" />
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
              <CardTitle>Projects</CardTitle>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Project
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="project-name">Project Name *</Label>
                      <Input
                        id="project-name"
                        value={newProject.name}
                        onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                        placeholder="Enter project name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="document-type">Document Type</Label>
                      <Select
                        value={newProject.documentType}
                        onValueChange={(value) => setNewProject({ ...newProject, documentType: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="gdpr">GDPR Compliance</SelectItem>
                          <SelectItem value="soc2">SOC 2</SelectItem>
                          <SelectItem value="hipaa">HIPAA</SelectItem>
                          <SelectItem value="iso27001">ISO 27001</SelectItem>
                          <SelectItem value="pci">PCI DSS</SelectItem>
                          <SelectItem value="custom">Custom Policy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="assignee">Assignee</Label>
                      <Input
                        id="assignee"
                        value={newProject.assignee}
                        onChange={(e) => setNewProject({ ...newProject, assignee: e.target.value })}
                        placeholder="Assign to team member"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={newProject.description}
                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                        placeholder="Describe the project scope and objectives"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateProject}
                        disabled={!newProject.name.trim()}
                      >
                        Create Project
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects..."
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
                {filteredProjects.map((project) => (
                <Card key={project.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{project.name}</h3>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Project Actions</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-2">
                            <Button variant="ghost" className="w-full justify-start">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Project
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start text-red-600 hover:text-red-700"
                              onClick={() => deleteProject(project.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Project
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {project.description}
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Compliance</span>
                        <span className={`font-medium ${getComplianceColor(project.compliance)}`}>
                          {project.compliance}%
                        </span>
                      </div>
                      <Progress value={project.compliance} className="h-2" />
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-1" />
                        {project.assignee}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(project.lastActivity).toLocaleDateString()}
                      </div>
                      
                      <div className="pt-2 border-t flex items-center justify-between">
                        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          {project.documentType}
                        </span>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/requirements-checklist');
                            }}
                          >
                            <CheckSquare className="h-3 w-3 mr-1" />
                            Requirements
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate('/compliance');
                            }}
                          >
                            <FileText className="h-3 w-3 mr-1" />
                            Compare
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                ))}
              </div>
            )}

            {filteredProjects.length === 0 && (
              <div className="text-center py-12">
                <FolderOpen className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No projects found</h3>
                <p className="mt-1 text-sm text-gray-500 mb-6">
                  {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new project.'}
                </p>
                {!searchTerm && (
                  <div className="flex justify-center space-x-4">
                    <Button 
                      onClick={() => setIsCreateDialogOpen(true)}
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Project
                    </Button>
                    <Button 
                      onClick={() => navigate('/document-upload')}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Documents
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

export default ProjectManagement;