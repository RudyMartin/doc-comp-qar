# Database Configuration Guide

This guide explains how to configure and use the database systems in ComplianceChecker. The application supports two database providers: **Supabase** (default) and **AWS Aurora Postgres**.

## Overview

ComplianceChecker uses a flexible database abstraction layer that allows you to switch between different database providers without changing your application code. This makes it easy to:

- Start development with Supabase for rapid prototyping
- Scale to AWS Aurora Postgres for production workloads
- Test with demo data during development
- Maintain consistent API interfaces across providers

## Database Providers

### 1. Supabase (Default)
- **Best for**: Rapid development, prototyping, small to medium applications
- **Features**: Built-in auth, real-time subscriptions, edge functions, file storage
- **Setup**: Quick setup with hosted service
- **Cost**: Free tier available, pay-as-you-scale

### 2. AWS Aurora Postgres
- **Best for**: Enterprise applications, high-performance requirements, AWS-centric architecture
- **Features**: Auto-scaling, high availability, performance insights, serverless v2
- **Setup**: Requires AWS account and infrastructure setup
- **Cost**: More predictable pricing for large workloads

## Configuration Files

### Core Configuration Files
- `/src/utils/constants.ts` - Main application constants and provider selection
- `/src/utils/aurora-config.ts` - Aurora Postgres specific configuration
- `/src/utils/aurora-service.ts` - Aurora database service implementation
- `/src/utils/database-factory.ts` - Database provider abstraction layer
- `/src/utils/supabase.ts` - Supabase service implementation
- `/.env.example` - Environment variable template

## Environment Variables

### Core Settings
```env
# Database Provider Selection
USE_AURORA_POSTGRES=false  # Set to true to use Aurora Postgres
DEMO_MODE=true            # Set to false for production

# Provider-specific configurations below...
```

### Supabase Configuration
```env
SUPABASE_PROJECT_ID=your-project-id
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_URL=https://your-project-id.supabase.co
```

### Aurora Postgres Configuration
```env
AURORA_POSTGRES_HOST=your-aurora-cluster.cluster-xxxxx.us-east-1.rds.amazonaws.com
AURORA_POSTGRES_PORT=5432
AURORA_POSTGRES_DATABASE=compliancechecker
AURORA_POSTGRES_USERNAME=postgres
AURORA_POSTGRES_PASSWORD=your-secure-password
AURORA_POSTGRES_SSL=true

# AWS Settings
AWS_REGION=us-east-1
AURORA_CLUSTER_IDENTIFIER=compliancechecker-cluster
```

## Switching Database Providers

### Option 1: Environment Variables (Recommended)
1. Update your `.env` file:
```env
USE_AURORA_POSTGRES=true  # Switch to Aurora
# or
USE_AURORA_POSTGRES=false # Switch to Supabase
```

2. Restart your application - the database factory will automatically use the correct provider.

### Option 2: Code Configuration
In `/src/utils/constants.ts`:
```typescript
export const APP_CONSTANTS = {
  // ... other constants
  USE_AURORA_POSTGRES: true, // or false
  DATABASE_PROVIDER: 'aurora-postgres', // or 'supabase'
}
```

## Database Factory Pattern

The application uses a factory pattern to abstract database operations:

```typescript
import { DatabaseService } from './src/utils/database-factory'

// These calls work with both Supabase and Aurora
const projects = await DatabaseService.getProjects()
const newProject = await DatabaseService.createProject(projectData)
```

### Available Operations
- **Projects**: `getProjects()`, `createProject()`, `updateProject()`, `deleteProject()`
- **Requirements**: `getRequirements()`, `createRequirement()`
- **Documents**: `getDocuments()`, `uploadDocument()`
- **Activities**: `getActivities()`

## Demo Mode

Demo mode allows you to test the application without setting up a real database:

```env
DEMO_MODE=true
```

### Demo Mode Features
- Uses mock data for all database operations
- No authentication required
- Orange banner indicates demo mode is active
- Perfect for development and testing

### Disabling Demo Mode
```env
DEMO_MODE=false
```
When disabled, the application will use your configured database provider.

## Setup Instructions

### Setting up Supabase

1. **Create a Supabase Project**
   - Visit [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and anon key

2. **Configure Environment Variables**
   ```env
   USE_AURORA_POSTGRES=false
   SUPABASE_PROJECT_ID=your-project-id
   SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_URL=https://your-project-id.supabase.co
   ```

3. **Set up Database Schema** (if needed)
   - Supabase provides a web interface for schema management
   - Tables are created automatically by the application

### Setting up Aurora Postgres

For detailed Aurora setup instructions, see [`/docs/aurora-setup.md`](../docs/aurora-setup.md).

**Quick Setup:**

1. **Create Aurora Cluster**
   ```bash
   aws rds create-db-cluster \
     --db-cluster-identifier compliancechecker-cluster \
     --engine aurora-postgresql \
     --master-username postgres \
     --master-user-password YourSecurePassword123!
   ```

2. **Configure Environment Variables**
   ```env
   USE_AURORA_POSTGRES=true
   AURORA_POSTGRES_HOST=your-cluster-endpoint
   AURORA_POSTGRES_USERNAME=postgres
   AURORA_POSTGRES_PASSWORD=YourSecurePassword123!
   # ... other Aurora settings
   ```

3. **Initialize Database Schema**
   ```typescript
   import { AuroraService } from './src/utils/aurora-service'
   await AuroraService.initializeDatabase()
   ```

## Database Schema

Both providers use the same schema structure:

### Core Tables
- **users** - User accounts and profiles
- **projects** - Compliance projects
- **requirements** - Project requirements and checks
- **documents** - Uploaded files and metadata  
- **activities** - Activity log and audit trail

### Key Features
- UUID primary keys for all tables
- Proper foreign key relationships
- Timestamps for all records
- JSONB support for flexible metadata
- Optimized indexes for performance

## Monitoring and Health Checks

### Check Current Provider
```typescript
import { DatabaseFactory } from './src/utils/database-factory'

console.log('Current provider:', DatabaseFactory.getCurrentProvider())
```

### Aurora-Specific Monitoring
```typescript
import { AuroraService } from './src/utils/aurora-service'

// Connection health
const health = await AuroraService.getConnectionHealth()

// Performance metrics
const metrics = await AuroraService.getAuroraMetrics()
```

## Troubleshooting

### Common Issues

**1. Environment Variables Not Loading**
- Ensure `.env` file is in project root
- Restart your development server
- Check for typos in variable names

**2. Connection Timeouts**
- Verify network connectivity
- Check firewall/security group settings
- Ensure database is running and accessible

**3. Authentication Errors**
- Verify credentials are correct
- Check if user has necessary permissions
- For Aurora: ensure IAM roles are configured correctly

**4. Schema Errors**
- Run database initialization for Aurora
- Check if tables exist
- Verify foreign key relationships

### Getting Help

- Check the [Aurora Setup Guide](../docs/aurora-setup.md) for detailed Aurora configuration
- Review environment variable examples in `.env.example`
- Enable demo mode for local testing without database setup

## Best Practices

### Development
- Use demo mode for initial development
- Start with Supabase for rapid prototyping
- Keep environment variables in `.env` (not committed to git)

### Production
- Use Aurora Postgres for high-performance needs
- Enable SSL connections
- Implement proper backup strategies
- Monitor database performance regularly
- Use connection pooling for high-traffic applications

### Security
- Never commit credentials to version control
- Use AWS Secrets Manager for production credentials
- Enable database encryption at rest and in transit
- Regularly rotate passwords and API keys
- Implement proper IAM roles and policies

## Migration Between Providers

### From Supabase to Aurora
1. Export data from Supabase using `pg_dump`
2. Set up Aurora Postgres cluster
3. Import data using `pg_restore`
4. Update environment variables
5. Test thoroughly before switching production traffic

### From Aurora to Supabase
1. Export data from Aurora
2. Create Supabase project and tables
3. Import data via Supabase dashboard or API
4. Update environment configuration
5. Verify all functionality works correctly

---

**Need more help?** Check the [Aurora Setup Guide](../docs/aurora-setup.md) or review the configuration examples in the codebase.