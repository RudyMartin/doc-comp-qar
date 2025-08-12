import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { mockMetrics, mockComplianceData, mockTrendData } from '../utils/mockData';
import { APIService } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Plus, ArrowRight, Upload, FileText, CheckSquare } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import type { Project, Activity } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [reportsResponse, activitiesResponse] = await Promise.all([
        APIService.getProjects(), // Using same API but treating as reports
        APIService.getActivities()
      ]);

      setProjects(reportsResponse.projects || []); // Still using projects state for compatibility
      setActivities(activitiesResponse.activities || []);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'on-hold': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate metrics from real data
  const calculateMetrics = () => {
    const totalReports = projects.length;
    const activeReports = projects.filter(p => p.status === 'active').length;
    const avgQualityScore = totalReports > 0 
      ? Math.round(projects.reduce((sum, p) => sum + (p.compliance || 0), 0) / totalReports)
      : 0;

    return [
      {
        title: 'Avg Quality Score',
        value: `${avgQualityScore}%`,
        change: '+5%',
        changeType: 'positive' as const,
        icon: 'Shield',
        color: 'text-green-600'
      },
      {
        title: 'Active Reports',
        value: activeReports.toString(),
        change: '+3',
        changeType: 'positive' as const,
        icon: 'BookOpen',
        color: 'text-blue-600'
      },
      {
        title: 'Total Reports',
        value: totalReports.toString(),
        change: '+2',
        changeType: 'positive' as const,
        icon: 'BarChart3',
        color: 'text-purple-600'
      },
      {
        title: 'Recent Activities',
        value: activities.length.toString(),
        change: '+5',
        changeType: 'positive' as const,
        icon: 'Activity',
        color: 'text-indigo-600'
      }
    ];
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="p-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-600">Error loading dashboard: {error}</p>
              <button 
                onClick={loadDashboardData}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Retry
              </button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="p-6 space-y-6">
        {/* Welcome Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-blue-900 mb-2">
                Welcome back, {user?.name || 'User'}!
              </h2>
              <p className="text-blue-700">
                Here's an overview of your QC reports and document analysis activities.
              </p>
            </div>
            <div className="flex space-x-3">
              <Button 
                onClick={() => navigate('/document-upload')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Report
              </Button>
            </div>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((metric, index) => {
            const IconComponent = (LucideIcons as any)[metric.icon];
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <IconComponent className={`h-4 w-4 ${metric.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metric.value}</div>
                  {metric.change && (
                    <p className={`text-xs ${metric.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change} from last month
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        {projects.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button 
                  onClick={() => navigate('/requirements-checklist')}
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-blue-50 hover:border-blue-300"
                >
                  <CheckSquare className="h-6 w-6" />
                  <span>Check Requirements</span>
                </Button>
                
                <Button 
                  onClick={() => navigate('/compliance')}
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-green-50 hover:border-green-300"
                >
                  <FileText className="h-6 w-6" />
                  <span>Review Suggestions</span>
                </Button>
                
                <Button 
                  onClick={() => navigate('/compliance-report')}
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-orange-50 hover:border-orange-300"
                >
                  <BarChart3 className="h-6 w-6" />
                  <span>View QC Report</span>
                </Button>
                
                <Button 
                  onClick={() => navigate('/document-upload')}
                  variant="outline" 
                  className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-300"
                >
                  <Upload className="h-6 w-6" />
                  <span>Upload Document</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Compliance Overview Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockComplianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="compliant" stackId="a" fill="#10B981" />
                  <Bar dataKey="partial" stackId="a" fill="#F59E0B" />
                  <Bar dataKey="nonCompliant" stackId="a" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Compliance Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="compliance" stroke="#3B82F6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.length > 0 ? (
                  activities.slice(0, 5).map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <div className="w-3 h-3 bg-blue-600 rounded-full" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          {activity.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400">
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No recent activities yet.</p>
                    <Button 
                      onClick={() => navigate('/document-upload')}
                      size="sm"
                      variant="outline"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Your First Report
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Your QC Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projects.length > 0 ? (
                  projects.slice(0, 5).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-blue-300 hover:bg-blue-50 cursor-pointer transition-all group"
                         onClick={() => navigate('/report-library')}>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 group-hover:text-blue-700">{project.name}</h4>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(project.status)}>
                              {project.status}
                            </Badge>
                            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600" />
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{project.assignee}</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={project.progress || project.compliance} className="flex-1" />
                          <span className="text-sm text-gray-500">
                            Quality Score: {project.progress || project.compliance}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-4">No reports yet.</p>
                    <Button 
                      onClick={() => navigate('/document-upload')}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Report
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;