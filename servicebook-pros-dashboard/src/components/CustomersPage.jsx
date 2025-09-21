import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Input } from './ui/input'
import { 
  Search, 
  Filter, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  MessageSquare, 
  Calendar, 
  FileText, 
  Trash2, 
  Eye,
  Download,
  Upload,
  Grid3X3,
  List,
  Phone,
  Mail,
  MapPin,
  User,
  Settings,
  Archive,
  Copy,
  RefreshCw,
  UserPlus,
  FileSpreadsheet,
  Trash,
  RotateCcw,
  Briefcase,
  Receipt,
  ChevronDown
} from 'lucide-react'
import CustomerInboxIntegrated from './CustomerInboxIntegrated'
import CreateCustomerModal from './CreateCustomerModal'
import apiClient from '../utils/apiClient'

const CustomersPage = () => {
  const [customers, setCustomers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCustomers, setSelectedCustomers] = useState([])
  const [viewMode, setViewMode] = useState('list') // 'list' or 'grid'
  const [showInbox, setShowInbox] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showActionsDropdown, setShowActionsDropdown] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [customerActionDropdown, setCustomerActionDropdown] = useState(null) // Track which customer's dropdown is open
  const [showFilterDropdown, setShowFilterDropdown] = useState(false)
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    location: 'all'
  })

  // Sample customer data
  const sampleCustomers = [
    {
      id: 1,
      name: 'John Meyer',
      company: '',
      email: 'john.meyer@email.com',
      phone: '(406) 799-0536',
      mobile: '(406) 799-0536',
      address: '1251 Golf View Drive',
      city: 'Seeley Lake',
      state: 'MT',
      zip_code: '59868',
      created_at: '2025-01-15T10:00:00Z',
      last_contact: '2025-09-12T14:30:00Z',
      total_jobs: 3,
      total_spent: 2850.00,
      status: 'active',
      type: 'residential'
    },
    {
      id: 2,
      name: 'Bruce Hall',
      company: '',
      email: 'bruce.hall@email.com',
      phone: '(719) 661-8955',
      mobile: '(719) 661-8955',
      address: '270 A Street',
      city: 'Seeley Lake',
      state: 'MT',
      zip_code: '59868',
      created_at: '2025-02-20T10:00:00Z',
      last_contact: '2025-09-10T09:15:00Z',
      total_jobs: 1,
      total_spent: 1200.00,
      status: 'active',
      type: 'residential'
    },
    {
      id: 3,
      name: 'Susan Scarr',
      company: '',
      email: 'susan.scarr@email.com',
      phone: '(770) 480-9498',
      mobile: '(770) 480-9498',
      address: '916 Grand Ave',
      city: 'Missoula',
      state: 'MT',
      zip_code: '59802',
      created_at: '2025-03-10T10:00:00Z',
      last_contact: '2025-09-11T16:45:00Z',
      total_jobs: 2,
      total_spent: 1850.00,
      status: 'active',
      type: 'residential'
    },
    {
      id: 4,
      name: 'Michael Pritchard',
      company: '',
      email: 'michael.pritchard@email.com',
      phone: '(406) 546-9299',
      mobile: '(406) 546-9299',
      address: '5855 La Voie Ln',
      city: 'Missoula',
      state: 'MT',
      zip_code: '59808',
      created_at: '2025-04-05T10:00:00Z',
      last_contact: '2025-09-09T11:20:00Z',
      total_jobs: 4,
      total_spent: 3200.00,
      status: 'active',
      type: 'commercial'
    },
    {
      id: 5,
      name: 'Nathan Winter',
      company: '',
      email: 'nathan.winter@email.com',
      phone: '(904) 801-9219',
      mobile: '(904) 801-9219',
      address: '3071 Double Arrow Lookout Road',
      city: 'Seeley Lake',
      state: 'MT',
      zip_code: '59868',
      created_at: '2025-05-12T10:00:00Z',
      last_contact: '2025-09-08T14:20:00Z',
      total_jobs: 1,
      total_spent: 950.00,
      status: 'prospect',
      type: 'residential'
    }
  ]

  useEffect(() => {
    // Try to fetch from API first, fall back to sample data
    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter(customer => {
    // Search filter
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Status filter
    const matchesStatus = filters.status === 'all' || customer.status === filters.status
    
    // Type filter (residential/commercial)
    const matchesType = filters.type === 'all' || customer.type === filters.type
    
    // Location filter (by city)
    const matchesLocation = filters.location === 'all' || customer.city === filters.location
    
    return matchesSearch && matchesStatus && matchesType && matchesLocation
  })

  const handleSelectCustomer = (customerId) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    )
  }

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([])
    } else {
      setSelectedCustomers(filteredCustomers.map(c => c.id))
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusBadge = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      prospect: 'bg-blue-100 text-blue-800'
    }
    return colors[status] || colors.active
  }

  const handleCreateCustomer = async (newCustomer) => {
    try {
      // Try to create via API first
      try {
        const createdCustomer = await apiClient.createCustomer(newCustomer)
        setCustomers(prev => [createdCustomer, ...prev])
        console.log('Customer created via API:', createdCustomer)
      } catch (apiError) {
        console.error('API creation failed, using local data:', apiError)
        // Fall back to local creation if API fails
        const customerWithId = { ...newCustomer, id: Date.now() }
        setCustomers(prev => [customerWithId, ...prev])
        console.log('Customer created locally:', customerWithId)
      }
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }

  // Customer action handlers with API integration
  const handleEditCustomer = async (customer) => {
    console.log('Edit customer:', customer)
    try {
      // TODO: Open edit customer modal with real data
      // For now, show alert with customer info
      alert(`Edit customer: ${customer.name}`)
      
      // Example of how to update customer via API:
      // const updatedCustomer = await apiClient.updateCustomer(customer.id, updatedData)
      // setCustomers(prev => prev.map(c => c.id === customer.id ? updatedCustomer : c))
    } catch (error) {
      console.error('Error editing customer:', error)
      alert('Failed to edit customer. Please try again.')
    }
  }

  const handleSendMessage = async (customer) => {
    console.log('Send message to customer:', customer)
    try {
      // TODO: Open messaging interface
      alert(`Send message to: ${customer.name} (${customer.email})`)
      
      // Example of how to create communication via API:
      // const communication = {
      //   type: 'email',
      //   subject: 'Message from ServiceBook Pros',
      //   content: messageContent,
      //   channel: 'email'
      // }
      // await apiClient.createCustomerCommunication(customer.id, communication)
    } catch (error) {
      console.error('Error sending message:', error)
      alert('Failed to send message. Please try again.')
    }
  }

  const handleScheduleJob = async (customer) => {
    console.log('Schedule job for customer:', customer)
    try {
      // TODO: Open job scheduling interface
      alert(`Schedule job for: ${customer.name}`)
      
      // Example of how to create job via API:
      // const jobData = {
      //   customer_id: customer.id,
      //   title: 'New Service Job',
      //   description: '',
      //   scheduled_date: new Date(),
      //   status: 'scheduled'
      // }
      // await apiClient.createJob(jobData)
    } catch (error) {
      console.error('Error scheduling job:', error)
      alert('Failed to schedule job. Please try again.')
    }
  }

  const handleCreateEstimate = async (customer) => {
    console.log('Create estimate for customer:', customer)
    try {
      // TODO: Open estimate creation interface
      alert(`Create estimate for: ${customer.name}`)
      
      // Example of how to create estimate via API:
      // const estimateData = {
      //   customer_id: customer.id,
      //   title: 'Service Estimate',
      //   items: [],
      //   total: 0,
      //   status: 'draft'
      // }
      // await apiClient.createEstimate(estimateData)
    } catch (error) {
      console.error('Error creating estimate:', error)
      alert('Failed to create estimate. Please try again.')
    }
  }

  const handleViewHistory = async (customer) => {
    console.log('View history for customer:', customer)
    try {
      // TODO: Open customer history view with real data
      alert(`View history for: ${customer.name}`)
      
      // Example of how to fetch customer analytics:
      // const analytics = await apiClient.getCustomerAnalytics(customer.id)
      // const communications = await apiClient.getCustomerCommunications(customer.id)
      // Show detailed history modal with this data
    } catch (error) {
      console.error('Error viewing history:', error)
      alert('Failed to load customer history. Please try again.')
    }
  }

  const handleDeleteCustomer = async (customer) => {
    console.log('Delete customer:', customer)
    if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
      try {
        // TODO: Delete via API
        // await apiClient.deleteCustomer(customer.id)
        setCustomers(prev => prev.filter(c => c.id !== customer.id))
        alert(`Customer ${customer.name} has been deleted`)
      } catch (error) {
        console.error('Error deleting customer:', error)
        alert('Failed to delete customer. Please try again.')
      }
    }
  }

  // Load customers from API
  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔄 Fetching customers from API...')
      
      const response = await apiClient.getCustomers()
      console.log('📦 API Response:', response)
      
      // Handle different response formats
      let customersData = []
      
      if (Array.isArray(response)) {
        // Direct array response
        customersData = response
      } else if (response && Array.isArray(response.data)) {
        // Paginated response with data array
        customersData = response.data
      } else if (response && response.customers && Array.isArray(response.customers)) {
        // Alternative format with customers array
        customersData = response.customers
      } else {
        console.warn('⚠️ Unexpected API response format:', response)
        customersData = []
      }
      
      console.log('✅ Processed customers data:', customersData)
      
      // Normalize customer data to match expected format
      const normalizedCustomers = customersData.map(customer => ({
        id: customer.id,
        name: customer.display_name || `${customer.first_name} ${customer.last_name}`.trim() || 'Unknown',
        company: customer.company_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        mobile: customer.mobile || customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zip_code: customer.zip_code || '',
        created_at: customer.created_at || new Date().toISOString(),
        last_contact: customer.updated_at || customer.created_at || new Date().toISOString(),
        total_jobs: customer.total_jobs || 0,
        total_spent: customer.total_spent || 0,
        status: customer.status || 'active',
        type: customer.customer_type || 'residential'
      }))
      
      setCustomers(normalizedCustomers)
      console.log('✅ Customers loaded successfully:', normalizedCustomers.length)
      
    } catch (error) {
      console.error('❌ Error fetching customers:', error)
      setError(error.message || 'Failed to load customers')
      
      // Fall back to sample data if API fails
      console.log('🔄 Falling back to sample data...')
      setCustomers(sampleCustomers)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Customers</h2>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <a href="#" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg">
            <Users className="w-4 h-4" />
            <span>Customers</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
            <Briefcase className="w-4 h-4" />
            <span>Jobs</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
            <FileText className="w-4 h-4" />
            <span>Estimates</span>
          </a>
          <a href="#" className="flex items-center space-x-3 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
            <Receipt className="w-4 h-4" />
            <span>Invoices</span>
          </a>
        </nav>

        {/* Inbox Section */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={() => setShowInbox(true)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-4 h-4" />
              <span>Inbox</span>
            </div>
            <Badge className="bg-red-500 text-white">3</Badge>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">All Customers</h1>
              <p className="text-gray-600">{filteredCustomers.length} records</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={fetchCustomers}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button 
                onClick={() => setShowCreateModal(true)}
                size="sm" 
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Customer
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search customers"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                {showFilterDropdown && (
                  <>
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setShowFilterDropdown(false)}
                    />
                    <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Filter Customers</h3>
                        
                        {/* Status Filter */}
                        <div className="mb-4">
                          <label className="block text-xs font-medium text-gray-700 mb-2">Status</label>
                          <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="all">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="prospect">Prospect</option>
                          </select>
                        </div>
                        
                        {/* Type Filter */}
                        <div className="mb-4">
                          <label className="block text-xs font-medium text-gray-700 mb-2">Customer Type</label>
                          <select
                            value={filters.type}
                            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="all">All Types</option>
                            <option value="residential">Residential</option>
                            <option value="commercial">Commercial</option>
                          </select>
                        </div>
                        
                        {/* Location Filter */}
                        <div className="mb-4">
                          <label className="block text-xs font-medium text-gray-700 mb-2">Location</label>
                          <select
                            value={filters.location}
                            onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="all">All Locations</option>
                            <option value="Seeley Lake">Seeley Lake</option>
                            <option value="Missoula">Missoula</option>
                          </select>
                        </div>
                        
                        {/* Filter Actions */}
                        <div className="flex space-x-2 pt-3 border-t border-gray-200">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setFilters({ status: 'all', type: 'all', location: 'all' })
                            }}
                            className="flex-1"
                          >
                            Clear
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => setShowFilterDropdown(false)}
                            className="flex-1"
                          >
                            Apply
                          </Button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    viewMode === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    viewMode === 'grid' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
              </div>
              
              {/* Actions Dropdown */}
              <div className="relative">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowActionsDropdown(!showActionsDropdown)}
                  className="flex items-center space-x-2"
                >
                  <span>Actions</span>
                  <ChevronDown className="w-4 h-4" />
                </Button>
                
                {showActionsDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <button 
                        onClick={() => {
                          setShowCreateModal(true)
                          setShowActionsDropdown(false)
                        }}
                        className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <UserPlus className="w-4 h-4" />
                        <span>Create customer</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Upload className="w-4 h-4" />
                        <span>Import</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Download className="w-4 h-4" />
                        <span>Export</span>
                      </button>
                      <div className="border-t border-gray-200 my-2"></div>
                      <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <RotateCcw className="w-4 h-4" />
                        <span>Restore deleted</span>
                      </button>
                      <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        <Copy className="w-4 h-4" />
                        <span>Manage duplicates</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Customer List */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            // Loading State
            <div className="h-full flex items-center justify-center bg-white">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Loading customers...</h3>
                <p className="text-gray-500">Please wait while we fetch your customer data.</p>
              </div>
            </div>
          ) : error ? (
            // Error State
            <div className="h-full flex items-center justify-center bg-white">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <RefreshCw className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load customers</h3>
                <p className="text-gray-500 mb-4">{error}</p>
                <div className="space-x-2">
                  <Button 
                    onClick={fetchCustomers}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      setError(null)
                      setCustomers(sampleCustomers)
                    }}
                  >
                    Use Sample Data
                  </Button>
                </div>
              </div>
            </div>
          ) : filteredCustomers.length === 0 ? (
            // Empty State
            <div className="h-full flex items-center justify-center bg-white">
              <div className="text-center">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filters.status !== 'all' || filters.type !== 'all' || filters.location !== 'all' 
                    ? 'No customers found' 
                    : 'No customers yet'
                  }
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm || filters.status !== 'all' || filters.type !== 'all' || filters.location !== 'all'
                    ? 'Try adjusting your search or filters to find what you\'re looking for.'
                    : 'Get started by adding your first customer to the system.'
                  }
                </p>
                {(!searchTerm && filters.status === 'all' && filters.type === 'all' && filters.location === 'all') && (
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Customer
                  </Button>
                )}
              </div>
            </div>
          ) : viewMode === 'list' ? (
            <div className="h-full overflow-y-auto">
              {/* Table Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-3">
                <div className="grid grid-cols-12 gap-4 text-sm font-medium text-gray-500">
                  <div className="col-span-1">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300"
                    />
                  </div>
                  <div className="col-span-3">Display name</div>
                  <div className="col-span-2">Company</div>
                  <div className="col-span-3">Address</div>
                  <div className="col-span-2">Mobile</div>
                  <div className="col-span-1">Actions</div>
                </div>
              </div>

              {/* Table Body */}
              <div className="bg-white">
                {filteredCustomers.map((customer) => (
                  <div
                    key={customer.id}
                    className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-100 hover:bg-gray-50 ${
                      selectedCustomers.includes(customer.id) ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={() => handleSelectCustomer(customer.id)}
                        className="rounded border-gray-300"
                      />
                    </div>
                    <div className="col-span-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="text-gray-900">{customer.company || '-'}</span>
                    </div>
                    <div className="col-span-3 flex items-center">
                      <div>
                        <p className="text-gray-900">{customer.address}</p>
                        <p className="text-sm text-gray-500">
                          {customer.city}, {customer.state} {customer.zip_code}
                        </p>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center">
                      <span className="text-gray-900">{customer.mobile}</span>
                    </div>
                    <div className="col-span-1 flex items-center relative">
                      <div className="relative">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setCustomerActionDropdown(customerActionDropdown === customer.id ? null : customer.id)}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                        {customerActionDropdown === customer.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-40"
                              onClick={() => setCustomerActionDropdown(null)}
                            />
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                              <div className="py-1">
                                <button 
                                  onClick={() => {
                                    setCustomerActionDropdown(null)
                                    handleEditCustomer(customer)
                                  }}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <Edit className="w-4 h-4 inline mr-2" />
                                  Edit Customer
                                </button>
                                <button 
                                  onClick={() => {
                                    setCustomerActionDropdown(null)
                                    handleSendMessage(customer)
                                  }}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <MessageSquare className="w-4 h-4 inline mr-2" />
                                  Send Message
                                </button>
                                <button 
                                  onClick={() => {
                                    setCustomerActionDropdown(null)
                                    handleScheduleJob(customer)
                                  }}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <Calendar className="w-4 h-4 inline mr-2" />
                                  Schedule Job
                                </button>
                                <button 
                                  onClick={() => {
                                    setCustomerActionDropdown(null)
                                    handleCreateEstimate(customer)
                                  }}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <FileText className="w-4 h-4 inline mr-2" />
                                  Create Estimate
                                </button>
                                <button 
                                  onClick={() => {
                                    setCustomerActionDropdown(null)
                                    handleViewHistory(customer)
                                  }}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                >
                                  <Receipt className="w-4 h-4 inline mr-2" />
                                  View History
                                </button>
                                <div className="border-t border-gray-100 my-1"></div>
                                <button 
                                  onClick={() => {
                                    setCustomerActionDropdown(null)
                                    handleDeleteCustomer(customer)
                                  }}
                                  className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                >
                                  <Trash2 className="w-4 h-4 inline mr-2" />
                                  Delete Customer
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Grid View */
            <div className="p-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCustomers.map((customer) => (
                  <Card key={customer.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{customer.name}</CardTitle>
                            <Badge className={getStatusBadge(customer.status)} variant="secondary">
                              {customer.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="relative">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => setCustomerActionDropdown(customerActionDropdown === customer.id ? null : customer.id)}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                          {customerActionDropdown === customer.id && (
                            <>
                              <div 
                                className="fixed inset-0 z-40"
                                onClick={() => setCustomerActionDropdown(null)}
                              />
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                                <div className="py-1">
                                  <button 
                                    onClick={() => {
                                      setCustomerActionDropdown(null)
                                      handleEditCustomer(customer)
                                    }}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <Edit className="w-4 h-4 inline mr-2" />
                                    Edit Customer
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setCustomerActionDropdown(null)
                                      handleSendMessage(customer)
                                    }}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <MessageSquare className="w-4 h-4 inline mr-2" />
                                    Send Message
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setCustomerActionDropdown(null)
                                      handleScheduleJob(customer)
                                    }}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <Calendar className="w-4 h-4 inline mr-2" />
                                    Schedule Job
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setCustomerActionDropdown(null)
                                      handleCreateEstimate(customer)
                                    }}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <FileText className="w-4 h-4 inline mr-2" />
                                    Create Estimate
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setCustomerActionDropdown(null)
                                      handleViewHistory(customer)
                                    }}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  >
                                    <Receipt className="w-4 h-4 inline mr-2" />
                                    View History
                                  </button>
                                  <div className="border-t border-gray-100 my-1"></div>
                                  <button 
                                    onClick={() => {
                                      setCustomerActionDropdown(null)
                                      handleDeleteCustomer(customer)
                                    }}
                                    className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                  >
                                    <Trash2 className="w-4 h-4 inline mr-2" />
                                    Delete Customer
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Phone className="w-4 h-4" />
                          <span>{customer.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span className="truncate">{customer.email}</span>
                        </div>
                        <div className="flex items-start space-x-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mt-0.5" />
                          <span>
                            {customer.address}<br />
                            {customer.city}, {customer.state} {customer.zip_code}
                          </span>
                        </div>
                        
                        <div className="pt-3 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-gray-500">Total Jobs</p>
                              <p className="font-medium">{customer.total_jobs}</p>
                            </div>
                            <div>
                              <p className="text-gray-500">Total Spent</p>
                              <p className="font-medium">${customer.total_spent.toLocaleString()}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 pt-3">
                          <Button size="sm" variant="outline" className="flex-1">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1">
                            <Calendar className="w-4 h-4 mr-2" />
                            Schedule
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer Inbox */}
      {showInbox && (
        <CustomerInboxIntegrated 
          isOpen={showInbox}
          onClose={() => setShowInbox(false)}
        />
      )}

      {/* Create Customer Modal */}
      <CreateCustomerModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateCustomer}
      />

      {/* Dropdown Overlay */}
      {showActionsDropdown && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowActionsDropdown(false)}
        />
      )}
    </div>
  )
}

export default CustomersPage

