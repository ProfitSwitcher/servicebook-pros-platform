import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  BarChart3,
  TrendingUp,
  Calendar,
  Filter,
  Download,
  Plus,
  Eye,
  Settings,
  ChevronDown,
  ChevronRight,
  MoreHorizontal,
  Presentation,
  Brain,
  Edit,
  Maximize,
  HelpCircle,
  FileText,
  Receipt,
  DollarSign,
  Users,
  Clock,
  Target,
  Zap
} from 'lucide-react'

const ReportingPage = () => {
  const [dateRange, setDateRange] = useState('year-to-date')
  const [showBy, setShowBy] = useState('month')
  const [expandedSections, setExpandedSections] = useState({
    businessInsights: true
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const sidebarItems = [
    {
      section: 'businessInsights',
      title: 'Business insights',
      icon: TrendingUp,
      badge: 'New',
      items: []
    },
    {
      section: 'dashboards',
      title: 'DASHBOARDS',
      isHeader: true,
      items: [
        { id: 'administrative', title: 'Administrative', icon: Settings },
        { id: 'electrical', title: 'Electrical', icon: Zap },
        { id: 'tech-performance', title: 'Tech Performance', icon: Users, active: true }
      ]
    },
    {
      section: 'allReports',
      title: 'ALL REPORTS',
      isHeader: true,
      items: [
        { id: 'jobs', title: 'Jobs', icon: FileText },
        { id: 'estimates', title: 'Estimates', icon: Receipt },
        { id: 'invoices', title: 'Invoices', icon: Receipt },
        { id: 'payments', title: 'Payments', icon: DollarSign },
        { id: 'custom', title: 'Custom', icon: Settings }
      ]
    }
  ]

  const renderSidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">Reporting</h1>
      </div>
      
      <nav className="p-4">
        {sidebarItems.map((section) => {
          if (section.isHeader) {
            return (
              <div key={section.section} className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          item.active 
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.title}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          }
          
          const Icon = section.icon
          const isExpanded = expandedSections[section.section]
          const hasItems = section.items && section.items.length > 0
          
          return (
            <div key={section.section} className="mb-2">
              <button
                onClick={() => hasItems && toggleSection(section.section)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{section.title}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {section.badge && (
                    <Badge className="bg-blue-100 text-blue-700 text-xs">
                      {section.badge}
                    </Badge>
                  )}
                  {hasItems && (
                    isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </button>
            </div>
          )
        })}
        
        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-700 px-3 py-2">
            <HelpCircle className="w-4 h-4" />
            <span>Give us feedback</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </nav>
    </div>
  )

  const renderJobsCompletedChart = () => (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">Jobs completed by technician</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Maximize className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-600 mb-1">Job count total</div>
            <div className="text-2xl font-bold">2</div>
          </div>
          
          {/* Chart */}
          <div className="h-64 flex items-end justify-center bg-gray-50 rounded-lg p-4">
            <div className="flex items-end space-x-8">
              <div className="flex flex-col items-center">
                <div 
                  className="w-16 bg-blue-600 rounded-t"
                  style={{ height: '120px' }}
                ></div>
                <div className="text-sm text-gray-600 mt-2">Dan Cooper</div>
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded"></div>
            <span className="text-sm text-gray-600">Job count</span>
          </div>
          
          <div className="text-center">
            <Button variant="outline" size="sm">
              View/edit report →
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderTimeTrackingChart = () => (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-base font-medium">Time tracking (completed jobs)</CardTitle>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Maximize className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <div className="text-lg font-medium text-gray-900 mb-2">No data meets your report criteria...</div>
            <div className="text-sm text-gray-600 mb-4">Try adjusting the dashboard's date range</div>
            <div className="text-xs text-gray-500">
              Is this report not relevant to you? You can move or remove it from your dashboard.
            </div>
          </div>
        </div>
        
        <div className="text-center mt-4">
          <Button variant="outline" size="sm">
            View/edit report →
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  const renderMainContent = () => (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            Tech Performance
            <Edit className="w-5 h-5 text-gray-400" />
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Presentation className="w-4 h-4 mr-2" />
            Presentation mode
          </Button>
          <Button variant="outline" size="sm">
            Add report
          </Button>
          <Button variant="outline" size="sm">
            <Brain className="w-4 h-4 mr-2" />
            Ask Analyst AI
          </Button>
          <Button variant="ghost" size="sm">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Global date range</span>
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="year-to-date">Year to date</option>
            <option value="last-month">Last month</option>
            <option value="last-quarter">Last quarter</option>
            <option value="custom">Custom range</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Show by</span>
          <select 
            value={showBy}
            onChange={(e) => setShowBy(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="day">Day</option>
            <option value="quarter">Quarter</option>
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {renderJobsCompletedChart()}
        {renderTimeTrackingChart()}
      </div>
    </div>
  )

  return (
    <div className="h-screen bg-gray-50 flex">
      {renderSidebar()}
      {renderMainContent()}
    </div>
  )
}

export default ReportingPage

