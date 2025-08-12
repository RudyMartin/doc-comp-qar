/**
 * Enhanced Aurora AI Service
 * Extends the base Aurora service with AI-specific functionality
 * Supports conversation management, AI analysis tracking, and provider configuration
 */

import { AuroraService } from './aurora-service';
import { APP_CONSTANTS } from './constants';
import type { ChatMessage } from './ai-service';
import type { AIConfig } from './ai-providers/provider-manager';

export interface ConversationData {
  id?: string;
  projectId: string;
  userId: string;
  title?: string;
  framework?: string;
  contextType?: 'compliance' | 'gaps' | 'recommendations' | 'general';
  aiProvider?: string;
  aiModel?: string;
  configuration?: any;
  metadata?: any;
}

export interface AIAnalysisResult {
  id?: string;
  projectId: string;
  documentId?: string;
  analysisType: string;
  framework: string;
  aiProvider: string;
  aiModel: string;
  summary?: string;
  gaps?: any[];
  recommendations?: any[];
  complianceScore?: number;
  confidenceScore?: number;
  rawResponse?: string;
  tokenUsage?: any;
  processingTime?: number;
}

export interface AIUsageRecord {
  userId: string;
  projectId?: string;
  aiProvider: string;
  aiModel: string;
  operationType: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costEstimate?: number;
  processingTime?: number;
  success?: boolean;
  errorMessage?: string;
}

export class AuroraAIService extends AuroraService {
  // Chat Conversations Management
  
  static async createConversation(conversationData: ConversationData): Promise<any> {
    if (APP_CONSTANTS.DEMO_MODE) {
      return {
        id: `demo-conv-${Date.now()}`,
        ...conversationData,
        createdAt: new Date().toISOString()
      };
    }

    const sql = `
      INSERT INTO chat_conversations (
        project_id, user_id, title, framework, context_type,
        ai_provider, ai_model, configuration, metadata
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      conversationData.projectId,
      conversationData.userId,
      conversationData.title || 'New AI Conversation',
      conversationData.framework || 'General',
      conversationData.contextType || 'general',
      conversationData.aiProvider || 'bedrock',
      conversationData.aiModel || 'anthropic.claude-3-sonnet-20240229-v1:0',
      JSON.stringify(conversationData.configuration || {}),
      JSON.stringify(conversationData.metadata || {})
    ];

    const result = await this.query(sql, values);
    return result.rows[0];
  }

  static async getConversations(userId: string, projectId?: string): Promise<any[]> {
    if (APP_CONSTANTS.DEMO_MODE) {
      return [
        {
          id: 'demo-conv-1',
          projectId: projectId || 'demo-project',
          userId,
          title: 'SOC 2 Compliance Review',
          framework: 'SOC 2',
          contextType: 'compliance',
          messageCount: 5,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }

    const sql = `
      SELECT 
        cc.*,
        COUNT(cm.id) as message_count
      FROM chat_conversations cc
      LEFT JOIN chat_messages cm ON cc.id = cm.conversation_id
      WHERE cc.user_id = $1 
        ${projectId ? 'AND cc.project_id = $2' : ''}
      GROUP BY cc.id
      ORDER BY cc.updated_at DESC
    `;

    const values = projectId ? [userId, projectId] : [userId];
    const result = await this.query(sql, values);
    return result.rows;
  }

  static async getConversationById(conversationId: string): Promise<any> {
    if (APP_CONSTANTS.DEMO_MODE) {
      return {
        id: conversationId,
        title: 'Demo Conversation',
        framework: 'SOC 2',
        contextType: 'compliance'
      };
    }

    const sql = 'SELECT * FROM chat_conversations WHERE id = $1';
    const result = await this.query(sql, [conversationId]);
    return result.rows[0];
  }

  // Chat Messages Management
  
  static async saveMessage(
    conversationId: string,
    message: ChatMessage,
    tokenUsage?: any,
    processingTime?: number
  ): Promise<any> {
    if (APP_CONSTANTS.DEMO_MODE) {
      return {
        id: `demo-msg-${Date.now()}`,
        conversationId,
        ...message,
        tokenUsage,
        processingTime
      };
    }

    const sql = `
      INSERT INTO chat_messages (
        conversation_id, role, content, context, metadata,
        token_usage, processing_time, ai_provider, ai_model
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      conversationId,
      message.role,
      message.content,
      JSON.stringify(message.context || {}),
      JSON.stringify(message.metadata || {}),
      JSON.stringify(tokenUsage || {}),
      processingTime || null,
      message.context?.aiProvider || null,
      message.context?.aiModel || null
    ];

    const result = await this.query(sql, values);
    
    // Update conversation timestamp
    await this.query(
      'UPDATE chat_conversations SET updated_at = NOW() WHERE id = $1',
      [conversationId]
    );

    return result.rows[0];
  }

  static async getConversationMessages(
    conversationId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<any[]> {
    if (APP_CONSTANTS.DEMO_MODE) {
      return [
        {
          id: 'demo-msg-1',
          conversationId,
          role: 'user',
          content: 'What are the critical compliance gaps in our SOC 2 assessment?',
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'demo-msg-2',
          conversationId,
          role: 'assistant',
          content: 'Based on my analysis, I\'ve identified 3 critical gaps...',
          createdAt: new Date().toISOString()
        }
      ];
    }

    const sql = `
      SELECT * FROM chat_messages 
      WHERE conversation_id = $1 
      ORDER BY created_at ASC
      LIMIT $2 OFFSET $3
    `;

    const result = await this.query(sql, [conversationId, limit, offset]);
    return result.rows;
  }

  // AI Analysis Results Management
  
  static async saveAnalysisResult(analysisData: AIAnalysisResult): Promise<any> {
    if (APP_CONSTANTS.DEMO_MODE) {
      return {
        id: `demo-analysis-${Date.now()}`,
        ...analysisData,
        createdAt: new Date().toISOString()
      };
    }

    const sql = `
      INSERT INTO ai_analysis_results (
        project_id, document_id, analysis_type, framework,
        ai_provider, ai_model, summary, gaps, recommendations,
        compliance_score, confidence_score, raw_response,
        token_usage, processing_time
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;

    const values = [
      analysisData.projectId,
      analysisData.documentId || null,
      analysisData.analysisType,
      analysisData.framework,
      analysisData.aiProvider,
      analysisData.aiModel,
      analysisData.summary || null,
      JSON.stringify(analysisData.gaps || []),
      JSON.stringify(analysisData.recommendations || []),
      analysisData.complianceScore || null,
      analysisData.confidenceScore || null,
      analysisData.rawResponse || null,
      JSON.stringify(analysisData.tokenUsage || {}),
      analysisData.processingTime || null
    ];

    const result = await this.query(sql, values);
    return result.rows[0];
  }

  static async getAnalysisResults(
    projectId: string,
    analysisType?: string,
    framework?: string
  ): Promise<any[]> {
    if (APP_CONSTANTS.DEMO_MODE) {
      return [
        {
          id: 'demo-analysis-1',
          projectId,
          analysisType: analysisType || 'compliance',
          framework: framework || 'SOC 2',
          complianceScore: 78,
          confidenceScore: 0.92,
          createdAt: new Date().toISOString()
        }
      ];
    }

    let sql = `
      SELECT * FROM ai_analysis_results 
      WHERE project_id = $1
    `;
    const values = [projectId];

    if (analysisType) {
      sql += ` AND analysis_type = $${values.length + 1}`;
      values.push(analysisType);
    }

    if (framework) {
      sql += ` AND framework = $${values.length + 1}`;
      values.push(framework);
    }

    sql += ` ORDER BY created_at DESC`;

    const result = await this.query(sql, values);
    return result.rows;
  }

  // AI Provider Configuration Management
  
  static async saveProviderConfig(
    userId: string,
    providerType: string,
    configuration: any,
    isActive: boolean = false,
    isDefault: boolean = false
  ): Promise<any> {
    if (APP_CONSTANTS.DEMO_MODE) {
      return {
        id: `demo-config-${Date.now()}`,
        userId,
        providerType,
        configuration,
        isActive,
        isDefault
      };
    }

    const sql = `
      INSERT INTO ai_provider_configs (
        user_id, provider_type, configuration, is_active, is_default
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id, provider_type) 
      DO UPDATE SET 
        configuration = EXCLUDED.configuration,
        is_active = EXCLUDED.is_active,
        is_default = EXCLUDED.is_default,
        updated_at = NOW()
      RETURNING *
    `;

    const values = [
      userId,
      providerType,
      JSON.stringify(configuration),
      isActive,
      isDefault
    ];

    const result = await this.query(sql, values);
    return result.rows[0];
  }

  static async getProviderConfigs(userId: string): Promise<any[]> {
    if (APP_CONSTANTS.DEMO_MODE) {
      return [
        {
          id: 'demo-config-1',
          userId,
          providerType: 'bedrock',
          configuration: {
            region: 'us-east-1',
            modelId: 'anthropic.claude-3-sonnet-20240229-v1:0'
          },
          isActive: true,
          isDefault: true
        }
      ];
    }

    const sql = `
      SELECT * FROM ai_provider_configs 
      WHERE user_id = $1 
      ORDER BY is_default DESC, is_active DESC, created_at DESC
    `;

    const result = await this.query(sql, [userId]);
    return result.rows;
  }

  static async getActiveProviderConfig(userId: string): Promise<any> {
    if (APP_CONSTANTS.DEMO_MODE) {
      return {
        providerType: 'bedrock',
        configuration: {
          region: 'us-east-1',
          modelId: 'anthropic.claude-3-sonnet-20240229-v1:0'
        }
      };
    }

    const sql = `
      SELECT * FROM ai_provider_configs 
      WHERE user_id = $1 AND is_active = true 
      ORDER BY is_default DESC
      LIMIT 1
    `;

    const result = await this.query(sql, [userId]);
    return result.rows[0];
  }

  // AI Usage Tracking
  
  static async trackUsage(usageData: AIUsageRecord): Promise<any> {
    if (APP_CONSTANTS.DEMO_MODE) {
      return {
        id: `demo-usage-${Date.now()}`,
        ...usageData,
        costEstimate: (usageData.totalTokens * 0.000015), // Mock cost calculation
        createdAt: new Date().toISOString()
      };
    }

    const sql = `
      SELECT track_ai_usage($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `;

    const values = [
      usageData.userId,
      usageData.projectId || null,
      usageData.aiProvider,
      usageData.aiModel,
      usageData.operationType,
      usageData.promptTokens,
      usageData.completionTokens,
      usageData.processingTime || null,
      usageData.success !== false,
      usageData.errorMessage || null
    ];

    const result = await this.query(sql, values);
    return { id: result.rows[0].track_ai_usage };
  }

  static async getUsageStats(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<any> {
    if (APP_CONSTANTS.DEMO_MODE) {
      return {
        totalRequests: 45,
        totalTokens: 12750,
        totalCost: 0.85,
        avgProcessingTime: 1250,
        providerBreakdown: {
          bedrock: { requests: 35, tokens: 9800, cost: 0.65 },
          openai: { requests: 10, tokens: 2950, cost: 0.20 }
        }
      };
    }

    const sql = `
      SELECT 
        COUNT(*) as total_requests,
        SUM(total_tokens) as total_tokens,
        SUM(cost_estimate) as total_cost,
        AVG(processing_time) as avg_processing_time,
        ai_provider,
        COUNT(*) as provider_requests,
        SUM(total_tokens) as provider_tokens,
        SUM(cost_estimate) as provider_cost
      FROM ai_usage_tracking 
      WHERE user_id = $1
        ${startDate ? 'AND created_at >= $2' : ''}
        ${endDate ? `AND created_at <= $${startDate ? '3' : '2'}` : ''}
      GROUP BY ai_provider
      ORDER BY provider_cost DESC
    `;

    const values = [userId];
    if (startDate) values.push(startDate);
    if (endDate) values.push(endDate);

    const result = await this.query(sql, values);
    return this.formatUsageStats(result.rows);
  }

  private static formatUsageStats(rows: any[]): any {
    if (rows.length === 0) {
      return {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: 0,
        avgProcessingTime: 0,
        providerBreakdown: {}
      };
    }

    const totals = rows.reduce((acc, row) => ({
      totalRequests: acc.totalRequests + parseInt(row.provider_requests),
      totalTokens: acc.totalTokens + parseInt(row.provider_tokens || 0),
      totalCost: acc.totalCost + parseFloat(row.provider_cost || 0),
      avgProcessingTime: acc.avgProcessingTime + parseFloat(row.avg_processing_time || 0)
    }), { totalRequests: 0, totalTokens: 0, totalCost: 0, avgProcessingTime: 0 });

    totals.avgProcessingTime = totals.avgProcessingTime / rows.length;

    const providerBreakdown = rows.reduce((acc, row) => {
      acc[row.ai_provider] = {
        requests: parseInt(row.provider_requests),
        tokens: parseInt(row.provider_tokens || 0),
        cost: parseFloat(row.provider_cost || 0)
      };
      return acc;
    }, {});

    return {
      ...totals,
      providerBreakdown
    };
  }

  // Requirements AI Analysis
  
  static async saveRequirementAnalysis(
    requirementId: string,
    aiProvider: string,
    aiModel: string,
    analysisData: any
  ): Promise<any> {
    if (APP_CONSTANTS.DEMO_MODE) {
      return {
        id: `demo-req-analysis-${Date.now()}`,
        requirementId,
        aiProvider,
        aiModel,
        ...analysisData
      };
    }

    const sql = `
      INSERT INTO requirements_ai_analysis (
        requirement_id, ai_provider, ai_model, analysis_type,
        confidence_score, ai_status, ai_priority, ai_gaps,
        ai_recommendations, ai_evidence, raw_analysis
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;

    const values = [
      requirementId,
      aiProvider,
      aiModel,
      analysisData.analysisType || 'gap_detection',
      analysisData.confidenceScore || null,
      analysisData.aiStatus || null,
      analysisData.aiPriority || null,
      JSON.stringify(analysisData.aiGaps || []),
      JSON.stringify(analysisData.aiRecommendations || []),
      analysisData.aiEvidence || null,
      analysisData.rawAnalysis || null
    ];

    const result = await this.query(sql, values);
    return result.rows[0];
  }

  static async getRequirementAnalysis(requirementId: string): Promise<any[]> {
    if (APP_CONSTANTS.DEMO_MODE) {
      return [
        {
          id: 'demo-req-analysis-1',
          requirementId,
          aiProvider: 'bedrock',
          aiModel: 'anthropic.claude-3-sonnet-20240229-v1:0',
          analysisType: 'gap_detection',
          confidenceScore: 0.89,
          aiStatus: 'non-compliant',
          aiPriority: 'high',
          createdAt: new Date().toISOString()
        }
      ];
    }

    const sql = `
      SELECT * FROM requirements_ai_analysis 
      WHERE requirement_id = $1 
      ORDER BY created_at DESC
    `;

    const result = await this.query(sql, [requirementId]);
    return result.rows;
  }

  // Document Processing for AI
  
  static async markDocumentProcessed(
    documentId: string,
    processingStatus: string,
    extractedText?: string,
    aiSummary?: string
  ): Promise<any> {
    if (APP_CONSTANTS.DEMO_MODE) {
      return { success: true, documentId };
    }

    const sql = `
      UPDATE documents 
      SET 
        ai_processed = $2,
        ai_processing_status = $3,
        extracted_text = $4,
        ai_summary = $5,
        updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const values = [
      documentId,
      processingStatus === 'completed',
      processingStatus,
      extractedText || null,
      aiSummary || null
    ];

    const result = await this.query(sql, values);
    return result.rows[0];
  }

  // Database Health and Monitoring
  
  static async getAIServiceHealth(): Promise<any> {
    if (APP_CONSTANTS.DEMO_MODE) {
      return {
        database: 'healthy',
        aiTables: 'ready',
        conversationsCount: 15,
        messagesCount: 187,
        analysisResultsCount: 42,
        usageRecordsCount: 203
      };
    }

    const sql = `
      SELECT 
        (SELECT COUNT(*) FROM chat_conversations) as conversations_count,
        (SELECT COUNT(*) FROM chat_messages) as messages_count,
        (SELECT COUNT(*) FROM ai_analysis_results) as analysis_results_count,
        (SELECT COUNT(*) FROM ai_usage_tracking) as usage_records_count,
        (SELECT COUNT(*) FROM ai_provider_configs) as provider_configs_count
    `;

    const result = await this.query(sql);
    return {
      database: 'healthy',
      aiTables: 'ready',
      ...result.rows[0]
    };
  }
}