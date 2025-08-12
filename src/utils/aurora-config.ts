// Helper function to safely access environment variables
const getEnvVar = (key: string, defaultValue: string = ''): string => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  return defaultValue;
};

// Aurora Postgres Configuration for AWS
export interface AuroraConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
  ssl?: boolean
  region?: string
  cluster?: string
}

// Environment-based Aurora Postgres configuration
export const AURORA_CONFIG: AuroraConfig = {
  host: getEnvVar('AURORA_POSTGRES_HOST', 'your-aurora-cluster.cluster-xxxxx.us-east-1.rds.amazonaws.com'),
  port: parseInt(getEnvVar('AURORA_POSTGRES_PORT', '5432')),
  database: getEnvVar('AURORA_POSTGRES_DATABASE', 'compliancechecker'),
  username: getEnvVar('AURORA_POSTGRES_USERNAME', 'postgres'),
  password: getEnvVar('AURORA_POSTGRES_PASSWORD', 'your-secure-password'),
  ssl: getEnvVar('AURORA_POSTGRES_SSL') === 'true' || true,
  region: getEnvVar('AWS_REGION', 'us-east-1'),
  cluster: getEnvVar('AURORA_CLUSTER_IDENTIFIER', 'compliancechecker-cluster')
}

// Aurora Postgres connection string builder
export const buildAuroraConnectionString = (config: AuroraConfig): string => {
  const sslParam = config.ssl ? 'sslmode=require' : 'sslmode=disable'
  return `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}?${sslParam}`
}

// Aurora Postgres connection pool configuration
export const AURORA_POOL_CONFIG = {
  min: 2,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  acquireTimeoutMillis: 60000,
  createTimeoutMillis: 30000,
  destroyTimeoutMillis: 5000,
  reapIntervalMillis: 1000,
  createRetryIntervalMillis: 200,
}

// Database schema for Aurora Postgres
export const AURORA_SCHEMA = {
  users: `
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email VARCHAR(255) UNIQUE NOT NULL,
      name VARCHAR(255),
      password_hash VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  projects: `
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(255) NOT NULL,
      description TEXT,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      document_type VARCHAR(100),
      assignee VARCHAR(255),
      status VARCHAR(50) DEFAULT 'active',
      compliance_score INTEGER DEFAULT 0,
      progress INTEGER DEFAULT 0,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  requirements: `
    CREATE TABLE IF NOT EXISTS requirements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      title VARCHAR(500) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      priority VARCHAR(20) DEFAULT 'medium',
      status VARCHAR(50) DEFAULT 'pending',
      confidence DECIMAL(3,2) DEFAULT 0.00,
      evidence TEXT,
      gaps TEXT[],
      recommendations TEXT[],
      section VARCHAR(100),
      assignee VARCHAR(255),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  documents: `
    CREATE TABLE IF NOT EXISTS documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      filename VARCHAR(500) NOT NULL,
      file_path VARCHAR(1000),
      file_size BIGINT,
      document_type VARCHAR(100),
      mime_type VARCHAR(100),
      uploaded_by UUID REFERENCES users(id),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  activities: `
    CREATE TABLE IF NOT EXISTS activities (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      user_id UUID REFERENCES users(id) ON DELETE CASCADE,
      type VARCHAR(50) NOT NULL,
      action VARCHAR(100) NOT NULL,
      target VARCHAR(500),
      title VARCHAR(255),
      description TEXT,
      metadata JSONB,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  `,
  indexes: [
    'CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);',
    'CREATE INDEX IF NOT EXISTS idx_requirements_project_id ON requirements(project_id);',
    'CREATE INDEX IF NOT EXISTS idx_requirements_status ON requirements(status);',
    'CREATE INDEX IF NOT EXISTS idx_documents_project_id ON documents(project_id);',
    'CREATE INDEX IF NOT EXISTS idx_activities_project_id ON activities(project_id);',
    'CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);',
    'CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);'
  ]
}

// Aurora Postgres specific features
export const AURORA_FEATURES = {
  // Enable Aurora Postgres query plan caching
  enableQueryPlanCache: true,
  
  // Enable Aurora Postgres parallel query
  enableParallelQuery: true,
  
  // Connection pooling with Aurora Proxy
  useAuroraProxy: getEnvVar('USE_AURORA_PROXY') === 'true',
  
  // Aurora Serverless v2 configuration
  serverlessV2: {
    minCapacity: parseFloat(getEnvVar('AURORA_MIN_CAPACITY', '0.5')),
    maxCapacity: parseFloat(getEnvVar('AURORA_MAX_CAPACITY', '16')),
    autoPause: getEnvVar('AURORA_AUTO_PAUSE') === 'true'
  }
}