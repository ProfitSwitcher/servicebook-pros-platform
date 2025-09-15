import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Alert, AlertDescription } from './components/ui/alert'
import { FileText, Settings, Search, User, LogOut, DollarSign, Users, CheckCircle, BarChart3, TrendingUp, Globe, Wifi, WifiOff, Download } from 'lucide-react'
import InvoiceManagement from './components/InvoiceManagement'
import CRMDashboard from './components/CRMDashboard'
import TeamManagement from './components/TeamManagement'
import MobileNavigation from './components/MobileNavigation'
import PWAInstallPrompt from './components/PWAInstallPrompt'
import { usePWA } from './hooks/usePWA'
import apiClient from './utils/apiClient'
import cachedApiClient from './utils/apiClientCached'
import { initializePerformanceOptimizations } from './utils/performanceOptimizer'
import {
  DashboardLazy,
  CustomersLazy,
  ScheduleLazy,
  MyMoneyLazy,
  ReportingLazy,
  JobsLazy,
  EstimatesLazy,
  PricingLazy,
  SettingsLazy
} from './components/LazyComponents'
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
  const [showFinancialsDropdown, setShowFinancialsDropdown] = useState(false)
  const [jobLocationView, setJobLocationView] = useState('today')

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
      const response = await apiClient.login(loginForm.username, loginForm.password)
      
      if (response.user) {
        setUser(response.user)
        setCompany(response.company || { name: 'ServiceBook Pros', id: 1 })
        setShowLogin(false)
        setSuccess('Login successful!')
        loadData()
      } else {
        setError('Login failed: Invalid response')
      }
    } catch (err) {
      console.error('Login error:', err)
      
      // Fallback to demo mode for development
      if (loginForm.username === 'demo_admin' && loginForm.password === 'demo123') {
        setUser({ 
          username: 'demo_admin', 
          token: 'demo_token',
          id: 1,
          role: 'admin'
        })
        setCompany({ 
          name: 'Demo Company',
          id: 1
        })
        setShowLogin(false)
        setSuccess('Login successful (Demo Mode)!')
        loadData()
      } else {
        setError(err.message || 'Network error: Failed to connect to server.')
        
        // Auto-login with demo credentials if API is unavailable
        if (err.message.includes('Failed to fetch') || err.message.includes('Network error')) {
          setTimeout(() => {
            setUser({ 
              username: 'demo_admin', 
              token: 'demo_token',
              id: 1,
              role: 'admin'
            })
            setCompany({ 
              name: 'Demo Company (Offline)',
              id: 1
            })
            setShowLogin(false)
            setError('')
            setSuccess('Running in demo mode - API server not available')
            loadData()
          }, 2000)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // Load data function
  const loadData = async () => {
    try {
      // Load estimates, jobs, and invoices
      const [estimatesRes, jobsRes, invoicesRes] = await Promise.all([
        fetch(`${API_BASE}/estimates`, { headers: { 'Authorization': `Bearer ${user?.token}` } }),
        fetch(`${API_BASE}/jobs`, { headers: { 'Authorization': `Bearer ${user?.token}` } }),
        fetch(`${API_BASE}/invoices`, { headers: { 'Authorization': `Bearer ${user?.token}` } })
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
            
            <div className="text-center text-sm text-gray-600">
              <p className="font-medium">Demo Accounts:</p>
              <p><strong>demo_admin</strong> / demo123</p>
              <p><strong>miami_admin</strong> / miami123</p>
              <p><strong>system_admin</strong> / admin123</p>
            </div>
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
              
              <nav className="flex space-x-1">
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
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
                  <div className="text-2xl font-bold text-gray-900">$0</div>
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
                  <div className="text-2xl font-bold text-gray-900">0</div>
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
                  <div className="text-2xl font-bold text-gray-900">$0</div>
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
                  <div className="text-2xl font-bold text-gray-900">$9,494</div>
                  <div className="text-xs text-green-600 mt-2 font-medium">↑ 1.283%</div>
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
                      <>
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">9:00am - 10:00am</span>
                              <span className="text-xs text-gray-500">Estimate 208</span>
                            </div>
                            <p className="text-sm text-gray-600">Susan Scarr • Westside District</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">11:00am - 12:00pm</span>
                              <span className="text-xs text-gray-500">Job 972</span>
                            </div>
                            <p className="text-sm text-gray-600">Michael Pritchard • Northside Area</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">2:00pm - 4:00pm</span>
                              <span className="text-xs text-gray-500">Job 845</span>
                            </div>
                            <p className="text-sm text-gray-600">Johnson Residence • Riverfront</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="text-sm font-medium text-gray-700 mb-3">This Week's Jobs</div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Mon - HVAC Service</span>
                              <span className="text-xs text-gray-500">Job 901</span>
                            </div>
                            <p className="text-sm text-gray-600">Davis Home • Downtown</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Tue - Plumbing Repair</span>
                              <span className="text-xs text-gray-500">Job 902</span>
                            </div>
                            <p className="text-sm text-gray-600">Wilson Building • Eastside</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Wed - Electrical Work</span>
                              <span className="text-xs text-gray-500">Job 903</span>
                            </div>
                            <p className="text-sm text-gray-600">Brown Office • Central</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Thu - Emergency Call</span>
                              <span className="text-xs text-gray-500">Job 904</span>
                            </div>
                            <p className="text-sm text-gray-600">Green Corp • Industrial</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Fri - Maintenance</span>
                              <span className="text-xs text-gray-500">Job 905</span>
                            </div>
                            <p className="text-sm text-gray-600">Smith Residence • Westside</p>
                          </div>
                        </div>
                      </>
                    )}
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
                        <div className="absolute top-8 left-12">
                          <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                          <div className="text-xs text-gray-700 mt-1 font-medium">Estimate 208</div>
                        </div>
                        
                        <div className="absolute top-20 right-16">
                          <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                          <div className="text-xs text-gray-700 mt-1 font-medium">Job 972</div>
                        </div>
                        
                        <div className="absolute bottom-12 left-20">
                          <div className="w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-lg animate-pulse"></div>
                          <div className="text-xs text-gray-700 mt-1 font-medium">Job 845</div>
                        </div>
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
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mt-1">
                        <FileText className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Line items updated total = $11226.29</p>
                        <p className="text-xs text-gray-500">Thu, Sep 11 at 3:27 PM</p>
                      </div>
                      <div className="text-right">
                        <button 
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                          onClick={() => setActiveTab('jobs')}
                        >
                          Job #964
                        </button>
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
                        <button 
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                          onClick={() => setActiveTab('jobs')}
                        >
                          Job #964
                        </button>
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
                        <button 
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                          onClick={() => setActiveTab('customers')}
                        >
                          Customer #125
                        </button>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mt-1">
                        <FileText className="w-4 h-4 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Invoice #INV-2025-001 sent</p>
                        <p className="text-xs text-gray-500">Thu, Sep 11 at 12:30 PM</p>
                      </div>
                      <div className="text-right">
                        <button 
                          className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                          onClick={() => setActiveTab('invoices')}
                        >
                          Invoice #001
                        </button>
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
                            <div className="flex items-center space-x-2">
                              <button 
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                onClick={() => setActiveTab('estimates')}
                              >
                                Estimate 208
                              </button>
                              <span className="text-sm">•</span>
                              <button 
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                onClick={() => setActiveTab('customers')}
                              >
                                Susan Scarr
                              </button>
                            </div>
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
                            <div className="flex items-center space-x-2">
                              <button 
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                onClick={() => setActiveTab('jobs')}
                              >
                                Job 972
                              </button>
                              <span className="text-sm">•</span>
                              <button 
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                onClick={() => setActiveTab('customers')}
                              >
                                Michael Pritchard
                              </button>
                            </div>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-xs">AM</span>
                              </div>
                              <span className="text-xs text-gray-500">Alvis(AJ) Miller</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="text-sm font-medium">2:00pm - 4:00pm</div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <button 
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                onClick={() => setActiveTab('jobs')}
                              >
                                Job 845
                              </button>
                              <span className="text-sm">•</span>
                              <button 
                                className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                                onClick={() => setActiveTab('customers')}
                              >
                                Johnson Residence
                              </button>
                            </div>
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
        
        {activeTab === 'invoices' && <InvoiceManagement />}
        
        {activeTab === 'schedule' && <ScheduleLazy />}
        
        {activeTab === 'customers' && <CustomersLazy />}
        
        {activeTab === 'financials' && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Financial Reports</h2>
            <p className="text-gray-600">Financial reporting features coming soon...</p>
          </div>
        )}
        
        {activeTab === 'estimates' && <EstimatesLazy />}
        
        {activeTab === 'jobs' && <JobsLazy />}
        
        {activeTab === 'my-money' && <MyMoneyLazy />}
        
        {activeTab === 'reporting' && <ReportingLazy />}
        
        {activeTab === 'settings' && <SettingsLazy />}
      </main>

      {/* Mobile Navigation */}
      <MobileNavigation 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
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

