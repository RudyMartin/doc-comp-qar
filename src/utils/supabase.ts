import { createClient } from '@supabase/supabase-js'
import { projectId, publicAnonKey } from '../../utils/supabase/info'
import { APP_CONSTANTS } from './constants'
import { mockProjects, mockActivities, mockRequirements } from './mockData'
import { AuroraService } from './aurora-service'

const supabaseUrl = `https://${projectId}.supabase.co`

export const supabase = createClient(supabaseUrl, publicAnonKey)

export interface AuthUser {
  id: string
  email: string
  name?: string
  access_token?: string
}

export class AuthService {
  static async signUp(email: string, password: string, name: string) {
    const response = await fetch(`${supabaseUrl}/functions/v1/make-server-6545ae52/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password, name })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Signup failed')
    }

    return response.json()
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new Error(error.message)
    }

    return data
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw new Error(error.message)
    }
  }

  static async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return null
    }

    return {
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.user_metadata?.name,
      access_token: session.access_token
    }
  }

  static async getAccessToken(): Promise<string | null> {
    const { data: { session } } = await supabase.auth.getSession()
    return session?.access_token || null
  }
}

export class APIService {
  private static async getAuthHeaders() {
    const token = await AuthService.getAccessToken()
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token || publicAnonKey}`
    }
  }

  private static async request(endpoint: string, options: RequestInit = {}) {
    // Use Aurora Postgres if configured
    if (APP_CONSTANTS.USE_AURORA_POSTGRES && !APP_CONSTANTS.DEMO_MODE) {
      return this.handleAuroraRequest(endpoint, options)
    }
    
    const headers = await this.getAuthHeaders()
    
    const response = await fetch(`${supabaseUrl}/functions/v1/make-server-6545ae52${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
  }

  private static async handleAuroraRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    // Route API requests to Aurora Postgres service
    const method = options.method || 'GET'
    const body = options.body ? JSON.parse(options.body as string) : {}
    
    // Get current user for database operations
    const user = await AuthService.getCurrentUser()
    if (!user) {
      throw new Error('Authentication required')
    }

    // Route requests based on endpoint
    if (endpoint === '/projects') {
      if (method === 'GET') {
        const projects = await AuroraService.getProjects(user.id)
        return { projects }
      } else if (method === 'POST') {
        const project = await AuroraService.createProject({ ...body, userId: user.id })
        return { project }
      }
    }
    
    if (endpoint.startsWith('/projects/') && endpoint.includes('/requirements')) {
      const projectId = endpoint.split('/')[2]
      if (method === 'GET') {
        const requirements = await AuroraService.getRequirements(projectId)
        return { requirements }
      } else if (method === 'POST') {
        const requirement = await AuroraService.createRequirement(projectId, body)
        return { requirement }
      }
    }
    
    if (endpoint === '/activities') {
      const activities = await AuroraService.getActivities(user.id)
      return { activities }
    }
    
    throw new Error(`Aurora endpoint not implemented: ${endpoint}`)
  }

  // Projects
  static async getProjects() {
    if (APP_CONSTANTS.DEMO_MODE) {
      // Return mock data in demo mode
      return Promise.resolve({ projects: mockProjects })
    }
    return this.request('/projects')
  }

  static async createProject(projectData: any) {
    if (APP_CONSTANTS.DEMO_MODE) {
      // Simulate project creation in demo mode
      const newProject = {
        id: `demo-${Date.now()}`,
        ...projectData,
        createdAt: new Date().toISOString(),
        status: 'active',
        compliance: 0,
        progress: 0
      }
      return Promise.resolve({ project: newProject })
    }
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData)
    })
  }

  static async updateProject(projectId: string, updates: any) {
    if (APP_CONSTANTS.DEMO_MODE) {
      // Simulate project update in demo mode
      return Promise.resolve({ success: true, projectId, updates })
    }
    return this.request(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    })
  }

  static async deleteProject(projectId: string) {
    if (APP_CONSTANTS.DEMO_MODE) {
      // Simulate project deletion in demo mode
      return Promise.resolve({ success: true, deletedId: projectId })
    }
    return this.request(`/projects/${projectId}`, {
      method: 'DELETE'
    })
  }

  // Requirements
  static async getRequirements(projectId: string) {
    if (APP_CONSTANTS.DEMO_MODE) {
      // Return mock requirements in demo mode
      return Promise.resolve({ requirements: mockRequirements })
    }
    return this.request(`/projects/${projectId}/requirements`)
  }

  static async createRequirement(projectId: string, requirementData: any) {
    if (APP_CONSTANTS.DEMO_MODE) {
      // Simulate requirement creation in demo mode
      const newRequirement = {
        id: `demo-req-${Date.now()}`,
        ...requirementData,
        lastUpdated: new Date().toISOString(),
        status: 'pending'
      }
      return Promise.resolve({ requirement: newRequirement })
    }
    return this.request(`/projects/${projectId}/requirements`, {
      method: 'POST',
      body: JSON.stringify(requirementData)
    })
  }

  // Documents
  static async uploadDocument(file: File, projectId: string, documentType: string) {
    if (APP_CONSTANTS.DEMO_MODE) {
      // Simulate document upload in demo mode
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate upload delay
      return Promise.resolve({
        success: true,
        document: {
          id: `demo-doc-${Date.now()}`,
          filename: file.name,
          projectId,
          documentType,
          uploadedAt: new Date().toISOString(),
          size: file.size
        }
      })
    }
    
    const token = await AuthService.getAccessToken()
    const formData = new FormData()
    formData.append('file', file)
    formData.append('projectId', projectId)
    formData.append('documentType', documentType)

    const response = await fetch(`${supabaseUrl}/functions/v1/make-server-6545ae52/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token || publicAnonKey}`
      },
      body: formData
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Upload failed')
    }

    return response.json()
  }

  static async getDocuments(projectId: string) {
    if (APP_CONSTANTS.DEMO_MODE) {
      // Return mock documents in demo mode
      return Promise.resolve({
        documents: [
          {
            id: 'demo-doc-1',
            filename: 'privacy_policy_v2.1.pdf',
            projectId,
            documentType: 'Privacy Policy',
            uploadedAt: '2024-01-20T14:22:00Z',
            size: 245760
          },
          {
            id: 'demo-doc-2',
            filename: 'security_controls.docx',
            projectId,
            documentType: 'Security Controls',
            uploadedAt: '2024-01-19T10:15:00Z',
            size: 156892
          }
        ]
      })
    }
    return this.request(`/projects/${projectId}/documents`)
  }

  // Activities
  static async getActivities() {
    if (APP_CONSTANTS.DEMO_MODE) {
      // Return mock activities in demo mode
      return Promise.resolve({ activities: mockActivities })
    }
    return this.request('/activities')
  }

  // Email Reports
  static async sendEmailReport(emailData: {
    projectId: string;
    to: string;
    subject: string;
    message: string;
    includeAttachment: boolean;
  }) {
    if (APP_CONSTANTS.DEMO_MODE) {
      // Simulate email sending in demo mode
      await new Promise(resolve => setTimeout(resolve, 1500))
      return Promise.resolve({
        success: true,
        messageId: `demo-email-${Date.now()}`,
        sentAt: new Date().toISOString()
      })
    }
    return this.request('/reports/email', {
      method: 'POST',
      body: JSON.stringify(emailData)
    })
  }

  // AI Provider Integration
  static async callAIProvider(requestData: {
    provider: string;
    model: string;
    prompt: string;
    temperature: number;
    maxTokens: number;
    projectId: string;
  }) {
    if (APP_CONSTANTS.DEMO_MODE) {
      // Simulate AI provider call in demo mode
      await new Promise(resolve => setTimeout(resolve, 1200))
      return {
        content: `Demo AI response for ${requestData.provider} ${requestData.model}. This would be the actual AI response in production.`,
        model: requestData.model,
        usage: {
          promptTokens: 150,
          completionTokens: 75,
          totalTokens: 225
        }
      }
    }
    return this.request('/ai/generate', {
      method: 'POST',
      body: JSON.stringify(requestData)
    })
  }
}