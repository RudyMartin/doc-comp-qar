import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Textarea } from '../../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../components/ui/dialog';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { 
  Send, 
  Bot, 
  User, 
  Brain, 
  Lightbulb, 
  Search, 
  Settings, 
  Download,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Zap,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Sparkles,
  MessageSquare,
  Loader2
} from 'lucide-react';
import { AIService, type ChatMessage, type AIConfig } from '../utils/ai-service';
import { APIService } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { mockRequirements } from '../utils/mockData';
import type { Project, Requirement } from '../types';

const AskAI: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiConfig, setAiConfig] = useState<AIConfig>(AIService.getConfig());
  const [showSettings, setShowSettings] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState('SOC 2');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadProjects();
    loadInitialMessage();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      loadRequirements(selectedProject.id);
      loadConversationHistory(selectedProject.id);
    }
  }, [selectedProject]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadProjects = async () => {
    try {
      const response = await APIService.getProjects();
      const projectList = response.projects || [];
      setProjects(projectList);
      
      if (projectList.length > 0) {
        setSelectedProject(projectList[0]);
      }
    } catch (err) {
      setError('Failed to load projects');
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

  const loadConversationHistory = (projectId: string) => {
    const history = AIService.getConversationHistory(projectId);
    setMessages(history);
  };

  const loadInitialMessage = () => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content: `# 🤖 Welcome to AI Compliance Assistant!

I'm here to help you with intelligent compliance analysis and recommendations. I can assist with:

## 🎯 **What I can do:**
- **Gap Analysis**: Identify missing controls and compliance issues
- **Smart Recommendations**: Provide specific, actionable improvement suggestions  
- **Framework Guidance**: Help with SOC 2, ISO 27001, GDPR, HIPAA, and more
- **Document Analysis**: Review policies and procedures for compliance
- **Implementation Planning**: Create step-by-step remediation guides

## 💡 **Try asking me:**
- *"What are the critical compliance gaps in our current assessment?"*
- *"How do I implement multi-factor authentication for SOC 2?"*
- *"What's our current compliance score and how can we improve it?"*
- *"Generate recommendations for requirement [specific requirement]"*
- *"Show me implementation steps for access control policies"*

**Current Context**: ${selectedProject?.name || 'No project selected'}
**Framework**: ${selectedFramework}
**Requirements**: ${requirements.length} items loaded

Select a project and start asking questions about your compliance requirements!`,
      timestamp: new Date(),
      context: {
        analysisType: 'general'
      }
    };

    setMessages([welcomeMessage]);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    if (!selectedProject) {
      setError('Please select a project first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await AIService.chatWithDocuments(
        inputMessage,
        selectedProject.id,
        requirements,
        selectedFramework
      );

      setMessages(prev => [...prev, response]);
      setInputMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI response');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickAction = async (action: string) => {
    if (!selectedProject) {
      setError('Please select a project first');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let response: ChatMessage;

      switch (action) {
        case 'gap-analysis':
          response = await AIService.detectGaps(requirements, selectedProject.id, selectedFramework);
          break;
        case 'compliance-score':
          response = await AIService.chatWithDocuments(
            'What is our current compliance score and how can we improve it?',
            selectedProject.id,
            requirements,
            selectedFramework
          );
          break;
        case 'critical-issues':
          response = await AIService.chatWithDocuments(
            'Show me all critical and high priority compliance issues that need immediate attention',
            selectedProject.id,
            requirements.filter(r => ['critical', 'high'].includes(r.priority)),
            selectedFramework
          );
          break;
        case 'recommendations':
          response = await AIService.chatWithDocuments(
            'Provide top 5 recommendations to improve our compliance posture',
            selectedProject.id,
            requirements,
            selectedFramework
          );
          break;
        default:
          return;
      }

      setMessages(prev => [...prev, response]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to perform analysis');
    } finally {
      setIsLoading(false);
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const clearConversation = () => {
    if (selectedProject) {
      AIService.clearConversationHistory(selectedProject.id);
      setMessages([]);
      loadInitialMessage();
    }
  };

  const updateAIConfig = (config: Partial<AIConfig>) => {
    const newConfig = { ...aiConfig, ...config };
    setAiConfig(newConfig);
    AIService.setConfig(newConfig);
  };

  const getMessageIcon = (role: string) => {
    switch (role) {
      case 'user':
        return <User className="h-6 w-6" />;
      case 'assistant':
        return <Bot className="h-6 w-6" />;
      default:
        return <MessageSquare className="h-6 w-6" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'non-compliant':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'partial':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const complianceMetrics = {
    total: requirements.length,
    compliant: requirements.filter(r => r.status === 'compliant').length,
    critical: requirements.filter(r => r.priority === 'critical' && r.status !== 'compliant').length,
    score: requirements.length > 0 ? Math.round((requirements.filter(r => r.status === 'compliant').length / requirements.length) * 100) : 0
  };

  return (
    <Layout title="Ask AI">
      <div className="flex h-full bg-gray-50">
        {/* Sidebar - Context Panel */}
        <div className="w-80 bg-white border-r flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold text-gray-900 mb-4">Context & Settings</h2>
            
            {/* Project Selection */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Project</label>
              <Select 
                value={selectedProject?.id || ''} 
                onValueChange={(value) => {
                  const project = projects.find(p => p.id === value);
                  setSelectedProject(project || null);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projects.map((project) => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Framework Selection */}
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Framework</label>
              <Select value={selectedFramework} onValueChange={setSelectedFramework}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOC 2">SOC 2</SelectItem>
                  <SelectItem value="ISO 27001">ISO 27001</SelectItem>
                  <SelectItem value="GDPR">GDPR</SelectItem>
                  <SelectItem value="HIPAA">HIPAA</SelectItem>
                  <SelectItem value="PCI DSS">PCI DSS</SelectItem>
                  <SelectItem value="NIST CSF">NIST CSF</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Dialog open={showSettings} onOpenChange={setShowSettings}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Settings className="h-4 w-4 mr-2" />
                  AI Settings
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>AI Configuration</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Provider</label>
                    <Select value={aiConfig.provider} onValueChange={(value: any) => updateAIConfig({ provider: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="claude">Claude</SelectItem>
                        <SelectItem value="local">Local Model</SelectItem>
                        <SelectItem value="azure">Azure AI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Model</label>
                    <Input
                      value={aiConfig.model}
                      onChange={(e) => updateAIConfig({ model: e.target.value })}
                      placeholder="gpt-4, claude-3, etc."
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={aiConfig.privacyMode}
                      onChange={(e) => updateAIConfig({ privacyMode: e.target.checked })}
                    />
                    <label className="text-sm">Privacy Mode (Local Processing)</label>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Quick Stats */}
          {selectedProject && (
            <div className="p-4 border-b">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Compliance Overview</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Compliance Score</span>
                  <Badge className={`${complianceMetrics.score >= 80 ? 'bg-green-100 text-green-800' : 
                    complianceMetrics.score >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                    {complianceMetrics.score}%
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Requirements</span>
                  <span className="text-sm font-medium">{complianceMetrics.total}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Compliant</span>
                  <span className="text-sm font-medium text-green-600">{complianceMetrics.compliant}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Critical Issues</span>
                  <span className="text-sm font-medium text-red-600">{complianceMetrics.critical}</span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleQuickAction('gap-analysis')}
                disabled={isLoading}
              >
                <Search className="h-4 w-4 mr-2" />
                Analyze Gaps
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleQuickAction('critical-issues')}
                disabled={isLoading}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Critical Issues
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleQuickAction('recommendations')}
                disabled={isLoading}
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Get Recommendations
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => handleQuickAction('compliance-score')}
                disabled={isLoading}
              >
                <Shield className="h-4 w-4 mr-2" />
                Compliance Score
              </Button>
            </div>
          </div>

          {/* Recent Requirements */}
          <div className="p-4 flex-1 overflow-y-auto">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Requirements</h3>
            <div className="space-y-2">
              {requirements.slice(0, 10).map((req) => (
                <div key={req.id} className="p-2 bg-gray-50 rounded text-xs">
                  <div className="flex items-center space-x-2 mb-1">
                    {getStatusIcon(req.status)}
                    <span className="font-medium truncate">{req.title}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Badge className={`text-xs ${req.priority === 'critical' ? 'bg-red-100 text-red-700' : 
                      req.priority === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                      {req.priority}
                    </Badge>
                    <span className="text-gray-500">{req.category}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white border-b p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">AI Compliance Assistant</h1>
                  <p className="text-sm text-gray-600">
                    {selectedProject ? `Analyzing ${selectedProject.name}` : 'Select a project to start'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {aiConfig.provider} • {aiConfig.privacyMode ? 'Private' : 'Cloud'}
                </Badge>
                <Button variant="ghost" size="sm" onClick={clearConversation}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="m-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex space-x-3 max-w-4xl ${message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                  }`}>
                    {getMessageIcon(message.role)}
                  </div>
                  
                  <div className={`rounded-lg p-4 ${
                    message.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    <div className="prose prose-sm max-w-none">
                      {message.content.includes('#') || message.content.includes('*') ? (
                        <div className="whitespace-pre-wrap">
                          {message.content.split('\n').map((line, i) => {
                            if (line.startsWith('# ')) {
                              return <h1 key={i} className="text-lg font-bold mb-2 text-gray-900">{line.substring(2)}</h1>;
                            } else if (line.startsWith('## ')) {
                              return <h2 key={i} className="text-base font-semibold mb-2 text-gray-800">{line.substring(3)}</h2>;
                            } else if (line.startsWith('### ')) {
                              return <h3 key={i} className="text-sm font-medium mb-1 text-gray-700">{line.substring(4)}</h3>;
                            } else if (line.startsWith('- ')) {
                              return <li key={i} className="ml-4 text-sm text-gray-600">{line.substring(2)}</li>;
                            } else if (line.trim().startsWith('*') && line.trim().endsWith('*')) {
                              return <p key={i} className="italic text-sm text-gray-600">{line}</p>;
                            } else if (line.includes('**')) {
                              const parts = line.split('**');
                              return (
                                <p key={i} className="text-sm text-gray-700">
                                  {parts.map((part, j) => 
                                    j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                                  )}
                                </p>
                              );
                            } else {
                              return line.trim() ? <p key={i} className="text-sm text-gray-700">{line}</p> : <br key={i} />;
                            }
                          })}
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    
                    {message.role === 'assistant' && (
                      <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-2">
                          {message.metadata?.confidence && (
                            <Badge variant="outline" className="text-xs">
                              {Math.round(message.metadata.confidence * 100)}% confident
                            </Badge>
                          )}
                          {message.context?.framework && (
                            <Badge variant="outline" className="text-xs">
                              {message.context.framework}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => copyMessage(message.content)}>
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ThumbsUp className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <ThumbsDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {message.metadata?.suggestions && message.metadata.suggestions.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 mb-2">💡 Suggested follow-ups:</p>
                        <div className="flex flex-wrap gap-1">
                          {message.metadata.suggestions.map((suggestion, i) => (
                            <Button
                              key={i}
                              variant="outline"
                              size="sm"
                              className="text-xs h-6"
                              onClick={() => setInputMessage(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex space-x-3 max-w-4xl">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                    <Bot className="h-6 w-6" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-gray-600">Analyzing compliance data...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="bg-white border-t p-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <Textarea
                  ref={inputRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about compliance requirements, gaps, or recommendations..."
                  className="min-h-[60px] resize-none"
                  disabled={isLoading}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading || !selectedProject}
                className="px-6"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Sparkles className="h-3 w-3" />
                <span>Press Enter to send, Shift+Enter for new line</span>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-xs">
                  {requirements.length} requirements loaded
                </Badge>
                {selectedProject && (
                  <Badge variant="outline" className="text-xs">
                    {selectedFramework} framework
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AskAI;