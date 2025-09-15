import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Alert, AlertDescription } from './components/ui/alert'
import { FileText, Settings, Search, User, LogOut, DollarSign, Users } from 'lucide-react'
import InvoiceManagement from './components/InvoiceManagement'
import CRMDashboard from './components/CRMDashboard'
import { 
  Building2, 
  Calculator, 
  TrendingUp,
  Edit,
  Save,
  Trash2,
  Plus,
  Minus
} from 'lucide-react'
import './App.css'

const API_BASE = 'https://9yhyi3cp5kgw.manus.space/api'

function App() {
  const [user, setUser] = useState(null)
  const [company, setCompany] = useState(null)
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [taxRates, setTaxRates] = useState([])
  const [laborRates, setLaborRates] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [editingService, setEditingService] = useState(null)
  const [showLogin, setShowLogin] = useState(true)
  const [estimates, setEstimates] = useState([])
  const [jobs, setJobs] = useState([])
  const [invoices, setInvoices] = useState([])
  const [showNewDropdown, setShowNewDropdown] = useState(false)

  // Login state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  })

  // Login function
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('Attempting login with:', loginForm.username)
      
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(loginForm)
      })

      console.log('Response status:', response.status)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Login response:', data)
      
      if (data.success) {
        setUser(data.user)
        setCompany(data.primary_company || data.company)
        setShowLogin(false)
        setSuccess('Login successful!')
        await loadDashboardData()
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (error) {
      console.error('Login error:', error)
      setError('Network error: Failed to fetch. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      // Load estimates
      const estimatesResponse = await fetch(`${API_BASE}/estimates`, {
        credentials: 'include'
      })
      if (estimatesResponse.ok) {
        const estimatesData = await estimatesResponse.json()
        setEstimates(estimatesData.estimates || [])
      }

      // Load jobs
      const jobsResponse = await fetch(`${API_BASE}/jobs`, {
        credentials: 'include'
      })
      if (jobsResponse.ok) {
        const jobsData = await jobsResponse.json()
        setJobs(jobsData.jobs || [])
      }

      // Load invoices
      const invoicesResponse = await fetch(`${API_BASE}/invoices`, {
        credentials: 'include'
      })
      if (invoicesResponse.ok) {
        const invoicesData = await invoicesResponse.json()
        setInvoices(invoicesData.invoices || [])
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    }
  }

  // Logout function
  const handleLogout = () => {
    setUser(null)
    setCompany(null)
    setShowLogin(true)
    setActiveTab('overview')
  }

  // Show login form if not authenticated
  if (showLogin || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl">ServiceBook Pros</CardTitle>
            <CardDescription>Company Dashboard Login</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-4 border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  placeholder="Enter your password"
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>Demo Accounts:</p>
              <p><strong>demo_admin</strong> / demo123</p>
              <p><strong>miami_admin</strong> / miami123</p>
              <p><strong>system_admin</strong> / admin123</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dark Header Navigation */}
      <header className="bg-gray-900 text-white">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-semibold">ServiceBook Pros</span>
            </div>
            <nav className="flex items-center space-x-6">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'overview' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Home
              </button>
              <button 
                onClick={() => setActiveTab('crm')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'crm' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Dash
              </button>
              <button 
                onClick={() => setActiveTab('schedule')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'schedule' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Schedule
              </button>
              <button 
                onClick={() => setActiveTab('customers')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'customers' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Customers
              </button>
              <button 
                onClick={() => setActiveTab('financials')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'financials' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Financials
              </button>
              <button 
                onClick={() => setActiveTab('invoices')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'invoices' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Invoices
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'settings' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
              >
                Settings
              </button>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search" 
                className="bg-gray-800 text-white pl-10 pr-4 py-2 rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
              />
            </div>
            <div className="relative">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-1"
                onMouseEnter={() => setShowNewDropdown(true)}
                onMouseLeave={() => setShowNewDropdown(false)}
              >
                <span>New</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showNewDropdown && (
                <div 
                  className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50"
                  onMouseEnter={() => setShowNewDropdown(true)}
                  onMouseLeave={() => setShowNewDropdown(false)}
                >
                  <button 
                    onClick={() => {setActiveTab('jobs'); setShowNewDropdown(false)}}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Job
                  </button>
                  <button 
                    onClick={() => {setActiveTab('estimates'); setShowNewDropdown(false)}}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Estimate
                  </button>
                  <button 
                    onClick={() => {setActiveTab('schedule'); setShowNewDropdown(false)}}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Event
                  </button>
                  <button 
                    onClick={() => {setActiveTab('customers'); setShowNewDropdown(false)}}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Customer
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-300">Hi, {user?.first_name || 'User'}</span>
              <button
                onClick={handleLogout}
                className="text-gray-300 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Messages */}
      {error && (
        <Alert className="mx-6 mt-4 border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mx-6 mt-4 border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <main className="p-6">
        <div className="space-y-6">
          {/* Overview/Home Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Hi, {user?.first_name || 'User'}</h1>
                <div className="flex items-center space-x-4">
                  <button className="text-blue-600 hover:text-blue-800">All estimates</button>
                  <button className="text-blue-600 hover:text-blue-800">All invoices</button>
                  <button className="text-blue-600 hover:text-blue-800">All jobs</button>
                </div>
              </div>
              
              {/* Dashboard Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card 
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab('estimates')}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">OPEN ESTIMATES</h3>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-gray-900">{estimates.filter(e => e.status === 'open').length}</span>
                        <span className="text-sm text-gray-500">
                          ${estimates.filter(e => e.status === 'open').reduce((sum, e) => sum + (e.total_amount || 0), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card 
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab('invoices')}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">OPEN INVOICES</h3>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-gray-900">{invoices.filter(i => i.status === 'pending').length}</span>
                        <span className="text-sm text-gray-500">
                          ${invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + (i.total_amount || 0), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card 
                  className="p-6 cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setActiveTab('jobs')}
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">UNSCHEDULED JOBS</h3>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-gray-900">{jobs.filter(j => j.status === 'unscheduled').length}</span>
                        <span className="text-sm text-gray-500">
                          ${jobs.filter(j => j.status === 'unscheduled').reduce((sum, j) => sum + (j.total_amount || 0), 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Week to Date Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Week to date</h2>
                  <button 
                    className="text-blue-600 hover:text-blue-800"
                    onClick={() => setActiveTab('financials')}
                  >
                    View all reports
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Card 
                    className="p-4 text-center cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setActiveTab('financials')}
                  >
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">JOB REVENUE EARNED</h4>
                    <div className="text-2xl font-bold text-gray-900">$0</div>
                  </Card>
                  <Card 
                    className="p-4 text-center cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setActiveTab('financials')}
                  >
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">JOBS COMPLETED</h4>
                    <div className="text-2xl font-bold text-gray-900">0</div>
                  </Card>
                  <Card 
                    className="p-4 text-center cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setActiveTab('financials')}
                  >
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">AVERAGE JOB SIZE</h4>
                    <div className="text-2xl font-bold text-gray-900">$0</div>
                  </Card>
                  <Card 
                    className="p-4 text-center cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setActiveTab('financials')}
                  >
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">TOTAL NEW JOBS BOOKED</h4>
                    <div className="text-2xl font-bold text-gray-900">$9,494</div>
                    <div className="text-xs text-green-600 mt-1">↑ 1.283%</div>
                  </Card>
                  <Card 
                    className="p-4 text-center cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => setActiveTab('financials')}
                  >
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">NEW JOBS BOOKED ONLINE</h4>
                    <div className="text-2xl font-bold text-gray-900">$0</div>
                  </Card>
                </div>
              </div>

              {/* Employee Status Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Employee Status</CardTitle>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm bg-gray-900 text-white rounded">Today</button>
                        <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded">Tomorrow</button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium">AM</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-medium">Alvis(AJ) Miller</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>📞 9:00am - 10:00am</span>
                            <span>📋 Susan Scarr • Estimate 208</span>
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>🕐 11:00am - 12:00pm</span>
                            <span>🔧 Michael Pritchard • Job 972</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Location Map</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2"></div>
                        <p className="text-sm text-gray-600">Interactive Map</p>
                        <p className="text-xs text-gray-500">Employee locations</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity and Schedule Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mt-1">
                          <FileText className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Line items updated total = $11226.29</p>
                          <p className="text-xs text-gray-500">Thu, Sep 11 at 3:27 PM</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Job #964</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mt-1">
                          <DollarSign className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Line items updated total = $9736.29</p>
                          <p className="text-xs text-gray-500">Thu, Sep 11 at 2:15 PM</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Job #964</p>
                        </div>
                      </div>

                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mt-1">
                          <Users className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">New customer added</p>
                          <p className="text-xs text-gray-500">Thu, Sep 11 at 1:45 PM</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">Customer #125</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Schedule</CardTitle>
                      <button 
                        className="text-blue-600 hover:text-blue-800 text-sm"
                        onClick={() => setActiveTab('schedule')}
                      >
                        View schedule
                      </button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-3">FRI SEP 12, 2025</p>
                        
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <div className="text-sm font-medium">9:00am - 10:00am</div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Estimate 208 • Susan Scarr</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                  <span className="text-xs">AM</span>
                                </div>
                                <span className="text-xs text-gray-500">Alvis(AJ) Miller</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-3">
                            <div className="text-sm font-medium">11:00am - 12:00pm</div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Job 972 • Michael Pritchard</p>
                              <div className="flex items-center space-x-2 mt-1">
                                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                  <span className="text-xs">AM</span>
                                </div>
                                <span className="text-xs text-gray-500">Alvis(AJ) Miller</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Inbox Section */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">5</span>
                    </div>
                    <CardTitle>Inbox</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">You have 5 new messages and notifications</p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Estimates Tab */}
          {activeTab === 'estimates' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Open Estimates</h1>
                <Button onClick={() => setActiveTab('overview')} variant="outline">
                  Back to Dashboard
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Current Open Estimates</CardTitle>
                  <CardDescription>All estimates awaiting customer approval</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {estimates.filter(e => e.status === 'open').length > 0 ? (
                      estimates.filter(e => e.status === 'open').map((estimate) => (
                        <div key={estimate.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">Estimate #{estimate.id}</h3>
                              <p className="text-sm text-gray-600">{estimate.customer_name}</p>
                              <p className="text-sm text-gray-500">{estimate.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold">${estimate.total_amount?.toLocaleString()}</p>
                              <Badge variant="outline">{estimate.status}</Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Open Estimates</h3>
                        <p className="text-gray-500">You don't have any open estimates at the moment.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Jobs Tab */}
          {activeTab === 'jobs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Unscheduled Jobs</h1>
                <Button onClick={() => setActiveTab('overview')} variant="outline">
                  Back to Dashboard
                </Button>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Jobs Awaiting Schedule</CardTitle>
                  <CardDescription>All jobs that need to be scheduled</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobs.filter(j => j.status === 'unscheduled').length > 0 ? (
                      jobs.filter(j => j.status === 'unscheduled').map((job) => (
                        <div key={job.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium">Job #{job.id}</h3>
                              <p className="text-sm text-gray-600">{job.customer_name}</p>
                              <p className="text-sm text-gray-500">{job.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-semibold">${job.total_amount?.toLocaleString()}</p>
                              <Badge variant="outline">{job.status}</Badge>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Settings className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Unscheduled Jobs</h3>
                        <p className="text-gray-500">All jobs are currently scheduled.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Financials Tab (combines My Money and Reporting) */}
          {activeTab === 'financials' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Financial Reports & Analytics</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Revenue This Month</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$45,231.89</div>
                    <p className="text-xs text-muted-foreground">
                      +20.1% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Outstanding Invoices</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$12,234.56</div>
                    <p className="text-xs text-muted-foreground">
                      19 pending invoices
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">24.3%</div>
                    <p className="text-xs text-muted-foreground">
                      +2.1% from last month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">127</div>
                    <p className="text-xs text-muted-foreground">
                      +15% from last month
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trends</CardTitle>
                    <CardDescription>Monthly revenue over the past 6 months</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-gray-500">
                      Revenue Chart Placeholder
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Top Services</CardTitle>
                    <CardDescription>Most profitable services this month</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Electrical Installation</span>
                        <span className="text-sm text-gray-500">$15,234</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Panel Upgrades</span>
                        <span className="text-sm text-gray-500">$12,456</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Troubleshooting</span>
                        <span className="text-sm text-gray-500">$8,765</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* CRM Dashboard Tab */}
          {activeTab === 'crm' && (
            <CRMDashboard />
          )}

          {/* Invoice Management Tab */}
          {activeTab === 'invoices' && (
            <InvoiceManagement />
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Schedule Management</h1>
              <Card>
                <CardHeader>
                  <CardTitle>Today's Schedule</CardTitle>
                  <CardDescription>Manage appointments and service calls</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">9:00am - 10:00am</h3>
                          <p className="text-sm text-gray-600">Susan Scarr • Estimate 208</p>
                        </div>
                        <Badge variant="outline">Scheduled</Badge>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">11:00am - 12:00pm</h3>
                          <p className="text-sm text-gray-600">Michael Pritchard • Job 972</p>
                        </div>
                        <Badge variant="outline">In Progress</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Customers Tab */}
          {activeTab === 'customers' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Customer Management</h1>
              <Card>
                <CardHeader>
                  <CardTitle>Recent Customers</CardTitle>
                  <CardDescription>Manage your customer database</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Susan Scarr</h3>
                          <p className="text-sm text-gray-600">123 Main St, City, State</p>
                          <p className="text-sm text-gray-600">(555) 123-4567</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">$2,450</p>
                          <p className="text-xs text-gray-500">Total Value</p>
                        </div>
                      </div>
                    </div>
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">Michael Pritchard</h3>
                          <p className="text-sm text-gray-600">456 Oak Ave, City, State</p>
                          <p className="text-sm text-gray-600">(555) 987-6543</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">$1,875</p>
                          <p className="text-xs text-gray-500">Total Value</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                  <CardDescription>Your company details and settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Company Name</Label>
                      <p className="text-sm text-gray-600">{company?.company_name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Company Code</Label>
                      <p className="text-sm text-gray-600">{company?.company_code}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Location</Label>
                      <p className="text-sm text-gray-600">
                        {company?.city}, {company?.state} {company?.zip_code}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Contact</Label>
                      <p className="text-sm text-gray-600">{company?.contact_phone}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default App

