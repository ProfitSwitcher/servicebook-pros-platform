import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { API_BASE_URL } from '@/lib/config'
import apiClient from '../utils/apiClient'
import CustomerAutocomplete from './CustomerAutocomplete'
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Send, 
  DollarSign, 
  Calendar,
  User,
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

const API_BASE = API_BASE_URL

const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [activeTab, setActiveTab] = useState('list')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [editingInvoice, setEditingInvoice] = useState(null)

  // Invoice form state
  const [invoiceForm, setInvoiceForm] = useState({
    customer_id: '',
    customer_name: '',
    due_date: '',
    payment_terms: 'Net 30',
    notes: '',
    line_items: []
  })

  // Customer form state
  const [customerForm, setCustomerForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip_code: ''
  })

  // Line item form state
  const [lineItemForm, setLineItemForm] = useState({
    description: '',
    quantity: 1,
    unit_price: 0,
    item_type: 'service'
  })

  useEffect(() => {
    loadInvoices()
    loadCustomers()
  }, [])

  useEffect(() => {
    const pending = sessionStorage.getItem('sbp_auto_open_invoice')
    if (pending) {
      try {
        const { customer_id, customer_name } = JSON.parse(pending)
        setInvoiceForm(prev => ({ ...prev, customer_id: String(customer_id), customer_name: customer_name || '' }))
        setActiveTab('create')
      } catch (e) {}
      sessionStorage.removeItem('sbp_auto_open_invoice')
    }
  }, [])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const data = await apiClient.getInvoices()
      setInvoices(Array.isArray(data) ? data : (data?.invoices || data?.results || []))
    } catch (err) {
      setError('Error loading invoices: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadCustomers = async () => {
    try {
      const data = await apiClient.getCustomers()
      setCustomers(Array.isArray(data) ? data : (data?.customers || data?.results || []))
    } catch (err) {
      console.error('Error loading customers:', err)
    }
  }

  const createInvoice = async () => {
    try {
      setLoading(true)
      setError('')
      // Ensure customer_name is set — fall back to looking up by customer_id
      let customerName = invoiceForm.customer_name
      if (!customerName && invoiceForm.customer_id) {
        const found = customers.find(c => String(c.id) === String(invoiceForm.customer_id))
        customerName = found?.name || ''
      }
      const data = await apiClient.createInvoice({ ...invoiceForm, customer_name: customerName })
      setSuccess('Invoice created successfully!')
      setShowCreateDialog(false)
      resetInvoiceForm()
      loadInvoices()
    } catch (err) {
      setError('Error creating invoice: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const createCustomer = async () => {
    try {
      setLoading(true)
      setError('')
      await apiClient.createCustomer(customerForm)
      setSuccess('Customer created successfully!')
      resetCustomerForm()
      loadCustomers()
    } catch (err) {
      setError('Error creating customer: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSendInvoice = async (invoice) => {
    try {
      await apiClient.request(`/invoices/${invoice.id}/send`, { method: 'POST', body: JSON.stringify({}) })
      setInvoices(prev => prev.map(inv => inv.id === invoice.id ? { ...inv, status: 'sent' } : inv))
    } catch (err) {
      console.error('Failed to send invoice:', err)
    }
  }

  const addLineItem = () => {
    if (!lineItemForm.description || !lineItemForm.unit_price) {
      setError('Please fill in description and unit price')
      return
    }

    const newLineItem = {
      ...lineItemForm,
      total_price: lineItemForm.quantity * lineItemForm.unit_price
    }

    setInvoiceForm(prev => ({
      ...prev,
      line_items: [...prev.line_items, newLineItem]
    }))

    setLineItemForm({
      description: '',
      quantity: 1,
      unit_price: 0,
      item_type: 'service'
    })
  }

  const removeLineItem = (index) => {
    setInvoiceForm(prev => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index)
    }))
  }

  const resetInvoiceForm = () => {
    setInvoiceForm({
      customer_id: '',
      customer_name: '',
      due_date: '',
      payment_terms: 'Net 30',
      notes: '',
      line_items: []
    })
  }

  const resetCustomerForm = () => {
    setCustomerForm({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip_code: ''
    })
  }

  const downloadInvoicePDF = (invoiceId, invoiceNumber) => {
    const url = `${API_BASE}/invoices/${invoiceId}/pdf`
    const link = document.createElement('a')
    link.href = url
    link.download = `invoice_${invoiceNumber}.pdf`
    link.target = '_blank'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const previewInvoicePDF = async (invoiceId) => {
    try {
      const url = `${API_BASE}/invoices/${invoiceId}/pdf/preview`
      window.open(url, '_blank')
    } catch (error) {
      console.error('Error previewing PDF:', error)
      alert('Failed to preview PDF. Please try again.')
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', icon: Edit },
      sent: { color: 'bg-blue-100 text-blue-800', icon: Send },
      paid: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      overdue: { color: 'bg-red-100 text-red-800', icon: AlertCircle },
      cancelled: { color: 'bg-gray-100 text-gray-600', icon: Clock }
    }
    
    const config = statusConfig[status] || statusConfig.draft
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {String(status || '').charAt(0).toUpperCase() + String(status || '').slice(1)}
      </Badge>
    )
  }

  const filteredInvoices = (invoices || []).filter(invoice => {
    const matchesSearch = String(invoice.invoice_number || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (invoice.customer && `${invoice.customer.first_name} ${invoice.customer.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const calculateSubtotal = () => {
    return invoiceForm.line_items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0)
  }

  const calculateTax = (subtotal) => {
    return subtotal * 0.0875 // Default 8.75% tax rate
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const tax = calculateTax(subtotal)
    return subtotal + tax
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="list">Invoice List</TabsTrigger>
          <TabsTrigger value="create">Create Invoice</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Invoice Management
              </CardTitle>
              <CardDescription>
                Manage your invoices, track payments, and send invoices to customers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters and Search */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search invoices..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => setActiveTab('create')}>
                  <Plus className="w-4 h-4 mr-2" />
                  New Invoice
                </Button>
              </div>

              {/* Invoice Table */}
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8">
                          Loading invoices...
                        </TableCell>
                      </TableRow>
                    ) : filteredInvoices.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          No invoices found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredInvoices.map((invoice) => (
                        <TableRow key={invoice.id}>
                          <TableCell className="font-medium">
                            {invoice.invoice_number}
                          </TableCell>
                          <TableCell>
                            {invoice.customer ? 
                              `${invoice.customer.first_name} ${invoice.customer.last_name}` : 
                              'Unknown Customer'
                            }
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.date_issued).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(invoice.due_date).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            ${parseFloat(invoice.total_amount || 0).toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(invoice.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => previewInvoicePDF(invoice.id)}
                                title="Preview PDF"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => downloadInvoicePDF(invoice.id, invoice.invoice_number)}
                                title="Download PDF"
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" title="Edit Invoice" onClick={() => setEditingInvoice(invoice)}>
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button variant="outline" size="sm" title="Send Invoice" onClick={() => handleSendInvoice(invoice)}>
                                <Send className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Invoice Form */}
            <Card>
              <CardHeader>
                <CardTitle>Create New Invoice</CardTitle>
                <CardDescription>
                  Fill in the invoice details and line items
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Selection */}
                <div>
                  <Label htmlFor="customer">Customer</Label>
                  <CustomerAutocomplete
                    customers={customers}
                    value={invoiceForm.customer_id}
                    onChange={({ customer_id, customer_name }) =>
                      setInvoiceForm(prev => ({ ...prev, customer_id, customer_name: customer_name || '' }))
                    }
                    placeholder="Search customers..."
                  />
                </div>

                {/* Due Date */}
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={invoiceForm.due_date}
                    onChange={(e) => setInvoiceForm(prev => ({...prev, due_date: e.target.value}))}
                  />
                </div>

                {/* Payment Terms */}
                <div>
                  <Label htmlFor="payment_terms">Payment Terms</Label>
                  <Select 
                    value={invoiceForm.payment_terms} 
                    onValueChange={(value) => setInvoiceForm(prev => ({...prev, payment_terms: value}))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Due on Receipt">Due on Receipt</SelectItem>
                      <SelectItem value="Net 15">Net 15</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 45">Net 45</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Additional notes for the invoice..."
                    value={invoiceForm.notes}
                    onChange={(e) => setInvoiceForm(prev => ({...prev, notes: e.target.value}))}
                  />
                </div>

                {/* Line Items Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Line Items</h3>
                  
                  {/* Add Line Item Form */}
                  <div className="border rounded-lg p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Input
                          id="description"
                          placeholder="Service or item description"
                          value={lineItemForm.description}
                          onChange={(e) => setLineItemForm(prev => ({...prev, description: e.target.value}))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="item_type">Type</Label>
                        <Select 
                          value={lineItemForm.item_type} 
                          onValueChange={(value) => setLineItemForm(prev => ({...prev, item_type: value}))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="service">Service</SelectItem>
                            <SelectItem value="material">Material</SelectItem>
                            <SelectItem value="labor">Labor</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="0"
                          step="0.01"
                          value={lineItemForm.quantity}
                          onChange={(e) => setLineItemForm(prev => ({...prev, quantity: parseFloat(e.target.value) || 0}))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="unit_price">Unit Price</Label>
                        <Input
                          id="unit_price"
                          type="number"
                          min="0"
                          step="0.01"
                          value={lineItemForm.unit_price}
                          onChange={(e) => setLineItemForm(prev => ({...prev, unit_price: parseFloat(e.target.value) || 0}))}
                        />
                      </div>
                      <div className="flex items-end">
                        <Button onClick={addLineItem} className="w-full">
                          <Plus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Line Items List */}
                  {invoiceForm.line_items.length > 0 && (
                    <div className="border rounded-lg">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Description</TableHead>
                            <TableHead>Qty</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {invoiceForm.line_items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.description}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>${item.unit_price.toFixed(2)}</TableCell>
                              <TableCell>${(item.quantity * item.unit_price).toFixed(2)}</TableCell>
                              <TableCell>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => removeLineItem(index)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>

                <Button 
                  onClick={createInvoice} 
                  disabled={loading || !invoiceForm.customer_id || !invoiceForm.due_date}
                  className="w-full"
                >
                  {loading ? 'Creating...' : 'Create Invoice'}
                </Button>
              </CardContent>
            </Card>

            {/* Right Panel - Invoice Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Invoice Preview</CardTitle>
                <CardDescription>
                  Preview of how your invoice will look
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 p-6 border rounded-lg bg-white">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold">INVOICE</h2>
                    <p className="text-gray-600">Invoice #: [Auto-generated]</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-semibold">Bill To:</h3>
                      {invoiceForm.customer_id ? (
                        <div className="text-sm text-gray-600">
                          {(() => {
                            const customer = customers.find(c => c.id.toString() === invoiceForm.customer_id)
                            return customer ? (
                              <div>
                                <p>{customer.first_name} {customer.last_name}</p>
                                {customer.email && <p>{customer.email}</p>}
                                {customer.phone && <p>{customer.phone}</p>}
                              </div>
                            ) : <p>Select a customer</p>
                          })()}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">Select a customer</p>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">Invoice Details:</h3>
                      <div className="text-sm text-gray-600">
                        <p>Date: {new Date().toLocaleDateString()}</p>
                        <p>Due: {invoiceForm.due_date ? new Date(invoiceForm.due_date).toLocaleDateString() : 'Select due date'}</p>
                        <p>Terms: {invoiceForm.payment_terms}</p>
                      </div>
                    </div>
                  </div>

                  {invoiceForm.line_items.length > 0 && (
                    <div>
                      <h3 className="font-semibold mb-2">Items:</h3>
                      <div className="border rounded">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="text-xs">Description</TableHead>
                              <TableHead className="text-xs">Qty</TableHead>
                              <TableHead className="text-xs">Price</TableHead>
                              <TableHead className="text-xs">Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invoiceForm.line_items.map((item, index) => (
                              <TableRow key={index}>
                                <TableCell className="text-xs">{item.description}</TableCell>
                                <TableCell className="text-xs">{item.quantity}</TableCell>
                                <TableCell className="text-xs">${item.unit_price.toFixed(2)}</TableCell>
                                <TableCell className="text-xs">${(item.quantity * item.unit_price).toFixed(2)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  )}

                  {invoiceForm.line_items.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Tax (8.75%):</span>
                        <span>${calculateTax(calculateSubtotal()).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-lg font-bold border-t pt-2">
                        <span>Total:</span>
                        <span>${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>
                  )}

                  {invoiceForm.notes && (
                    <div>
                      <h3 className="font-semibold">Notes:</h3>
                      <p className="text-sm text-gray-600">{invoiceForm.notes}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customer Management
              </CardTitle>
              <CardDescription>
                Manage your customer database
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Add Customer Form */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Add New Customer</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="first_name">First Name</Label>
                      <Input
                        id="first_name"
                        value={customerForm.first_name}
                        onChange={(e) => setCustomerForm(prev => ({...prev, first_name: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="last_name">Last Name</Label>
                      <Input
                        id="last_name"
                        value={customerForm.last_name}
                        onChange={(e) => setCustomerForm(prev => ({...prev, last_name: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm(prev => ({...prev, email: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm(prev => ({...prev, phone: e.target.value}))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={customerForm.address}
                      onChange={(e) => setCustomerForm(prev => ({...prev, address: e.target.value}))}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={customerForm.city}
                        onChange={(e) => setCustomerForm(prev => ({...prev, city: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={customerForm.state}
                        onChange={(e) => setCustomerForm(prev => ({...prev, state: e.target.value}))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zip_code">ZIP Code</Label>
                      <Input
                        id="zip_code"
                        value={customerForm.zip_code}
                        onChange={(e) => setCustomerForm(prev => ({...prev, zip_code: e.target.value}))}
                      />
                    </div>
                  </div>
                  <Button 
                    onClick={createCustomer} 
                    disabled={loading || !customerForm.first_name || !customerForm.last_name}
                    className="w-full"
                  >
                    {loading ? 'Creating...' : 'Add Customer'}
                  </Button>
                </div>

                {/* Customer List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Existing Customers</h3>
                  <div className="border rounded-lg max-h-96 overflow-y-auto">
                    {customers.length === 0 ? (
                      <div className="p-4 text-center text-gray-500">
                        No customers found
                      </div>
                    ) : (
                      <div className="divide-y">
                        {customers.map((customer) => (
                          <div key={customer.id} className="p-4">
                            <div className="font-medium">
                              {customer.first_name} {customer.last_name}
                            </div>
                            {customer.email && (
                              <div className="text-sm text-gray-600">{customer.email}</div>
                            )}
                            {customer.phone && (
                              <div className="text-sm text-gray-600">{customer.phone}</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Invoice Modal */}
      {editingInvoice && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Edit Invoice</h2>
              <button onClick={() => setEditingInvoice(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Invoice Number</label>
                <input type="text" value={editingInvoice.invoice_number || editingInvoice.number || ''} readOnly className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={editingInvoice.status || 'pending'} onChange={e => setEditingInvoice({...editingInvoice, status: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setEditingInvoice(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={async () => {
                  try {
                    await apiClient.updateInvoice(editingInvoice.id, { status: editingInvoice.status })
                  } catch (err) {
                    console.error('Failed to update invoice:', err)
                  }
                  setInvoices(prev => prev.map(inv => inv.id === editingInvoice.id ? editingInvoice : inv))
                  setEditingInvoice(null)
                }} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default InvoiceManagement

