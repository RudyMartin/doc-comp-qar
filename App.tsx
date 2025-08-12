import React, { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './src/contexts/AuthContext'
import LoginForm from './src/components/Auth/LoginForm'
import Dashboard from './src/pages/Dashboard'
import DocumentUpload from './src/pages/DocumentUpload'
import RequirementsChecklist from './src/pages/RequirementsChecklist'
import ReportLibrary from './src/pages/ReportLibrary'
import Compliance from './src/pages/Compliance'
import ComplianceReport from './src/pages/ComplianceReport'
import AskAI from './src/pages/AskAI'
import { APP_CONSTANTS } from './src/utils/constants'
import './styles/globals.css'

const AppRoutes: React.FC = () => {
  const { user, loading } = useAuth()

  console.log('AppRoutes - user:', user, 'loading:', loading, 'DEMO_MODE:', APP_CONSTANTS.DEMO_MODE)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading QC Reporter...</p>
        </div>
      </div>
    )
  }

  if (!user && !APP_CONSTANTS.DEMO_MODE) {
    return <AuthPage />
  }

  return (
    <BrowserRouter>
      <div className="h-screen bg-gray-50">
        {/* Demo Mode Banner */}
        {APP_CONSTANTS.DEMO_MODE && (
          <div className="bg-orange-500 text-white px-4 py-2 text-center text-sm font-medium">
            🚀 DEMO MODE - No authentication required. Upload documents and generate QC reports for testing.
          </div>
        )}
        <div className={APP_CONSTANTS.DEMO_MODE ? "h-screen" : "h-screen"}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/document-upload" element={<DocumentUpload />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/requirements-checklist" element={<RequirementsChecklist />} />
            <Route path="/compliance-report" element={<ComplianceReport />} />
            <Route path="/ask-ai" element={<AskAI />} />
            <Route path="/report-library" element={<ReportLibrary />} />
            <Route path="/settings" element={<Dashboard />} />
            <Route path="/help" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  )
}

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false)

  return (
    <LoginForm 
      onToggleMode={() => setIsSignUp(!isSignUp)}
      isSignUp={isSignUp}
    />
  )
}

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}

export default App