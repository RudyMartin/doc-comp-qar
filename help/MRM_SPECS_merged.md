# 📋 **MRM (Model Risk Management) Specifications**

## 📊 **Executive Summary**

This document defines the specifications for the Model Risk Management (MRM) Quality Assurance system, including data structures, workflows, and requirements for QA reviews.

---

## 🎯 **Completed QA Reviews Data Structure**

### **Core Review Information**


### **Review Sections**


### **Validation Review Segments**


### **Findings & Issues**


### **AI Suggestions**


### **QA Outcomes**


### **Policy Compliance**


---

## 📋 **Risk Tier Requirements**

### **Timeline Requirements by Risk Tier**
| Model Risk Tier | Full Scope Validation/Revalidation | Targeted-Scope Validation | Annual Model Review |
|-----------------|-----------------------------------|---------------------------|-------------------|
| High | 3 weeks (15 business days) | 2 weeks (10 business days) | 1 week (5 business days) |
| Medium | 2 weeks (10 business days) | 1 week (5 business days) | 3 business days |
| Low | 1 week (5 business days) | 3 business days | 3 business days |
| DM | 1 week (5 business days) | 3 business days | 3 business days |

### **Risk Tier Determination Factors**
- **Model Complexity:** Number of variables, sophistication of methodology
- **Business Impact:** Financial exposure, regulatory requirements
- **Data Quality:** Data availability, reliability, completeness
- **Model Performance:** Historical accuracy, stability
- **Regulatory Requirements:** Specific regulatory mandates

---

## 🔄 **QA Review Process Workflow**

### **1. Sample Selection & Assignment**


### **2. Assignment Management**


### **3. Review Execution**


### **4. Quality Assurance Review (QAR)**


---

## 📊 **Quality Metrics & Scoring**

### **Quality Scoring Framework**


### **Quality Weights by Risk Tier**


---

## 🎯 **Validation Review Requirements**

### **Validation Review Checklist**


### **Testing Requirements by Model Type**


---

## 📈 **Reporting & Analytics**

### **QA Review Reports**


### **Trend Analysis**


---

## 🔐 **Access Control & Security**

### **Role-Based Access**


### **Data Security Requirements**
- **Encryption:** All data encrypted at rest and in transit
- **Audit Trail:** Complete audit trail for all actions
- **Access Logging:** Log all data access and modifications
- **Backup:** Regular automated backups
- **Compliance:** GDPR, SOX, and other regulatory compliance

---

## 📦 **QA Review Package Components**

### **Complete QA Review Package Structure**
The QA Review Package is a comprehensive collection of documents and artifacts that support the Model Risk Management validation process. Each package contains the following components:

#### **1. Model Validation Report**


#### **2. Findings Document**


#### **3. Model Documentation**


#### **4. Testing Documentation**


#### **5. Data Quality Assessment**


#### **6. Code Review Documentation**


#### **7. Governance Documentation**


#### **8. Performance Monitoring Reports**


### **QA Review Package Metadata**


### **Package Quality Assessment**
The QA Review Package is assessed based on:
- **Completeness:** All required components present
- **Quality:** Individual component quality scores
- **Consistency:** Cross-references and data consistency
- **Compliance:** Regulatory and policy compliance
- **Timeliness:** Current and up-to-date information

---

## 🚀 **Quick Wins Implementation**

### **Dashboard Enhancement Features**
The following quick wins have been implemented to enhance user experience and functionality:

#### **1. Export Functionality**


#### **2. Drill-Down Capabilities**


#### **3. Advanced Filtering**


#### **4. Real-Time Updates**


#### **5. Performance Alerts**


#### **6. Detailed Report Viewer**


### **Implementation Status**
- ✅ **Export buttons** added to all charts and tables
- ✅ **Drill-down** on quarterly trends implemented
- ✅ **Search functionality** added to recent reports
- ✅ **Detailed report viewer** modal created
- ✅ **Performance alerts** and notifications system
- ✅ **Real-time updates** for key metrics
- ✅ **Advanced filtering** options implemented

---

## 🧹 **Navigation Consolidation**

### **Audit Trail Consolidation**
The generic Audit Trails page has been removed and its functionality consolidated into contextually relevant locations:

#### **Changes Made:**
- ❌ **Removed** generic "Audit Trails" page
- ❌ **Removed** redundant audit-trails routes from navigation
- ✅ **Added** Model Validation History to Model Inventory page
- ✅ **Consolidated** audit functionality into appropriate sections

#### **New Structure:**
- **Model Validation History** → Model Inventory page
- **Timeline features** → Integrated into Findings page
- **Change tracking** → Contextual to individual items
- **User activity logs** → System Settings/Admin (future)

#### **Benefits:**
- **Tighter navigation focus** - no redundant generic pages
- **Contextual relevance** - audit features where they belong
- **Improved user experience** - more focused, purposeful pages
- **Cleaner architecture** - elimination of duplicate functionality

---

## 🗄️ **Database Configuration System**

### **Multi-Provider Database Support**
The system now supports seamless transition between database providers with a comprehensive configuration interface.

#### **Supported Providers:**
- **Supabase** (Current/Default)
- **AWS PostgreSQL** (Future migration target)

#### **Configuration Features:**
- **Provider Selection** - Radio button selection between Supabase and AWS PostgreSQL
- **Dynamic Configuration Forms** - Provider-specific configuration fields
- **Connection Testing** - Built-in connection validation
- **Migration Tools** - Export schema, generate migration scripts
- **Environment Variable Integration** - Automatic loading of existing Supabase config

#### **Supabase Configuration:**


#### **AWS PostgreSQL Configuration:**


#### **Migration Workflow:**
1. **Configuration Setup** - Configure AWS PostgreSQL connection details
2. **Connection Testing** - Validate connectivity to target database
3. **Schema Export** - Export current Supabase schema
4. **Migration Script Generation** - Create PostgreSQL-compatible migration scripts
5. **Data Migration** - Transfer data with validation
6. **Provider Switch** - Update application to use new database

#### **Security Features:**
- **Password masking** for sensitive credentials
- **SSL configuration** options for secure connections
- **Connection pooling** management
- **Environment variable** integration for production deployments

---

## 📚 **Policy Repository System**

### **RAG Training Document Management**
The Policy Repository manages training documents for QA and Validation Agents across all validation segments.

#### **Core Features:**
- **Document Upload & Management** - Upload, edit, and organize policy documents
- **Segment-Based Organization** - Documents organized by validation segments
- **Agent-Specific Training** - Separate training for QA Agents vs Validation Agents
- **Training Status Tracking** - Monitor training progress (trained, training, pending)
- **Search & Filtering** - Advanced search across documents, segments, and agents
- **Version Control** - Track document versions and updates

#### **Validation Segments Supported:**
1. **Model Documentation** - Standards and requirements for model documentation
2. **Model Data** - Data quality assessment frameworks
3. **Conceptual Soundness** - Validation guidelines for theoretical foundations
4. **Code Review and Output Replication** - Best practices for code review
5. **Model Development Evidence** - Documentation of development processes
6. **Model Limitations and Compensating Controls** - Risk mitigation strategies
7. **Model Implementation** - Implementation guidelines and standards
8. **Model Performance Monitoring** - Performance tracking frameworks
9. **Model Interconnectivity** - Integration and dependency management
10. **Model Risk** - Risk assessment methodologies
11. **Model Governance** - Governance frameworks and oversight
12. **Grounding Documents** - Authoritative references and traceability requirements

#### **Agent Types:**
- **QA Agent** - Quality assurance and review processes
- **Validation Agent** - Model validation and assessment processes

#### **7 Specialized QA Agents for 6 QA Dimensions:**

| **QA Dimension**         | **Agents Assigned**                                    | **Role in Dimension**                                                                                                                                                |
| ------------------------ | ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Validation Review**    | `ValidatorVision`, `IntroInspector`, `AppendixAuditor` | `ValidatorVision` ensures test procedures meet requirements; `IntroInspector` verifies opening sections are complete; `AppendixAuditor` checks supporting materials. |
| **Validation Processes** | `ProcessPilot`, `ComplianceCompass`                    | `ProcessPilot` checks procedural adherence and documentation; `ComplianceCompass` ensures processes align with regulatory and privacy rules.                         |
| **Control Execution**    | `ControlCaptain`, `ComplianceCompass`                  | `ControlCaptain` verifies approvals and evidence are tracked; `ComplianceCompass` ensures execution meets compliance standards.                                      |
| **Data Quality**         | `ValidatorVision`, `ComplianceCompass`                 | `ValidatorVision` confirms requirement coverage; `ComplianceCompass` ensures data privacy is correctly marked and data rules followed.                               |
| **Style & Formatting**   | `StyleSentinel`, `IntroInspector`                      | `StyleSentinel` enforces formatting, numbering, and clarity; `IntroInspector` checks title/cover consistency.                                                        |
| **System Integration & Risk Assessment** | `LinkMapper`, `ImpactGauge`                    | `LinkMapper` maps model interconnectivity and dependencies; `ImpactGauge` measures model risk impact and materiality assessment.                                   |

#### **Complete Dimensions-to-Agents Mapping:**

| **QA Dimension** | **Validation Agents** | **QA Agents** | **Combined Role** |
|------------------|----------------------|---------------|-------------------|
| **Validation Review** | DocGuardian, LogicSmith, CodeEcho | ValidatorVision, IntroInspector, AppendixAuditor | Comprehensive validation methodology + test procedure QA |
| **Validation Processes** | BuildArchivist, GovernanceAnchor | ProcessPilot, ComplianceCompass | Process documentation + procedural adherence QA |
| **Control Execution** | RiskBuffer, DeployKeeper | ControlCaptain, ComplianceCompass | Control framework + approval tracking QA |
| **Data Quality** | DataSentinel, PerfWatch | ValidatorVision, ComplianceCompass | Data integrity + quality assessment QA |
| **Style & Formatting** | TruthBinder | StyleSentinel, IntroInspector | Documentation standards + formatting QA |
| **System Integration & Risk Assessment** | LinkMapper, ImpactGauge | ComplianceCompass, ValidatorVision | System compliance validation + integration requirement QA + risk framework validation |

#### **QA Agent Specializations:**

**ValidatorVision** - *Test Procedure & Requirement Coverage Agent*
- **Primary Focus**: Validation Review, Data Quality
- **Responsibilities**: Ensures test procedures meet requirements and confirms requirement coverage
- **Key Functions**: Test procedure validation, requirement mapping, coverage analysis

**IntroInspector** - *Opening Section & Title Consistency Agent*
- **Primary Focus**: Validation Review, Style & Formatting
- **Responsibilities**: Verifies opening sections are complete and checks title/cover consistency
- **Key Functions**: Introduction validation, title verification, opening section completeness

**AppendixAuditor** - *Supporting Materials Agent*
- **Primary Focus**: Validation Review
- **Responsibilities**: Checks supporting materials and appendices
- **Key Functions**: Appendix validation, supporting documentation review, reference checking

**ProcessPilot** - *Procedural Adherence Agent*
- **Primary Focus**: Validation Processes
- **Responsibilities**: Checks procedural adherence and documentation
- **Key Functions**: Process validation, procedural compliance, documentation review

**ComplianceCompass** - *Regulatory & Privacy Compliance Agent*
- **Primary Focus**: Validation Processes, Control Execution, Data Quality
- **Responsibilities**: Ensures alignment with regulatory and privacy rules across multiple dimensions
- **Key Functions**: Regulatory compliance, privacy validation, compliance standards enforcement

**ControlCaptain** - *Approval & Evidence Tracking Agent*
- **Primary Focus**: Control Execution
- **Responsibilities**: Verifies approvals and evidence are tracked
- **Key Functions**: Approval validation, evidence tracking, control verification

**StyleSentinel** - *Formatting & Clarity Agent*
- **Primary Focus**: Style & Formatting
- **Responsibilities**: Enforces formatting, numbering, and clarity
- **Key Functions**: Format validation, numbering consistency, clarity assessment

---

## 🤖 **AI Agents System**

### **12-Dimension MRM Framework with Specialized Agents**

The system employs 12 specialized AI agents, each responsible for a specific validation dimension. These agents work together to provide comprehensive model risk management coverage.

#### **Validation Agents by Dimension:**

**1. DocGuardian** - *Model Documentation Agent*
- **Focus**: Watches over Model Documentation integrity
- **Responsibilities**: 
  - Comprehensive written descriptions of purpose, methodology, data inputs, assumptions, and limitations
  - Diagrams, flowcharts, and logic explanations
  - Version history and change logs
- **Distinctive**: Ensures the model can be understood, operated, and audited without relying on the original developer

**2. DataSentinel** - *Model Data Agent*
- **Focus**: Protects Model Data integrity
- **Responsibilities**:
  - Source identification, lineage, and acquisition process
  - Data quality checks, completeness, and timeliness assessments
  - Data transformations, feature engineering, and normalization steps
- **Distinctive**: Focuses entirely on input integrity, separating it from modeling logic or outputs

**3. LogicSmith** - *Conceptual Soundness Agent*
- **Focus**: Conceptual Soundness crafting
- **Responsibilities**:
  - Theoretical justification and design rationale
  - Method selection aligned with business use case
  - Mathematical/statistical correctness of approach
- **Distinctive**: Evaluates whether the model's foundation makes sense and is defensible, even before code is written

**4. CodeEcho** - *Code Review Agent*
- **Focus**: Ensures Code Review & Replication
- **Responsibilities**:
  - Independent review of code for clarity, efficiency, and correctness
  - Verification that outputs can be consistently reproduced
  - Source control and dependency management
- **Distinctive**: Combines software engineering discipline with auditability of results

**5. BuildArchivist** - *Development Evidence Agent*
- **Focus**: Preserves Model Development Evidence
- **Responsibilities**:
  - Experiment logs, tuning results, and iteration history
  - Test and validation results during development
  - Evidence that model meets predefined acceptance criteria
- **Distinctive**: Creates a chain of custody for development decisions, enabling reconstruction if needed

**6. RiskBuffer** - *Limitations & Controls Agent*
- **Focus**: Manages Limitations & Controls
- **Responsibilities**:
  - Explicit listing of model blind spots and constraints
  - Compensating processes (e.g., manual review, conservative thresholds)
  - Scenarios where model is not fit for use
- **Distinctive**: Addresses risk proactively by embedding mitigation strategies into governance

**7. DeployKeeper** - *Implementation Agent*
- **Focus**: Secures Model Implementation
- **Responsibilities**:
  - Production environment configuration and change management
  - Security, access control, and operational procedures
  - Validation that implementation matches the approved design
- **Distinctive**: Ensures the deployed version matches the validated version, avoiding drift during go-live

**8. PerfWatch** - *Performance Monitoring Agent*
- **Focus**: Tracks Model Performance Monitoring
- **Responsibilities**:
  - Performance metrics (accuracy, bias, drift) post-deployment
  - Alert thresholds and automated triggers for review
  - Recalibration or retraining protocols
- **Distinctive**: Keeps the model in compliance and effective over time

**9. LinkMapper** - *Interconnectivity Agent*
- **Focus**: Maps Model Interconnectivity
- **Responsibilities**:
  - Dependencies between models and shared data pipelines
  - Impact analysis for upstream/downstream changes
  - Contingency planning for multi-model failures
- **Distinctive**: Identifies and manages compound risk from interconnected systems

**10. ImpactGauge** - *Risk Impact Agent*
- **Focus**: Measures Model Risk impact
- **Responsibilities**:
  - Tier classification and inherent risk assessment
  - Stress testing and scenario analysis
  - Potential financial, operational, or reputational impact
- **Distinctive**: Focuses on impact severity, not just technical correctness

**11. GovernanceAnchor** - *Governance Agent*
- **Focus**: Enforces Model Governance
- **Responsibilities**:
  - Roles, responsibilities, and escalation paths
  - Approval workflows and decision gates
  - Regulatory compliance mapping (e.g., SR 11-7, OCC 2011-12)
- **Distinctive**: Embeds oversight and accountability into the model lifecycle

**12. TruthBinder** - *Grounding Documents Agent*
- **Focus**: Ties decisions to Grounding Documents
- **Responsibilities**:
  - Authoritative references (regulatory texts, industry standards, internal policy)
  - Business requirement documents and stakeholder approvals
  - Source documents for assumptions, thresholds, and benchmarks
- **Distinctive**: Provides traceability — every claim, parameter, and decision ties back to a recognized, verifiable source

#### **Agent Integration Features:**
- **Specialized Training** - Each agent trained on specific validation dimension documents
- **Collaborative Analysis** - Agents work together to provide comprehensive coverage
- **Context-Aware Suggestions** - Recommendations based on specific dimension requirements
- **Continuous Learning** - Agents improve through feedback and new document training
- **Audit Trail** - Complete tracking of agent recommendations and decisions

#### **Agent Performance Metrics:**
- **Accuracy Rate** - Percentage of correct recommendations
- **Coverage Rate** - Percentage of validation areas addressed
- **Response Time** - Speed of agent analysis and suggestions
- **User Acceptance Rate** - Percentage of agent suggestions accepted by reviewers
- **Training Status** - Current training progress and effectiveness

#### **TypeScript Interfaces for Agents:**
typescript
interface PolicyDocument {
  id: string;
  title: string;
  segment: ValidationSegment;
  agentType: 'QA Agent' | 'Validation Agent';
  description: string;
  uploadDate: string;
  lastUpdated: string;
  version: string;
  status: 'active' | 'archived' | 'draft';
  fileSize: string;
  fileType: string;
  trainingStatus: 'trained' | 'training' | 'pending';
  usageCount: number;
  tags: string[];
}

interface ValidationSegment {
  id: string;
  name: string;
  description: string;
  agentTypes: ('QA Agent' | 'Validation Agent')[];
  documentCount: number;
  trainedAgents: number;
}

QA Review Management
├── Review Overview (ProjectsOverviewPage)
├── Create Review (CreateProjectPage)
└── Quality Check Details (integrated)
sql
-- Required PostgreSQL function for raw SQL execution
CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    result json;
    query_result record;
    result_array json[] := '{}';
BEGIN
    -- Execute the query and return results as JSON
    FOR query_result IN EXECUTE sql_query
    LOOP
        result_array := array_append(result_array, to_json(query_result));
    END LOOP;
    
    result := json_build_object(
        'data', result_array,
        'rowCount', array_length(result_array, 1)
    );
    
    RETURN result;
EXCEPTION
    WHEN OTHERS THEN
        -- Return error information
        RETURN json_build_object(
            'error', SQLERRM,
            'errorCode', SQLSTATE,
            'data', '[]',
            'rowCount', 0
        );
END;
$$;
sql
-- Count agents in MRM schema
SELECT COUNT(*) FROM mrm.agents;

-- View detailed agent information
SELECT name, type, status, training_status, documents_trained, accuracy, coverage 
FROM mrm.agents ORDER BY name;

-- Count dimensions
SELECT COUNT(*) FROM mrm.dimension;

-- View agent assignments
SELECT ad.*, a.name as agent_name, d.code as dimension_name 
FROM mrm.agent_dimension ad 
JOIN mrm.agents a ON ad.agent_id = a.id 
JOIN mrm.dimension d ON ad.dimension_id = d.id;
```

#### **Security Considerations:**
- **Read-only operations** - Only SELECT queries are supported
- **Schema isolation** - Queries respect database schema boundaries
- **Error sanitization** - Error messages don't expose sensitive information
- **Permission validation** - Queries respect user permissions

#### **User Interface Features:**
- **Query input area** - Large text area for SQL input
- **Sample query buttons** - One-click query execution
- **Result display** - Formatted JSON results with row counts
- **Error display** - Clear error messages with details
- **Loading states** - Visual feedback during query execution

### **Performance Requirements**
- Page load times: <2 seconds
- AI response times: <5 seconds
- Database queries: <100ms
- Real-time updates: <1 second latency
- Concurrent users: 50+ simultaneous users

### **Scalability Considerations**
- Horizontal scaling capability
- Database read replicas
- Caching strategy for frequently accessed data
- CDN for static assets
- Load balancing for high availability

This specification document provides the foundation for implementing a comprehensive MRM Quality Assurance system that meets regulatory requirements and industry best practices.

## 📋 **DocCompliance Pro – MRM Requirements**

### 1️⃣ Assignments
**Source:** Inventory of model governance data in **MUSE** (Salesforce).  

**QA Manager Role:**
- Determines percentage of reviews to sample.
- Decides which reviews are in progress, which to sample, and which not to sample.
- Monitors quarterly volumes and activity trends.

**References:**
- **Alex Snow** for algorithm and parameters to consider.

### 2️⃣ Document Sources
- All documents stored in **MUSE**, except:  
  - Highly restrictive documents → stored on shared drives with specific permission controls.

**MVP1:**
- No repository creation.
- Manual upload of files for QA review.

**Future:**
- Box integration planned for later in 2025.

### 3️⃣ Control Checkpoints
- All **control checkpoints** must be documented by validators.
- Validator control checkpoints must also be documented by QA.

**MVP1 Scope:**
- Focuses on validator control checkpoints only.

### 4️⃣ QA Reviewer UX
Focus QA screen on:
- **Assigned tasks** (“do this”), not process flows.
- Missing items and pending QA reports.

**Job Aid Integration:**
- Pre-filled via chat where possible.
- Otherwise completed manually by reviewer.

**Document Access:**
- Provide inline PDF view of the document under review.

### 5️⃣ Metadata
- Extract from **EMAR** or **RDS** at the **time of review**.
- **Critical:** Match date to model version and review details.

**Reference:**
- **Hannah Shin** for sourcing guidance.

### 6️⃣ Policy Documents
- Include Policy Standards that are classified as *Guidelines*.
- Run through AI to:
  - Check consistency.
  - Suggest clarity improvements.
  - Recommend implementation approaches.

**Reference:**
- **Mark Wustefield** for standards content.

### 7️⃣ Activity Tracking & Usage Metrics
- **Usage** is a core success metric for the program.

**User tiers:**
1. **QA Team** – Document that all controls have been met; share results (e.g., PDF report).
2. **Validation Staff** – Run tool as part of peer review step.
3. **Model Development Community** – Use as pre-flight check to improve documents over time.

**Progression Tracking:**
- Historical scoring to show improvement over time.

### 8️⃣ FAQ Section
Focus on:
- What the system **“knows”** about the process.
- How it can **prioritize** items for review.

## 🆕 **Process Awareness Agents**
*(Operate at different levels, for different users, with different scopes.)*

### **ProcessPilot – Procedural Adherence Agent**
**🎯 Scope:**
- Checks whether the documented process was followed for the validation review.
- Looks **backward** at what happened and compares it to official MRM procedures.
- Focused on **compliance with steps**, **required artifacts**, and **proper documentation**.

**👥 Users:**
- QA Reviewers
- Validation Leads (peer review stage)

**📌 Example Tasks:**
- Verify that meeting minutes were recorded for required checkpoints.
- Confirm all steps in the validation plan were executed and documented.
- Flag missing artifacts required by procedure.
- Check adherence to timelines and mandatory sign-offs.

### **ModelGPS – Role & Lifecycle Navigation Agent**
**🎯 Scope:**
- Guides a **specific user** through where they are in the process **now** and what to do **next**.
- Looks **forward** at the remaining steps in their **current role**.
- Dynamic — adjusts recommendations based on **user type** (QA, validator, developer).

**👥 Users:**
- QA Team
- Validation Staff
- Model Development Community

**📌 Example Tasks:**
- For QA Reviewer: “You’ve completed 60% of the checklist — next, verify control checkpoint C-102.”
- For Validator: “Your QA review is pending; submit supporting test documentation before deadline.”
- For Developer: “Run the pre-flight review to catch formatting issues before submission.”
- For any role: “You are in Stage 3 of 5 — estimated 2 hours to completion.”

### **Key Differences Table**

| **Feature**       | **ProcessPilot (Procedural Adherence)** | **ModelGPS (Role & Lifecycle Navigation)** |
|-------------------|-----------------------------------------|---------------------------------------------|
| **Primary View**  | Backward-looking (audit compliance)     | Forward-looking (next step guidance)        |
| **Focus**         | Process adherence                       | User’s position in lifecycle & next steps   |
| **Scope**         | Review of completed/ongoing process     | Active navigation through process           |
| **Output**        | Pass/fail checks, missing steps         | Personalized action list, progress tracking |
| **Target Users**  | QA Reviewers, Validators                | All user tiers (QA, Validators, Developers) |
| **Dependencies**  | Needs completed artifacts & logs        | Needs role metadata & process map           |
| **Example Question** | “Did you follow the procedure?”      | “What should I do next in my role?”         |

## 📊 **Updated Dimensions-to-Agents Mapping**

| **QA Dimension** | **Agents Assigned** |
|---|---|
| **Validation Review** | ValidatorVision, IntroInspector, AppendixAuditor, EfficiencyMetricAssist, **ModelGPS** |
| **Validation Processes** | **ProcessPilot**, ComplianceCompass, EfficiencyMetricAssist, TemplateMaster |
| **Control Execution** | ControlCaptain, ComplianceCompass, TemplateMaster, **ModelGPS** |
| **Data Quality** | ValidatorVision, ComplianceCompass, EfficiencyMetricAssist |
| **Style & Formatting** | StyleSentinel, IntroInspector, TemplateMaster |
| **System Integration & Risk Assessment** | LinkMapper, ImpactGauge |