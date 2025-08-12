-- Aurora PostgreSQL Schema for AI-Enhanced Compliance Platform
-- Modular design supporting AWS Bedrock integration and conversation management

-- Chat conversations table for AI interactions
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255),
    framework VARCHAR(100), -- SOC 2, ISO 27001, GDPR, etc.
    context_type VARCHAR(50) DEFAULT 'general', -- 'compliance', 'gaps', 'recommendations', 'general'
    ai_provider VARCHAR(50) DEFAULT 'bedrock', -- 'bedrock', 'openai', 'claude', etc.
    ai_model VARCHAR(100) DEFAULT 'anthropic.claude-3-sonnet-20240229-v1:0',
    configuration JSONB, -- AI configuration and parameters
    metadata JSONB, -- Additional conversation metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table for conversation history
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    context JSONB, -- Message context (requirements, framework, analysis type)
    metadata JSONB, -- Confidence scores, sources, suggestions, token usage
    token_usage JSONB, -- Token consumption tracking
    processing_time INTEGER, -- Response time in milliseconds
    ai_provider VARCHAR(50), -- Provider used for this message
    ai_model VARCHAR(100), -- Model used for this message
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI analysis results table for document analysis
CREATE TABLE IF NOT EXISTS ai_analysis_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    analysis_type VARCHAR(50) NOT NULL, -- 'compliance', 'gaps', 'recommendations'
    framework VARCHAR(100) NOT NULL,
    ai_provider VARCHAR(50) NOT NULL,
    ai_model VARCHAR(100) NOT NULL,
    summary TEXT,
    gaps JSONB, -- Array of identified gaps
    recommendations JSONB, -- Array of recommendations
    compliance_score DECIMAL(5,2),
    confidence_score DECIMAL(5,2),
    raw_response TEXT, -- Full AI response for debugging
    token_usage JSONB,
    processing_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI provider configurations table
CREATE TABLE IF NOT EXISTS ai_provider_configs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider_type VARCHAR(50) NOT NULL, -- 'bedrock', 'openai', 'claude', etc.
    configuration JSONB NOT NULL, -- Provider-specific configuration
    is_active BOOLEAN DEFAULT false,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, provider_type)
);

-- Requirements AI enhancement table
CREATE TABLE IF NOT EXISTS requirements_ai_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requirement_id UUID REFERENCES requirements(id) ON DELETE CASCADE,
    ai_provider VARCHAR(50) NOT NULL,
    ai_model VARCHAR(100) NOT NULL,
    analysis_type VARCHAR(50), -- 'gap_detection', 'recommendation', 'evidence_check'
    confidence_score DECIMAL(5,2),
    ai_status VARCHAR(50), -- AI-determined status
    ai_priority VARCHAR(20), -- AI-suggested priority
    ai_gaps JSONB, -- AI-identified gaps
    ai_recommendations JSONB, -- AI-generated recommendations
    ai_evidence TEXT, -- AI-found evidence
    raw_analysis TEXT, -- Full AI analysis response
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document embeddings for RAG (Retrieval Augmented Generation)
CREATE TABLE IF NOT EXISTS document_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    embedding VECTOR(1536), -- OpenAI ada-002 dimension, adjust for other models
    metadata JSONB, -- Page number, section, etc.
    token_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI usage tracking for billing and monitoring
CREATE TABLE IF NOT EXISTS ai_usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    ai_provider VARCHAR(50) NOT NULL,
    ai_model VARCHAR(100) NOT NULL,
    operation_type VARCHAR(50), -- 'chat', 'analysis', 'gap_detection', etc.
    prompt_tokens INTEGER DEFAULT 0,
    completion_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    cost_estimate DECIMAL(10,6), -- Estimated cost in USD
    processing_time INTEGER, -- Response time in milliseconds
    success BOOLEAN DEFAULT true,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI feedback table for model improvement
CREATE TABLE IF NOT EXISTS ai_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message_id UUID REFERENCES chat_messages(id) ON DELETE CASCADE,
    feedback_type VARCHAR(20) CHECK (feedback_type IN ('thumbs_up', 'thumbs_down', 'report')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    feedback_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced projects table with AI features
ALTER TABLE projects ADD COLUMN IF NOT EXISTS ai_analysis_enabled BOOLEAN DEFAULT true;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS preferred_ai_provider VARCHAR(50) DEFAULT 'bedrock';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS ai_configuration JSONB;

-- Enhanced requirements table with AI scoring
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(5,2);
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS ai_last_analyzed TIMESTAMP WITH TIME ZONE;
ALTER TABLE requirements ADD COLUMN IF NOT EXISTS ai_analysis_version VARCHAR(50);

-- Enhanced documents table for AI processing
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ai_processed BOOLEAN DEFAULT false;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ai_processing_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE documents ADD COLUMN IF NOT EXISTS extracted_text TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS embedding_model VARCHAR(100);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_chat_conversations_project_user ON chat_conversations(project_id, user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated ON chat_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON chat_messages(role);

CREATE INDEX IF NOT EXISTS idx_ai_analysis_project ON ai_analysis_results(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_document ON ai_analysis_results(document_id);
CREATE INDEX IF NOT EXISTS idx_ai_analysis_type_framework ON ai_analysis_results(analysis_type, framework);

CREATE INDEX IF NOT EXISTS idx_ai_provider_configs_user ON ai_provider_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_provider_configs_active ON ai_provider_configs(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_requirements_ai_analysis_req ON requirements_ai_analysis(requirement_id);
CREATE INDEX IF NOT EXISTS idx_requirements_ai_analysis_created ON requirements_ai_analysis(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_document_embeddings_document ON document_embeddings(document_id);
CREATE INDEX IF NOT EXISTS idx_document_embeddings_chunk ON document_embeddings(chunk_index);

CREATE INDEX IF NOT EXISTS idx_ai_usage_tracking_user_date ON ai_usage_tracking(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_usage_tracking_provider ON ai_usage_tracking(ai_provider);
CREATE INDEX IF NOT EXISTS idx_ai_usage_tracking_project ON ai_usage_tracking(project_id);

CREATE INDEX IF NOT EXISTS idx_ai_feedback_message ON ai_feedback(message_id);
CREATE INDEX IF NOT EXISTS idx_ai_feedback_user_type ON ai_feedback(user_id, feedback_type);

-- Vector similarity search index (requires pgvector extension)
CREATE INDEX IF NOT EXISTS idx_document_embeddings_vector ON document_embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Functions for AI operations

-- Function to get conversation context for AI
CREATE OR REPLACE FUNCTION get_conversation_context(conversation_uuid UUID, context_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    role VARCHAR(20),
    content TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cm.role,
        cm.content,
        cm.created_at
    FROM chat_messages cm
    WHERE cm.conversation_id = conversation_uuid
    ORDER BY cm.created_at DESC
    LIMIT context_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate AI usage costs
CREATE OR REPLACE FUNCTION calculate_ai_usage_cost(
    provider_name VARCHAR(50),
    model_name VARCHAR(100),
    prompt_tokens_count INTEGER,
    completion_tokens_count INTEGER
) RETURNS DECIMAL(10,6) AS $$
DECLARE
    cost DECIMAL(10,6) := 0;
BEGIN
    -- Pricing logic based on provider and model
    CASE provider_name
        WHEN 'bedrock' THEN
            CASE 
                WHEN model_name LIKE '%claude-3-sonnet%' THEN
                    cost := (prompt_tokens_count * 0.000003) + (completion_tokens_count * 0.000015);
                WHEN model_name LIKE '%claude-3-haiku%' THEN
                    cost := (prompt_tokens_count * 0.00000025) + (completion_tokens_count * 0.00000125);
                WHEN model_name LIKE '%titan%' THEN
                    cost := (prompt_tokens_count * 0.0000005) + (completion_tokens_count * 0.0000015);
            END CASE;
        WHEN 'openai' THEN
            CASE 
                WHEN model_name = 'gpt-4' THEN
                    cost := (prompt_tokens_count * 0.00003) + (completion_tokens_count * 0.00006);
                WHEN model_name = 'gpt-3.5-turbo' THEN
                    cost := (prompt_tokens_count * 0.000001) + (completion_tokens_count * 0.000002);
            END CASE;
    END CASE;
    
    RETURN cost;
END;
$$ LANGUAGE plpgsql;

-- Function to track AI usage
CREATE OR REPLACE FUNCTION track_ai_usage(
    user_uuid UUID,
    project_uuid UUID,
    provider_name VARCHAR(50),
    model_name VARCHAR(100),
    operation VARCHAR(50),
    prompt_tokens_count INTEGER,
    completion_tokens_count INTEGER,
    processing_time_ms INTEGER,
    success_flag BOOLEAN DEFAULT true,
    error_msg TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    usage_id UUID;
    calculated_cost DECIMAL(10,6);
BEGIN
    calculated_cost := calculate_ai_usage_cost(provider_name, model_name, prompt_tokens_count, completion_tokens_count);
    
    INSERT INTO ai_usage_tracking (
        user_id, project_id, ai_provider, ai_model, operation_type,
        prompt_tokens, completion_tokens, total_tokens, cost_estimate,
        processing_time, success, error_message
    ) VALUES (
        user_uuid, project_uuid, provider_name, model_name, operation,
        prompt_tokens_count, completion_tokens_count, prompt_tokens_count + completion_tokens_count,
        calculated_cost, processing_time_ms, success_flag, error_msg
    ) RETURNING id INTO usage_id;
    
    RETURN usage_id;
END;
$$ LANGUAGE plpgsql;

-- Views for reporting and analytics

-- AI usage summary by user
CREATE OR REPLACE VIEW ai_usage_summary AS
SELECT 
    u.email,
    u.name,
    aut.ai_provider,
    aut.ai_model,
    COUNT(*) as request_count,
    SUM(aut.total_tokens) as total_tokens,
    SUM(aut.cost_estimate) as total_cost,
    AVG(aut.processing_time) as avg_processing_time,
    DATE_TRUNC('day', aut.created_at) as usage_date
FROM ai_usage_tracking aut
JOIN users u ON aut.user_id = u.id
WHERE aut.created_at >= NOW() - INTERVAL '30 days'
GROUP BY u.email, u.name, aut.ai_provider, aut.ai_model, DATE_TRUNC('day', aut.created_at)
ORDER BY usage_date DESC, total_cost DESC;

-- Project AI analysis summary
CREATE OR REPLACE VIEW project_ai_analysis_summary AS
SELECT 
    p.name as project_name,
    p.id as project_id,
    COUNT(DISTINCT aar.id) as analysis_count,
    AVG(aar.compliance_score) as avg_compliance_score,
    AVG(aar.confidence_score) as avg_confidence_score,
    COUNT(DISTINCT cc.id) as conversation_count,
    COUNT(DISTINCT cm.id) as message_count,
    MAX(aar.created_at) as last_analysis_date
FROM projects p
LEFT JOIN ai_analysis_results aar ON p.id = aar.project_id
LEFT JOIN chat_conversations cc ON p.id = cc.project_id
LEFT JOIN chat_messages cm ON cc.id = cm.conversation_id
GROUP BY p.id, p.name
ORDER BY last_analysis_date DESC;

-- Requirements AI confidence summary
CREATE OR REPLACE VIEW requirements_ai_confidence_summary AS
SELECT 
    r.title,
    r.status,
    r.priority,
    r.category,
    AVG(raa.confidence_score) as avg_ai_confidence,
    COUNT(raa.id) as ai_analysis_count,
    MAX(raa.created_at) as last_ai_analysis
FROM requirements r
LEFT JOIN requirements_ai_analysis raa ON r.id = raa.requirement_id
GROUP BY r.id, r.title, r.status, r.priority, r.category
ORDER BY avg_ai_confidence DESC;

-- Grant appropriate permissions (adjust based on your user roles)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO compliance_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO compliance_app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO compliance_app_user;