import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Alert, AlertDescription } from './components/ui/alert'
import { FileText, Settings, Search, User, LogOut, DollarSign, Users, CheckCircle, BarChart3, TrendingUp, Globe, Wifi, WifiOff, Download } from 'lucide-react'
import CRMDashboard from './components/CRMDashboard'
import MobileNavigation from './components/MobileNavigation'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import { usePWA } from './hooks/usePWA'
import apiClient from './utils/apiClient'
import cachedApiClient from './utils/apiClientCached'
import { initializePerformanceOptimizations } from './utils/performanceOptimizer'
import { API_BASE_URL } from './lib/config'
import {
  DashboardLazy,
  CustomersLazy,
  ScheduleLazy,
  MyMoneyLazy,
  ReportingLazy,
  JobsLazy,
  EstimatesLazy,
  PricingLazy,
  TeamLazy,
  InvoiceLazy,
  SettingsLazy
} from './components/LazyComponents'
import './App.css'

const API_BASE = API_BASE_URL

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
  const [showFinancialsDropdown, setShowFinancialsDropdown] = useState(false)
  const [jobLocationView, setJobLocationView] = useState('today')
  const [weekStats, setWeekStats] = useState({ revenue: 0, jobs_completed: 0, avg_job_size: 0, new_jobs_booked: 0, new_jobs_online: 0 })
  const [customers, setCustomers] = useState([])

  // Search results derived from searchTerm
  const searchResults = searchTerm.trim().length >= 2 ? [
    ...customers.filter(c => {
      const name = c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim()
      return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (c.email || '').toLowerCase().includes(searchTerm.toLowerCase())
    }).slice(0, 3).map(c => ({
      type: 'Customer',
      label: c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim(),
      sub: c.email || c.phone || '',
      tab: 'customers',
      color: 'bg-blue-100 text-blue-700',
    })),
    ...jobs.filter(j =>
      (j.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (j.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 3).map(j => ({
      type: 'Job',
      label: j.title || 'Job',
      sub: j.customer_name || '',
      tab: 'jobs',
      color: 'bg-orange-100 text-orange-700',
    })),
    ...invoices.filter(i =>
      (i.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 3).map(i => ({
      type: 'Invoice',
      label: i.invoice_number || `INV-${i.id}`,
      sub: i.customer_name || '',
      tab: 'invoices',
      color: 'bg-green-100 text-green-700',
    })),
    ...estimates.filter(e =>
      (e.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 3).map(e => ({
      type: 'Estimate',
      label: e.title || `EST-${e.id}`,
      sub: e.customer_name || '',
      tab: 'estimates',
      color: 'bg-purple-100 text-purple-700',
    })),
  ] : []

  // PWA functionality
  const { isOnline, isInstallable, updateAvailable, updateServiceWorker, showNotification } = usePWA()

  // Initialize performance optimizations
  useEffect(() => {
    initializePerformanceOptimizations()
    
    // Preload critical data if user is already logged in
    const token = localStorage.getItem('auth_token')
    if (token) {
      cachedApiClient.preloadCriticalData()
    }
  }, [])

  // Login state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  })

  // Login function with API client
  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🔐 Starting login flow for user:', loginForm.username)
      const response = await apiClient.login({ username: loginForm.username, password: loginForm.password })
      console.log('🔐 Login response keys:', Object.keys(response || {}))
      const savedToken = localStorage.getItem('auth_token')
      console.log('🔐 Token saved to localStorage?', !!savedToken)
      
      if (response.user) {
        setUser(response.user)
        setCompany(response.company || { name: 'ServiceBook Pros', id: 1 })
        setShowLogin(false)
        setSuccess('Login successful!')
        loadData()
      } else if (savedToken) {
        // Some backends return only a token; fetch current user
        console.log('👤 Fetching current user via /auth/me since login response had no user')
        try {
          const me = await apiClient.getCurrentUser()
          console.log('👤 /auth/me response keys:', Object.keys(me || {}))
          if (me && (me.user || me.username)) {
            const resolvedUser = me.user || { username: me.username, id: me.id }
            setUser(resolvedUser)
            setCompany(me.company || me.primary_company || { name: 'ServiceBook Pros', id: 1 })
            setShowLogin(false)
            setSuccess('Login successful!')
            loadData()
          } else {
            console.warn('⚠️ /auth/me did not return user info')
            setError('Login failed: Could not load user info')
          }
        } catch (meErr) {
          console.error('❌ Failed to fetch /auth/me:', meErr)
          setError('Login failed: Could not verify user')
        }
      } else {
        setError('Login failed: Invalid response')
      }
    } catch (err) {
      console.error('Login error:', err)
      setError('Unable to connect to the server. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  // Load data function
  const loadData = async () => {
    try {
      const token = localStorage.getItem('auth_token')
      console.log('📦 Loading dashboard data. Token present?', !!token, 'API_BASE:', API_BASE)
      // Load estimates, jobs, and invoices
      const [estimatesRes, jobsRes, invoicesRes] = await Promise.all([
        fetch(`${API_BASE}/estimates`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/jobs`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${API_BASE}/invoices`, { headers: { 'Authorization': `Bearer ${token}` } })
      ])

      if (estimatesRes.ok) {
        const estimatesData = await estimatesRes.json()
        setEstimates(estimatesData)
      }
      if (jobsRes.ok) {
        const jobsData = await jobsRes.json()
        setJobs(jobsData)
      }
      if (invoicesRes.ok) {
        const invoicesData = await invoicesRes.json()
        setInvoices(invoicesData)
      }

      // Load week stats and customers (non-blocking, fail silently)
      apiClient.getWeekStats().then(setWeekStats).catch(() => {})
      apiClient.getCustomers().then(data => setCustomers(Array.isArray(data) ? data : [])).catch(() => {})
    } catch (err) {
      console.error('Error loading data:', err)
    }
  }

  // Logout function
  const handleLogout = () => {
    setUser(null)
    setCompany(null)
    setShowLogin(true)
    setActiveTab('overview')
    setSuccess('')
    setError('')
  }

  // Show login form
  if (showLogin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-gray-900">ServiceBook Pros</h2>
            <p className="mt-2 text-sm text-gray-600">Company Dashboard Login</p>
          </div>
          
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">Username</label>
              <input
                id="username"
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your username"
                value={loginForm.username}
                onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input
                id="password"
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            
          </form>
        </div>
      </div>
    )
  }

  // Main dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dark Header */}
      <header className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Navigation */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-blue-400" />
                <span className="text-lg font-semibold">ServiceBook Pros</span>
              </div>
              
              <nav className="hidden lg:flex space-x-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'overview' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Home
                </button>
                <button
                  onClick={() => setActiveTab('crm')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'crm' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Dash
                </button>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'schedule' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Schedule
                </button>
                <button
                  onClick={() => setActiveTab('customers')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'customers' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Customers
                </button>
                
                {/* Financials Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowFinancialsDropdown(!showFinancialsDropdown)}
                    className={`px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1 ${
                      activeTab === 'financials' || activeTab === 'my-money' || activeTab === 'reporting' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                  >
                    <span>Financials</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showFinancialsDropdown && (
                    <>
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setShowFinancialsDropdown(false)}
                      />
                      <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                        <div className="py-1">
                          <button 
                            onClick={() => {
                              setActiveTab('my-money')
                              setShowFinancialsDropdown(false)
                            }} 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            My Money
                          </button>
                          <button 
                            onClick={() => {
                              setActiveTab('reporting')
                              setShowFinancialsDropdown(false)
                            }} 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            Reporting
                          </button>
                          <button 
                            onClick={() => {
                              setActiveTab('financials')
                              setShowFinancialsDropdown(false)
                            }} 
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            Overview
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={() => setActiveTab('invoices')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'invoices' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Invoices
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'settings' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  Settings
                </button>
              </nav>
            </div>

            {/* Search and Actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden lg:block relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  onBlur={() => setTimeout(() => setSearchTerm(''), 200)}
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
                    {searchResults.map((r, i) => (
                      <button
                        key={i}
                        onMouseDown={() => { setActiveTab(r.tab); setSearchTerm('') }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left"
                      >
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${r.color}`}>{r.type}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{r.label}</p>
                          {r.sub && <p className="text-xs text-gray-500">{r.sub}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="relative">
                <button
                  onClick={() => setShowNewDropdown(!showNewDropdown)}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  New ▼
                </button>
                {showNewDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNewDropdown(false)}
                    />
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                      <div className="py-1">
                        <button 
                          onClick={() => {
                            setActiveTab('jobs')
                            setShowNewDropdown(false)
                          }} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Job
                        </button>
                        <button 
                          onClick={() => {
                            setActiveTab('estimates')
                            setShowNewDropdown(false)
                          }} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Estimate
                        </button>
                        <button 
                          onClick={() => {
                            setActiveTab('schedule')
                            setShowNewDropdown(false)
                          }} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Event
                        </button>
                        <button 
                          onClick={() => {
                            setActiveTab('customers')
                            setShowNewDropdown(false)
                          }} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                        >
                          Customer
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              <button onClick={handleLogout} className="text-gray-300 hover:text-white">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Home Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Greeting */}
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900">Hi, {user?.username || 'User'}</h1>
              <div className="flex space-x-2">
                <button onClick={() => setActiveTab('estimates')} className="text-blue-600 hover:text-blue-800 text-sm">All estimates</button>
                <button onClick={() => setActiveTab('invoices')} className="text-blue-600 hover:text-blue-800 text-sm">All invoices</button>
                <button onClick={() => setActiveTab('jobs')} className="text-blue-600 hover:text-blue-800 text-sm">All jobs</button>
              </div>
            </div>

            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card 
                className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-white"
                onClick={() => setActiveTab('estimates')}
              >
                <div className="flex items-center space-x-4 p-6">
                  <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center shadow-md">
                    <FileText className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">OPEN ESTIMATES</h3>
                    <div className="flex items-baseline space-x-3">
                      <span className="text-3xl font-bold text-gray-900">{estimates.filter(e => e.status === 'pending').length}</span>
                      <span className="text-lg font-medium text-gray-600">
                        ${estimates.filter(e => e.status === 'pending').reduce((sum, e) => sum + (e.total_amount || 0), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-white"
                onClick={() => setActiveTab('invoices')}
              >
                <div className="flex items-center space-x-4 p-6">
                  <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center shadow-md">
                    <FileText className="w-7 h-7 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">OPEN INVOICES</h3>
                    <div className="flex items-baseline space-x-3">
                      <span className="text-3xl font-bold text-gray-900">{invoices.filter(i => i.status === 'pending').length}</span>
                      <span className="text-lg font-medium text-gray-600">
                        ${invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + (i.total_amount || 0), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>

              <Card 
                className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-l-4 border-l-orange-500 bg-gradient-to-r from-orange-50 to-white"
                onClick={() => setActiveTab('jobs')}
              >
                <div className="flex items-center space-x-4 p-6">
                  <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center shadow-md">
                    <Settings className="w-7 h-7 text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">UNSCHEDULED JOBS</h3>
                    <div className="flex items-baseline space-x-3">
                      <span className="text-3xl font-bold text-gray-900">{jobs.filter(j => j.status === 'unscheduled').length}</span>
                      <span className="text-lg font-medium text-gray-600">
                        ${jobs.filter(j => j.status === 'unscheduled').reduce((sum, j) => sum + (j.total_amount || 0), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Week to Date Section */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Week to date</h2>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                  onClick={() => setActiveTab('financials')}
                >
                  View all reports
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card 
                  className="p-5 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-t-4 border-t-blue-500"
                  onClick={() => setActiveTab('financials')}
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">JOB REVENUE EARNED</h4>
                  <div className="text-2xl font-bold text-gray-900">{weekStats.revenue ? '$' + weekStats.revenue.toLocaleString() : '$0'}</div>
                </Card>
                <Card 
                  className="p-5 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-t-4 border-t-green-500"
                  onClick={() => setActiveTab('financials')}
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">JOBS COMPLETED</h4>
                  <div className="text-2xl font-bold text-gray-900">{weekStats.jobs_completed || 0}</div>
                </Card>
                <Card 
                  className="p-5 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-t-4 border-t-purple-500"
                  onClick={() => setActiveTab('financials')}
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-purple-600" />
                    </div>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">AVERAGE JOB SIZE</h4>
                  <div className="text-2xl font-bold text-gray-900">{weekStats.avg_job_size ? '$' + weekStats.avg_job_size.toLocaleString() : '$0'}</div>
                </Card>
                <Card 
                  className="p-5 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-t-4 border-t-orange-500"
                  onClick={() => setActiveTab('financials')}
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-orange-600" />
                    </div>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">TOTAL NEW JOBS BOOKED</h4>
                  <div className="text-2xl font-bold text-gray-900">{weekStats.new_jobs_booked || jobs.length}</div>
                </Card>
                <Card 
                  className="p-5 text-center cursor-pointer hover:shadow-xl transition-all duration-300 hover:scale-105 border-t-4 border-t-indigo-500"
                  onClick={() => setActiveTab('financials')}
                >
                  <div className="flex justify-center mb-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-indigo-600" />
                    </div>
                  </div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">NEW JOBS BOOKED ONLINE</h4>
                  <div className="text-2xl font-bold text-gray-900">$0</div>
                </Card>
              </div>
            </div>

            {/* Job Locations Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Today's Job Locations</CardTitle>
                    <div className="flex space-x-2">
                      <button 
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          jobLocationView === 'today' 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={() => setJobLocationView('today')}
                      >
                        Today
                      </button>
                      <button 
                        className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                          jobLocationView === 'week' 
                            ? 'bg-blue-600 text-white' 
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                        onClick={() => setJobLocationView('week')}
                      >
                        This Week
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {jobLocationView === 'today' ? (
                      (() => {
                        const todayStr = new Date().toISOString().split('T')[0]
                        const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500']
                        const todayJobs = jobs.filter(j => {
                          const d = j.scheduled_date || j.scheduledDate || ''
                          return d && d.startsWith(todayStr)
                        })
                        const display = todayJobs.length > 0 ? todayJobs : jobs.filter(j => j.status !== 'completed' && j.status !== 'cancelled')
                        if (display.length === 0) return <p className="text-sm text-gray-400">No jobs scheduled for today.</p>
                        return display.slice(0, 3).map((j, i) => (
                          <div key={j.id} className="flex items-center space-x-3">
                            <div className={`w-3 h-3 ${colors[i % colors.length]} rounded-full`}></div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">{j.title || j.job_type || 'Service Job'}</span>
                                <span className="text-xs text-gray-500">Job #{j.id}</span>
                              </div>
                              <p className="text-sm text-gray-600">{j.customer_name || j.customer?.name || '—'}</p>
                            </div>
                          </div>
                        ))
                      })()
                    ) : (
                      (() => {
                        const colors = ['bg-purple-500', 'bg-orange-500', 'bg-teal-500', 'bg-red-500', 'bg-blue-500']
                        const weekJobs = jobs.filter(j => j.status !== 'cancelled').slice(0, 5)
                        if (weekJobs.length === 0) return <p className="text-sm text-gray-400">No jobs this week.</p>
                        return (
                          <>
                            <div className="text-sm font-medium text-gray-700 mb-3">This Week's Jobs</div>
                            {weekJobs.map((j, i) => (
                              <div key={j.id} className="flex items-center space-x-3">
                                <div className={`w-3 h-3 ${colors[i % colors.length]} rounded-full`}></div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{j.title || j.job_type || 'Service Job'}</span>
                                    <span className="text-xs text-gray-500">Job #{j.id}</span>
                                  </div>
                                  <p className="text-sm text-gray-600">{j.customer_name || j.customer?.name || '—'}</p>
                                </div>
                              </div>
                            ))}
                          </>
                        )
                      })()
                    ) /* end week view */}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Job Location Map</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 bg-gradient-to-br from-blue-50 to-green-50 rounded-lg relative overflow-hidden">
                    {/* Map Background */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="w-full h-full bg-gray-200 rounded-lg"></div>
                    </div>
                    
                    {/* Job Location Markers - Conditional based on view */}
                    {jobLocationView === 'today' ? (
                      <>
                        {jobs.slice(0, 3).map((j, i) => {
                          const positions = [
                            'absolute top-8 left-12',
                            'absolute top-20 right-16',
                            'absolute bottom-12 left-20',
                          ]
                          const dotColors = ['bg-red-500', 'bg-blue-500', 'bg-green-500']
                          return (
                            <div key={j.id} className={positions[i]}>
                              <div className={`w-4 h-4 ${dotColors[i]} rounded-full border-2 border-white shadow-lg animate-pulse`}></div>
                              <div className="text-xs text-gray-700 mt-1 font-medium">Job #{j.id}</div>
                            </div>
                          )
                        })}
                        {jobs.length === 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <p className="text-sm text-gray-400">No jobs to display</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="absolute top-6 left-8">
                          <div className="w-3 h-3 bg-purple-500 rounded-full border-2 border-white shadow-lg"></div>
                          <div className="text-xs text-gray-700 mt-1 font-medium">Mon</div>
                        </div>
                        
                        <div className="absolute top-12 right-20">
                          <div className="w-3 h-3 bg-orange-500 rounded-full border-2 border-white shadow-lg"></div>
                          <div className="text-xs text-gray-700 mt-1 font-medium">Tue</div>
                        </div>
                        
                        <div className="absolute top-24 left-16">
                          <div className="w-3 h-3 bg-teal-500 rounded-full border-2 border-white shadow-lg"></div>
                          <div className="text-xs text-gray-700 mt-1 font-medium">Wed</div>
                        </div>
                        
                        <div className="absolute bottom-16 right-12">
                          <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>
                          <div className="text-xs text-gray-700 mt-1 font-medium">Thu</div>
                        </div>
                        
                        <div className="absolute bottom-8 left-24">
                          <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                          <div className="text-xs text-gray-700 mt-1 font-medium">Fri</div>
                        </div>
                      </>
                    )}
                    
                    {/* Map Legend */}
                    <div className="absolute bottom-4 right-4 bg-white rounded-lg p-2 shadow-md">
                      <div className="flex items-center space-x-4 text-xs">
                        {jobLocationView === 'today' ? (
                          <>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <span>Estimates</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              <span>Active Jobs</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              <span>Completed</span>
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                              <span>HVAC</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                              <span>Plumbing</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
                              <span>Electrical</span>
                            </div>
                          </>
                        )}
                      </div>
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
                    {(() => {
                      const activities = []
                      // Add recent invoices
                      ;[...invoices].slice(-3).reverse().forEach(inv => {
                        activities.push({
                          type: 'invoice',
                          text: `Invoice #${inv.invoice_number || inv.id} ${inv.status === 'paid' ? 'paid' : 'created'} — $${Number(inv.amount || inv.total_amount || 0).toLocaleString()}`,
                          date: inv.created_at || '',
                          tab: 'invoices',
                          link: `Invoice #${inv.invoice_number || inv.id}`,
                        })
                      })
                      // Add recent customers
                      ;[...customers].slice(-2).reverse().forEach(c => {
                        activities.push({
                          type: 'customer',
                          text: `New customer added: ${c.name || `${c.first_name || ''} ${c.last_name || ''}`.trim()}`,
                          date: c.created_at || '',
                          tab: 'customers',
                          link: `Customer #${c.id}`,
                        })
                      })
                      // Sort by date desc (if no date, put at end)
                      activities.sort((a, b) => (b.date || '0').localeCompare(a.date || '0'))

                      const icons = { invoice: FileText, customer: Users, job: Settings }
                      const colors = { invoice: 'text-blue-600', customer: 'text-green-600', job: 'text-orange-600' }

                      if (activities.length === 0) {
                        return <p className="text-sm text-gray-400">No recent activity.</p>
                      }

                      return activities.slice(0, 4).map((act, i) => {
                        const Icon = icons[act.type] || FileText
                        const dateLabel = act.date
                          ? new Date(act.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                          : 'Recently'
                        return (
                          <div key={i} className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mt-1">
                              <Icon className={`w-4 h-4 ${colors[act.type]}`} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">{act.text}</p>
                              <p className="text-xs text-gray-500">{dateLabel}</p>
                            </div>
                            <div className="text-right">
                              <button
                                className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                                onClick={() => setActiveTab(act.tab)}
                              >
                                {act.link}
                              </button>
                            </div>
                          </div>
                        )
                      })
                    })()}
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
                      <p className="text-sm font-medium text-gray-500 mb-3">
                        {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
                      </p>
                      
                      <div className="space-y-3">
                        {(() => {
                          const todayStr = new Date().toISOString().split('T')[0]
                          const todayJobs = jobs.filter(j => {
                            const d = j.scheduled_date || j.scheduledDate || ''
                            return d && d.startsWith(todayStr)
                          })
                          if (todayJobs.length === 0) {
                            // Show upcoming jobs if none today
                            const upcoming = [...jobs]
                              .filter(j => j.status !== 'completed' && j.status !== 'cancelled')
                              .slice(0, 3)
                            if (upcoming.length === 0) {
                              return <p className="text-sm text-gray-400">No jobs scheduled for today.</p>
                            }
                            return upcoming.map((j, i) => (
                              <div key={j.id} className="flex items-center space-x-3">
                                <div className={`w-3 h-3 rounded-full ${['bg-red-500','bg-blue-500','bg-green-500'][i % 3]}`}></div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">{j.title || 'Service Job'}</span>
                                    <span className="text-xs text-gray-500">Job #{j.id}</span>
                                  </div>
                                  <p className="text-sm text-gray-600">{j.customer_name || (j.customer && j.customer.name) || ''}</p>
                                </div>
                              </div>
                            ))
                          }
                          return todayJobs.slice(0, 3).map((j, i) => (
                            <div key={j.id} className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${['bg-red-500','bg-blue-500','bg-green-500'][i % 3]}`}></div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">{j.title || 'Service Job'}</span>
                                  <span className="text-xs text-gray-500">Job #{j.id}</span>
                                </div>
                                <p className="text-sm text-gray-600">{j.customer_name || ''}</p>
                              </div>
                            </div>
                          ))
                        })()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'crm' && (
          <DashboardLazy 
            user={user}
            company={company}
            estimates={estimates}
            jobs={jobs}
            invoices={invoices}
          />
        )}
        
        {activeTab === 'invoices' && <InvoiceLazy setActiveTab={setActiveTab} />}
        
        {activeTab === 'schedule' && <ScheduleLazy setActiveTab={setActiveTab} />}
        
        {activeTab === 'customers' && <CustomersLazy setActiveTab={setActiveTab} />}
        
        {activeTab === 'financials' && (
          <div className="space-y-6 p-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Financial Overview</h2>
              <button
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => setActiveTab('reporting')}
              >
                Full Reports →
              </button>
            </div>

            {/* Revenue Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {
                  label: 'Total Revenue',
                  value: '$' + invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.amount || i.total_amount || 0), 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}),
                  color: 'green',
                  sub: 'Paid invoices',
                },
                {
                  label: 'Outstanding',
                  value: '$' + invoices.filter(i => i.status === 'pending' || i.status === 'sent').reduce((s, i) => s + (i.amount || i.total_amount || 0), 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}),
                  color: 'yellow',
                  sub: 'Pending / sent',
                },
                {
                  label: 'Overdue',
                  value: '$' + invoices.filter(i => i.status === 'overdue').reduce((s, i) => s + (i.amount || i.total_amount || 0), 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}),
                  color: 'red',
                  sub: 'Past due date',
                },
                {
                  label: 'Est. Pipeline',
                  value: '$' + estimates.filter(e => e.status === 'pending').reduce((s, e) => s + (e.total_amount || e.amount || 0), 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}),
                  color: 'blue',
                  sub: 'Open estimates',
                },
              ].map(({ label, value, color, sub }) => (
                <Card key={label} className={`border-t-4 border-t-${color}-500`}>
                  <div className="p-5">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    <p className="text-xs text-gray-500 mt-1">{sub}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Invoice Breakdown Table */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 text-gray-500 font-medium">Invoice</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Customer</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Date</th>
                      <th className="text-left py-2 text-gray-500 font-medium">Status</th>
                      <th className="text-right py-2 text-gray-500 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map(inv => (
                      <tr key={inv.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 font-medium">{inv.invoice_number || `INV-${inv.id}`}</td>
                        <td className="py-2 text-gray-600">{inv.customer_name || (inv.customer && inv.customer.name) || '—'}</td>
                        <td className="py-2 text-gray-600">{inv.created_at || inv.date_issued || '—'}</td>
                        <td className="py-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            inv.status === 'paid' ? 'bg-green-100 text-green-700' :
                            inv.status === 'overdue' ? 'bg-red-100 text-red-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-2 text-right font-medium">${Number(inv.amount || inv.total_amount || 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200">
                      <td colSpan={4} className="py-2 font-semibold">Total</td>
                      <td className="py-2 text-right font-bold">
                        ${invoices.reduce((s, i) => s + (i.amount || i.total_amount || 0), 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>

            {/* Jobs Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: 'Total Jobs', value: jobs.length, color: 'blue' },
                { label: 'Completed', value: jobs.filter(j => j.status === 'completed').length, color: 'green' },
                { label: 'In Progress', value: jobs.filter(j => j.status === 'in_progress' || j.status === 'in-progress').length, color: 'orange' },
                { label: 'Scheduled', value: jobs.filter(j => j.status === 'scheduled').length, color: 'purple' },
                { label: 'Total Estimates', value: estimates.length, color: 'indigo' },
                { label: 'Approved Estimates', value: estimates.filter(e => e.status === 'approved').length, color: 'teal' },
              ].map(({ label, value, color }) => (
                <Card key={label} className={`border-l-4 border-l-${color}-500`}>
                  <div className="p-4 flex items-center space-x-3">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">{label}</p>
                      <p className="text-2xl font-bold text-gray-900">{value}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'estimates' && <EstimatesLazy setActiveTab={setActiveTab} />}
        
        {activeTab === 'jobs' && <JobsLazy setActiveTab={setActiveTab} />}
        
        {activeTab === 'my-money' && <MyMoneyLazy />}
        
        {activeTab === 'reporting' && <ReportingLazy />}
        
        {activeTab === 'settings' && <SettingsLazy />}

        {activeTab === 'pricing' && <PricingLazy />}

        {activeTab === 'team' && <TeamLazy user={user} />}
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onNewAction={(actionId) => {
          // Handle quick actions from mobile menu
          if (actionId === 'new-customer') {
            setActiveTab('customers')
          } else if (actionId === 'new-job') {
            setActiveTab('jobs')
          } else if (actionId === 'new-estimate') {
            setActiveTab('estimates')
          } else if (actionId === 'schedule-appointment') {
            setActiveTab('schedule')
          }
        }}
      />

      {/* PWA Install Prompt */}
      <PWAInstallPrompt />

      {/* Offline/Online Status */}
      {!isOnline && (
        <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-80 bg-yellow-50 border border-yellow-200 rounded-lg p-3 shadow-lg z-40">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800">You're offline</p>
              <p className="text-xs text-yellow-600">Changes will sync when connection is restored</p>
            </div>
          </div>
        </div>
      )}

      {/* Update Available */}
      {updateAvailable && (
        <div className="fixed bottom-20 lg:bottom-4 left-4 right-4 lg:left-auto lg:right-4 lg:w-80 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-lg z-40">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-800">Update available</p>
                <p className="text-xs text-blue-600">New features and improvements</p>
              </div>
            </div>
            <button
              onClick={updateServiceWorker}
              className="text-xs bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 transition-colors"
            >
              Update
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default App

