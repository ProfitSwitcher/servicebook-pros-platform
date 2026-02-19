import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import FinancialCharts from './FinancialCharts'
import InteractiveMap from './InteractiveMap'
import apiClient from '../utils/apiClient'
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar, 
  MapPin, 
  FileText, 
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Zap
} from 'lucide-react'
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const ComprehensiveDashboard = ({ user, company, estimates, jobs, invoices }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('30d')
  const [activeView, setActiveView] = useState('overview')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dashboardData, setDashboardData] = useState({
    revenue: {
      current: 45280,
      previous: 38950,
      growth: 16.3
    },
    jobs: {
      completed: 127,
      inProgress: 23,
      scheduled: 45
    },
    customers: {
      total: 89,
      new: 12,
      retention: 94.2
    },
    estimates: {
      pending: 18,
      approved: 34,
      conversion: 65.4
    }
  })

  // Load analytics data from API
  const loadAnalyticsData = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Load analytics summary from API
      const analyticsData = await apiClient.getAnalyticsSummary()
      
      if (analyticsData) {
        setDashboardData({
          revenue: {
            current: analyticsData.total_invoice_amount || 45280,
            previous: analyticsData.previous_period_revenue || 38950,
            growth: analyticsData.revenue_growth || 16.3
          },
          jobs: {
            completed: analyticsData.completed_jobs || 127,
            inProgress: analyticsData.in_progress_jobs || 23,
            scheduled: analyticsData.scheduled_jobs || 45
          },
          customers: {
            total: analyticsData.total_customers || 89,
            new: analyticsData.new_customers || 12,
            retention: analyticsData.customer_retention || 94.2
          },
          estimates: {
            pending: analyticsData.pending_estimates || 18,
            approved: analyticsData.approved_estimates || 34,
            conversion: analyticsData.estimate_conversion || 65.4
          }
        })
      }
      
    } catch (error) {
      console.error('Error loading analytics data:', error)
      setError('Failed to load analytics data')
      // Keep default sample data if API fails
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount and when timeframe changes
  useEffect(() => {
    loadAnalyticsData()
  }, [selectedTimeframe])

  // Load additional analytics data
  const [revenueByMonth, setRevenueByMonth] = useState([])
  const [topCustomers, setTopCustomers] = useState([])
  const [churnAnalysis, setChurnAnalysis] = useState([])

  const loadDetailedAnalytics = async () => {
    try {
      const [revenueData, customersData, churnData] = await Promise.all([
        apiClient.getRevenueByMonth(),
        apiClient.getTopCustomers(),
        apiClient.getChurnAnalysis()
      ])
      
      setRevenueByMonth(revenueData || [])
      setTopCustomers(customersData || [])
      setChurnAnalysis(churnData || [])
      
    } catch (error) {
      console.error('Error loading detailed analytics:', error)
      // Use sample data as fallback
    }
  }

  useEffect(() => {
    loadDetailedAnalytics()
  }, [])

  const recentActivity = [
    { id: 1, type: 'job', title: 'HVAC Repair - Johnson Residence', status: 'completed', amount: 850, time: '2 hours ago' },
    { id: 2, type: 'estimate', title: 'Plumbing Installation - Smith Office', status: 'pending', amount: 1200, time: '4 hours ago' },
    { id: 3, type: 'invoice', title: 'Electrical Work - Davis Home', status: 'paid', amount: 650, time: '6 hours ago' },
    { id: 4, type: 'job', title: 'AC Maintenance - Wilson Building', status: 'in-progress', amount: 300, time: '1 day ago' }
  ]

  const upcomingJobs = [
    { id: 1, title: 'Kitchen Renovation - Brown Residence', time: '9:00 AM', location: '123 Oak St, Miami, FL', technician: 'Mike Johnson' },
    { id: 2, title: 'Bathroom Plumbing - Green Office', time: '11:30 AM', location: '456 Pine Ave, Miami, FL', technician: 'Sarah Davis' },
    { id: 3, title: 'HVAC Service - Blue Corp', time: '2:00 PM', location: '789 Elm Rd, Miami, FL', technician: 'Tom Wilson' },
    { id: 4, title: 'Electrical Repair - Red Building', time: '4:30 PM', location: '321 Maple Dr, Miami, FL', technician: 'Lisa Brown' }
  ]


  const monthlyRevenueData = [
    { month: 'Aug', revenue: 32400 },
    { month: 'Sep', revenue: 38100 },
    { month: 'Oct', revenue: 35800 },
    { month: 'Nov', revenue: 41200 },
    { month: 'Dec', revenue: 45280 },
    { month: 'Jan', revenue: 38950 },
  ]
  const financialMetrics = [
    { label: 'Monthly Revenue', value: '$45,280', change: '+16.3%', trend: 'up', color: 'green' },
    { label: 'Outstanding Invoices', value: '$12,450', change: '-8.2%', trend: 'down', color: 'red' },
    { label: 'Average Job Value', value: '$356', change: '+5.7%', trend: 'up', color: 'green' },
    { label: 'Profit Margin', value: '28.4%', change: '+2.1%', trend: 'up', color: 'green' }
  ]

  const jobLocations = [
    { id: 1, address: '123 Oak St, Miami, FL', lat: 25.7617, lng: -80.1918, status: 'completed' },
    { id: 2, address: '456 Pine Ave, Miami, FL', lat: 25.7717, lng: -80.1818, status: 'in-progress' },
    { id: 3, address: '789 Elm Rd, Miami, FL', lat: 25.7517, lng: -80.2018, status: 'scheduled' },
    { id: 4, address: '321 Maple Dr, Miami, FL', lat: 25.7417, lng: -80.1718, status: 'completed' }
  ]

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Comprehensive business insights and performance metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Report
          </Button>
        </div>
      </div>

      {/* Dashboard Navigation */}
      <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveView('overview')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'overview' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Activity className="w-4 h-4 mr-2 inline" />
          Overview
        </button>
        <button
          onClick={() => setActiveView('financial')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'financial' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <BarChart3 className="w-4 h-4 mr-2 inline" />
          Financial Analytics
        </button>
        <button
          onClick={() => setActiveView('locations')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'locations' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MapPin className="w-4 h-4 mr-2 inline" />
          Job Locations
        </button>
        <button
          onClick={() => setActiveView('performance')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeView === 'performance' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Target className="w-4 h-4 mr-2 inline" />
          Performance
        </button>
      </div>

      {/* Dashboard Content */}
      {activeView === 'overview' && (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {financialMetrics.map((metric, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{metric.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">{metric.value}</p>
                    </div>
                    <div className={`flex items-center space-x-1 ${
                      metric.color === 'green' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      <span className="text-sm font-medium">{metric.change}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Main Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Revenue Trends</span>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </CardTitle>
                <CardDescription>Monthly revenue performance and projections</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={monthlyRevenueData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Revenue']} />
                      <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Job Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Job Status Overview</CardTitle>
                <CardDescription>Current job distribution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium">Completed</span>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    {dashboardData.jobs.completed}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <span className="font-medium">In Progress</span>
                  </div>
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    {dashboardData.jobs.inProgress}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <span className="font-medium">Scheduled</span>
                  </div>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {dashboardData.jobs.scheduled}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Activity and Schedule Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest jobs, estimates, and invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          activity.status === 'completed' || activity.status === 'paid' ? 'bg-green-500' :
                          activity.status === 'in-progress' ? 'bg-yellow-500' : 'bg-blue-500'
                        }`} />
                        <div>
                          <p className="font-medium text-gray-900">{activity.title}</p>
                          <p className="text-sm text-gray-500">{activity.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">${activity.amount}</p>
                        <Badge variant="outline" className="text-xs">
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Upcoming jobs and appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingJobs.map((job) => (
                    <div key={job.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{job.title}</p>
                        <p className="text-sm text-gray-600">{job.location}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-sm font-medium text-blue-600">{job.time}</span>
                          <span className="text-sm text-gray-500">{job.technician}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Custom Reports Section */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Reports</CardTitle>
              <CardDescription>Track stats important to your business</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Add custom report</h3>
                <p className="text-gray-600 mb-6">Track stats important to your business</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Custom Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeView === 'financial' && <FinancialCharts />}
      
      {activeView === 'locations' && <InteractiveMap />}
      
      {activeView === 'performance' && (
        <div className="text-center py-12">
          <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Performance Analytics</h2>
          <p className="text-gray-600">Advanced performance metrics and KPI tracking coming soon...</p>
        </div>
      )}
    </div>
  )
}

export default ComprehensiveDashboard

