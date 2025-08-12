/**
 * AI Provider Manager
 * Modular system to manage different AI providers (Bedrock, OpenAI, Claude, Local)
 * Supports dynamic switching and configuration management
 */

import { BedrockProvider, type BedrockConfig, type BedrockResponse } from './bedrock-provider';

export type AIProviderType = 'bedrock' | 'openai' | 'claude' | 'azure' | 'local';

export interface BaseAIConfig {
  provider: AIProviderType;
  modelId: string;
  maxTokens: number;
  temperature: number;
  topP?: number;
  region?: string;
  endpoint?: string;
  apiKey?: string;
  privacyMode: boolean;
  timeout?: number;
}

export interface OpenAIConfig extends BaseAIConfig {
  provider: 'openai';
  apiKey: string;
  organization?: string;
}

export interface ClaudeConfig extends BaseAIConfig {
  provider: 'claude';
  apiKey: string;
}

export interface AzureConfig extends BaseAIConfig {
  provider: 'azure';
  apiKey: string;
  endpoint: string;
  deploymentId: string;
}

export interface LocalConfig extends BaseAIConfig {
  provider: 'local';
  endpoint: string;
  modelPath?: string;
}

export type AIConfig = BedrockConfig | OpenAIConfig | ClaudeConfig | AzureConfig | LocalConfig;

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model: string;
  provider: AIProviderType;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface DocumentAnalysisRequest {
  content: string;
  analysisType: 'compliance' | 'gaps' | 'recommendations' | 'general';
  framework?: string;
  requirements?: any[];
  context?: any;
}

export interface ChatRequest {
  message: string;
  documentContext?: string[];
  conversationHistory?: any[];
  framework?: string;
  projectId?: string;
}

export class AIProviderManager {
  private currentProvider: AIProviderType;
  private providers: Map<AIProviderType, any> = new Map();
  private configs: Map<AIProviderType, AIConfig> = new Map();
  private fallbackProviders: AIProviderType[] = [];

  constructor() {
    this.currentProvider = 'bedrock'; // Default to Bedrock
    this.initializeProviders();
  }

  /**
   * Initialize all available AI providers
   */
  private async initializeProviders(): Promise<void> {
    // Initialize providers based on available configurations
    await this.setupBedrockProvider();
    // await this.setupOpenAIProvider();
    // await this.setupClaudeProvider();
    // await this.setupAzureProvider();
    // await this.setupLocalProvider();
  }

  /**
   * Configure and set the active AI provider
   */
  async setProvider(providerType: AIProviderType, config: AIConfig): Promise<void> {
    try {
      this.configs.set(providerType, config);
      
      switch (providerType) {
        case 'bedrock':
          await this.setupBedrockProvider(config as BedrockConfig);
          break;
        case 'openai':
          await this.setupOpenAIProvider(config as OpenAIConfig);
          break;
        case 'claude':
          await this.setupClaudeProvider(config as ClaudeConfig);
          break;
        case 'azure':
          await this.setupAzureProvider(config as AzureConfig);
          break;
        case 'local':
          await this.setupLocalProvider(config as LocalConfig);
          break;
        default:
          throw new Error(`Unsupported provider type: ${providerType}`);
      }

      this.currentProvider = providerType;
      console.log(`AI Provider switched to: ${providerType}`);
    } catch (error) {
      console.error(`Failed to set provider ${providerType}:`, error);
      throw error;
    }
  }

  /**
   * Get the current active provider
   */
  getCurrentProvider(): AIProviderType {
    return this.currentProvider;
  }

  /**
   * Generate AI response using the current provider
   */
  async generateResponse(
    prompt: string, 
    context?: any,
    options?: { useProvider?: AIProviderType }
  ): Promise<AIResponse> {
    const provider = options?.useProvider || this.currentProvider;
    
    try {
      const providerInstance = this.providers.get(provider);
      if (!providerInstance) {
        throw new Error(`Provider ${provider} not initialized`);
      }

      const response = await this.callProvider(provider, 'generateResponse', prompt, context);
      return this.standardizeResponse(response, provider);
    } catch (error) {
      console.error(`Error with provider ${provider}:`, error);
      
      // Try fallback providers
      if (this.fallbackProviders.length > 0) {
        return this.tryFallbackProviders(prompt, context);
      }
      
      throw error;
    }
  }

  /**
   * Analyze document content
   */
  async analyzeDocument(request: DocumentAnalysisRequest): Promise<AIResponse> {
    try {
      const providerInstance = this.providers.get(this.currentProvider);
      if (!providerInstance) {
        throw new Error(`Provider ${this.currentProvider} not initialized`);
      }

      const response = await this.callProvider(
        this.currentProvider,
        'analyzeDocument',
        request.content,
        request.analysisType,
        request.framework
      );

      return this.standardizeResponse(response, this.currentProvider);
    } catch (error) {
      console.error('Document analysis error:', error);
      throw error;
    }
  }

  /**
   * Chat with documents using RAG
   */
  async chatWithDocuments(request: ChatRequest): Promise<AIResponse> {
    try {
      const providerInstance = this.providers.get(this.currentProvider);
      if (!providerInstance) {
        throw new Error(`Provider ${this.currentProvider} not initialized`);
      }

      const response = await this.callProvider(
        this.currentProvider,
        'chatWithDocuments',
        request.message,
        request.documentContext || [],
        request.conversationHistory || [],
        request.framework
      );

      return this.standardizeResponse(response, this.currentProvider);
    } catch (error) {
      console.error('Chat with documents error:', error);
      throw error;
    }
  }

  /**
   * Detect compliance gaps
   */
  async detectComplianceGaps(
    requirements: any[],
    documentContent: string,
    framework: string
  ): Promise<AIResponse> {
    try {
      const providerInstance = this.providers.get(this.currentProvider);
      if (!providerInstance) {
        throw new Error(`Provider ${this.currentProvider} not initialized`);
      }

      const response = await this.callProvider(
        this.currentProvider,
        'detectComplianceGaps',
        requirements,
        documentContent,
        framework
      );

      return this.standardizeResponse(response, this.currentProvider);
    } catch (error) {
      console.error('Gap detection error:', error);
      throw error;
    }
  }

  /**
   * Test connection for all providers
   */
  async testAllProviders(): Promise<Record<AIProviderType, boolean>> {
    const results: Record<AIProviderType, boolean> = {} as any;
    
    for (const [providerType, provider] of this.providers) {
      try {
        results[providerType] = await provider.testConnection?.() || false;
      } catch (error) {
        console.error(`Test failed for ${providerType}:`, error);
        results[providerType] = false;
      }
    }
    
    return results;
  }

  /**
   * Get available models for current provider
   */
  async getAvailableModels(): Promise<string[]> {
    const provider = this.providers.get(this.currentProvider);
    if (!provider?.listAvailableModels) {
      return [];
    }
    
    try {
      return await provider.listAvailableModels();
    } catch (error) {
      console.error('Failed to get available models:', error);
      return [];
    }
  }

  /**
   * Set fallback providers for redundancy
   */
  setFallbackProviders(providers: AIProviderType[]): void {
    this.fallbackProviders = providers.filter(p => this.providers.has(p));
  }

  /**
   * Get provider configuration
   */
  getProviderConfig(providerType?: AIProviderType): AIConfig | undefined {
    const provider = providerType || this.currentProvider;
    return this.configs.get(provider);
  }

  /**
   * Update provider configuration
   */
  async updateProviderConfig(
    providerType: AIProviderType, 
    updates: Partial<AIConfig>
  ): Promise<void> {
    const currentConfig = this.configs.get(providerType);
    if (!currentConfig) {
      throw new Error(`No configuration found for provider ${providerType}`);
    }

    const newConfig = { ...currentConfig, ...updates };
    await this.setProvider(providerType, newConfig);
  }

  /**
   * Private methods for provider setup
   */
  private async setupBedrockProvider(config?: BedrockConfig): Promise<void> {
    const defaultConfig: BedrockConfig = {
      region: process.env.AWS_REGION || 'us-east-1',
      modelId: 'anthropic.claude-3-sonnet-20240229-v1:0',
      maxTokens: 2000,
      temperature: 0.3,
      topP: 0.9,
      ...config
    };

    const provider = new BedrockProvider(defaultConfig);
    await provider.initialize();
    
    this.providers.set('bedrock', provider);
    this.configs.set('bedrock', defaultConfig);
  }

  private async setupOpenAIProvider(config?: OpenAIConfig): Promise<void> {
    // OpenAI provider implementation would go here
    // For now, create a placeholder
    const provider = {
      generateResponse: async (prompt: string) => ({
        completion: 'OpenAI response placeholder',
        model: config?.modelId || 'gpt-4',
        timestamp: new Date().toISOString()
      }),
      testConnection: async () => true
    };

    this.providers.set('openai', provider);
    if (config) this.configs.set('openai', config);
  }

  private async setupClaudeProvider(config?: ClaudeConfig): Promise<void> {
    // Claude API provider implementation would go here
    const provider = {
      generateResponse: async (prompt: string) => ({
        completion: 'Claude response placeholder',
        model: config?.modelId || 'claude-3-sonnet',
        timestamp: new Date().toISOString()
      }),
      testConnection: async () => true
    };

    this.providers.set('claude', provider);
    if (config) this.configs.set('claude', config);
  }

  private async setupAzureProvider(config?: AzureConfig): Promise<void> {
    // Azure OpenAI provider implementation would go here
    const provider = {
      generateResponse: async (prompt: string) => ({
        completion: 'Azure OpenAI response placeholder',
        model: config?.modelId || 'gpt-4',
        timestamp: new Date().toISOString()
      }),
      testConnection: async () => true
    };

    this.providers.set('azure', provider);
    if (config) this.configs.set('azure', config);
  }

  private async setupLocalProvider(config?: LocalConfig): Promise<void> {
    // Local model provider implementation would go here
    const provider = {
      generateResponse: async (prompt: string) => ({
        completion: 'Local model response placeholder',
        model: config?.modelId || 'local-llm',
        timestamp: new Date().toISOString()
      }),
      testConnection: async () => true
    };

    this.providers.set('local', provider);
    if (config) this.configs.set('local', config);
  }

  private async callProvider(
    providerType: AIProviderType,
    method: string,
    ...args: any[]
  ): Promise<any> {
    const provider = this.providers.get(providerType);
    if (!provider || !provider[method]) {
      throw new Error(`Method ${method} not available for provider ${providerType}`);
    }

    return provider[method](...args);
  }

  private standardizeResponse(response: any, provider: AIProviderType): AIResponse {
    // Standardize response format across all providers
    return {
      content: response.completion || response.content || response.text || '',
      usage: response.usage,
      model: response.model || 'unknown',
      provider,
      timestamp: response.timestamp || new Date().toISOString(),
      metadata: {
        stopReason: response.stop_reason,
        originalResponse: response
      }
    };
  }

  private async tryFallbackProviders(prompt: string, context?: any): Promise<AIResponse> {
    for (const fallbackProvider of this.fallbackProviders) {
      try {
        console.log(`Trying fallback provider: ${fallbackProvider}`);
        const response = await this.generateResponse(prompt, context, { useProvider: fallbackProvider });
        return response;
      } catch (error) {
        console.error(`Fallback provider ${fallbackProvider} also failed:`, error);
        continue;
      }
    }

    throw new Error('All providers failed, including fallbacks');
  }

  /**
   * Get provider status and health
   */
  async getProviderStatus(): Promise<Record<AIProviderType, any>> {
    const status: Record<AIProviderType, any> = {} as any;

    for (const [providerType, provider] of this.providers) {
      try {
        const isHealthy = await provider.testConnection?.() || false;
        const config = this.configs.get(providerType);
        
        status[providerType] = {
          healthy: isHealthy,
          model: config?.modelId || 'unknown',
          lastTested: new Date().toISOString(),
          config: {
            ...config,
            apiKey: config?.apiKey ? '***masked***' : undefined,
            secretAccessKey: config?.secretAccessKey ? '***masked***' : undefined
          }
        };
      } catch (error) {
        status[providerType] = {
          healthy: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          lastTested: new Date().toISOString()
        };
      }
    }

    return status;
  }

  /**
   * Switch to best available provider
   */
  async switchToBestProvider(): Promise<AIProviderType> {
    const statuses = await this.getProviderStatus();
    
    // Priority order for provider selection
    const priorityOrder: AIProviderType[] = ['bedrock', 'claude', 'azure', 'openai', 'local'];
    
    for (const provider of priorityOrder) {
      if (statuses[provider]?.healthy && this.providers.has(provider)) {
        this.currentProvider = provider;
        console.log(`Switched to best available provider: ${provider}`);
        return provider;
      }
    }

    throw new Error('No healthy providers available');
  }
}

// Singleton instance
export const aiProviderManager = new AIProviderManager();