# ServiceBook Pros - CRM API Usage for Invoicing System

## Overview
This document details the CRM API usage for the Invoicing System in the ServiceBook Pros CRM Dashboard. The Invoicing System provides professional invoice creation, management, and tracking with integration to work orders and customer management.

## API Endpoints for Invoicing

### 1. Get Invoices
**Endpoint:** `GET /api/invoices`
**Purpose:** Retrieve invoices with filtering and pagination
**Authentication:** Required (company-scoped)

#### Request Parameters
```javascript
{
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled',
  customer_id?: string,
  work_order_id?: string,
  date_from?: string,
  date_to?: string,
  limit?: number,
  offset?: number,
  sort?: 'date_created' | 'due_date' | 'amount' | 'status'
}
```

#### Response Format
```javascript
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": "inv-2024-001",
        "invoice_number": "INV-2024-001",
        "work_order_id": "wo-2023-007",
        "customer_id": "cust-123",
        "customer": {
          "id": "cust-123",
          "name": "John Smith",
          "company": "ABC Corp",
          "email": "john@abccorp.com",
          "phone": "(555) 123-4567",
          "billing_address": {
            "street": "123 Business Lane",
            "city": "Anytown",
            "state": "CA",
            "zip": "91234"
          }
        },
        "status": "sent",
        "date_created": "2024-01-15T10:30:00Z",
        "date_sent": "2024-01-15T14:45:00Z",
        "due_date": "2024-02-14T23:59:59Z",
        "payment_terms": "Net 30",
        "line_items": [
          {
            "id": "li-001",
            "type": "service",
            "service_id": "T811272",
            "description": "Consultation & Needs Assessment",
            "quantity": 1,
            "unit_price": 150.00,
            "total": 150.00
          },
          {
            "id": "li-002", 
            "type": "service",
            "service_id": "T811273",
            "description": "Software Configuration",
            "quantity": 12,
            "unit_price": 75.00,
            "total": 900.00
          },
          {
            "id": "li-003",
            "type": "material",
            "material_id": "mat-cable-12awg",
            "description": "12 AWG Electrical Cable",
            "quantity": 100,
            "unit_cost": 1.25,
            "markup_percentage": 35,
            "unit_price": 1.69,
            "total": 169.00
          }
        ],
        "subtotal": 1219.00,
        "tax_rate": 8.5,
        "tax_amount": 103.62,
        "total_amount": 1322.62,
        "amount_paid": 0.00,
        "balance_due": 1322.62,
        "notes": "Thank you for your business!",
        "payment_instructions": "Please remit payment within 30 days.",
        "company_info": {
          "name": "Elite Electrical Services",
          "address": "789 Contractor Ave, Business City, CA 90210",
          "phone": "(555) 987-6543",
          "email": "billing@eliteelectrical.com",
          "license": "C-10 #123456"
        }
      }
    ],
    "summary": {
      "total_invoices": 156,
      "total_amount": 45230.50,
      "paid_amount": 38940.25,
      "outstanding_amount": 6290.25,
      "overdue_count": 5
    }
  }
}
```

### 2. Create Invoice
**Endpoint:** `POST /api/invoices`
**Purpose:** Create a new invoice
**Authentication:** Required (company-scoped)

#### Request Body
```javascript
{
  "customer_id": "cust-123",
  "work_order_id": "wo-2023-008", // Optional - for work order conversion
  "due_date": "2024-02-15T23:59:59Z",
  "payment_terms": "Net 30",
  "line_items": [
    {
      "type": "service",
      "service_id": "T811272",
      "description": "Electrical Panel Upgrade 200A",
      "quantity": 1,
      "unit_price": 850.00
    },
    {
      "type": "material", 
      "material_id": "mat-panel-200a",
      "description": "200A Main Panel",
      "quantity": 1,
      "unit_cost": 250.00,
      "markup_percentage": 35
    }
  ],
  "tax_rate": 8.5,
  "notes": "Panel upgrade completed successfully.",
  "payment_instructions": "Payment due within 30 days of invoice date.",
  "send_email": true
}
```

#### Response Format
```javascript
{
  "success": true,
  "data": {
    "invoice": {
      "id": "inv-2024-002",
      "invoice_number": "INV-2024-002",
      // ... full invoice object
    },
    "pdf_url": "https://api.servicebookpros.com/invoices/inv-2024-002/pdf",
    "email_sent": true
  },
  "message": "Invoice created and sent successfully"
}
```

### 3. Update Invoice
**Endpoint:** `PATCH /api/invoices/{invoice_id}`
**Purpose:** Update invoice details or status
**Authentication:** Required (company-scoped)

#### Request Body
```javascript
{
  "status": "paid",
  "payment_date": "2024-01-20T15:30:00Z",
  "payment_amount": 1322.62,
  "payment_method": "check",
  "payment_reference": "Check #1234",
  "notes": "Payment received - thank you!"
}
```

### 4. Generate Invoice PDF
**Endpoint:** `GET /api/invoices/{invoice_id}/pdf`
**Purpose:** Generate and download invoice PDF
**Authentication:** Required (company-scoped)

### 5. Send Invoice Email
**Endpoint:** `POST /api/invoices/{invoice_id}/send`
**Purpose:** Send invoice via email to customer
**Authentication:** Required (company-scoped)

#### Request Body
```javascript
{
  "to_email": "customer@example.com",
  "cc_emails": ["manager@company.com"],
  "subject": "Invoice INV-2024-002 from Elite Electrical Services",
  "message": "Please find attached your invoice. Payment is due within 30 days.",
  "include_pdf": true
}
```

## Frontend Implementation

### 1. Invoice Creation Interface
```javascript
const InvoiceCreationForm = ({ workOrder, customer, onSave }) => {
  const [invoice, setInvoice] = useState({
    customer_id: customer?.id || '',
    work_order_id: workOrder?.id || '',
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    payment_terms: 'Net 30',
    line_items: workOrder?.services || [],
    tax_rate: 8.5,
    notes: '',
    payment_instructions: 'Please remit payment within 30 days.'
  });

  const [preview, setPreview] = useState(null);

  const calculateTotals = () => {
    const subtotal = invoice.line_items.reduce((sum, item) => {
      return sum + (item.quantity * item.unit_price);
    }, 0);
    
    const tax_amount = subtotal * (invoice.tax_rate / 100);
    const total_amount = subtotal + tax_amount;
    
    return { subtotal, tax_amount, total_amount };
  };

  const handleLineItemChange = (index, field, value) => {
    const updatedItems = [...invoice.line_items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Recalculate total for the line item
    if (field === 'quantity' || field === 'unit_price') {
      updatedItems[index].total = updatedItems[index].quantity * updatedItems[index].unit_price;
    }
    
    setInvoice(prev => ({ ...prev, line_items: updatedItems }));
  };

  const addLineItem = () => {
    setInvoice(prev => ({
      ...prev,
      line_items: [
        ...prev.line_items,
        {
          type: 'service',
          description: '',
          quantity: 1,
          unit_price: 0,
          total: 0
        }
      ]
    }));
  };

  const removeLineItem = (index) => {
    setInvoice(prev => ({
      ...prev,
      line_items: prev.line_items.filter((_, i) => i !== index)
    }));
  };

  const generatePreview = async () => {
    try {
      const response = await fetch('/api/invoices/preview', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoice)
      });
      
      const data = await response.json();
      setPreview(data.data.preview);
    } catch (error) {
      console.error('Error generating preview:', error);
    }
  };

  const handleSave = async (action = 'draft') => {
    try {
      const response = await fetch('/api/invoices', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...invoice,
          send_email: action === 'send'
        })
      });

      if (response.ok) {
        const data = await response.json();
        onSave(data.data.invoice, action);
      }
    } catch (error) {
      console.error('Error saving invoice:', error);
    }
  };

  const { subtotal, tax_amount, total_amount } = calculateTotals();

  return (
    <div className="invoice-creation-form grid grid-cols-2 gap-6">
      {/* Left Side - Form */}
      <div className="form-section">
        <div className="customer-section mb-6">
          <h3 className="text-lg font-semibold mb-3">Customer Information</h3>
          <CustomerSelect
            value={invoice.customer_id}
            onChange={(customerId) => setInvoice(prev => ({ ...prev, customer_id: customerId }))}
          />
        </div>

        <div className="work-order-section mb-6">
          <h3 className="text-lg font-semibold mb-3">Work Order Details</h3>
          <input
            type="date"
            value={invoice.due_date?.split('T')[0]}
            onChange={(e) => setInvoice(prev => ({ 
              ...prev, 
              due_date: new Date(e.target.value).toISOString() 
            }))}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="line-items-section mb-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold">Line Items</h3>
            <button
              onClick={addLineItem}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm"
            >
              + Add Item
            </button>
          </div>
          
          <div className="space-y-2">
            {invoice.line_items.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                  className="col-span-5 p-2 border rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => handleLineItemChange(index, 'quantity', parseFloat(e.target.value))}
                  className="col-span-2 p-2 border rounded text-sm"
                />
                <input
                  type="number"
                  placeholder="Rate"
                  value={item.unit_price}
                  onChange={(e) => handleLineItemChange(index, 'unit_price', parseFloat(e.target.value))}
                  className="col-span-2 p-2 border rounded text-sm"
                />
                <div className="col-span-2 text-right font-medium">
                  ${(item.quantity * item.unit_price).toFixed(2)}
                </div>
                <button
                  onClick={() => removeLineItem(index)}
                  className="col-span-1 text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="totals-section mb-6">
          <div className="bg-gray-50 p-4 rounded">
            <div className="flex justify-between mb-2">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Tax ({invoice.tax_rate}%):</span>
              <span>${tax_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2">
              <span>Total:</span>
              <span>${total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="notes-section mb-6">
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            value={invoice.notes}
            onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
            className="w-full p-2 border rounded"
            rows="3"
          />
        </div>

        <div className="actions-section flex space-x-2">
          <button
            onClick={() => handleSave('draft')}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            Save Draft
          </button>
          <button
            onClick={() => handleSave('send')}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Send Invoice
          </button>
          <button
            onClick={generatePreview}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Preview
          </button>
        </div>
      </div>

      {/* Right Side - Preview */}
      <div className="preview-section">
        <div className="sticky top-4">
          <h3 className="text-lg font-semibold mb-3">Invoice Preview</h3>
          <div className="border rounded-lg p-4 bg-white shadow-sm">
            <InvoicePreview invoice={invoice} preview={preview} />
          </div>
        </div>
      </div>
    </div>
  );
};
```

### 2. Invoice Preview Component
```javascript
const InvoicePreview = ({ invoice, customer, companyInfo }) => {
  const { subtotal, tax_amount, total_amount } = calculateInvoiceTotals(invoice);

  return (
    <div className="invoice-preview bg-white p-6 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div className="company-info">
          <div className="flex items-center mb-2">
            <div className="w-8 h-8 bg-blue-600 rounded mr-2"></div>
            <h1 className="text-xl font-bold text-blue-600">ServiceBook Pros</h1>
          </div>
          <div className="text-sm text-gray-600">
            <p>{companyInfo?.name}</p>
            <p>{companyInfo?.address}</p>
            <p>{companyInfo?.phone}</p>
            <p>{companyInfo?.email}</p>
          </div>
        </div>
        <div className="invoice-details text-right">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">INVOICE</h2>
          <div className="text-sm">
            <p><strong>Invoice #:</strong> {invoice.invoice_number || 'DRAFT'}</p>
            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> {new Date(invoice.due_date).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="bill-to mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Bill To:</h3>
        <div className="bg-gray-50 p-4 rounded">
          <p className="font-medium">{customer?.name}</p>
          {customer?.company && <p>{customer.company}</p>}
          <p>{customer?.billing_address?.street}</p>
          <p>{customer?.billing_address?.city}, {customer?.billing_address?.state} {customer?.billing_address?.zip}</p>
        </div>
      </div>

      {/* Line Items */}
      <div className="line-items mb-8">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-300">
              <th className="text-left py-2">#</th>
              <th className="text-left py-2">Description</th>
              <th className="text-center py-2">Qty</th>
              <th className="text-right py-2">Rate</th>
              <th className="text-right py-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {invoice.line_items.map((item, index) => (
              <tr key={index} className="border-b border-gray-200">
                <td className="py-2">{index + 1}</td>
                <td className="py-2">{item.description}</td>
                <td className="text-center py-2">{item.quantity}</td>
                <td className="text-right py-2">${item.unit_price.toFixed(2)}</td>
                <td className="text-right py-2">${(item.quantity * item.unit_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="totals mb-8">
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-1">
              <span>Subtotal:</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Tax ({invoice.tax_rate}%):</span>
              <span>${tax_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-t-2 border-gray-300 font-bold text-lg">
              <span>Total Due:</span>
              <span>${total_amount.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="payment-instructions">
        <h4 className="font-semibold mb-2">Payment Instructions:</h4>
        <p className="text-sm text-gray-600">{invoice.payment_instructions}</p>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="notes mt-4">
          <h4 className="font-semibold mb-2">Notes:</h4>
          <p className="text-sm text-gray-600">{invoice.notes}</p>
        </div>
      )}
    </div>
  );
};
```

### 3. Invoice Management Dashboard
```javascript
const InvoiceManagement = () => {
  const [invoices, setInvoices] = useState([]);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchInvoices = async () => {
    const params = new URLSearchParams({
      status: filter === 'all' ? '' : filter,
      limit: '20',
      sort: 'date_created'
    });

    const response = await fetch(`/api/invoices?${params}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const data = await response.json();
    setInvoices(data.data.invoices);
  };

  const handleStatusUpdate = async (invoiceId, newStatus) => {
    try {
      await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      fetchInvoices(); // Refresh list
    } catch (error) {
      console.error('Error updating invoice:', error);
    }
  };

  return (
    <div className="invoice-management">
      <div className="header flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Invoices</h2>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          + New Invoice
        </button>
      </div>

      <div className="filters mb-4">
        <div className="flex space-x-2">
          {['all', 'draft', 'sent', 'paid', 'overdue'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded ${
                filter === status 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="invoices-table">
        <InvoiceTable 
          invoices={invoices}
          onStatusUpdate={handleStatusUpdate}
        />
      </div>
    </div>
  );
};
```

## Integration Features

### 1. Work Order Integration
- Automatic invoice creation from completed work orders
- Service and material line items pre-populated
- Customer information synchronized

### 2. Payment Tracking
- Payment status updates
- Overdue invoice notifications
- Payment history tracking

### 3. Email Integration
- Automated invoice delivery
- Payment reminders
- Receipt confirmations

### 4. Reporting Integration
- Revenue analytics
- Payment performance metrics
- Customer payment history

This comprehensive specification ensures the Invoicing System provides professional invoice management with seamless integration into the CRM ecosystem.

