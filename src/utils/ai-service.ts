import { APP_CONSTANTS } from './constants';
import { APIService } from './supabase';
import { aiProviderManager, type AIConfig as ProviderConfig, type DocumentAnalysisRequest, type ChatRequest } from './ai-providers/provider-manager';
import type { Project, Requirement } from '../types';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  projectId?: string;
  context?: {
    documentType?: string;
    requirements?: Requirement[];
    framework?: string;
    analysisType?: 'gap-detection' | 'compliance-check' | 'recommendation' | 'general';
  };
  metadata?: {
    confidence?: number;
    sources?: string[];
    suggestions?: string[];
  };
}

export interface AIAnalysisResult {
  summary: string;
  gaps: Array<{
    requirement: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
    description: string;
    recommendation: string;
    evidence?: string;
  }>;
  recommendations: Array<{
    title: string;
    description: string;
    priority: 'critical' | 'high' | 'medium' | 'low';
    effort: 'low' | 'medium' | 'high';
    impact: string;
  }>;
  complianceScore: number;
  framework: string;
}

export interface AIConfig {
  provider: 'bedrock' | 'openai' | 'claude' | 'local' | 'azure';
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
  privacyMode: boolean;
  region?: string;
  apiKey?: string;
}

export class AIService {
  private static config: AIConfig = {
    provider: 'bedrock',
    model: 'anthropic.claude-3-sonnet-20240229-v1:0',
    temperature: 0.3,
    maxTokens: 2000,
    systemPrompt: `You are a compliance expert AI assistant specializing in document analysis and regulatory requirements. 
    You help organizations identify compliance gaps, provide recommendations, and ensure adherence to various frameworks like SOC 2, ISO 27001, GDPR, HIPAA, and others.
    
    Always provide:
    1. Clear, actionable recommendations
    2. Evidence-based analysis
    3. Risk severity assessments
    4. Implementation guidance
    5. Framework-specific insights
    
    Be precise, professional, and focus on practical solutions.`,
    privacyMode: true,
    region: process.env.AWS_REGION || 'us-east-1'
  };

  private static conversationHistory: Map<string, ChatMessage[]> = new Map();

  static async setConfig(newConfig: Partial<AIConfig>) {
    this.config = { ...this.config, ...newConfig };
    
    // Update the provider manager with new configuration
    if (newConfig.provider || newConfig.model || newConfig.region) {
      const providerConfig: ProviderConfig = {
        provider: this.config.provider as any,
        modelId: this.config.model,
        maxTokens: this.config.maxTokens,
        temperature: this.config.temperature,
        privacyMode: this.config.privacyMode,
        region: this.config.region,
        apiKey: this.config.apiKey
      } as any;

      await aiProviderManager.setProvider(this.config.provider as any, providerConfig);
    }
  }

  static getConfig(): AIConfig {
    return { ...this.config };
  }

  static async analyzeDocument(
    projectId: string,
    documentContent: string,
    framework: string = 'SOC 2',
    analysisType: 'gap-detection' | 'compliance-check' | 'recommendation' = 'gap-detection'
  ): Promise<AIAnalysisResult> {
    if (APP_CONSTANTS.DEMO_MODE) {
      return this.getMockAnalysis(framework, analysisType);
    }

    try {
      const prompt = this.buildAnalysisPrompt(documentContent, framework, analysisType);
      const response = await this.callAIProvider(prompt, projectId);
      return this.parseAnalysisResponse(response);
    } catch (error) {
      console.error('AI Analysis error:', error);
      throw new Error('Failed to analyze document with AI');
    }
  }

  static async chatWithDocuments(
    message: string,
    projectId: string,
    requirements?: Requirement[],
    framework?: string
  ): Promise<ChatMessage> {
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      role: 'user',
      content: message,
      timestamp: new Date(),
      projectId,
      context: { requirements, framework }
    };

    // Add to conversation history
    const history = this.conversationHistory.get(projectId) || [];
    history.push(userMessage);
    this.conversationHistory.set(projectId, history);

    if (APP_CONSTANTS.DEMO_MODE) {
      const response = await this.getMockChatResponse(message, requirements, framework);
      history.push(response);
      this.conversationHistory.set(projectId, history);
      return response;
    }

    try {
      const contextualPrompt = this.buildContextualPrompt(message, history, requirements, framework);
      const aiResponse = await this.callAIProvider(contextualPrompt, projectId);
      
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        projectId,
        context: { requirements, framework, analysisType: 'general' },
        metadata: {
          confidence: 0.9,
          sources: requirements ? requirements.map(r => r.title).slice(0, 3) : []
        }
      };

      history.push(assistantMessage);
      this.conversationHistory.set(projectId, history);
      return assistantMessage;
    } catch (error) {
      console.error('Chat error:', error);
      throw new Error('Failed to get AI response');
    }
  }

  static async detectGaps(
    requirements: Requirement[],
    projectId: string,
    framework: string = 'SOC 2'
  ): Promise<ChatMessage> {
    const nonCompliantReqs = requirements.filter(r => r.status !== 'compliant');
    const criticalGaps = nonCompliantReqs.filter(r => r.priority === 'critical').length;
    const highGaps = nonCompliantReqs.filter(r => r.priority === 'high').length;

    if (APP_CONSTANTS.DEMO_MODE) {
      const gapAnalysis = `## 🔍 Automated Gap Analysis Results

Based on my analysis of your ${framework} requirements, I've identified **${nonCompliantReqs.length}** compliance gaps that need attention:

### 🚨 Critical Issues (${criticalGaps})
${criticalGaps > 0 ? nonCompliantReqs
  .filter(r => r.priority === 'critical')
  .map(r => `- **${r.title}**: ${r.gaps?.[0] || 'Missing implementation evidence'}`)
  .join('\n') : '- None identified ✅'}

### ⚠️ High Priority Issues (${highGaps})
${highGaps > 0 ? nonCompliantReqs
  .filter(r => r.priority === 'high')
  .map(r => `- **${r.title}**: ${r.gaps?.[0] || 'Partial compliance detected'}`)
  .join('\n') : '- None identified ✅'}

### 💡 Recommended Next Steps:
1. **Immediate action required** for critical gaps to ensure compliance
2. **Review documentation** for high-priority items within 30 days
3. **Implement missing controls** based on framework requirements
4. **Schedule regular assessments** to maintain compliance posture

### 📊 Compliance Score: ${Math.round((requirements.filter(r => r.status === 'compliant').length / requirements.length) * 100)}%

Would you like me to provide specific remediation steps for any of these gaps?`;

      return {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: gapAnalysis,
        timestamp: new Date(),
        projectId,
        context: { requirements, framework, analysisType: 'gap-detection' },
        metadata: {
          confidence: 0.95,
          sources: nonCompliantReqs.map(r => r.title).slice(0, 5),
          suggestions: [
            'Show remediation steps for critical gaps',
            'Generate implementation timeline',
            'Export gap analysis report',
            'Schedule compliance review meeting'
          ]
        }
      };
    }

    // Real AI implementation would go here
    return this.chatWithDocuments(
      `Analyze compliance gaps in our ${framework} requirements and provide prioritized remediation recommendations`,
      projectId,
      requirements,
      framework
    );
  }

  static async generateRecommendations(
    requirement: Requirement,
    projectId: string,
    framework: string = 'SOC 2'
  ): Promise<ChatMessage> {
    if (APP_CONSTANTS.DEMO_MODE) {
      const recommendations = `## 💡 Smart Recommendations for "${requirement.title}"

### Current Status: ${requirement.status.toUpperCase()}
**Priority**: ${requirement.priority} | **Category**: ${requirement.category}

### 🎯 Specific Recommendations:

#### 1. **Immediate Actions** (0-30 days)
${requirement.status === 'non-compliant' ? 
  `- Document existing ${requirement.category.toLowerCase()} procedures
- Implement missing ${requirement.title.toLowerCase()} controls
- Assign responsible stakeholder for oversight` :
  `- Review current implementation for optimization
- Update documentation to reflect best practices
- Validate control effectiveness`}

#### 2. **Implementation Guidelines**
- **Documentation**: ${requirement.evidence ? 'Update existing evidence' : 'Create comprehensive documentation'}
- **Testing**: Implement regular validation procedures
- **Monitoring**: Set up continuous compliance monitoring
- **Training**: Ensure staff understands requirements

#### 3. **Success Metrics**
- Compliance status moves to "Compliant"
- Audit evidence is complete and current
- Control testing shows 100% effectiveness
- No findings in future assessments

#### 4. **Framework Alignment** (${framework})
${framework === 'SOC 2' ? 
  'Ensure controls meet SOC 2 Trust Service Criteria and support audit requirements' :
  `Align implementation with ${framework} specific requirements and audit standards`}

### 🔗 Related Requirements
${requirement.recommendations?.length ? 
  requirement.recommendations.map(r => `- ${r}`).join('\n') : 
  '- Review similar controls in the same category\n- Consider dependencies with other requirements'}

**Estimated Implementation Time**: ${requirement.priority === 'critical' ? '1-2 weeks' : requirement.priority === 'high' ? '2-4 weeks' : '1-2 months'}

Would you like me to create a detailed implementation plan or help with documentation templates?`;

      return {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: recommendations,
        timestamp: new Date(),
        projectId,
        context: { requirements: [requirement], framework, analysisType: 'recommendation' },
        metadata: {
          confidence: 0.9,
          sources: [requirement.title],
          suggestions: [
            'Create implementation timeline',
            'Generate documentation template',
            'Show similar requirements',
            'Export recommendation report'
          ]
        }
      };
    }

    return this.chatWithDocuments(
      `Provide detailed implementation recommendations for the requirement "${requirement.title}" with status "${requirement.status}" and priority "${requirement.priority}"`,
      projectId,
      [requirement],
      framework
    );
  }

  static getConversationHistory(projectId: string): ChatMessage[] {
    return this.conversationHistory.get(projectId) || [];
  }

  static clearConversationHistory(projectId: string): void {
    this.conversationHistory.delete(projectId);
  }

  private static buildAnalysisPrompt(
    documentContent: string,
    framework: string,
    analysisType: string
  ): string {
    return `${this.config.systemPrompt}

Analyze the following document for ${framework} compliance:

Document Content:
${documentContent}

Analysis Type: ${analysisType}
Framework: ${framework}

Please provide a detailed analysis including:
1. Compliance gaps identified
2. Risk severity for each gap
3. Specific recommendations
4. Implementation guidance
5. Overall compliance score

Respond in JSON format matching the AIAnalysisResult interface.`;
  }

  private static buildContextualPrompt(
    message: string,
    history: ChatMessage[],
    requirements?: Requirement[],
    framework?: string
  ): string {
    const context = requirements ? 
      `\nCurrent Requirements Context:\n${requirements.map(r => 
        `- ${r.title} (${r.status}, ${r.priority} priority): ${r.description}`
      ).join('\n')}` : '';

    const conversationContext = history.length > 1 ? 
      `\nPrevious Conversation:\n${history.slice(-6).map(msg => 
        `${msg.role}: ${msg.content}`
      ).join('\n')}` : '';

    return `${this.config.systemPrompt}
    
Framework: ${framework || 'General Compliance'}${context}${conversationContext}

User Question: ${message}

Please provide a helpful, accurate response based on the context provided.`;
  }

  private static async callAIProvider(prompt: string, projectId: string): Promise<string> {
    if (this.config.privacyMode && this.config.provider !== 'local') {
      console.warn('Privacy mode enabled but using cloud provider');
    }

    // In demo mode, return mock response
    if (APP_CONSTANTS.DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
      return "This is a mock AI response for demo purposes. In production, this would connect to your configured AI provider.";
    }

    try {
      // Use the modular provider manager
      const response = await aiProviderManager.generateResponse(prompt, { projectId });
      return response.content;
    } catch (error) {
      console.error('AI Provider error:', error);
      
      // Fallback to API service if provider manager fails
      const response = await APIService.callAIProvider({
        provider: this.config.provider,
        model: this.config.model,
        prompt,
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
        projectId
      });

      return response.content;
    }
  }

  private static parseAnalysisResponse(response: string): AIAnalysisResult {
    try {
      return JSON.parse(response);
    } catch {
      // Fallback if response isn't valid JSON
      return {
        summary: response,
        gaps: [],
        recommendations: [],
        complianceScore: 0,
        framework: 'Unknown'
      };
    }
  }

  private static getMockAnalysis(framework: string, analysisType: string): AIAnalysisResult {
    return {
      summary: `Mock analysis for ${framework} compliance using ${analysisType} approach. Document reviewed for regulatory adherence and control effectiveness.`,
      gaps: [
        {
          requirement: 'Multi-factor Authentication',
          severity: 'critical',
          description: 'No evidence of MFA implementation for administrative access',
          recommendation: 'Implement MFA for all privileged accounts within 30 days'
        },
        {
          requirement: 'Data Encryption',
          severity: 'high',
          description: 'Encryption standards not documented',
          recommendation: 'Document encryption protocols and verify implementation'
        }
      ],
      recommendations: [
        {
          title: 'Implement Identity Access Management',
          description: 'Deploy comprehensive IAM solution with role-based access controls',
          priority: 'critical',
          effort: 'high',
          impact: 'Significant improvement in access control compliance'
        }
      ],
      complianceScore: 73,
      framework
    };
  }

  private static async getMockChatResponse(
    message: string,
    requirements?: Requirement[],
    framework?: string
  ): Promise<ChatMessage> {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate thinking time

    let response = '';
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('gap') || lowerMessage.includes('missing')) {
      response = `I've analyzed your compliance requirements and identified several key gaps that need attention:

🚨 **Critical Gaps:**
- Multi-factor authentication not implemented
- Data encryption protocols missing documentation

⚠️ **High Priority:**
- Access control procedures need updating
- Incident response plan requires review

💡 **Recommendations:**
1. Prioritize MFA implementation for all admin accounts
2. Document current encryption standards
3. Schedule quarterly compliance reviews

Would you like me to provide detailed remediation steps for any of these items?`;
    } else if (lowerMessage.includes('implement') || lowerMessage.includes('how')) {
      response = `Here's a step-by-step implementation guide:

## Implementation Approach

### Phase 1: Planning (Week 1-2)
- Assess current state and gaps
- Define requirements and scope
- Identify stakeholders and resources

### Phase 2: Implementation (Week 3-6)
- Deploy necessary controls
- Update documentation
- Train relevant personnel

### Phase 3: Validation (Week 7-8)
- Test control effectiveness
- Gather evidence for compliance
- Prepare for audit validation

**Timeline**: 6-8 weeks depending on complexity
**Resources**: IT team, compliance officer, documentation specialist

Need help with any specific phase or requirement?`;
    } else if (lowerMessage.includes('compliance') || lowerMessage.includes('score')) {
      const score = requirements ? Math.round((requirements.filter(r => r.status === 'compliant').length / requirements.length) * 100) : 75;
      response = `## 📊 Compliance Analysis

**Current Compliance Score**: ${score}%

**Breakdown:**
- ✅ Compliant: ${requirements?.filter(r => r.status === 'compliant').length || 15} requirements
- ⚠️ Partial: ${requirements?.filter(r => r.status === 'partial').length || 8} requirements  
- ❌ Non-compliant: ${requirements?.filter(r => r.status === 'non-compliant').length || 5} requirements

**Framework**: ${framework || 'SOC 2'}

**Priority Actions:**
1. Address critical non-compliant items first
2. Complete partial implementations
3. Maintain compliant controls

The score indicates ${score >= 80 ? 'good' : score >= 60 ? 'fair' : 'poor'} compliance posture. Let me know if you'd like specific improvement recommendations!`;
    } else {
      response = `I'm here to help with your compliance analysis! I can assist with:

🔍 **Gap Analysis**: Identify missing controls and requirements
📋 **Implementation Guidance**: Step-by-step remediation plans  
📊 **Compliance Scoring**: Current posture assessment
📝 **Documentation Help**: Templates and best practices
🎯 **Framework Guidance**: SOC 2, ISO 27001, GDPR, HIPAA, etc.

**Current Context:**
- Framework: ${framework || 'General Compliance'}
- Requirements: ${requirements?.length || 0} items analyzed
- Project: Active compliance assessment

What specific aspect would you like me to help with? You can ask questions like:
- "What compliance gaps need immediate attention?"
- "How do I implement multi-factor authentication?"
- "What's our current compliance score?"`;
    }

    return {
      id: `msg-${Date.now()}-assistant`,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      projectId: 'mock',
      context: { requirements, framework, analysisType: 'general' },
      metadata: {
        confidence: 0.9,
        sources: requirements ? requirements.map(r => r.title).slice(0, 3) : [],
        suggestions: [
          'Show implementation steps',
          'Generate compliance report', 
          'Explain specific requirement',
          'Get remediation timeline'
        ]
      }
    };
  }
}