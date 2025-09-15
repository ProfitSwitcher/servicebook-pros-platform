# ServiceBook Pros - Invoice Management API Documentation

## Overview

The Invoice Management API provides comprehensive functionality for creating, managing, and tracking invoices within the ServiceBook Pros platform. This API supports multi-tenant architecture, ensuring complete data isolation between companies while providing professional invoicing capabilities for contractors.

## Base Information

- **Base URL:** `https://api.servicebookpros.com/api`
- **Authentication:** Bearer Token (JWT)
- **Content-Type:** `application/json`
- **API Version:** `v1`

## Authentication

All endpoints require authentication via JWT token in the Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Rate Limiting

- **Standard Operations:** 100 requests per minute
- **PDF Generation:** 20 requests per minute
- **Email Operations:** 10 requests per minute

## 1. Get All Invoices

Retrieve a paginated list of invoices for the authenticated user's company with advanced filtering and search capabilities.

### Endpoint
```http
GET /api/invoices
```

### Query Parameters

| Parameter | Type | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| `page` | integer | No | Page number (default: 1) | `1` |
| `limit` | integer | No | Items per page (default: 20, max: 100) | `20` |
| `status` | string | No | Filter by invoice status | `sent` |
| `customer_id` | integer | No | Filter by customer ID | `123` |
| `work_order_id` | integer | No | Filter by work order ID | `456` |
| `date_from` | string | No | Start date filter (ISO format) | `2025-01-01` |
| `date_to` | string | No | End date filter (ISO format) | `2025-12-31` |
| `search` | string | No | Search in invoice number, customer name | `INV-2025` |
| `sort_by` | string | No | Sort field | `date_issued` |
| `sort_order` | string | No | Sort direction (`asc` or `desc`) | `desc` |

### Status Values
- `draft` - Invoice is being created/edited
- `sent` - Invoice has been sent to customer
- `paid` - Invoice has been fully paid
- `overdue` - Invoice is past due date
- `cancelled` - Invoice has been cancelled

### Request Example

```bash
curl -X GET "https://api.servicebookpros.com/api/invoices?page=1&limit=10&status=sent&sort_by=date_issued&sort_order=desc" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Response Format

```typescript
interface InvoiceListResponse {
  success: boolean;
  data: {
    invoices: Invoice[];
    pagination: PaginationInfo;
    summary: InvoiceSummary;
  };
  message: string;
}

interface Invoice {
  id: number;
  company_id: number;
  customer_id: number;
  work_order_id?: number;
  invoice_number: string;
  date_issued: string;
  due_date: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  payment_terms: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  customer: CustomerSummary;
  work_order?: WorkOrderSummary;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

interface InvoiceSummary {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  overdueAmount: number;
  invoiceCount: number;
}
```

### Response Example

```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "id": 1,
        "company_id": 1,
        "customer_id": 5,
        "work_order_id": 12,
        "invoice_number": "INV-2025-000001",
        "date_issued": "2025-09-10",
        "due_date": "2025-10-10",
        "status": "sent",
        "subtotal": 1500.00,
        "tax_rate": 0.08,
        "tax_amount": 120.00,
        "total_amount": 1620.00,
        "amount_paid": 0.00,
        "amount_due": 1620.00,
        "payment_terms": "Net 30",
        "notes": "Electrical panel upgrade work",
        "created_at": "2025-09-10T10:30:00Z",
        "updated_at": "2025-09-10T10:30:00Z",
        "customer": {
          "id": 5,
          "name": "John Smith",
          "company": "ABC Corp",
          "email": "john@abccorp.com",
          "phone": "(555) 123-4567"
        },
        "work_order": {
          "id": 12,
          "number": "WO-2025-0012",
          "description": "Electrical Panel Upgrade - 200A"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3,
      "hasNext": true,
      "hasPrev": false
    },
    "summary": {
      "totalAmount": 45000.00,
      "paidAmount": 32000.00,
      "pendingAmount": 10000.00,
      "overdueAmount": 3000.00,
      "invoiceCount": 25
    }
  },
  "message": "Invoices retrieved successfully"
}
```

### Error Responses

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid query parameters",
    "details": {
      "field": "limit",
      "message": "Limit must be between 1 and 100"
    }
  },
  "timestamp": "2025-09-10T10:30:00Z"
}
```

## 2. Get Invoice by ID

Retrieve detailed information for a specific invoice including line items, payments, and activity history.

### Endpoint
```http
GET /api/invoices/{id}
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Invoice ID |

### Request Example

```bash
curl -X GET "https://api.servicebookpros.com/api/invoices/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

### Response Format

```typescript
interface InvoiceDetailResponse {
  success: boolean;
  data: {
    invoice: InvoiceDetail;
    calculations: InvoiceCalculations;
  };
  message: string;
}

interface InvoiceDetail extends Invoice {
  line_items: InvoiceLineItem[];
  payments: Payment[];
  activity_log: ActivityLog[];
}

interface InvoiceLineItem {
  id: number;
  invoice_id: number;
  service_id?: number;
  material_id?: number;
  line_number: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type: 'service' | 'material' | 'labor' | 'other';
  created_at: string;
  updated_at: string;
  service?: ServiceSummary;
  material?: MaterialSummary;
}

interface Payment {
  id: number;
  invoice_id: number;
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
  created_at: string;
  created_by: number;
}

interface InvoiceCalculations {
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  payment_percentage: number;
}
```

### Response Example

```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": 1,
      "company_id": 1,
      "customer_id": 5,
      "work_order_id": 12,
      "invoice_number": "INV-2025-000001",
      "date_issued": "2025-09-10",
      "due_date": "2025-10-10",
      "status": "sent",
      "subtotal": 1500.00,
      "tax_rate": 0.08,
      "tax_amount": 120.00,
      "total_amount": 1620.00,
      "amount_paid": 0.00,
      "amount_due": 1620.00,
      "payment_terms": "Net 30",
      "notes": "Electrical panel upgrade work",
      "created_at": "2025-09-10T10:30:00Z",
      "updated_at": "2025-09-10T10:30:00Z",
      "customer": {
        "id": 5,
        "name": "John Smith",
        "company": "ABC Corp",
        "email": "john@abccorp.com",
        "phone": "(555) 123-4567",
        "address": "123 Business Lane, Anytown, CA 91234"
      },
      "line_items": [
        {
          "id": 1,
          "invoice_id": 1,
          "service_id": 15,
          "line_number": 1,
          "description": "Electrical Panel Upgrade - 200A",
          "quantity": 1,
          "unit_price": 1200.00,
          "total_price": 1200.00,
          "item_type": "service",
          "created_at": "2025-09-10T10:30:00Z",
          "updated_at": "2025-09-10T10:30:00Z",
          "service": {
            "id": 15,
            "name": "Electrical Panel Upgrade",
            "code": "EPU-200A"
          }
        },
        {
          "id": 2,
          "invoice_id": 1,
          "material_id": 8,
          "line_number": 2,
          "description": "200A Electrical Panel",
          "quantity": 1,
          "unit_price": 300.00,
          "total_price": 300.00,
          "item_type": "material",
          "created_at": "2025-09-10T10:30:00Z",
          "updated_at": "2025-09-10T10:30:00Z",
          "material": {
            "id": 8,
            "name": "200A Electrical Panel",
            "sku": "EP-200A-SQ"
          }
        }
      ],
      "payments": [],
      "activity_log": [
        {
          "id": 1,
          "action": "created",
          "description": "Invoice created",
          "user_name": "John Doe",
          "timestamp": "2025-09-10T10:30:00Z"
        }
      ]
    },
    "calculations": {
      "subtotal": 1500.00,
      "tax_amount": 120.00,
      "total_amount": 1620.00,
      "amount_paid": 0.00,
      "amount_due": 1620.00,
      "payment_percentage": 0
    }
  },
  "message": "Invoice retrieved successfully"
}
```

## 3. Create Invoice

Create a new invoice with line items and automatic calculations.

### Endpoint
```http
POST /api/invoices
```

### Request Format

```typescript
interface CreateInvoiceRequest {
  customer_id: number;
  work_order_id?: number;
  due_date: string;          // ISO date format (YYYY-MM-DD)
  payment_terms?: string;    // Default: "Net 30"
  notes?: string;
  tax_rate?: number;         // Default: company tax rate
  line_items: LineItemRequest[];
}

interface LineItemRequest {
  service_id?: number;
  material_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  item_type: 'service' | 'material' | 'labor' | 'other';
}
```

### Request Example

```bash
curl -X POST "https://api.servicebookpros.com/api/invoices" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 5,
    "work_order_id": 12,
    "due_date": "2025-10-10",
    "payment_terms": "Net 30",
    "notes": "Electrical panel upgrade work",
    "tax_rate": 0.08,
    "line_items": [
      {
        "service_id": 15,
        "description": "Electrical Panel Upgrade - 200A",
        "quantity": 1,
        "unit_price": 1200.00,
        "item_type": "service"
      },
      {
        "material_id": 8,
        "description": "200A Electrical Panel",
        "quantity": 1,
        "unit_price": 300.00,
        "item_type": "material"
      }
    ]
  }'
```

### Response Format

```typescript
interface CreateInvoiceResponse {
  success: boolean;
  data: {
    invoice: Invoice;
    invoice_number: string;
  };
  message: string;
}
```

### Response Example

```json
{
  "success": true,
  "data": {
    "invoice": {
      "id": 1,
      "company_id": 1,
      "customer_id": 5,
      "work_order_id": 12,
      "invoice_number": "INV-2025-000001",
      "date_issued": "2025-09-10",
      "due_date": "2025-10-10",
      "status": "draft",
      "subtotal": 1500.00,
      "tax_rate": 0.08,
      "tax_amount": 120.00,
      "total_amount": 1620.00,
      "amount_paid": 0.00,
      "amount_due": 1620.00,
      "payment_terms": "Net 30",
      "notes": "Electrical panel upgrade work",
      "created_at": "2025-09-10T10:30:00Z",
      "updated_at": "2025-09-10T10:30:00Z"
    },
    "invoice_number": "INV-2025-000001"
  },
  "message": "Invoice created successfully"
}
```

### Validation Rules

- `customer_id`: Must exist and belong to the same company
- `work_order_id`: Must exist and belong to the same company (if provided)
- `due_date`: Must be a valid future date
- `tax_rate`: Must be between 0 and 1 (0% to 100%)
- `line_items`: Must contain at least one item
- `quantity`: Must be greater than 0
- `unit_price`: Must be greater than or equal to 0

## 4. Update Invoice

Update an existing invoice. Only draft invoices can be fully updated; sent invoices have limited update capabilities.

### Endpoint
```http
PATCH /api/invoices/{id}
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Invoice ID |

### Request Format

```typescript
interface UpdateInvoiceRequest {
  customer_id?: number;
  due_date?: string;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  payment_terms?: string;
  notes?: string;
  tax_rate?: number;
}
```

### Request Example

```bash
curl -X PATCH "https://api.servicebookpros.com/api/invoices/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "due_date": "2025-10-15",
    "payment_terms": "Net 15",
    "notes": "Updated payment terms for faster processing"
  }'
```

### Response Format

```typescript
interface UpdateInvoiceResponse {
  success: boolean;
  data: {
    invoice: Invoice;
  };
  message: string;
}
```

### Update Restrictions

| Invoice Status | Allowed Updates |
|----------------|-----------------|
| `draft` | All fields |
| `sent` | `due_date`, `payment_terms`, `notes`, `status` |
| `paid` | `notes` only |
| `overdue` | `due_date`, `payment_terms`, `notes`, `status` |
| `cancelled` | No updates allowed |

## 5. Delete Invoice

Delete an invoice. Only draft invoices can be deleted.

### Endpoint
```http
DELETE /api/invoices/{id}
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Invoice ID |

### Request Example

```bash
curl -X DELETE "https://api.servicebookpros.com/api/invoices/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Response Format

```typescript
interface DeleteInvoiceResponse {
  success: boolean;
  message: string;
}
```

### Response Example

```json
{
  "success": true,
  "message": "Invoice deleted successfully"
}
```

### Business Rules

- Only invoices with status `draft` can be deleted
- Invoices with payments cannot be deleted
- Deletion is permanent and cannot be undone
- All associated line items are also deleted

## 6. Send Invoice

Send an invoice via email and update status to 'sent'.

### Endpoint
```http
POST /api/invoices/{id}/send
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Invoice ID |

### Request Format

```typescript
interface SendInvoiceRequest {
  email_addresses: string[];
  subject?: string;
  message?: string;
  include_pdf: boolean;
  send_copy_to_self?: boolean;
}
```

### Request Example

```bash
curl -X POST "https://api.servicebookpros.com/api/invoices/1/send" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email_addresses": ["john@abccorp.com", "accounting@abccorp.com"],
    "subject": "Invoice INV-2025-000001 from Elite Electrical",
    "message": "Please find attached your invoice for the electrical panel upgrade work completed on September 10, 2025.",
    "include_pdf": true,
    "send_copy_to_self": true
  }'
```

### Response Format

```typescript
interface SendInvoiceResponse {
  success: boolean;
  data: {
    email_sent_to: string[];
    pdf_generated: boolean;
    invoice_status: string;
  };
  message: string;
}
```

### Response Example

```json
{
  "success": true,
  "data": {
    "email_sent_to": ["john@abccorp.com", "accounting@abccorp.com"],
    "pdf_generated": true,
    "invoice_status": "sent"
  },
  "message": "Invoice sent successfully"
}
```

## 7. Generate Invoice PDF

Generate and download invoice PDF.

### Endpoint
```http
GET /api/invoices/{id}/pdf
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Invoice ID |

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `template_id` | integer | No | Custom template ID |
| `download` | boolean | No | Force download (default: true) |

### Request Example

```bash
curl -X GET "https://api.servicebookpros.com/api/invoices/1/pdf?download=true" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o "invoice-INV-2025-000001.pdf"
```

### Response

- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="invoice-{number}.pdf"`
- **Body:** PDF binary data

## 8. Duplicate Invoice

Create a copy of an existing invoice as a draft.

### Endpoint
```http
POST /api/invoices/{id}/duplicate
```

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | integer | Yes | Invoice ID to duplicate |

### Request Format

```typescript
interface DuplicateInvoiceRequest {
  customer_id?: number;     // Use different customer
  due_date?: string;        // New due date
  notes?: string;           // Additional notes
}
```

### Request Example

```bash
curl -X POST "https://api.servicebookpros.com/api/invoices/1/duplicate" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "due_date": "2025-11-10",
    "notes": "Duplicate invoice for additional work"
  }'
```

### Response Format

```typescript
interface DuplicateInvoiceResponse {
  success: boolean;
  data: {
    invoice: Invoice;
    original_invoice_number: string;
  };
  message: string;
}
```

## Error Handling

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Invalid or missing authentication token |
| `FORBIDDEN` | 403 | User doesn't have permission to access resource |
| `NOT_FOUND` | 404 | Invoice not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `BUSINESS_RULE_VIOLATION` | 422 | Business logic constraint violated |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Unexpected server error |

### Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}
```

### Example Error Responses

#### Validation Error
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request data",
    "details": {
      "field": "customer_id",
      "message": "Customer ID is required"
    }
  },
  "timestamp": "2025-09-10T10:30:00Z"
}
```

#### Business Rule Violation
```json
{
  "success": false,
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Cannot delete invoice with payments",
    "details": {
      "invoice_id": 1,
      "payment_count": 2
    }
  },
  "timestamp": "2025-09-10T10:30:00Z"
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { ServiceBookProAPI } from '@servicebookpro/api-client';

const api = new ServiceBookProAPI({
  baseURL: 'https://api.servicebookpros.com/api',
  apiKey: 'your-jwt-token'
});

// Get all invoices
const invoices = await api.invoices.list({
  page: 1,
  limit: 10,
  status: 'sent'
});

// Create an invoice
const newInvoice = await api.invoices.create({
  customer_id: 5,
  due_date: '2025-10-10',
  line_items: [
    {
      description: 'Electrical Panel Upgrade',
      quantity: 1,
      unit_price: 1200.00,
      item_type: 'service'
    }
  ]
});

// Send invoice
await api.invoices.send(newInvoice.id, {
  email_addresses: ['customer@example.com'],
  include_pdf: true
});

// Get invoice details
const invoice = await api.invoices.get(newInvoice.id);
```

### Python

```python
import requests

class ServiceBookProAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }
    
    def get_invoices(self, **params):
        response = requests.get(
            f'{self.base_url}/invoices',
            headers=self.headers,
            params=params
        )
        return response.json()
    
    def create_invoice(self, data):
        response = requests.post(
            f'{self.base_url}/invoices',
            headers=self.headers,
            json=data
        )
        return response.json()

# Usage
api = ServiceBookProAPI('https://api.servicebookpros.com/api', 'your-jwt-token')

# Get invoices
invoices = api.get_invoices(status='sent', limit=10)

# Create invoice
new_invoice = api.create_invoice({
    'customer_id': 5,
    'due_date': '2025-10-10',
    'line_items': [
        {
            'description': 'Electrical Panel Upgrade',
            'quantity': 1,
            'unit_price': 1200.00,
            'item_type': 'service'
        }
    ]
})
```

## Testing

### Postman Collection

A complete Postman collection is available for testing all Invoice Management endpoints:

```json
{
  "info": {
    "name": "ServiceBook Pros - Invoice Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{jwt_token}}",
        "type": "string"
      }
    ]
  },
  "variable": [
    {
      "key": "base_url",
      "value": "https://api.servicebookpros.com/api"
    },
    {
      "key": "jwt_token",
      "value": "your-jwt-token-here"
    }
  ]
}
```

### Test Data

Sample test data for creating invoices:

```json
{
  "test_customer": {
    "id": 1,
    "name": "Test Customer",
    "email": "test@example.com"
  },
  "test_invoice": {
    "customer_id": 1,
    "due_date": "2025-10-10",
    "payment_terms": "Net 30",
    "line_items": [
      {
        "description": "Test Service",
        "quantity": 1,
        "unit_price": 100.00,
        "item_type": "service"
      }
    ]
  }
}
```

## Support

For API support and questions:

- **Documentation:** [https://docs.servicebookpros.com](https://docs.servicebookpros.com)
- **Support Email:** api-support@servicebookpros.com
- **Developer Portal:** [https://developers.servicebookpros.com](https://developers.servicebookpros.com)

## Changelog

### Version 1.0.0 (2025-09-10)
- Initial release of Invoice Management API
- Support for CRUD operations on invoices
- PDF generation and email delivery
- Multi-tenant security implementation
- Comprehensive filtering and pagination

