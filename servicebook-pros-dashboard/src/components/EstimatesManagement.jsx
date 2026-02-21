import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  MapPin,
  User,
  Clock,
  DollarSign,
  CheckCircle,
  FileText,
  Mail,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  ChevronDown,
  Copy,
  Printer,
  Download,
  Send,
  X,
  Check,
  XCircle,
  Clock10
} from 'lucide-react'
import apiClient from '../utils/apiClient'
import CustomerAutocomplete from './CustomerAutocomplete'

const EstimatesManagement = () => {
  const [estimates, setEstimates] = useState([])
  const [selectedEstimate, setSelectedEstimate] = useState(null)
  const [showEstimateModal, setShowEstimateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState([])
  const [newEstimate, setNewEstimate] = useState({ customer_id: '', customerName: '', description: '', amount: '', validUntil: '', notes: '' })
  const [creatingEstimate, setCreatingEstimate] = useState(false)
  const [editingEstimate, setEditingEstimate] = useState(null)

  // Sample estimates data
  const sampleEstimates = [
    {
      id: 1,
      estimateNumber: 'EST-001',
      title: 'New AC Unit Installation',
      customer: {
        name: 'Bruce Hall',
        phone: '(719) 661-8955',
        email: 'bruce.hall@email.com',
        address: '270 A Street, Seeley Lake, MT 59868'
      },
      status: 'sent',
      totalAmount: '$4,500.00',
      createdDate: '2025-09-11',
      expiryDate: '2025-10-11',
      lineItems: [
        { id: 1, description: 'New 3-ton AC Unit', quantity: 1, price: '$3,200.00', total: '$3,200.00' },
        { id: 2, description: 'Installation Labor', quantity: 8, price: '$125.00/hr', total: '$1,000.00' },
        { id: 3, description: 'Ductwork Modification', quantity: 1, price: '$300.00', total: '$300.00' }
      ],
      notes: 'Includes 10-year warranty on parts and labor. Price valid for 30 days.',
      lastUpdated: '2025-09-11 02:15 PM'
    },
    {
      id: 2,
      estimateNumber: 'EST-002',
      title: 'Water Heater Replacement',
      customer: {
        name: 'Jonathan Winter',
        phone: '(904) 801-9219',
        email: 'jonathan.winter@email.com',
        address: '3071 Double Arrow Lookou Road, Seeley Lake, MT 59868'
      },
      status: 'approved',
      totalAmount: '$1,850.00',
      createdDate: '2025-09-10',
      expiryDate: '2025-10-10',
      lineItems: [
        { id: 1, description: '50-gallon Gas Water Heater', quantity: 1, price: '$1,250.00', total: '$1,250.00' },
        { id: 2, description: 'Installation & Removal', quantity: 1, price: '$600.00', total: '$600.00' }
      ],
      notes: 'Includes removal of old water heater. Installation can be scheduled for next week.',
      lastUpdated: '2025-09-12 10:00 AM'
    },
    {
      id: 3,
      estimateNumber: 'EST-003',
      title: 'Full House Rewiring',
      customer: {
        name: 'Susan Scarr',
        phone: '(770) 480-9498',
        email: 'susan.scarr@email.com',
        address: '916 Grand Ave, Missoula, MT 59802'
      },
      status: 'draft',
      totalAmount: '$12,500.00',
      createdDate: '2025-09-12',
      expiryDate: '2025-10-12',
      lineItems: [
        { id: 1, description: 'Complete house rewiring (2000 sq ft)', quantity: 1, price: '$10,000.00', total: '$10,000.00' },
        { id: 2, description: 'New outlets and switches', quantity: 25, price: '$50.00/ea', total: '$1,250.00' },
        { id: 3, description: 'Permit and inspection fees', quantity: 1, price: '$1,250.00', total: '$1,250.00' }
      ],
      notes: 'Project requires 5-7 business days. A 50% deposit is required to start.',
      lastUpdated: '2025-09-12 04:30 PM'
    }
  ]

  useEffect(() => {
    const loadEstimates = async () => {
      setLoading(true)
      try {
        const data = await apiClient.getEstimates()
        const loaded = Array.isArray(data) ? data : (data?.estimates || data?.results || [])
        setEstimates(loaded.length > 0 ? loaded : sampleEstimates)
      } catch (err) {
        console.error('Failed to load estimates:', err)
        setEstimates(sampleEstimates)
      } finally {
        setLoading(false)
      }
    }
    loadEstimates()
  }, [])

  useEffect(() => {
    apiClient.getCustomers().then(data => {
      const list = Array.isArray(data) ? data : (data?.customers || [])
      setCustomers(list)
    }).catch(err => console.error('Failed to load customers:', err))
  }, [])

  useEffect(() => {
    const pending = sessionStorage.getItem('sbp_auto_open_estimate')
    if (pending) {
      try {
        const { customer_id, customer_name } = JSON.parse(pending)
        setNewEstimate(prev => ({ ...prev, customer_id: String(customer_id), customerName: customer_name }))
        setShowEstimateModal(true)
      } catch (e) {}
      sessionStorage.removeItem('sbp_auto_open_estimate')
    }
  }, [])

  const handleCreateEstimate = async (e) => {
    e.preventDefault()
    setCreatingEstimate(true)
    try {
      const payload = {
        title: newEstimate.description,
        customer_name: newEstimate.customerName,
        customer_id: parseInt(newEstimate.customer_id) || null,
        total: parseFloat(newEstimate.amount) || 0,
        expiry_date: newEstimate.validUntil || null,
        status: newEstimate.status || 'pending',
        notes: newEstimate.notes,
      }
      const created = await apiClient.createEstimate(payload)
      setEstimates(prev => [created, ...prev])
      setShowEstimateModal(false)
      setNewEstimate({ customer_id: '', customerName: '', description: '', amount: '', validUntil: '', notes: '' })
    } catch (err) {
      console.error('Failed to create estimate:', err)
      setEstimates(prev => [{ title: newEstimate.description, customer_name: newEstimate.customerName, id: Date.now(), status: 'draft', totalAmount: `$${newEstimate.amount}` }, ...prev])
      setShowEstimateModal(false)
      setNewEstimate({ customer_id: '', customerName: '', description: '', amount: '', validUntil: '', notes: '' })
    } finally {
      setCreatingEstimate(false)
    }
  }

  const handleUpdateEstimate = async (e) => {
    e.preventDefault()
    try {
      const updated = await apiClient.updateEstimate(editingEstimate.id, {
        title: editingEstimate.title,
        customer_name: editingEstimate.customer?.name || editingEstimate.customerName || editingEstimate.customer_name,
        total: parseFloat(editingEstimate.totalAmount || editingEstimate.total) || 0,
        status: editingEstimate.status,
        notes: editingEstimate.notes,
      })
      setEstimates(prev => prev.map(e => e.id === editingEstimate.id ? updated : e))
      setSelectedEstimate(updated)
      setEditingEstimate(null)
    } catch (err) {
      console.error('Failed to update estimate:', err)
      setEditingEstimate(null)
    }
  }

  const handleDeleteEstimate = async (estimate) => {
    if (!window.confirm(`Delete estimate for ${estimate.customer?.name || estimate.customerName || 'this customer'}?`)) return
    try {
      await apiClient.deleteEstimate(estimate.id)
    } catch (err) {
      console.error('Failed to delete estimate:', err)
    }
    setEstimates(prev => prev.filter(e => e.id !== estimate.id))
    setSelectedEstimate(null)
  }

  const handleSendEstimate = async (estimate) => {
    try {
      await apiClient.updateEstimate(estimate.id, { status: 'sent' })
    } catch (err) {
      console.error('Send estimate error:', err)
    }
    setEstimates(prev => prev.map(e => e.id === estimate.id ? { ...e, status: 'sent' } : e))
    setSelectedEstimate(prev => prev?.id === estimate.id ? { ...prev, status: 'sent' } : prev)
  }

  const handleApproveEstimate = async (estimate) => {
    try {
      await apiClient.updateEstimate(estimate.id, { status: 'approved' })
    } catch (err) {
      console.error('Approve estimate error:', err)
    }
    setEstimates(prev => prev.map(e => e.id === estimate.id ? { ...e, status: 'approved' } : e))
    setSelectedEstimate(prev => prev?.id === estimate.id ? { ...prev, status: 'approved' } : prev)
  }

  const handleConvertToJob = async (estimate) => {
    if (!window.confirm(`Convert this estimate to a job?`)) return
    try {
      await apiClient.request(`/estimates/${estimate.id}/convert`, { method: 'POST' })
    } catch (err) {
      console.error('Convert to job error:', err)
    }
    setEstimates(prev => prev.map(e => e.id === estimate.id ? { ...e, status: 'converted' } : e))
    setSelectedEstimate(null)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'viewed': return 'bg-purple-100 text-purple-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'expired': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft': return <Edit className="w-4 h-4" />
      case 'sent': return <Send className="w-4 h-4" />
      case 'viewed': return <Eye className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'expired': return <Clock10 className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const filteredEstimates = (estimates || []).filter(estimate => {
    const matchesSearch = String(estimate.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         String(estimate.customer?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         String(estimate.estimateNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || estimate.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getEstimateCustomerName = (estimate) => {
    return estimate.customer?.name || estimate.customer_name || estimate.customerName || 'Unknown Customer'
  }

  const renderEstimateCard = (estimate) => (
    <Card key={estimate.id} className="mb-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedEstimate(estimate)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(estimate.status)}
              <span className="font-semibold text-lg">{estimate.estimateNumber || estimate.estimate_number || `EST-${estimate.id}`}</span>
            </div>
            <Badge className={getStatusColor(estimate.status)}>
              {String(estimate.status || '').toUpperCase()}
            </Badge>
          </div>
          <div className="text-right">
            <div className="font-semibold text-lg">{estimate.totalAmount || (estimate.total != null ? `$${parseFloat(estimate.total).toFixed(2)}` : '')}</div>
            <div className="text-sm text-gray-500">Expires: {estimate.expiryDate || estimate.expiry_date || ''}</div>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2">{estimate.title}</h3>

        <div className="flex items-center space-x-2 mb-4">
          <User className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{getEstimateCustomerName(estimate)}</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Created: {estimate.createdDate || estimate.created_at || ''}
          </div>
          <div className="text-sm text-gray-500">
            Updated: {estimate.lastUpdated || estimate.updated_at || ''}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderEstimateDetails = () => {
    if (!selectedEstimate) return null

    const customerName = getEstimateCustomerName(selectedEstimate)
    const customerAddress = selectedEstimate.customer?.address || ''
    const customerPhone = selectedEstimate.customer?.phone || ''
    const customerEmail = selectedEstimate.customer?.email || ''

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl h-5/6 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold">{selectedEstimate.estimateNumber || selectedEstimate.estimate_number || `EST-${selectedEstimate.id}`}</h2>
                  <Badge className={getStatusColor(selectedEstimate.status)}>
                    {String(selectedEstimate.status || '').toUpperCase()}
                  </Badge>
                </div>
                <h3 className="text-xl text-gray-700 mb-2">{selectedEstimate.title}</h3>
                <div className="text-sm text-gray-600">{customerName}</div>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setSelectedEstimate(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-semibold">{customerName}</p>
                  {customerAddress && <p>{customerAddress}</p>}
                  {customerPhone && <p>{customerPhone}</p>}
                  {customerEmail && <p>{customerEmail}</p>}
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Estimate Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Created:</strong> {selectedEstimate.createdDate || selectedEstimate.created_at || ''}</p>
                  <p><strong>Expires:</strong> {selectedEstimate.expiryDate || selectedEstimate.expiry_date || ''}</p>
                  <p><strong>Total:</strong> <span className="font-bold text-lg">{selectedEstimate.totalAmount || (selectedEstimate.total != null ? `$${parseFloat(selectedEstimate.total).toFixed(2)}` : '')}</span></p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Line Items</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Description</th>
                      <th className="text-right py-2">Quantity</th>
                      <th className="text-right py-2">Price</th>
                      <th className="text-right py-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedEstimate.lineItems || []).map(item => (
                      <tr key={item.id} className="border-b">
                        <td className="py-2">{item.description}</td>
                        <td className="text-right py-2">{item.quantity}</td>
                        <td className="text-right py-2">{item.price}</td>
                        <td className="text-right py-2 font-semibold">{item.total}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2">
                      <td colSpan="3" className="text-right py-2 font-bold">Total</td>
                      <td className="text-right py-2 font-bold text-lg">{selectedEstimate.totalAmount || (selectedEstimate.total != null ? `$${parseFloat(selectedEstimate.total).toFixed(2)}` : '')}</td>
                    </tr>
                  </tfoot>
                </table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{selectedEstimate.notes}</p>
              </CardContent>
            </Card>
          </div>

          {/* Footer Actions */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex justify-end items-center space-x-3">
              {selectedEstimate.status === 'draft' && (
                <Button variant="outline" onClick={() => handleSendEstimate(selectedEstimate)}>
                  <Send className="w-4 h-4 mr-2" />
                  Send to Customer
                </Button>
              )}
              {selectedEstimate.status === 'sent' && (
                <Button variant="outline" onClick={() => handleApproveEstimate(selectedEstimate)}>
                  <Check className="w-4 h-4 mr-2" />
                  Mark as Approved
                </Button>
              )}
              {selectedEstimate.status === 'approved' && (
                <Button onClick={() => handleConvertToJob(selectedEstimate)}>
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Convert to Job
                </Button>
              )}
              <Button variant="outline" onClick={() => setEditingEstimate(selectedEstimate)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteEstimate(selectedEstimate)}>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estimates Management</h1>
          <p className="text-gray-600 mt-1">Create, send, and track estimates for your customers</p>
        </div>
        <Button onClick={() => setShowEstimateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Estimate
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search estimates, customers, or estimate numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="sent">Sent</option>
          <option value="viewed">Viewed</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Estimates</p>
                <p className="text-2xl font-bold">{estimates.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold">{estimates.filter(e => e.status === 'approved').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{estimates.filter(e => e.status === 'sent' || e.status === 'viewed').length}</p>
              </div>
              <Clock10 className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Value</p>
                <p className="text-2xl font-bold">${(estimates || []).reduce((sum, e) => sum + parseFloat(String(e.totalAmount || 0).replace('$', '').replace(',', '')), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estimates List */}
      <div className="space-y-4">
        {filteredEstimates.length > 0 ? (
          filteredEstimates.map(renderEstimateCard)
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No estimates found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by creating your first estimate'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setShowEstimateModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Estimate
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Estimate Details Modal */}
      {selectedEstimate && renderEstimateDetails()}

      {/* Edit Estimate Modal */}
      {editingEstimate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Edit Estimate</h2>
              <button onClick={() => setEditingEstimate(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleUpdateEstimate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input type="text" required value={editingEstimate.title || ''} onChange={e => setEditingEstimate({...editingEstimate, title: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Service description" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input type="text" value={editingEstimate.customer?.name || editingEstimate.customerName || editingEstimate.customer_name || ''} onChange={e => setEditingEstimate({...editingEstimate, customer: {...(editingEstimate.customer || {}), name: e.target.value}, customerName: e.target.value, customer_name: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Customer name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                <input type="number" min="0" step="0.01" value={editingEstimate.totalAmount || editingEstimate.total || ''} onChange={e => setEditingEstimate({...editingEstimate, totalAmount: e.target.value, total: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editingEstimate.status || 'pending'} onChange={e => setEditingEstimate({...editingEstimate, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={editingEstimate.notes || ''} onChange={e => setEditingEstimate({...editingEstimate, notes: e.target.value})} rows={3} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Additional notes..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingEstimate(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Estimate Modal */}
      {showEstimateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">New Estimate</h2>
              <button onClick={() => setShowEstimateModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreateEstimate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
                <CustomerAutocomplete
                  customers={customers}
                  value={newEstimate.customer_id}
                  onChange={({ customer_id, customer_name }) =>
                    setNewEstimate({ ...newEstimate, customer_id, customerName: customer_name })
                  }
                  placeholder="Search customers..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Description *</label>
                <input type="text" required value={newEstimate.description} onChange={e => setNewEstimate({...newEstimate, description: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. 200A Panel Upgrade" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
                  <input type="number" min="0" step="0.01" value={newEstimate.amount} onChange={e => setNewEstimate({...newEstimate, amount: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
                  <input type="date" value={newEstimate.validUntil} onChange={e => setNewEstimate({...newEstimate, validUntil: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={newEstimate.notes} onChange={e => setNewEstimate({...newEstimate, notes: e.target.value})} rows={3} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Additional notes..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEstimateModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={creatingEstimate} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60">{creatingEstimate ? 'Creating...' : 'Create Estimate'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default EstimatesManagement

