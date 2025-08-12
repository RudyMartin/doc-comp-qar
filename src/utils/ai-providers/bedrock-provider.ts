/**
 * AWS Bedrock AI Provider
 * Modular implementation for AWS Bedrock integration
 * Supports multiple models: Claude, Llama, Titan, etc.
 */

export interface BedrockConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  sessionToken?: string;
  modelId: string;
  maxTokens: number;
  temperature: number;
  topP?: number;
  stopSequences?: string[];
}

export interface BedrockRequest {
  prompt: string;
  modelId: string;
  maxTokens: number;
  temperature: number;
  topP?: number;
  stopSequences?: string[];
  anthropicVersion?: string;
}

export interface BedrockResponse {
  completion: string;
  stop_reason: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  model: string;
  timestamp: string;
}

export class BedrockProvider {
  private config: BedrockConfig;
  private endpoint: string;

  constructor(config: BedrockConfig) {
    this.config = config;
    this.endpoint = `https://bedrock-runtime.${config.region}.amazonaws.com`;
  }

  /**
   * Initialize AWS credentials and validate configuration
   */
  async initialize(): Promise<void> {
    try {
      // Validate required configuration
      if (!this.config.region) {
        throw new Error('AWS region is required for Bedrock integration');
      }
      
      if (!this.config.modelId) {
        throw new Error('Model ID is required for Bedrock integration');
      }

      // Validate model availability
      await this.validateModel();
      
      console.log(`Bedrock provider initialized with model: ${this.config.modelId}`);
    } catch (error) {
      console.error('Failed to initialize Bedrock provider:', error);
      throw error;
    }
  }

  /**
   * Generate AI response using AWS Bedrock
   */
  async generateResponse(prompt: string, context?: any): Promise<BedrockResponse> {
    try {
      const request = this.buildRequest(prompt, context);
      const response = await this.callBedrock(request);
      return this.parseResponse(response);
    } catch (error) {
      console.error('Bedrock generation error:', error);
      throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze document content using Bedrock models
   */
  async analyzeDocument(
    documentContent: string, 
    analysisType: 'compliance' | 'gaps' | 'recommendations' | 'general',
    framework?: string
  ): Promise<BedrockResponse> {
    const analysisPrompt = this.buildAnalysisPrompt(documentContent, analysisType, framework);
    return this.generateResponse(analysisPrompt);
  }

  /**
   * Chat with documents using RAG (Retrieval Augmented Generation)
   */
  async chatWithDocuments(
    message: string,
    documentContext: string[],
    conversationHistory: any[],
    framework?: string
  ): Promise<BedrockResponse> {
    const contextualPrompt = this.buildChatPrompt(message, documentContext, conversationHistory, framework);
    return this.generateResponse(contextualPrompt);
  }

  /**
   * Detect compliance gaps with specific framework requirements
   */
  async detectComplianceGaps(
    requirements: any[],
    documentContent: string,
    framework: string
  ): Promise<BedrockResponse> {
    const gapPrompt = this.buildGapAnalysisPrompt(requirements, documentContent, framework);
    return this.generateResponse(gapPrompt);
  }

  private buildRequest(prompt: string, context?: any): BedrockRequest {
    // Model-specific request formatting
    switch (this.getModelFamily()) {
      case 'claude':
        return this.buildClaudeRequest(prompt, context);
      case 'llama':
        return this.buildLlamaRequest(prompt, context);
      case 'titan':
        return this.buildTitanRequest(prompt, context);
      default:
        return this.buildGenericRequest(prompt, context);
    }
  }

  private buildClaudeRequest(prompt: string, context?: any): BedrockRequest {
    return {
      prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
      modelId: this.config.modelId,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
      topP: this.config.topP || 0.9,
      stopSequences: this.config.stopSequences || ['\n\nHuman:'],
      anthropicVersion: 'bedrock-2023-05-31'
    };
  }

  private buildLlamaRequest(prompt: string, context?: any): BedrockRequest {
    return {
      prompt: `<s>[INST] ${prompt} [/INST]`,
      modelId: this.config.modelId,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
      topP: this.config.topP || 0.9
    };
  }

  private buildTitanRequest(prompt: string, context?: any): BedrockRequest {
    return {
      prompt: prompt,
      modelId: this.config.modelId,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
      topP: this.config.topP || 0.9,
      stopSequences: this.config.stopSequences || []
    };
  }

  private buildGenericRequest(prompt: string, context?: any): BedrockRequest {
    return {
      prompt: prompt,
      modelId: this.config.modelId,
      maxTokens: this.config.maxTokens,
      temperature: this.config.temperature,
      topP: this.config.topP || 0.9
    };
  }

  private async callBedrock(request: BedrockRequest): Promise<any> {
    const endpoint = `${this.endpoint}/model/${request.modelId}/invoke`;
    
    // Build AWS Signature V4 headers
    const headers = await this.buildAuthHeaders(request);
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(this.formatRequestBody(request))
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Bedrock API error: ${error.message || response.statusText}`);
    }

    return response.json();
  }

  private formatRequestBody(request: BedrockRequest): any {
    const modelFamily = this.getModelFamily();
    
    switch (modelFamily) {
      case 'claude':
        return {
          prompt: request.prompt,
          max_tokens_to_sample: request.maxTokens,
          temperature: request.temperature,
          top_p: request.topP,
          stop_sequences: request.stopSequences,
          anthropic_version: request.anthropicVersion
        };
      
      case 'llama':
        return {
          prompt: request.prompt,
          max_gen_len: request.maxTokens,
          temperature: request.temperature,
          top_p: request.topP
        };
      
      case 'titan':
        return {
          inputText: request.prompt,
          textGenerationConfig: {
            maxTokenCount: request.maxTokens,
            temperature: request.temperature,
            topP: request.topP,
            stopSequences: request.stopSequences
          }
        };
      
      default:
        return {
          prompt: request.prompt,
          max_tokens: request.maxTokens,
          temperature: request.temperature,
          top_p: request.topP
        };
    }
  }

  private parseResponse(response: any): BedrockResponse {
    const modelFamily = this.getModelFamily();
    
    switch (modelFamily) {
      case 'claude':
        return {
          completion: response.completion,
          stop_reason: response.stop_reason,
          usage: response.usage,
          model: this.config.modelId,
          timestamp: new Date().toISOString()
        };
      
      case 'llama':
        return {
          completion: response.generation,
          stop_reason: response.stop_reason || 'end_turn',
          model: this.config.modelId,
          timestamp: new Date().toISOString()
        };
      
      case 'titan':
        return {
          completion: response.results?.[0]?.outputText || '',
          stop_reason: response.results?.[0]?.completionReason || 'finished',
          model: this.config.modelId,
          timestamp: new Date().toISOString()
        };
      
      default:
        return {
          completion: response.completion || response.text || '',
          stop_reason: response.stop_reason || 'finished',
          model: this.config.modelId,
          timestamp: new Date().toISOString()
        };
    }
  }

  private async buildAuthHeaders(request: BedrockRequest): Promise<Record<string, string>> {
    // AWS Signature V4 implementation
    // This would use AWS SDK or implement signature manually
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    // In production, use AWS SDK for authentication
    // For now, return basic headers (AWS SDK will handle auth)
    if (this.config.accessKeyId && this.config.secretAccessKey) {
      // Custom credential handling
      headers['Authorization'] = await this.generateAWSSignature(request);
    }

    return headers;
  }

  private async generateAWSSignature(request: BedrockRequest): Promise<string> {
    // AWS Signature V4 implementation
    // This would be handled by AWS SDK in production
    return 'AWS4-HMAC-SHA256 Credential=...'; // Placeholder
  }

  private getModelFamily(): string {
    const modelId = this.config.modelId.toLowerCase();
    
    if (modelId.includes('claude')) return 'claude';
    if (modelId.includes('llama')) return 'llama';
    if (modelId.includes('titan')) return 'titan';
    if (modelId.includes('jurassic')) return 'ai21';
    if (modelId.includes('cohere')) return 'cohere';
    
    return 'generic';
  }

  private async validateModel(): Promise<void> {
    // Validate that the model is available in the specified region
    const supportedModels = await this.listAvailableModels();
    
    if (!supportedModels.includes(this.config.modelId)) {
      throw new Error(`Model ${this.config.modelId} is not available in region ${this.config.region}`);
    }
  }

  private async listAvailableModels(): Promise<string[]> {
    // In production, this would call Bedrock ListFoundationModels API
    return [
      'anthropic.claude-3-sonnet-20240229-v1:0',
      'anthropic.claude-3-haiku-20240307-v1:0',
      'anthropic.claude-v2:1',
      'anthropic.claude-instant-v1',
      'meta.llama2-70b-chat-v1',
      'meta.llama2-13b-chat-v1',
      'amazon.titan-text-premier-v1:0',
      'amazon.titan-text-express-v1',
      'ai21.j2-ultra-v1',
      'ai21.j2-mid-v1',
      'cohere.command-text-v14',
      'cohere.command-light-text-v14'
    ];
  }

  private buildAnalysisPrompt(
    documentContent: string, 
    analysisType: string, 
    framework?: string
  ): string {
    const basePrompt = `You are a compliance expert analyzing documents for regulatory adherence.`;
    
    switch (analysisType) {
      case 'compliance':
        return `${basePrompt}

Document Content:
${documentContent}

Framework: ${framework || 'General Compliance'}

Analyze this document for compliance with ${framework} requirements. Identify:
1. Compliant areas
2. Non-compliant areas  
3. Missing requirements
4. Risk assessment
5. Specific recommendations

Provide a detailed analysis with severity ratings and actionable recommendations.`;

      case 'gaps':
        return `${basePrompt}

Document Content:
${documentContent}

Framework: ${framework || 'General Compliance'}

Perform a gap analysis to identify:
1. Missing controls or procedures
2. Incomplete implementations
3. Documentation gaps
4. Process weaknesses
5. Remediation priorities

Focus on actionable gaps with implementation guidance.`;

      case 'recommendations':
        return `${basePrompt}

Document Content:
${documentContent}

Framework: ${framework || 'General Compliance'}

Provide specific recommendations to improve compliance:
1. Priority improvements
2. Implementation steps
3. Resource requirements
4. Timeline estimates
5. Success metrics

Focus on practical, implementable recommendations.`;

      default:
        return `${basePrompt}

Document Content:
${documentContent}

Provide a comprehensive analysis of this document including compliance status, gaps, and recommendations.`;
    }
  }

  private buildChatPrompt(
    message: string,
    documentContext: string[],
    conversationHistory: any[],
    framework?: string
  ): string {
    const context = documentContext.length > 0 ? 
      `\nDocument Context:\n${documentContext.join('\n\n')}` : '';
    
    const history = conversationHistory.length > 0 ?
      `\nConversation History:\n${conversationHistory.map(msg => 
        `${msg.role}: ${msg.content}`
      ).join('\n')}` : '';

    return `You are a compliance expert assistant helping with ${framework || 'general compliance'} requirements.${context}${history}

User Question: ${message}

Provide a helpful, accurate response based on the document context and conversation history.`;
  }

  private buildGapAnalysisPrompt(
    requirements: any[],
    documentContent: string,
    framework: string
  ): string {
    const reqList = requirements.map(req => 
      `- ${req.title} (${req.status}, ${req.priority} priority): ${req.description}`
    ).join('\n');

    return `You are a compliance expert performing gap analysis for ${framework}.

Current Requirements:
${reqList}

Document Content:
${documentContent}

Analyze the gaps between requirements and current implementation:
1. Identify specific gaps for each requirement
2. Assess risk level and business impact
3. Provide detailed remediation steps
4. Estimate implementation effort and timeline
5. Prioritize actions based on compliance risk

Focus on actionable insights and specific implementation guidance.`;
  }

  /**
   * Update configuration for different models or regions
   */
  updateConfig(newConfig: Partial<BedrockConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.endpoint = `https://bedrock-runtime.${this.config.region}.amazonaws.com`;
  }

  /**
   * Get current configuration
   */
  getConfig(): BedrockConfig {
    return { ...this.config };
  }

  /**
   * Test connection and model availability
   */
  async testConnection(): Promise<boolean> {
    try {
      const testResponse = await this.generateResponse('Test connection');
      return testResponse.completion.length > 0;
    } catch (error) {
      console.error('Bedrock connection test failed:', error);
      return false;
    }
  }
}