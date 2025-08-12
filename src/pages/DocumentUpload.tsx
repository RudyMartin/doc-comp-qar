import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { Upload, FileText, X, CheckCircle, AlertCircle, ArrowRight, Eye, BarChart3, BookOpen } from 'lucide-react';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { APIService } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
// Simple drag and drop implementation without external dependencies

interface FileUpload {
  id: string;
  file: File;
  type: 'policy' | 'program';
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
}

const DocumentUpload: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [uploads, setUploads] = useState<FileUpload[]>([]);
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [currentReportId, setCurrentReportId] = useState<string | null>(null);
  const [isCreatingReport, setIsCreatingReport] = useState(false);
  const [error, setError] = useState('');
  const [analysisComplete, setAnalysisComplete] = useState(false);

  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
      return validTypes.includes(file.type) || file.name.match(/\.(pdf|doc|docx|txt)$/i);
    });

    const newUploads: FileUpload[] = validFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: 'policy',
      status: 'pending',
      progress: 0
    }));
    
    setUploads(prev => [...prev, ...newUploads]);
  }, []);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newUploads: FileUpload[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      type: 'policy',
      status: 'pending',
      progress: 0
    }));
    
    setUploads(prev => [...prev, ...newUploads]);
  };

  const updateFileType = (id: string, type: 'policy' | 'program') => {
    setUploads(prev => prev.map(upload => 
      upload.id === id ? { ...upload, type } : upload
    ));
  };

  const removeFile = (id: string) => {
    setUploads(prev => prev.filter(upload => upload.id !== id));
  };

  const createReport = async () => {
    if (!reportName.trim()) {
      setError('Report name is required');
      return null;
    }

    try {
      setIsCreatingReport(true);
      setError('');
      
      const response = await APIService.createProject({
        name: reportName,
        description: reportDescription,
        documentType: documentType || 'Quality Assessment'
      });

      setCurrentReportId(response.project.id);
      return response.project.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create report');
      return null;
    } finally {
      setIsCreatingReport(false);
    }
  };

  const uploadFile = async (upload: FileUpload, reportId: string) => {
    try {
      setUploads(prev => prev.map(u => 
        u.id === upload.id ? { ...u, status: 'uploading', progress: 0 } : u
      ));

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploads(prev => prev.map(u => {
          if (u.id === upload.id && u.status === 'uploading' && u.progress < 90) {
            return { ...u, progress: u.progress + 20 };
          }
          return u;
        }));
      }, 200);

      const response = await APIService.uploadDocument(
        upload.file, 
        reportId, 
        upload.type
      );

      clearInterval(progressInterval);
      
      setUploads(prev => prev.map(u => 
        u.id === upload.id ? { ...u, status: 'completed', progress: 100 } : u
      ));

      return response;
    } catch (err) {
      setUploads(prev => prev.map(u => 
        u.id === upload.id ? { ...u, status: 'error', progress: 0 } : u
      ));
      throw err;
    }
  };

  const startAnalysis = async () => {
    try {
      setError('');
      
      // Create report if not exists
      let reportId = currentReportId;
      if (!reportId) {
        reportId = await createReport();
        if (!reportId) return;
      }

      // Upload all pending files
      const pendingUploads = uploads.filter(u => u.status === 'pending');
      
      for (const upload of pendingUploads) {
        try {
          await uploadFile(upload, reportId);
        } catch (err) {
          console.error(`Failed to upload ${upload.file.name}:`, err);
        }
      }

      // Mark analysis as complete after all files are uploaded
      const allCompleted = uploads.every(u => u.status === 'completed');
      if (allCompleted || uploads.filter(u => u.status === 'completed').length > 0) {
        setAnalysisComplete(true);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start analysis');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'uploading': return 'bg-blue-100 text-blue-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Layout title="Document Upload">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Report Information */}
        <Card>
          <CardHeader>
            <CardTitle>QC Report Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter report name"
                />
              </div>
              <div>
                <Label htmlFor="document-type">Document Type</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">Contract Review</SelectItem>
                    <SelectItem value="policy">Policy Analysis</SelectItem>
                    <SelectItem value="sop">SOP Assessment</SelectItem>
                    <SelectItem value="manual">Manual Review</SelectItem>
                    <SelectItem value="agreement">Agreement Analysis</SelectItem>
                    <SelectItem value="other">Other Document</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="report-description">Description (Optional)</Label>
              <Textarea
                id="report-description"
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe the purpose and scope of this quality assessment"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* File Upload */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Documents</CardTitle>
            <p className="text-sm text-muted-foreground">
              Upload your documents for quality control analysis and get suggestions for improvement. Supported formats: PDF, DOC, DOCX, TXT
            </p>
          </CardHeader>
          <CardContent>
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input 
                id="file-input"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              {isDragActive ? (
                <p className="text-blue-600">Drop the files here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag & drop files here, or click to select files
                  </p>
                  <p className="text-sm text-gray-400">
                    Maximum file size: 50MB per file
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Uploaded Files */}
        {uploads.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Files ({uploads.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {uploads.map((upload) => (
                  <div key={upload.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{upload.file.name}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(upload.status)}>
                            {upload.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(upload.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{(upload.file.size / 1024 / 1024).toFixed(2)} MB</span>
                        <Select
                          value={upload.type}
                          onValueChange={(value: 'policy' | 'program') => updateFileType(upload.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="policy">Policy</SelectItem>
                            <SelectItem value="program">Program</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {upload.status === 'uploading' && (
                        <div className="mt-2">
                          <Progress value={upload.progress} className="w-full" />
                          <p className="text-xs text-gray-500 mt-1">{upload.progress}% uploaded</p>
                        </div>
                      )}
                      {upload.status === 'completed' && (
                        <div className="mt-2 flex items-center text-green-600">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          <span className="text-sm">Upload complete</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-end space-x-4">
                <Button variant="outline" onClick={() => setUploads([])}>
                  Clear All
                </Button>
                <Button 
                  onClick={startAnalysis} 
                  disabled={uploads.length === 0 || isCreatingReport || !reportName.trim()}
                >
                  {isCreatingReport ? 'Creating Report...' : 'Start QC Analysis'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analysis Complete - Next Steps */}
        {analysisComplete && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center text-green-800">
                <CheckCircle className="h-5 w-5 mr-2" />
                QC Analysis Complete!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700 mb-6">
                Your documents have been successfully analyzed. Follow the workflow to complete your QC report.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Button 
                  onClick={() => navigate('/requirements-checklist')}
                  className="flex items-center justify-center space-x-2 h-auto py-4"
                  variant="outline"
                >
                  <CheckSquare className="h-5 w-5" />
                  <div className="text-left">
                    <div>Check Requirements</div>
                    <div className="text-sm opacity-75">Step 1</div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
                
                <Button 
                  onClick={() => navigate('/compliance')}
                  className="flex items-center justify-center space-x-2 h-auto py-4"
                  variant="outline"
                >
                  <Eye className="h-5 w-5" />
                  <div className="text-left">
                    <div>Review Suggestions</div>
                    <div className="text-sm opacity-75">Step 2</div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <Button 
                  onClick={() => navigate('/compliance-report')}
                  className="flex items-center justify-center space-x-2 h-auto py-4"
                  variant="outline"
                >
                  <BarChart3 className="h-5 w-5" />
                  <div className="text-left">
                    <div>Your QC Report</div>
                    <div className="text-sm opacity-75">Step 3</div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>

                <Button 
                  onClick={() => navigate('/report-library')}
                  className="flex items-center justify-center space-x-2 h-auto py-4"
                  variant="outline"
                >
                  <BookOpen className="h-5 w-5" />
                  <div className="text-left">
                    <div>Report Library</div>
                    <div className="text-sm opacity-75">View All</div>
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default DocumentUpload;