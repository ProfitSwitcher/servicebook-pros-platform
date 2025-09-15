# ServiceBook Pros - Invoicing System API Endpoints

## Overview

This document provides a comprehensive specification of all API endpoints for the Invoicing System in the ServiceBook Pros platform. All endpoints require authentication and implement multi-tenant data isolation.

## Authentication

All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Base URL
```
https://api.servicebookpros.com/api
```

## 1. Invoice Management Endpoints

### 1.1 Get All Invoices

**Endpoint:** `GET /invoices`

**Description:** Retrieve a paginated list of invoices for the authenticated user's company.

**Query Parameters:**
```typescript
interface InvoiceListParams {
  page?: number;           // Default: 1
  limit?: number;          // Default: 20, Max: 100
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  customer_id?: number;
  work_order_id?: number;
  date_from?: string;      // ISO date format (YYYY-MM-DD)
  date_to?: string;        // ISO date format (YYYY-MM-DD)
  search?: string;         // Search in invoice number, customer name, or description
  sort_by?: 'date_issued' | 'due_date' | 'total_amount' | 'customer_name';
  sort_order?: 'asc' | 'desc';
}
```

**Response:**
```typescript
interface InvoiceListResponse {
  success: boolean;
  data: {
    invoices: Invoice[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    summary: {
      totalAmount: number;
      paidAmount: number;
      pendingAmount: number;
      overdueAmount: number;
      invoiceCount: number;
    };
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
  customer: {
    id: number;
    name: string;
    company: string;
    email: string;
    phone: string;
  };
  work_order?: {
    id: number;
    number: string;
    description: string;
  };
}
```

**Example Request:**
```bash
GET /api/invoices?page=1&limit=10&status=sent&sort_by=date_issued&sort_order=desc
```

**Example Response:**
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

### 1.2 Get Invoice by ID

**Endpoint:** `GET /invoices/:id`

**Description:** Retrieve detailed information for a specific invoice.

**Path Parameters:**
- `id` (number): Invoice ID

**Response:**
```typescript
interface InvoiceDetailResponse {
  success: boolean;
  data: {
    invoice: Invoice & {
      line_items: InvoiceLineItem[];
      payments: Payment[];
      activity_log: ActivityLog[];
    };
    calculations: {
      subtotal: number;
      tax_amount: number;
      total_amount: number;
      amount_paid: number;
      amount_due: number;
      payment_percentage: number;
    };
  };
  message: string;
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
  service?: {
    id: number;
    name: string;
    code: string;
  };
  material?: {
    id: number;
    name: string;
    sku: string;
  };
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

interface ActivityLog {
  id: number;
  action: string;
  description: string;
  user_name: string;
  timestamp: string;
}
```

### 1.3 Create Invoice

**Endpoint:** `POST /invoices`

**Description:** Create a new invoice.

**Request Body:**
```typescript
interface CreateInvoiceRequest {
  customer_id: number;
  work_order_id?: number;
  due_date: string;          // ISO date format
  payment_terms?: string;    // Default: "Net 30"
  notes?: string;
  tax_rate?: number;         // Default: company tax rate
  line_items: {
    service_id?: number;
    material_id?: number;
    description: string;
    quantity: number;
    unit_price: number;
    item_type: 'service' | 'material' | 'labor' | 'other';
  }[];
}
```

**Response:**
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

**Example Request:**
```json
{
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
}
```

### 1.4 Update Invoice

**Endpoint:** `PATCH /invoices/:id`

**Description:** Update an existing invoice (only draft invoices can be fully updated).

**Path Parameters:**
- `id` (number): Invoice ID

**Request Body:**
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

**Response:**
```typescript
interface UpdateInvoiceResponse {
  success: boolean;
  data: {
    invoice: Invoice;
  };
  message: string;
}
```

### 1.5 Delete Invoice

**Endpoint:** `DELETE /invoices/:id`

**Description:** Delete an invoice (only draft invoices can be deleted).

**Path Parameters:**
- `id` (number): Invoice ID

**Response:**
```typescript
interface DeleteInvoiceResponse {
  success: boolean;
  message: string;
}
```

### 1.6 Send Invoice

**Endpoint:** `POST /invoices/:id/send`

**Description:** Send an invoice via email and update status to 'sent'.

**Path Parameters:**
- `id` (number): Invoice ID

**Request Body:**
```typescript
interface SendInvoiceRequest {
  email_addresses: string[];
  subject?: string;
  message?: string;
  include_pdf: boolean;
  send_copy_to_self?: boolean;
}
```

**Response:**
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

### 1.7 Generate Invoice PDF

**Endpoint:** `GET /invoices/:id/pdf`

**Description:** Generate and download invoice PDF.

**Path Parameters:**
- `id` (number): Invoice ID

**Query Parameters:**
```typescript
interface PDFParams {
  template_id?: number;     // Custom template ID
  download?: boolean;       // Default: true
}
```

**Response:**
- **Content-Type:** `application/pdf`
- **Content-Disposition:** `attachment; filename="invoice-{number}.pdf"`
- **Body:** PDF binary data

### 1.8 Duplicate Invoice

**Endpoint:** `POST /invoices/:id/duplicate`

**Description:** Create a copy of an existing invoice as a draft.

**Path Parameters:**
- `id` (number): Invoice ID to duplicate

**Request Body:**
```typescript
interface DuplicateInvoiceRequest {
  customer_id?: number;     // Use different customer
  due_date?: string;        // New due date
  notes?: string;           // Additional notes
}
```

**Response:**
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

## 2. Invoice Line Items Endpoints

### 2.1 Add Line Item

**Endpoint:** `POST /invoices/:invoiceId/line-items`

**Description:** Add a new line item to an invoice.

**Path Parameters:**
- `invoiceId` (number): Invoice ID

**Request Body:**
```typescript
interface AddLineItemRequest {
  service_id?: number;
  material_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  item_type: 'service' | 'material' | 'labor' | 'other';
  line_number?: number;     // Auto-assigned if not provided
}
```

**Response:**
```typescript
interface AddLineItemResponse {
  success: boolean;
  data: {
    line_item: InvoiceLineItem;
    updated_totals: {
      subtotal: number;
      tax_amount: number;
      total_amount: number;
    };
  };
  message: string;
}
```

### 2.2 Update Line Item

**Endpoint:** `PATCH /invoices/:invoiceId/line-items/:itemId`

**Description:** Update an existing line item.

**Path Parameters:**
- `invoiceId` (number): Invoice ID
- `itemId` (number): Line item ID

**Request Body:**
```typescript
interface UpdateLineItemRequest {
  description?: string;
  quantity?: number;
  unit_price?: number;
  line_number?: number;
}
```

**Response:**
```typescript
interface UpdateLineItemResponse {
  success: boolean;
  data: {
    line_item: InvoiceLineItem;
    updated_totals: {
      subtotal: number;
      tax_amount: number;
      total_amount: number;
    };
  };
  message: string;
}
```

### 2.3 Delete Line Item

**Endpoint:** `DELETE /invoices/:invoiceId/line-items/:itemId`

**Description:** Remove a line item from an invoice.

**Path Parameters:**
- `invoiceId` (number): Invoice ID
- `itemId` (number): Line item ID

**Response:**
```typescript
interface DeleteLineItemResponse {
  success: boolean;
  data: {
    updated_totals: {
      subtotal: number;
      tax_amount: number;
      total_amount: number;
    };
  };
  message: string;
}
```

### 2.4 Reorder Line Items

**Endpoint:** `PATCH /invoices/:invoiceId/line-items/reorder`

**Description:** Reorder line items within an invoice.

**Path Parameters:**
- `invoiceId` (number): Invoice ID

**Request Body:**
```typescript
interface ReorderLineItemsRequest {
  line_item_orders: {
    id: number;
    line_number: number;
  }[];
}
```

**Response:**
```typescript
interface ReorderLineItemsResponse {
  success: boolean;
  data: {
    line_items: InvoiceLineItem[];
  };
  message: string;
}
```

## 3. Payment Management Endpoints

### 3.1 Record Payment

**Endpoint:** `POST /invoices/:id/payments`

**Description:** Record a payment against an invoice.

**Path Parameters:**
- `id` (number): Invoice ID

**Request Body:**
```typescript
interface RecordPaymentRequest {
  amount: number;
  payment_date: string;      // ISO date format
  payment_method: string;    // 'cash', 'check', 'credit_card', 'bank_transfer', 'online'
  reference_number?: string;
  notes?: string;
}
```

**Response:**
```typescript
interface RecordPaymentResponse {
  success: boolean;
  data: {
    payment: Payment;
    invoice_status: 'paid' | 'partial' | 'pending';
    remaining_balance: number;
    payment_percentage: number;
  };
  message: string;
}
```

### 3.2 Get Payment History

**Endpoint:** `GET /invoices/:id/payments`

**Description:** Get all payments for a specific invoice.

**Path Parameters:**
- `id` (number): Invoice ID

**Response:**
```typescript
interface PaymentHistoryResponse {
  success: boolean;
  data: {
    payments: Payment[];
    summary: {
      total_paid: number;
      remaining_balance: number;
      payment_count: number;
      last_payment_date?: string;
    };
  };
  message: string;
}
```

### 3.3 Update Payment

**Endpoint:** `PATCH /invoices/:invoiceId/payments/:paymentId`

**Description:** Update a payment record.

**Path Parameters:**
- `invoiceId` (number): Invoice ID
- `paymentId` (number): Payment ID

**Request Body:**
```typescript
interface UpdatePaymentRequest {
  amount?: number;
  payment_date?: string;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
}
```

### 3.4 Delete Payment

**Endpoint:** `DELETE /invoices/:invoiceId/payments/:paymentId`

**Description:** Delete a payment record.

**Path Parameters:**
- `invoiceId` (number): Invoice ID
- `paymentId` (number): Payment ID

**Response:**
```typescript
interface DeletePaymentResponse {
  success: boolean;
  data: {
    updated_balance: number;
    invoice_status: string;
  };
  message: string;
}
```

## 4. Integration Endpoints

### 4.1 Convert Work Order to Invoice

**Endpoint:** `POST /work-orders/:id/convert-to-invoice`

**Description:** Convert a completed work order into an invoice.

**Path Parameters:**
- `id` (number): Work Order ID

**Request Body:**
```typescript
interface ConvertWorkOrderRequest {
  due_date: string;
  payment_terms?: string;
  include_materials: boolean;
  include_labor: boolean;
  additional_notes?: string;
  tax_rate?: number;
  markup_percentage?: number;
}
```

**Response:**
```typescript
interface ConvertWorkOrderResponse {
  success: boolean;
  data: {
    invoice: Invoice;
    line_items_created: number;
    total_amount: number;
    work_order_number: string;
  };
  message: string;
}
```

### 4.2 Get Customer Invoices

**Endpoint:** `GET /customers/:id/invoices`

**Description:** Get all invoices for a specific customer.

**Path Parameters:**
- `id` (number): Customer ID

**Query Parameters:**
```typescript
interface CustomerInvoicesParams {
  status?: string;
  date_from?: string;
  date_to?: string;
  include_payments?: boolean;
}
```

**Response:**
```typescript
interface CustomerInvoicesResponse {
  success: boolean;
  data: {
    invoices: Invoice[];
    summary: {
      total_invoiced: number;
      total_paid: number;
      outstanding_balance: number;
      average_payment_days: number;
      invoice_count: number;
    };
  };
  message: string;
}
```

### 4.3 Get Service Pricing

**Endpoint:** `GET /services/:id/pricing`

**Description:** Get current pricing for a service including company markups.

**Path Parameters:**
- `id` (number): Service ID

**Response:**
```typescript
interface ServicePricingResponse {
  success: boolean;
  data: {
    service: {
      id: number;
      name: string;
      code: string;
      description: string;
    };
    pricing: {
      base_price: number;
      company_markup_percentage: number;
      final_price: number;
      labor_hours: number;
      materials_included: boolean;
    };
  };
  message: string;
}
```

### 4.4 Get Material Pricing

**Endpoint:** `GET /materials/:id/pricing`

**Description:** Get current pricing for a material including company markups.

**Path Parameters:**
- `id` (number): Material ID

**Response:**
```typescript
interface MaterialPricingResponse {
  success: boolean;
  data: {
    material: {
      id: number;
      name: string;
      sku: string;
      description: string;
    };
    pricing: {
      base_cost: number;
      company_markup_percentage: number;
      final_price: number;
      unit_of_measure: string;
      availability: boolean;
    };
  };
  message: string;
}
```

## 5. Analytics and Reporting Endpoints

### 5.1 Invoice Analytics

**Endpoint:** `GET /invoices/analytics`

**Description:** Get comprehensive invoice analytics for the company.

**Query Parameters:**
```typescript
interface InvoiceAnalyticsParams {
  period: 'week' | 'month' | 'quarter' | 'year';
  start_date?: string;
  end_date?: string;
  group_by?: 'day' | 'week' | 'month';
}
```

**Response:**
```typescript
interface InvoiceAnalyticsResponse {
  success: boolean;
  data: {
    revenue_analytics: {
      total_revenue: number;
      revenue_by_period: {
        period: string;
        revenue: number;
        invoice_count: number;
      }[];
      revenue_by_service: {
        service_name: string;
        revenue: number;
        percentage: number;
      }[];
      average_invoice_amount: number;
      growth_rate: number;
    };
    payment_analytics: {
      average_payment_days: number;
      payment_methods: {
        method: string;
        count: number;
        percentage: number;
      }[];
      overdue_analysis: {
        overdue_amount: number;
        overdue_count: number;
        average_overdue_days: number;
      };
    };
    customer_analytics: {
      top_customers: {
        customer_name: string;
        total_invoiced: number;
        invoice_count: number;
      }[];
      new_customers: number;
      repeat_customers: number;
    };
  };
  message: string;
}
```

### 5.2 Revenue Report

**Endpoint:** `GET /invoices/revenue-report`

**Description:** Generate detailed revenue report.

**Query Parameters:**
```typescript
interface RevenueReportParams {
  start_date: string;
  end_date: string;
  format?: 'json' | 'csv' | 'pdf';
  include_details?: boolean;
}
```

**Response:**
```typescript
interface RevenueReportResponse {
  success: boolean;
  data: {
    report_period: {
      start_date: string;
      end_date: string;
    };
    summary: {
      total_revenue: number;
      total_invoices: number;
      average_invoice_amount: number;
      paid_invoices: number;
      pending_invoices: number;
      overdue_invoices: number;
    };
    monthly_breakdown: {
      month: string;
      revenue: number;
      invoice_count: number;
      growth_percentage: number;
    }[];
    service_breakdown: {
      service_category: string;
      revenue: number;
      percentage: number;
    }[];
  };
  message: string;
}
```

### 5.3 Outstanding Invoices Report

**Endpoint:** `GET /invoices/outstanding-report`

**Description:** Get report of all outstanding invoices.

**Query Parameters:**
```typescript
interface OutstandingReportParams {
  aging_buckets?: boolean;  // Group by aging periods
  customer_id?: number;
  format?: 'json' | 'csv' | 'pdf';
}
```

**Response:**
```typescript
interface OutstandingReportResponse {
  success: boolean;
  data: {
    summary: {
      total_outstanding: number;
      invoice_count: number;
      average_days_outstanding: number;
    };
    aging_analysis: {
      current: { amount: number; count: number; };      // 0-30 days
      thirty_days: { amount: number; count: number; };  // 31-60 days
      sixty_days: { amount: number; count: number; };   // 61-90 days
      ninety_plus: { amount: number; count: number; };  // 90+ days
    };
    outstanding_invoices: {
      invoice_number: string;
      customer_name: string;
      amount_due: number;
      days_outstanding: number;
      due_date: string;
    }[];
  };
  message: string;
}
```

## 6. Template Management Endpoints

### 6.1 Get Invoice Templates

**Endpoint:** `GET /invoice-templates`

**Description:** Get all invoice templates for the company.

**Response:**
```typescript
interface InvoiceTemplatesResponse {
  success: boolean;
  data: {
    templates: InvoiceTemplate[];
    default_template_id: number;
  };
  message: string;
}

interface InvoiceTemplate {
  id: number;
  company_id: number;
  name: string;
  is_default: boolean;
  header_logo_url?: string;
  header_text?: string;
  footer_text?: string;
  terms_conditions?: string;
  color_scheme: {
    primary_color: string;
    secondary_color: string;
    text_color: string;
  };
  created_at: string;
  updated_at: string;
}
```

### 6.2 Create Invoice Template

**Endpoint:** `POST /invoice-templates`

**Description:** Create a new invoice template.

**Request Body:**
```typescript
interface CreateTemplateRequest {
  name: string;
  is_default?: boolean;
  header_logo_url?: string;
  header_text?: string;
  footer_text?: string;
  terms_conditions?: string;
  color_scheme?: {
    primary_color: string;
    secondary_color: string;
    text_color: string;
  };
}
```

### 6.3 Update Invoice Template

**Endpoint:** `PATCH /invoice-templates/:id`

**Description:** Update an existing invoice template.

**Path Parameters:**
- `id` (number): Template ID

**Request Body:**
```typescript
interface UpdateTemplateRequest {
  name?: string;
  is_default?: boolean;
  header_logo_url?: string;
  header_text?: string;
  footer_text?: string;
  terms_conditions?: string;
  color_scheme?: {
    primary_color: string;
    secondary_color: string;
    text_color: string;
  };
}
```

## 7. Error Responses

All endpoints return consistent error responses:

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

### Common Error Codes:

- `UNAUTHORIZED` (401): Invalid or missing authentication token
- `FORBIDDEN` (403): User doesn't have permission to access resource
- `NOT_FOUND` (404): Resource not found
- `VALIDATION_ERROR` (400): Request validation failed
- `BUSINESS_RULE_VIOLATION` (422): Business logic constraint violated
- `INTERNAL_SERVER_ERROR` (500): Unexpected server error

### Example Error Response:
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

## 8. Rate Limiting

All API endpoints are subject to rate limiting:

- **Standard endpoints:** 100 requests per minute per user
- **PDF generation:** 20 requests per minute per user
- **Email sending:** 10 requests per minute per user
- **Analytics endpoints:** 50 requests per minute per user

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1694354400
```

## 9. Webhooks

The system supports webhooks for real-time notifications:

### 9.1 Invoice Status Changed
```typescript
interface InvoiceStatusWebhook {
  event: 'invoice.status_changed';
  data: {
    invoice_id: number;
    invoice_number: string;
    old_status: string;
    new_status: string;
    customer_id: number;
    total_amount: number;
  };
  timestamp: string;
}
```

### 9.2 Payment Received
```typescript
interface PaymentReceivedWebhook {
  event: 'payment.received';
  data: {
    payment_id: number;
    invoice_id: number;
    invoice_number: string;
    amount: number;
    payment_method: string;
    customer_id: number;
  };
  timestamp: string;
}
```

### 9.3 Invoice Overdue
```typescript
interface InvoiceOverdueWebhook {
  event: 'invoice.overdue';
  data: {
    invoice_id: number;
    invoice_number: string;
    customer_id: number;
    days_overdue: number;
    amount_due: number;
  };
  timestamp: string;
}
```

## 10. SDK Examples

### JavaScript/TypeScript SDK Usage:

```typescript
import { ServiceBookProAPI } from '@servicebookpro/api-client';

const api = new ServiceBookProAPI({
  baseURL: 'https://api.servicebookpros.com/api',
  apiKey: 'your-api-key'
});

// Create an invoice
const invoice = await api.invoices.create({
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

// Send invoice via email
await api.invoices.send(invoice.id, {
  email_addresses: ['customer@example.com'],
  include_pdf: true
});

// Record payment
await api.invoices.recordPayment(invoice.id, {
  amount: 1200.00,
  payment_method: 'check',
  payment_date: '2025-09-15'
});
```

This comprehensive API specification provides all the endpoints needed to implement a full-featured invoicing system with professional capabilities, seamless integration, and robust business logic.

