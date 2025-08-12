# AWS Bedrock + Aurora Deployment Guide

## 🚀 **Modular AI-Enhanced Compliance Platform Deployment**

This guide covers deploying your ComplianceChecker app with AWS Bedrock AI integration and Aurora PostgreSQL database.

---

## 📋 **Architecture Overview**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │───▶│   API Gateway    │───▶│   Lambda/ECS    │
│ (ComplianceUI)  │    │                  │    │   (Backend)     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                         ┌──────────────────────────────┼──────────────────┐
                         │                              │                  │
                    ┌─────▼─────┐              ┌────────▼────────┐   ┌─────▼─────┐
                    │  Bedrock  │              │ Aurora Postgres │   │    S3     │
                    │    AI     │              │   (Documents)   │   │(Documents)│
                    └───────────┘              └─────────────────┘   └───────────┘
```

---

## 🔧 **Prerequisites**

### AWS Account Setup
- AWS Account with appropriate permissions
- AWS CLI configured with credentials
- Bedrock model access enabled in your region

### Required AWS Services
- **AWS Bedrock** (AI models)
- **Aurora PostgreSQL** (database)
- **Lambda** or **ECS** (backend hosting)
- **S3** (document storage)
- **API Gateway** (API management)
- **CloudFront** (optional, for UI distribution)

---

## 🗄️ **Database Setup (Aurora PostgreSQL)**

### 1. Create Aurora Cluster

```bash
# Create Aurora PostgreSQL cluster
aws rds create-db-cluster \
  --db-cluster-identifier compliance-aurora-cluster \
  --engine aurora-postgresql \
  --engine-version 14.9 \
  --master-username complianceadmin \
  --master-user-password [SECURE_PASSWORD] \
  --vpc-security-group-ids sg-xxxxxxxx \
  --db-subnet-group-name compliance-subnet-group \
  --backup-retention-period 7 \
  --storage-encrypted

# Create cluster instances
aws rds create-db-instance \
  --db-instance-identifier compliance-aurora-writer \
  --db-instance-class db.r6g.large \
  --engine aurora-postgresql \
  --db-cluster-identifier compliance-aurora-cluster

aws rds create-db-instance \
  --db-instance-identifier compliance-aurora-reader \
  --db-instance-class db.r6g.large \
  --engine aurora-postgresql \
  --db-cluster-identifier compliance-aurora-cluster
```

### 2. Initialize Database Schema

```bash
# Connect to Aurora and run schema
psql -h [AURORA_ENDPOINT] -U complianceadmin -d postgres -f src/utils/aurora-ai-schema.sql
```

### 3. Environment Configuration

```env
# Aurora Database
DATABASE_URL=postgresql://complianceadmin:[PASSWORD]@[AURORA_ENDPOINT]:5432/compliance_db
AURORA_CLUSTER_ENDPOINT=[CLUSTER_ENDPOINT]
AURORA_READER_ENDPOINT=[READER_ENDPOINT]

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=[YOUR_ACCESS_KEY]
AWS_SECRET_ACCESS_KEY=[YOUR_SECRET_KEY]
```

---

## 🤖 **AWS Bedrock Setup**

### 1. Enable Model Access

```bash
# List available models in your region
aws bedrock list-foundation-models --region us-east-1

# Request access to models (via AWS Console)
# Required models:
# - anthropic.claude-3-sonnet-20240229-v1:0
# - anthropic.claude-3-haiku-20240307-v1:0
# - amazon.titan-text-express-v1
```

### 2. IAM Permissions

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream",
        "bedrock:ListFoundationModels",
        "bedrock:GetFoundationModel"
      ],
      "Resource": [
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-sonnet-20240229-v1:0",
        "arn:aws:bedrock:*::foundation-model/anthropic.claude-3-haiku-20240307-v1:0",
        "arn:aws:bedrock:*::foundation-model/amazon.titan-text-express-v1"
      ]
    }
  ]
}
```

### 3. Bedrock Configuration

```env
# Bedrock Configuration
BEDROCK_REGION=us-east-1
BEDROCK_DEFAULT_MODEL=anthropic.claude-3-sonnet-20240229-v1:0
BEDROCK_FALLBACK_MODEL=anthropic.claude-3-haiku-20240307-v1:0

# Model Settings
AI_TEMPERATURE=0.3
AI_MAX_TOKENS=2000
AI_TOP_P=0.9
```

---

## 🔄 **Application Configuration**

### 1. Update Environment Variables

```env
# App Mode
DEMO_MODE=false
USE_AURORA_POSTGRES=true
ENABLE_AI_FEATURES=true

# AI Provider Settings
DEFAULT_AI_PROVIDER=bedrock
ENABLE_FALLBACK_PROVIDERS=true
AI_PRIVACY_MODE=false

# Feature Flags
ENABLE_CONVERSATION_HISTORY=true
ENABLE_USAGE_TRACKING=true
ENABLE_AI_ANALYTICS=true
```

### 2. Provider Configuration File

Create `src/config/ai-providers.json`:

```json
{
  "providers": {
    "bedrock": {
      "enabled": true,
      "priority": 1,
      "models": {
        "claude-3-sonnet": {
          "id": "anthropic.claude-3-sonnet-20240229-v1:0",
          "costPer1kTokens": {
            "input": 0.003,
            "output": 0.015
          },
          "maxTokens": 200000,
          "contextWindow": 200000
        },
        "claude-3-haiku": {
          "id": "anthropic.claude-3-haiku-20240307-v1:0",
          "costPer1kTokens": {
            "input": 0.00025,
            "output": 0.00125
          },
          "maxTokens": 200000,
          "contextWindow": 200000
        }
      }
    },
    "openai": {
      "enabled": false,
      "priority": 2,
      "requiresApiKey": true
    },
    "local": {
      "enabled": false,
      "priority": 3
    }
  },
  "fallbackChain": ["bedrock", "openai", "local"]
}
```

---

## 🚀 **Deployment Options**

### Option 1: Lambda + API Gateway (Serverless)

```yaml
# serverless.yml
service: compliance-checker-api

provider:
  name: aws
  runtime: nodejs18.x
  region: us-east-1
  environment:
    DATABASE_URL: ${env:DATABASE_URL}
    BEDROCK_REGION: ${env:BEDROCK_REGION}
    
  iamRoleStatements:
    - Effect: Allow
      Action:
        - bedrock:InvokeModel
        - bedrock:ListFoundationModels
      Resource: "*"
    - Effect: Allow
      Action:
        - rds-data:ExecuteStatement
        - rds-data:BatchExecuteStatement
      Resource: "*"

functions:
  api:
    handler: dist/lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
          cors: true
```

### Option 2: ECS + Fargate (Containerized)

```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist
COPY public ./public

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  compliance-app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=${DATABASE_URL}
      - BEDROCK_REGION=${BEDROCK_REGION}
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    depends_on:
      - aurora-proxy
```

### Option 3: EC2 (Traditional)

```bash
# Install Node.js and dependencies
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone and setup application
git clone [YOUR_REPO_URL]
cd compliance-checker
npm install
npm run build

# Configure systemd service
sudo cp scripts/compliance-checker.service /etc/systemd/system/
sudo systemctl enable compliance-checker
sudo systemctl start compliance-checker
```

---

## 🔧 **Modular Configuration Management**

### 1. Provider Switching Logic

```typescript
// src/config/deployment-config.ts
export const DeploymentConfig = {
  development: {
    aiProvider: 'bedrock',
    database: 'aurora',
    fallbackProviders: ['openai', 'local'],
    enableAnalytics: false
  },
  staging: {
    aiProvider: 'bedrock',
    database: 'aurora',
    fallbackProviders: ['openai'],
    enableAnalytics: true
  },
  production: {
    aiProvider: 'bedrock',
    database: 'aurora',
    fallbackProviders: ['bedrock-fallback'],
    enableAnalytics: true,
    enableUsageTracking: true
  }
};
```

### 2. Environment-Based Initialization

```typescript
// src/utils/init-services.ts
export async function initializeServices() {
  const env = process.env.NODE_ENV || 'development';
  const config = DeploymentConfig[env];
  
  // Initialize AI Provider Manager
  await aiProviderManager.setProvider('bedrock', {
    provider: 'bedrock',
    region: process.env.BEDROCK_REGION,
    modelId: process.env.BEDROCK_DEFAULT_MODEL,
    // ... other config
  });
  
  // Initialize Aurora Service
  if (config.database === 'aurora') {
    await AuroraAIService.initializeDatabase();
  }
  
  // Set fallback providers
  aiProviderManager.setFallbackProviders(config.fallbackProviders);
}
```

---

## 📊 **Monitoring & Analytics**

### 1. CloudWatch Integration

```typescript
// src/utils/monitoring.ts
export class CloudWatchMonitoring {
  static async logAIUsage(metrics: {
    provider: string;
    model: string;
    tokens: number;
    latency: number;
    cost: number;
  }) {
    await cloudWatch.putMetricData({
      Namespace: 'ComplianceChecker/AI',
      MetricData: [
        {
          MetricName: 'TokensUsed',
          Value: metrics.tokens,
          Dimensions: [
            { Name: 'Provider', Value: metrics.provider },
            { Name: 'Model', Value: metrics.model }
          ]
        },
        {
          MetricName: 'ResponseLatency',
          Value: metrics.latency,
          Unit: 'Milliseconds'
        },
        {
          MetricName: 'EstimatedCost',
          Value: metrics.cost,
          Unit: 'None'
        }
      ]
    }).promise();
  }
}
```

### 2. Usage Analytics Dashboard

```sql
-- Aurora queries for analytics
CREATE VIEW daily_ai_usage_summary AS
SELECT 
  DATE_TRUNC('day', created_at) as usage_date,
  ai_provider,
  ai_model,
  COUNT(*) as request_count,
  SUM(total_tokens) as total_tokens,
  SUM(cost_estimate) as total_cost,
  AVG(processing_time) as avg_response_time
FROM ai_usage_tracking 
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), ai_provider, ai_model
ORDER BY usage_date DESC;
```

---

## 🔒 **Security Configuration**

### 1. VPC Security Groups

```bash
# Database Security Group
aws ec2 create-security-group \
  --group-name compliance-aurora-sg \
  --description "Aurora PostgreSQL access for Compliance app"

aws ec2 authorize-security-group-ingress \
  --group-id sg-xxxxxxxx \
  --protocol tcp \
  --port 5432 \
  --source-group sg-yyyyyyyy  # App security group
```

### 2. Secrets Management

```bash
# Store database credentials in Secrets Manager
aws secretsmanager create-secret \
  --name "compliance/aurora/credentials" \
  --description "Aurora database credentials" \
  --secret-string '{"username":"complianceadmin","password":"[SECURE_PASSWORD]"}'

# Store API keys
aws secretsmanager create-secret \
  --name "compliance/ai/api-keys" \
  --description "AI provider API keys" \
  --secret-string '{"openai":"sk-...","anthropic":"sk-ant-..."}'
```

### 3. Environment Variables for Production

```env
# Use AWS Secrets Manager references
DATABASE_URL={{resolve:secretsmanager:compliance/aurora/credentials:SecretString:url}}
OPENAI_API_KEY={{resolve:secretsmanager:compliance/ai/api-keys:SecretString:openai}}

# Security Settings
ENABLE_REQUEST_LOGGING=true
ENABLE_AUDIT_TRAIL=true
MAX_REQUEST_SIZE=50MB
RATE_LIMIT_PER_MINUTE=100
```

---

## 🧪 **Testing the Deployment**

### 1. Health Checks

```bash
# Test Aurora connection
curl -X GET https://api.compliance-checker.com/health/database

# Test Bedrock integration
curl -X POST https://api.compliance-checker.com/health/ai \
  -H "Content-Type: application/json" \
  -d '{"provider": "bedrock", "model": "claude-3-sonnet"}'

# Test end-to-end AI flow
curl -X POST https://api.compliance-checker.com/api/ai/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN]" \
  -d '{"message": "Test compliance analysis", "projectId": "test-project"}'
```

### 2. Load Testing

```bash
# Install k6 for load testing
npm install -g k6

# Run load test
k6 run scripts/load-test.js
```

---

## 📈 **Scaling Configuration**

### Auto Scaling for ECS

```json
{
  "targetCapacity": 2,
  "minimumCapacity": 1,
  "maximumCapacity": 10,
  "scaleOutCooldown": 300,
  "scaleInCooldown": 300,
  "targetCpuUtilization": 70,
  "targetMemoryUtilization": 80
}
```

### Aurora Auto Scaling

```bash
# Enable Aurora auto scaling
aws application-autoscaling register-scalable-target \
  --service-namespace rds \
  --resource-id cluster:compliance-aurora-cluster \
  --scalable-dimension rds:cluster:ReadReplicaCount \
  --min-capacity 1 \
  --max-capacity 5
```

---

## 🔄 **CI/CD Pipeline**

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster compliance-cluster \
            --service compliance-service \
            --force-new-deployment
```

---

## 🎯 **Go-Live Checklist**

- [ ] Aurora cluster created and schema deployed
- [ ] Bedrock model access enabled and tested
- [ ] Environment variables configured
- [ ] Security groups and VPC setup complete
- [ ] Secrets Manager configured
- [ ] Application deployed and health checks passing
- [ ] AI provider switching tested
- [ ] Monitoring and logging configured
- [ ] Backup and recovery procedures documented
- [ ] Load testing completed
- [ ] Security scan completed

---

## 📞 **Support & Troubleshooting**

### Common Issues

**Bedrock Access Denied**
- Verify model access is enabled in AWS Console
- Check IAM permissions for bedrock:InvokeModel
- Confirm region supports requested models

**Aurora Connection Issues**
- Verify security group allows connections
- Check VPC and subnet configuration
- Validate connection string format

**High AI Costs**
- Review token usage in CloudWatch
- Implement request caching
- Optimize prompt length
- Consider using cheaper models for non-critical operations

### Monitoring Commands

```bash
# Check Aurora status
aws rds describe-db-clusters --db-cluster-identifier compliance-aurora-cluster

# Monitor Bedrock usage
aws bedrock get-model-invocation-logging-configuration

# View CloudWatch metrics
aws cloudwatch get-metric-statistics \
  --namespace ComplianceChecker/AI \
  --metric-name TokensUsed \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

---

**🎉 Your modular AI-enhanced ComplianceChecker platform is now ready for production deployment with AWS Bedrock and Aurora PostgreSQL!**