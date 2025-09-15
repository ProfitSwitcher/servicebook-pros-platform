import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import InvoiceManagement from '@/components/InvoiceManagement.jsx'
import CRMDashboard from '@/components/CRMDashboard.jsx'
import { 
  Building2, 
  Calculator, 
  DollarSign, 
  Settings, 
  Users, 
  FileText, 
  TrendingUp,
  Search,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Eye,
  EyeOff
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

  // Login state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  })

  // New tax rate form
  const [newTaxRate, setNewTaxRate] = useState({
    tax_name: '',
    tax_rate: '',
    is_default: false
  })

  // New labor rate form
  const [newLaborRate, setNewLaborRate] = useState({
    rate_name: '',
    hourly_cost: '',
    hourly_price: '',
    is_default: false
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
    } catch (err) {
      console.error('Login error:', err)
      setError(`Network error: ${err.message}. Please check your connection.`)
    } finally {
      setLoading(false)
    }
  }

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      // Load services
      const servicesResponse = await fetch(`${API_BASE}/pricing/services?per_page=50`, {
        credentials: 'include'
      })
      const servicesData = await servicesResponse.json()
      if (servicesData.success) {
        setServices(servicesData.services)
      }

      // Load categories
      const categoriesResponse = await fetch(`${API_BASE}/pricing/categories`, {
        credentials: 'include'
      })
      const categoriesData = await categoriesResponse.json()
      if (categoriesData.success) {
        setCategories(categoriesData.categories)
      }

      // Load tax rates
      const taxResponse = await fetch(`${API_BASE}/pricing/tax-rates`, {
        credentials: 'include'
      })
      const taxData = await taxResponse.json()
      if (taxData.success) {
        setTaxRates(taxData.tax_rates)
      }

      // Load labor rates
      const laborResponse = await fetch(`${API_BASE}/pricing/labor-rates`, {
        credentials: 'include'
      })
      const laborData = await laborResponse.json()
      if (laborData.success) {
        setLaborRates(laborData.labor_rates)
      }

    } catch (err) {
      setError('Failed to load dashboard data')
    }
  }

  // Update service pricing
  const updateServicePricing = async (serviceCode, updates) => {
    try {
      const response = await fetch(`${API_BASE}/pricing/services/${serviceCode}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(updates)
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess('Service updated successfully!')
        await loadDashboardData()
        setEditingService(null)
      } else {
        setError(data.message || 'Update failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  // Create tax rate
  const createTaxRate = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE}/pricing/tax-rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...newTaxRate,
          tax_rate: parseFloat(newTaxRate.tax_rate)
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess('Tax rate created successfully!')
        setNewTaxRate({ tax_name: '', tax_rate: '', is_default: false })
        await loadDashboardData()
      } else {
        setError(data.message || 'Creation failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  // Create labor rate
  const createLaborRate = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE}/pricing/labor-rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...newLaborRate,
          hourly_cost: parseFloat(newLaborRate.hourly_cost),
          hourly_price: parseFloat(newLaborRate.hourly_price)
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setSuccess('Labor rate created successfully!')
        setNewLaborRate({ rate_name: '', hourly_cost: '', hourly_price: '', is_default: false })
        await loadDashboardData()
      } else {
        setError(data.message || 'Creation failed')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    }
  }

  // Filter services based on search
  const filteredServices = services.filter(service =>
    service.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.service_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('')
        setSuccess('')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">ServiceBook Pros</CardTitle>
            <CardDescription>Company Dashboard Login</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
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
              <div className="space-y-2">
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
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}
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
                onClick={() => setActiveTab('services')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'services' ? 'bg-gray-700 text-white' : 'text-gray-300 hover:text-white hover:bg-gray-800'
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
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors">
              New
            </button>
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
                <Card className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">OPEN ESTIMATES</h3>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-gray-900">106</span>
                        <span className="text-sm text-gray-500">$825,726.06</span>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6 border-blue-200 bg-blue-50">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">OPEN INVOICES</h3>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-gray-900">19</span>
                        <span className="text-sm text-gray-500">$39,890.12</span>
                      </div>
                    </div>
                  </div>
                </Card>
                
                <Card className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Settings className="w-6 h-6 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">UNSCHEDULED JOBS</h3>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-3xl font-bold text-gray-900">840</span>
                        <span className="text-sm text-gray-500">$1,395,088.75</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Week to Date Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Week to date</h2>
                  <button className="text-blue-600 hover:text-blue-800">View all reports</button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Card className="p-4 text-center">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">JOB REVENUE EARNED</h4>
                    <div className="text-2xl font-bold text-gray-900">$0</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">JOBS COMPLETED</h4>
                    <div className="text-2xl font-bold text-gray-900">0</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">AVERAGE JOB SIZE</h4>
                    <div className="text-2xl font-bold text-gray-900">$0</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">TOTAL NEW JOBS BOOKED</h4>
                    <div className="text-2xl font-bold text-gray-900">$9,494</div>
                    <div className="text-xs text-green-600 mt-1">↑ 1.283%</div>
                  </Card>
                  <Card className="p-4 text-center">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">NEW JOBS BOOKED ONLINE</h4>
                    <div className="text-2xl font-bold text-gray-900">$0</div>
                  </Card>
                </div>
              </div>
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

          {/* Services Tab */}
          <TabsContent value="services" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Service Pricing Management</CardTitle>
                <CardDescription>Customize pricing for your electrical services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <div className="space-y-4">
                  {filteredServices.map((service) => (
                    <div key={service.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge variant="outline">{service.service_code}</Badge>
                            {service.is_customized && (
                              <Badge className="bg-blue-100 text-blue-800">Customized</Badge>
                            )}
                          </div>
                          <h3 className="font-medium text-gray-900">{service.service_name}</h3>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                            <span>Base: ${service.base_price}</span>
                            <span>Effective: ${service.effective_price}</span>
                            <span>Labor: {service.base_labor_hours}h × ${service.company_labor_rate}</span>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingService(service)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Rates Tab */}
          <TabsContent value="tax-rates" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Tax Rates</CardTitle>
                  <CardDescription>Manage your company's tax rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {taxRates.map((rate) => (
                      <div key={rate.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{rate.tax_name}</p>
                          <p className="text-sm text-gray-600">{rate.tax_rate_percent}%</p>
                        </div>
                        {rate.is_default && (
                          <Badge className="bg-green-100 text-green-800">Default</Badge>
                        )}
                      </div>
                    ))}
                    {taxRates.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No tax rates configured</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add Tax Rate</CardTitle>
                  <CardDescription>Create a new tax rate for your company</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createTaxRate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="tax_name">Tax Name</Label>
                      <Input
                        id="tax_name"
                        value={newTaxRate.tax_name}
                        onChange={(e) => setNewTaxRate({...newTaxRate, tax_name: e.target.value})}
                        placeholder="e.g., State Tax, Local Tax"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                      <Input
                        id="tax_rate"
                        type="number"
                        step="0.01"
                        value={newTaxRate.tax_rate}
                        onChange={(e) => setNewTaxRate({...newTaxRate, tax_rate: e.target.value})}
                        placeholder="e.g., 8.25"
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_default_tax"
                        checked={newTaxRate.is_default}
                        onChange={(e) => setNewTaxRate({...newTaxRate, is_default: e.target.checked})}
                      />
                      <Label htmlFor="is_default_tax">Set as default tax rate</Label>
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Tax Rate
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Labor Rates Tab */}
          <TabsContent value="labor-rates" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Current Labor Rates</CardTitle>
                  <CardDescription>Manage your company's labor rates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {laborRates.map((rate) => (
                      <div key={rate.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-medium">{rate.rate_name}</p>
                          {rate.is_default && (
                            <Badge className="bg-green-100 text-green-800">Default</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p>Cost: ${rate.hourly_cost}/hr</p>
                            <p>Price: ${rate.hourly_price}/hr</p>
                          </div>
                          <div>
                            <p>Markup: {rate.markup_percent}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {laborRates.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No labor rates configured</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Add Labor Rate</CardTitle>
                  <CardDescription>Create a new labor rate for your company</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={createLaborRate} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="rate_name">Rate Name</Label>
                      <Input
                        id="rate_name"
                        value={newLaborRate.rate_name}
                        onChange={(e) => setNewLaborRate({...newLaborRate, rate_name: e.target.value})}
                        placeholder="e.g., Standard Rate, Emergency Rate"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hourly_cost">Hourly Cost ($)</Label>
                      <Input
                        id="hourly_cost"
                        type="number"
                        step="0.01"
                        value={newLaborRate.hourly_cost}
                        onChange={(e) => setNewLaborRate({...newLaborRate, hourly_cost: e.target.value})}
                        placeholder="e.g., 75.00"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="hourly_price">Hourly Price ($)</Label>
                      <Input
                        id="hourly_price"
                        type="number"
                        step="0.01"
                        value={newLaborRate.hourly_price}
                        onChange={(e) => setNewLaborRate({...newLaborRate, hourly_price: e.target.value})}
                        placeholder="e.g., 125.00"
                        required
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="is_default_labor"
                        checked={newLaborRate.is_default}
                        onChange={(e) => setNewLaborRate({...newLaborRate, is_default: e.target.checked})}
                      />
                      <Label htmlFor="is_default_labor">Set as default labor rate</Label>
                    </div>
                    <Button type="submit" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Labor Rate
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Settings</CardTitle>
                <CardDescription>Manage your company information and preferences</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Company Name</Label>
                      <Input value={company?.company_name || ''} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Company Code</Label>
                      <Input value={company?.company_code || ''} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Email</Label>
                      <Input value={company?.contact_email || ''} readOnly />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Phone</Label>
                      <Input value={company?.contact_phone || ''} readOnly />
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <p className="text-sm text-gray-600">
                      To update company settings, please contact support or use the company management API.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Service Edit Modal */}
      {editingService && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Service Pricing</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingService(null)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <CardDescription>
                Customize pricing for {editingService.service_name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.target)
                const updates = {
                  custom_name: formData.get('custom_name'),
                  custom_description: formData.get('custom_description'),
                  custom_price: formData.get('custom_price') ? parseFloat(formData.get('custom_price')) : null,
                  price_adjustment_percent: formData.get('price_adjustment_percent') ? parseFloat(formData.get('price_adjustment_percent')) : 0
                }
                updateServicePricing(editingService.service_code, updates)
              }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom_name">Service Name</Label>
                  <Input
                    id="custom_name"
                    name="custom_name"
                    defaultValue={editingService.service_name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="custom_description">Description</Label>
                  <textarea
                    id="custom_description"
                    name="custom_description"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    defaultValue={editingService.description}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="custom_price">Custom Price ($)</Label>
                    <Input
                      id="custom_price"
                      name="custom_price"
                      type="number"
                      step="0.01"
                      placeholder={`Current: $${editingService.effective_price}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price_adjustment_percent">Adjustment (%)</Label>
                    <Input
                      id="price_adjustment_percent"
                      name="price_adjustment_percent"
                      type="number"
                      step="0.01"
                      placeholder="e.g., 15 or -10"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditingService(null)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default App

