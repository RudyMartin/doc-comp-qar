# Aurora Postgres Setup Guide

This guide will help you configure the ComplianceChecker application to use AWS Aurora Postgres instead of the default Supabase database.

## Prerequisites

1. AWS Account with appropriate permissions
2. Aurora Postgres cluster set up in AWS RDS
3. Node.js application with the required dependencies
4. AWS CLI configured (optional, for management operations)

## Step 1: Create Aurora Postgres Cluster

### Using AWS Console

1. Go to AWS RDS Console
2. Click "Create database"
3. Choose "Amazon Aurora" 
4. Select "Aurora (PostgreSQL Compatible)"
5. Choose your preferred version (14.x or higher recommended)
6. Select "Aurora Serverless v2" for auto-scaling capabilities
7. Configure:
   - **Cluster identifier**: `compliancechecker-cluster`
   - **Master username**: `postgres`
   - **Master password**: Choose a secure password
   - **Database name**: `compliancechecker`

### Using AWS CLI

```bash
# Create Aurora Postgres cluster
aws rds create-db-cluster \
    --db-cluster-identifier compliancechecker-cluster \
    --engine aurora-postgresql \
    --engine-version 14.9 \
    --master-username postgres \
    --master-user-password YourSecurePassword123! \
    --database-name compliancechecker \
    --serverless-v2-scaling-configuration MinCapacity=0.5,MaxCapacity=16 \
    --engine-mode provisioned

# Create cluster instances
aws rds create-db-instance \
    --db-instance-identifier compliancechecker-writer \
    --db-instance-class db.serverless \
    --engine aurora-postgresql \
    --db-cluster-identifier compliancechecker-cluster

aws rds create-db-instance \
    --db-instance-identifier compliancechecker-reader \
    --db-instance-class db.serverless \
    --engine aurora-postgresql \
    --db-cluster-identifier compliancechecker-cluster
```

## Step 2: Configure Security Groups

Ensure your Aurora cluster's security group allows connections from your application:

```bash
# Add inbound rule for PostgreSQL (port 5432)
aws ec2 authorize-security-group-ingress \
    --group-id sg-xxxxxxxxx \
    --protocol tcp \
    --port 5432 \
    --source-group sg-yyyyyyyyy  # Your application's security group
```

## Step 3: Application Configuration

1. Copy the environment configuration:
```bash
cp .env.example .env
```

2. Update your `.env` file with Aurora settings:
```env
# Enable Aurora Postgres
USE_AURORA_POSTGRES=true
DEMO_MODE=false

# Aurora Configuration
AURORA_POSTGRES_HOST=compliancechecker-cluster.cluster-xxxxx.us-east-1.rds.amazonaws.com
AURORA_POSTGRES_PORT=5432
AURORA_POSTGRES_DATABASE=compliancechecker
AURORA_POSTGRES_USERNAME=postgres
AURORA_POSTGRES_PASSWORD=YourSecurePassword123!
AURORA_POSTGRES_SSL=true

# AWS Settings
AWS_REGION=us-east-1
AURORA_CLUSTER_IDENTIFIER=compliancechecker-cluster
```

## Step 4: Install PostgreSQL Client

Add PostgreSQL client to your project:

```bash
npm install pg @types/pg
# or
yarn add pg @types/pg
```

## Step 5: Database Migration

Run the database initialization to create tables and indexes:

```typescript
import { AuroraService } from './src/utils/aurora-service'

// Initialize database schema
await AuroraService.initializeDatabase()
```

## Step 6: Connection Pooling (Recommended)

For production applications, set up connection pooling:

```bash
npm install pg-pool
# or 
yarn add pg-pool
```

Update your Aurora configuration to use connection pooling for better performance.

## Step 7: Monitoring and Logging

### Enable Performance Insights

```bash
aws rds modify-db-cluster \
    --db-cluster-identifier compliancechecker-cluster \
    --enable-performance-insights \
    --performance-insights-retention-period 7
```

### CloudWatch Integration

Aurora automatically sends metrics to CloudWatch. Key metrics to monitor:
- `DatabaseConnections`
- `CPUUtilization`
- `FreeableMemory`
- `ReadLatency` / `WriteLatency`
- `ReadIOPS` / `WriteIOPS`

## Step 8: Backup and Recovery

Aurora provides automatic backups. Configure backup retention:

```bash
aws rds modify-db-cluster \
    --db-cluster-identifier compliancechecker-cluster \
    --backup-retention-period 7 \
    --preferred-backup-window "03:00-04:00"
```

## Step 9: Testing the Connection

Test your Aurora connection:

```typescript
import { AuroraService } from './src/utils/aurora-service'

// Test connection health
const health = await AuroraService.getConnectionHealth()
console.log('Aurora connection:', health)

// Test metrics
const metrics = await AuroraService.getAuroraMetrics()
console.log('Aurora metrics:', metrics)
```

## Troubleshooting

### Connection Issues

1. **Connection Timeout**
   - Check security group rules
   - Verify VPC configuration
   - Ensure cluster is in `available` state

2. **Authentication Failed**
   - Verify username/password
   - Check if user has necessary permissions
   - Ensure SSL configuration matches

3. **Database Not Found**
   - Verify database name in connection string
   - Check if database was created during cluster setup

### Performance Issues

1. **Slow Queries**
   - Enable Performance Insights
   - Review query execution plans
   - Add appropriate indexes

2. **Connection Pool Exhaustion**
   - Increase max connections in pool configuration
   - Implement connection retry logic
   - Monitor connection usage

## Best Practices

1. **Security**
   - Use IAM database authentication when possible
   - Enable encryption at rest and in transit
   - Regularly rotate passwords
   - Use AWS Secrets Manager for credentials

2. **Performance**
   - Use connection pooling
   - Implement read/write splitting for read replicas
   - Monitor and optimize slow queries
   - Use appropriate instance classes

3. **Cost Optimization**
   - Use Aurora Serverless v2 for variable workloads
   - Set appropriate min/max capacity
   - Enable auto-pause for development environments
   - Monitor and adjust capacity based on usage

4. **High Availability**
   - Enable multi-AZ deployment
   - Set up read replicas in different AZs
   - Implement proper error handling and retries
   - Regular backup testing

## Migration from Supabase

If migrating from Supabase to Aurora:

1. Export data from Supabase using `pg_dump`
2. Transform schema if needed
3. Import data to Aurora using `pg_restore`
4. Update application configuration
5. Test thoroughly before switching production traffic

## Additional Resources

- [Aurora Postgres Documentation](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/)
- [Aurora Serverless v2](https://docs.aws.amazon.com/AmazonRDS/latest/AuroraUserGuide/aurora-serverless-v2.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)