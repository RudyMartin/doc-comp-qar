import { APP_CONSTANTS } from './constants'
import { APIService as SupabaseAPIService } from './supabase'
import { AuroraService } from './aurora-service'

// Database provider abstraction
export interface DatabaseProvider {
  // Projects
  getProjects(): Promise<any>
  createProject(projectData: any): Promise<any>
  updateProject(projectId: string, updates: any): Promise<any>
  deleteProject(projectId: string): Promise<any>
  
  // Requirements
  getRequirements(projectId: string): Promise<any>
  createRequirement(projectId: string, requirementData: any): Promise<any>
  
  // Documents
  getDocuments(projectId: string): Promise<any>
  uploadDocument(file: File, projectId: string, documentType: string): Promise<any>
  
  // Activities
  getActivities(): Promise<any>
}

// Supabase Database Provider
class SupabaseDatabaseProvider implements DatabaseProvider {
  async getProjects(): Promise<any> {
    return SupabaseAPIService.getProjects()
  }
  
  async createProject(projectData: any): Promise<any> {
    return SupabaseAPIService.createProject(projectData)
  }
  
  async updateProject(projectId: string, updates: any): Promise<any> {
    return SupabaseAPIService.updateProject(projectId, updates)
  }
  
  async deleteProject(projectId: string): Promise<any> {
    return SupabaseAPIService.deleteProject(projectId)
  }
  
  async getRequirements(projectId: string): Promise<any> {
    return SupabaseAPIService.getRequirements(projectId)
  }
  
  async createRequirement(projectId: string, requirementData: any): Promise<any> {
    return SupabaseAPIService.createRequirement(projectId, requirementData)
  }
  
  async getDocuments(projectId: string): Promise<any> {
    return SupabaseAPIService.getDocuments(projectId)
  }
  
  async uploadDocument(file: File, projectId: string, documentType: string): Promise<any> {
    return SupabaseAPIService.uploadDocument(file, projectId, documentType)
  }
  
  async getActivities(): Promise<any> {
    return SupabaseAPIService.getActivities()
  }
}

// Aurora Database Provider
class AuroraDatabaseProvider implements DatabaseProvider {
  private async getCurrentUserId(): Promise<string> {
    // In a real implementation, get user ID from auth context
    return 'demo-user-id' // Mock user ID for demo
  }
  
  async getProjects(): Promise<any> {
    const userId = await this.getCurrentUserId()
    const projects = await AuroraService.getProjects(userId)
    return { projects }
  }
  
  async createProject(projectData: any): Promise<any> {
    const userId = await this.getCurrentUserId()
    const project = await AuroraService.createProject({ ...projectData, userId })
    return { project }
  }
  
  async updateProject(projectId: string, updates: any): Promise<any> {
    const project = await AuroraService.updateProject(projectId, updates)
    return { project }
  }
  
  async deleteProject(projectId: string): Promise<any> {
    await AuroraService.deleteProject(projectId)
    return { success: true }
  }
  
  async getRequirements(projectId: string): Promise<any> {
    const requirements = await AuroraService.getRequirements(projectId)
    return { requirements }
  }
  
  async createRequirement(projectId: string, requirementData: any): Promise<any> {
    const requirement = await AuroraService.createRequirement(projectId, requirementData)
    return { requirement }
  }
  
  async getDocuments(projectId: string): Promise<any> {
    const documents = await AuroraService.getDocuments(projectId)
    return { documents }
  }
  
  async uploadDocument(file: File, projectId: string, documentType: string): Promise<any> {
    // In a real implementation, upload file to S3 and store metadata in Aurora
    const userId = await this.getCurrentUserId()
    const document = await AuroraService.createDocument({
      projectId,
      filename: file.name,
      filePath: `uploads/${projectId}/${file.name}`,
      fileSize: file.size,
      documentType,
      mimeType: file.type,
      uploadedBy: userId
    })
    return { document }
  }
  
  async getActivities(): Promise<any> {
    const userId = await this.getCurrentUserId()
    const activities = await AuroraService.getActivities(userId)
    return { activities }
  }
}

// Database Factory
export class DatabaseFactory {
  private static instance: DatabaseProvider | null = null
  
  static getInstance(): DatabaseProvider {
    if (!this.instance) {
      this.instance = this.createProvider()
    }
    return this.instance
  }
  
  private static createProvider(): DatabaseProvider {
    switch (APP_CONSTANTS.DATABASE_PROVIDER) {
      case 'aurora-postgres':
        return new AuroraDatabaseProvider()
      case 'supabase':
      default:
        return new SupabaseDatabaseProvider()
    }
  }
  
  // Reset instance (useful for testing or switching providers)
  static resetInstance(): void {
    this.instance = null
  }
  
  // Get current provider type
  static getCurrentProvider(): string {
    return APP_CONSTANTS.DATABASE_PROVIDER
  }
}

// Convenience wrapper that maintains backward compatibility
export const DatabaseService = {
  // Projects
  getProjects: () => DatabaseFactory.getInstance().getProjects(),
  createProject: (projectData: any) => DatabaseFactory.getInstance().createProject(projectData),
  updateProject: (projectId: string, updates: any) => DatabaseFactory.getInstance().updateProject(projectId, updates),
  deleteProject: (projectId: string) => DatabaseFactory.getInstance().deleteProject(projectId),
  
  // Requirements
  getRequirements: (projectId: string) => DatabaseFactory.getInstance().getRequirements(projectId),
  createRequirement: (projectId: string, requirementData: any) => DatabaseFactory.getInstance().createRequirement(projectId, requirementData),
  
  // Documents
  getDocuments: (projectId: string) => DatabaseFactory.getInstance().getDocuments(projectId),
  uploadDocument: (file: File, projectId: string, documentType: string) => DatabaseFactory.getInstance().uploadDocument(file, projectId, documentType),
  
  // Activities
  getActivities: () => DatabaseFactory.getInstance().getActivities(),
  
  // Provider info
  getCurrentProvider: () => DatabaseFactory.getCurrentProvider()
}