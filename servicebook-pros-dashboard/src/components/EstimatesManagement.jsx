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

const EstimatesManagement = () => {
  const [estimates, setEstimates] = useState([])
  const [selectedEstimate, setSelectedEstimate] = useState(null)
  const [showEstimateModal, setShowEstimateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(false)

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
    setEstimates(sampleEstimates)
  }, [])

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

  const filteredEstimates = estimates.filter(estimate => {
    const matchesSearch = estimate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         estimate.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         estimate.estimateNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || estimate.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const renderEstimateCard = (estimate) => (
    <Card key={estimate.id} className="mb-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedEstimate(estimate)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(estimate.status)}
              <span className="font-semibold text-lg">{estimate.estimateNumber}</span>
            </div>
            <Badge className={getStatusColor(estimate.status)}>
              {estimate.status.toUpperCase()}
            </Badge>
          </div>
          <div className="text-right">
            <div className="font-semibold text-lg">{estimate.totalAmount}</div>
            <div className="text-sm text-gray-500">Expires: {estimate.expiryDate}</div>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2">{estimate.title}</h3>
        
        <div className="flex items-center space-x-2 mb-4">
          <User className="w-4 h-4 text-gray-500" />
          <span className="font-medium">{estimate.customer.name}</span>
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Created: {estimate.createdDate}
          </div>
          <div className="text-sm text-gray-500">
            Updated: {estimate.lastUpdated}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderEstimateDetails = () => {
    if (!selectedEstimate) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-4xl h-5/6 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <h2 className="text-2xl font-bold">{selectedEstimate.estimateNumber}</h2>
                  <Badge className={getStatusColor(selectedEstimate.status)}>
                    {selectedEstimate.status.toUpperCase()}
                  </Badge>
                </div>
                <h3 className="text-xl text-gray-700 mb-2">{selectedEstimate.title}</h3>
                <div className="text-sm text-gray-600">{selectedEstimate.customer.name}</div>
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
                  <p className="font-semibold">{selectedEstimate.customer.name}</p>
                  <p>{selectedEstimate.customer.address}</p>
                  <p>{selectedEstimate.customer.phone}</p>
                  <p>{selectedEstimate.customer.email}</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Estimate Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <p><strong>Created:</strong> {selectedEstimate.createdDate}</p>
                  <p><strong>Expires:</strong> {selectedEstimate.expiryDate}</p>
                  <p><strong>Total:</strong> <span className="font-bold text-lg">{selectedEstimate.totalAmount}</span></p>
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
                    {selectedEstimate.lineItems.map(item => (
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
                      <td className="text-right py-2 font-bold text-lg">{selectedEstimate.totalAmount}</td>
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
                <Button variant="outline" onClick={() => alert('Send estimate')}>
                  <Send className="w-4 h-4 mr-2" />
                  Send to Customer
                </Button>
              )}
              {selectedEstimate.status === 'sent' && (
                <Button variant="outline" onClick={() => alert('Mark as approved')}>
                  <Check className="w-4 h-4 mr-2" />
                  Mark as Approved
                </Button>
              )}
              {selectedEstimate.status === 'approved' && (
                <Button onClick={() => alert('Convert to job')}>
                  <ChevronRight className="w-4 h-4 mr-2" />
                  Convert to Job
                </Button>
              )}
              <Button variant="outline" onClick={() => alert('Edit estimate')}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => alert('Delete estimate')}>
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
                <p className="text-2xl font-bold">${estimates.reduce((sum, e) => sum + parseFloat(e.totalAmount.replace('$', '').replace(',', '')), 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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
    </div>
  )
}

export default EstimatesManagement

