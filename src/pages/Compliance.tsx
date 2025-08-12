import React, { useState } from 'react'
import { ChevronLeft, ChevronRight, Search, Bookmark, Save, Download, StickyNote, Highlighter, MoreHorizontal, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Badge } from '../../components/ui/badge'
import { Progress } from '../../components/ui/progress'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Separator } from '../../components/ui/separator'
import { Toggle } from '../../components/ui/toggle'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip'
import Layout from '../components/Layout/Layout'

const Compliance: React.FC = () => {
  const [currentView, setCurrentView] = useState<'split' | 'policy' | 'program'>('split')
  const [isSynced, setIsSynced] = useState(true)
  const [policyPage, setPolicyPage] = useState(1)
  const [programPage, setProgramPage] = useState(1)
  const [zoom, setZoom] = useState(100)

  // Mock data for total pages (in real implementation, this would come from document metadata)
  const totalPolicyPages = 5
  const totalProgramPages = 3

  const complianceData = {
    compliant: 0,
    nonCompliant: 429,
    total: 429,
    percentage: 0
  }

  const handleViewChange = (view: 'split' | 'policy' | 'program') => {
    setCurrentView(view)
  }

  const handlePreviousSection = () => {
    if (isSynced) {
      // Move both documents together
      setPolicyPage(Math.max(1, policyPage - 1))
      setProgramPage(Math.max(1, programPage - 1))
    } else {
      // When not synced, this affects the currently visible document(s)
      if (currentView === 'split') {
        // In split view when not synced, move both documents
        setPolicyPage(Math.max(1, policyPage - 1))
        setProgramPage(Math.max(1, programPage - 1))
      } else if (currentView === 'policy') {
        setPolicyPage(Math.max(1, policyPage - 1))
      } else if (currentView === 'program') {
        setProgramPage(Math.max(1, programPage - 1))
      }
    }
  }

  const handleNextSection = () => {
    if (isSynced) {
      // Move both documents together
      setPolicyPage(Math.min(totalPolicyPages, policyPage + 1))
      setProgramPage(Math.min(totalProgramPages, programPage + 1))
    } else {
      // When not synced, this affects the currently visible document(s)
      if (currentView === 'split') {
        // In split view when not synced, move both documents
        setPolicyPage(Math.min(totalPolicyPages, policyPage + 1))
        setProgramPage(Math.min(totalProgramPages, programPage + 1))
      } else if (currentView === 'policy') {
        setPolicyPage(Math.min(totalPolicyPages, policyPage + 1))
      } else if (currentView === 'program') {
        setProgramPage(Math.min(totalProgramPages, programPage + 1))
      }
    }
  }

  // Individual document navigation functions
  const handlePolicyNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const newPage = Math.max(1, policyPage - 1)
      setPolicyPage(newPage)
      if (isSynced) setProgramPage(Math.max(1, programPage - 1))
    } else {
      const newPage = Math.min(totalPolicyPages, policyPage + 1)
      setPolicyPage(newPage)
      if (isSynced) setProgramPage(Math.min(totalProgramPages, programPage + 1))
    }
  }

  const handleProgramNavigation = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      const newPage = Math.max(1, programPage - 1)
      setProgramPage(newPage)
      if (isSynced) setPolicyPage(Math.max(1, policyPage - 1))
    } else {
      const newPage = Math.min(totalProgramPages, programPage + 1)
      setProgramPage(newPage)
      if (isSynced) setPolicyPage(Math.min(totalPolicyPages, policyPage + 1))
    }
  }

  return (
    <Layout>
      <div className="flex flex-col h-full bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">Healthcare Compliance Review 2024</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Policy vs Program Documentation</span>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">In Progress</Badge>
                <span>68%</span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <span className="mr-2">🕒</span>
                Saved 2 minutes ago
              </Button>
              <Button variant="ghost" size="sm">
                <Bookmark className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Save className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Breadcrumb */}
        <div className="bg-white border-b px-6 py-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Dashboard</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Compliance</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Title Section */}
          <div className="bg-white px-6 py-4 border-b">
            <div className="mb-4">
              <h1 className="text-2xl font-semibold text-gray-900">Compliance</h1>
              <p className="text-gray-600 mt-1">Compare policy requirements with program documentation to identify compliance gaps and track progress.</p>
            </div>

            {/* Control Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant={currentView === 'split' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleViewChange('split')}
                >
                  Split View
                </Button>
                <Button
                  variant={currentView === 'policy' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleViewChange('policy')}
                >
                  Policy Only
                </Button>
                <Button
                  variant={currentView === 'program' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleViewChange('program')}
                >
                  Program Only
                </Button>
                <Separator orientation="vertical" className="h-6" />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Toggle
                        pressed={isSynced}
                        onPressedChange={setIsSynced}
                        className="data-[state=on]:bg-blue-600 data-[state=on]:text-white"
                      >
                        🔗 {isSynced ? 'Synced' : 'Independent'}
                      </Toggle>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isSynced ? 'Documents navigate together' : 'Documents navigate independently'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button variant="outline" size="sm" onClick={handlePreviousSection}>
                  ⏮ Previous Section
                </Button>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <span>Section</span>
                  <span className="font-medium">2.1 -</span>
                  <span>Access Controls</span>
                  {!isSynced && (
                    <Badge variant="outline" className="ml-2">
                      Independent Mode
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleNextSection}>
                    Next Section ⏭
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Bookmark className="w-4 h-4" />
                    Bookmarks
                  </Button>
                  <Button variant="ghost" size="sm">
                    <StickyNote className="w-4 h-4" />
                    Notes
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Highlighter className="w-4 h-4" />
                    Highlight
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Save className="w-4 h-4" />
                    Save
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="w-4 h-4" />
                    Export
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Document Comparison Content */}
          <div className="flex-1 flex">
            {/* Documents Area */}
            <div className="flex-1 flex">
              {/* Policy Document */}
              {(currentView === 'split' || currentView === 'policy') && (
                <div className="flex-1 bg-white border-r">
                  <div className="h-full flex flex-col">
                    {/* Document Header */}
                    <div className="border-b p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                            📄
                          </div>
                          <div>
                            <h3 className="font-medium">Policy Document</h3>
                            <p className="text-sm text-gray-600">Page {policyPage} of {totalPolicyPages}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Search className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Document Content */}
                    <div className="flex-1 p-6 overflow-auto">
                      <div className="max-w-none">
                        <div className="mb-6">
                          <h2 className="text-lg font-semibold mb-4">HEALTHCARE COMPLIANCE POLICY 2024</h2>
                          
                          <div className="space-y-4 text-sm leading-relaxed">
                            <div>
                              <h3 className="font-medium text-base mb-2">Section {policyPage}: {policyPage === 1 ? 'Introduction' : policyPage === 2 ? 'Security Requirements' : `Section ${policyPage}`}</h3>
                              {policyPage === 1 && (
                                <p>This policy establishes comprehensive healthcare compliance requirements for all system implementations.</p>
                              )}
                              {policyPage === 2 && (
                                <div className="ml-4 space-y-2">
                                  <div>
                                    <h4 className="font-medium">2.1 Multi-factor Authentication</h4>
                                    <p>All system access must implement role-based access controls with multi-factor authentication for all users accessing sensitive healthcare data.</p>
                                  </div>
                                </div>
                              )}
                              {policyPage > 2 && (
                                <p>Policy content for section {policyPage}. This would contain the actual policy requirements and guidelines.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Document Footer */}
                    <div className="border-t p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handlePolicyNavigation('prev')}
                          disabled={policyPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm">{policyPage} / {totalPolicyPages}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handlePolicyNavigation('next')}
                          disabled={policyPage === totalPolicyPages}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-sm">{zoom}%</span>
                        <Button variant="ghost" size="sm">
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Program Document */}
              {(currentView === 'split' || currentView === 'program') && (
                <div className="flex-1 bg-white">
                  <div className="h-full flex flex-col">
                    {/* Document Header */}
                    <div className="border-b p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 bg-green-100 rounded flex items-center justify-center">
                            📄
                          </div>
                          <div>
                            <h3 className="font-medium">Program Document</h3>
                            <p className="text-sm text-gray-600">Page {programPage} of {totalProgramPages}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button variant="ghost" size="sm">
                            <Search className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <RotateCcw className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Document Content */}
                    <div className="flex-1 p-6 overflow-auto">
                      <div className="max-w-none">
                        <div className="mb-6">
                          <h2 className="text-lg font-semibold mb-4">HEALTHCARE MANAGEMENT SYSTEM DOCUMENTATION</h2>
                          
                          <div className="space-y-4 text-sm leading-relaxed">
                            <div>
                              <h3 className="font-medium text-base mb-2">Section {programPage}: {programPage === 1 ? 'System Overview' : programPage === 2 ? 'Authentication System' : `Section ${programPage}`}</h3>
                              {programPage === 1 && (
                                <p>Our healthcare management system provides comprehensive patient data management with security features.</p>
                              )}
                              {programPage === 2 && (
                                <p>The system currently implements basic username/password authentication for user access.</p>
                              )}
                              {programPage > 2 && (
                                <p>Program documentation for section {programPage}. This would contain the actual implementation details and system specifications.</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Document Footer */}
                    <div className="border-t p-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleProgramNavigation('prev')}
                          disabled={programPage === 1}
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <span className="text-sm">{programPage} / {totalProgramPages}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleProgramNavigation('next')}
                          disabled={programPage === totalProgramPages}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                        <span className="text-sm">{zoom}%</span>
                        <Button variant="ghost" size="sm">
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Compliance Checklist Sidebar */}
            <div className="w-80 bg-white border-l">
              <div className="h-full flex flex-col">
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Compliance Checklist</h3>
                    <Button variant="ghost" size="sm">
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    🔍 Analyze Compliance
                  </Button>
                </div>

                <div className="p-4 border-b">
                  <div className="text-sm text-red-600 mb-2">
                    <span className="font-medium">{complianceData.nonCompliant}</span> You exceeded your current quota, please 
                    check your plan and billing details. 
                    <a href="#" className="text-blue-600 hover:underline">
                      https://platform.openai.com/account/billing/overage-alert
                    </a>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                      <span className="font-medium">{complianceData.compliant}%</span>
                      <span className="text-gray-600 ml-1">Compliant</span>
                    </span>
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                      <span className="font-medium">{complianceData.nonCompliant}%</span>
                      <span className="text-gray-600 ml-1">Non-compliant</span>
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input 
                      placeholder="Search requirements..." 
                      className="pl-10 bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default Compliance