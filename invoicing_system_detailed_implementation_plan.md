# ServiceBook Pros - Detailed Invoicing System Implementation Plan

## Executive Summary

This document provides a comprehensive, step-by-step implementation plan for the Invoicing System in the ServiceBook Pros platform. The system will feature a professional split-screen interface, real-time calculations, PDF generation, email delivery, and seamless integration with the existing CRM and scheduling systems.

## 1. Database Schema Implementation

### 1.1 Core Invoice Tables

#### Invoices Table
```sql
CREATE TABLE invoices (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  customer_id INTEGER NOT NULL REFERENCES customers(id),
  work_order_id INTEGER REFERENCES work_orders(id),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  date_issued DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'paid', 'overdue', 'cancelled')),
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.08,
  tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  payment_terms VARCHAR(50) DEFAULT 'Net 30',
  notes TEXT,
  terms_conditions TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id)
);

CREATE INDEX idx_invoices_company_id ON invoices(company_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_date_issued ON invoices(date_issued);
```

#### Invoice Line Items Table
```sql
CREATE TABLE invoice_line_items (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  service_id INTEGER REFERENCES services(id),
  material_id INTEGER REFERENCES materials(id),
  line_number INTEGER NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10,3) NOT NULL DEFAULT 1.000,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  item_type VARCHAR(20) NOT NULL CHECK (item_type IN ('service', 'material', 'labor', 'other')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX idx_invoice_line_items_service_id ON invoice_line_items(service_id);
```

#### Payments Table
```sql
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  invoice_id INTEGER NOT NULL REFERENCES invoices(id),
  amount DECIMAL(10,2) NOT NULL,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method VARCHAR(50) NOT NULL,
  reference_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id)
);

CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_payment_date ON payments(payment_date);
```

#### Invoice Templates Table
```sql
CREATE TABLE invoice_templates (
  id SERIAL PRIMARY KEY,
  company_id INTEGER NOT NULL REFERENCES companies(id),
  name VARCHAR(100) NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  header_logo_url VARCHAR(500),
  header_text TEXT,
  footer_text TEXT,
  terms_conditions TEXT,
  color_scheme JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 1.2 Database Triggers and Functions

#### Auto-generate Invoice Numbers
```sql
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invoice_number IS NULL THEN
    NEW.invoice_number := 'INV-' || TO_CHAR(CURRENT_DATE, 'YYYY') || '-' || 
                         LPAD(NEXTVAL('invoice_number_seq_' || NEW.company_id::text), 6, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION generate_invoice_number();
```

#### Auto-calculate Totals
```sql
CREATE OR REPLACE FUNCTION calculate_invoice_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE invoices 
  SET 
    subtotal = (
      SELECT COALESCE(SUM(total_price), 0) 
      FROM invoice_line_items 
      WHERE invoice_id = NEW.invoice_id
    ),
    tax_amount = subtotal * tax_rate,
    total_amount = subtotal + tax_amount,
    updated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_invoice_totals
  AFTER INSERT OR UPDATE OR DELETE ON invoice_line_items
  FOR EACH ROW
  EXECUTE FUNCTION calculate_invoice_totals();
```

## 2. Backend API Implementation

### 2.1 Invoice Management Endpoints

#### GET /api/invoices
```typescript
interface InvoiceListParams {
  page?: number;
  limit?: number;
  status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  customer_id?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
}

interface InvoiceListResponse {
  invoices: Invoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalAmount: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
  };
}
```

#### POST /api/invoices
```typescript
interface CreateInvoiceRequest {
  customer_id: number;
  work_order_id?: number;
  due_date: string;
  payment_terms?: string;
  notes?: string;
  line_items: {
    service_id?: number;
    material_id?: number;
    description: string;
    quantity: number;
    unit_price: number;
    item_type: 'service' | 'material' | 'labor' | 'other';
  }[];
}

interface CreateInvoiceResponse {
  invoice: Invoice;
  success: boolean;
  message: string;
}
```

#### GET /api/invoices/:id
```typescript
interface InvoiceDetailResponse {
  invoice: Invoice & {
    customer: Customer;
    work_order?: WorkOrder;
    line_items: InvoiceLineItem[];
    payments: Payment[];
  };
  calculations: {
    subtotal: number;
    tax_amount: number;
    total_amount: number;
    amount_paid: number;
    amount_due: number;
  };
}
```

#### PATCH /api/invoices/:id
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

#### POST /api/invoices/:id/send
```typescript
interface SendInvoiceRequest {
  email_addresses: string[];
  subject?: string;
  message?: string;
  include_pdf: boolean;
}

interface SendInvoiceResponse {
  success: boolean;
  message: string;
  email_sent_to: string[];
  pdf_generated: boolean;
}
```

#### GET /api/invoices/:id/pdf
```typescript
// Returns PDF file as binary stream
// Headers: Content-Type: application/pdf
//          Content-Disposition: attachment; filename="invoice-{number}.pdf"
```

### 2.2 Line Items Management

#### POST /api/invoices/:id/line-items
```typescript
interface AddLineItemRequest {
  service_id?: number;
  material_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  item_type: 'service' | 'material' | 'labor' | 'other';
}
```

#### PATCH /api/invoices/:invoiceId/line-items/:itemId
```typescript
interface UpdateLineItemRequest {
  description?: string;
  quantity?: number;
  unit_price?: number;
}
```

#### DELETE /api/invoices/:invoiceId/line-items/:itemId
```typescript
interface DeleteLineItemResponse {
  success: boolean;
  message: string;
  updated_totals: {
    subtotal: number;
    tax_amount: number;
    total_amount: number;
  };
}
```

### 2.3 Payment Tracking

#### POST /api/invoices/:id/payments
```typescript
interface RecordPaymentRequest {
  amount: number;
  payment_date: string;
  payment_method: string;
  reference_number?: string;
  notes?: string;
}

interface RecordPaymentResponse {
  payment: Payment;
  invoice_status: 'paid' | 'partial' | 'pending';
  remaining_balance: number;
}
```

#### GET /api/invoices/:id/payments
```typescript
interface PaymentHistoryResponse {
  payments: Payment[];
  summary: {
    total_paid: number;
    remaining_balance: number;
    payment_count: number;
  };
}
```

### 2.4 Integration Endpoints

#### POST /api/work-orders/:id/convert-to-invoice
```typescript
interface ConvertWorkOrderRequest {
  due_date: string;
  payment_terms?: string;
  include_materials: boolean;
  include_labor: boolean;
  additional_notes?: string;
}

interface ConvertWorkOrderResponse {
  invoice: Invoice;
  line_items_created: number;
  total_amount: number;
}
```

#### GET /api/customers/:id/invoices
```typescript
interface CustomerInvoicesResponse {
  invoices: Invoice[];
  summary: {
    total_invoiced: number;
    total_paid: number;
    outstanding_balance: number;
    average_payment_days: number;
  };
}
```

## 3. Frontend UI Components

### 3.1 Invoice Creation Interface (Split-Screen)

#### Component Structure
```typescript
// InvoiceCreation.tsx
interface InvoiceCreationProps {
  workOrderId?: number;
  customerId?: number;
}

interface InvoiceFormData {
  customer_id: number;
  work_order_id?: number;
  due_date: string;
  payment_terms: string;
  notes: string;
  line_items: LineItem[];
}

interface LineItem {
  id?: number;
  service_id?: number;
  material_id?: number;
  description: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  item_type: 'service' | 'material' | 'labor' | 'other';
}
```

#### Left Panel Components

##### Customer Information Section
```typescript
// CustomerInfoSection.tsx
interface CustomerInfoProps {
  selectedCustomerId: number;
  onCustomerChange: (customerId: number) => void;
  customers: Customer[];
}

// Features:
// - Searchable dropdown with customer list
// - Auto-populate company, phone, email fields
// - Quick "Add New Customer" button
// - Display customer service history
```

##### Work Order Details Section
```typescript
// WorkOrderDetailsSection.tsx
interface WorkOrderDetailsProps {
  workOrderId?: number;
  dateIssued: string;
  dueDate: string;
  projectDescription: string;
  paymentTerms: string;
  onFieldChange: (field: string, value: string) => void;
}

// Features:
// - Date picker for issue and due dates
// - Payment terms dropdown (Net 15, Net 30, Net 45, Due on Receipt)
// - Project description text area
// - Work order reference display
```

##### Line Items Section
```typescript
// LineItemsSection.tsx
interface LineItemsProps {
  lineItems: LineItem[];
  onAddItem: () => void;
  onUpdateItem: (index: number, item: LineItem) => void;
  onDeleteItem: (index: number) => void;
  services: Service[];
  materials: Material[];
}

// Features:
// - Dynamic table with add/remove rows
// - Service/material lookup with search
// - Real-time price calculation
// - Quantity and rate input validation
// - Drag-and-drop reordering
```

##### Invoice Totals Section
```typescript
// InvoiceTotalsSection.tsx
interface InvoiceTotalsProps {
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  onTaxRateChange: (rate: number) => void;
}

// Features:
// - Real-time calculation display
// - Editable tax rate with company default
// - Currency formatting
// - Discount application (future feature)
```

#### Right Panel Components

##### Invoice Preview
```typescript
// InvoicePreview.tsx
interface InvoicePreviewProps {
  invoiceData: InvoiceFormData;
  customer: Customer;
  company: Company;
  template: InvoiceTemplate;
}

// Features:
// - Real-time preview updates
// - Professional invoice layout
// - Company branding and logo
// - Print-ready formatting
// - Mobile responsive design
```

##### Action Buttons Panel
```typescript
// InvoiceActionsPanel.tsx
interface InvoiceActionsProps {
  invoiceStatus: 'draft' | 'sent' | 'paid';
  onSaveDraft: () => void;
  onSendInvoice: () => void;
  onPrintInvoice: () => void;
  onEmailInvoice: () => void;
  isLoading: boolean;
}

// Features:
// - Status-based button availability
// - Loading states and confirmations
// - Email composition modal
// - Print preview functionality
```

### 3.2 Invoice List/Management Page

#### Invoice Table Component
```typescript
// InvoiceTable.tsx
interface InvoiceTableProps {
  invoices: Invoice[];
  onStatusChange: (id: number, status: string) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
  onSend: (id: number) => void;
}

// Features:
// - Sortable columns (date, amount, status, customer)
// - Status badges with color coding
// - Quick action buttons
// - Bulk selection and operations
// - Export to CSV/PDF functionality
```

#### Filters and Search
```typescript
// InvoiceFilters.tsx
interface InvoiceFiltersProps {
  filters: InvoiceFilters;
  onFilterChange: (filters: InvoiceFilters) => void;
  customers: Customer[];
}

// Features:
// - Status filter dropdown
// - Date range picker
// - Customer filter
// - Amount range filter
// - Search by invoice number or description
```

### 3.3 Invoice Detail View

#### Invoice Detail Component
```typescript
// InvoiceDetail.tsx
interface InvoiceDetailProps {
  invoiceId: number;
}

// Features:
// - Full invoice display with professional formatting
// - Payment history timeline
// - Edit mode toggle
// - Activity log
// - Related work orders and quotes
```

#### Payment Recording
```typescript
// PaymentRecording.tsx
interface PaymentRecordingProps {
  invoiceId: number;
  remainingBalance: number;
  onPaymentRecorded: (payment: Payment) => void;
}

// Features:
// - Payment amount input with validation
// - Payment method selection
// - Reference number tracking
// - Partial payment handling
// - Receipt generation
```

## 4. Integration Features

### 4.1 Work Order Integration

#### Automatic Conversion Flow
```typescript
// WorkOrderToInvoice.ts
class WorkOrderToInvoiceConverter {
  async convertWorkOrder(workOrderId: number, options: ConversionOptions): Promise<Invoice> {
    // 1. Fetch work order details
    const workOrder = await this.getWorkOrder(workOrderId);
    
    // 2. Extract services and materials
    const lineItems = await this.extractLineItems(workOrder, options);
    
    // 3. Apply company pricing and markups
    const pricedItems = await this.applyPricing(lineItems);
    
    // 4. Create invoice with pre-populated data
    const invoice = await this.createInvoice({
      customer_id: workOrder.customer_id,
      work_order_id: workOrderId,
      line_items: pricedItems,
      due_date: this.calculateDueDate(workOrder.completion_date),
      notes: `Invoice for work order #${workOrder.number}`
    });
    
    return invoice;
  }
}
```

### 4.2 Service Catalog Integration

#### Real-time Pricing
```typescript
// PricingService.ts
class PricingService {
  async getServicePrice(serviceId: number, companyId: number): Promise<ServicePrice> {
    // 1. Get base service price
    const basePrice = await this.getBaseServicePrice(serviceId);
    
    // 2. Apply company-specific markup
    const companyMarkup = await this.getCompanyMarkup(companyId);
    
    // 3. Calculate final price
    return {
      base_price: basePrice,
      markup_percentage: companyMarkup,
      final_price: basePrice * (1 + companyMarkup / 100),
      labor_hours: await this.getLaborHours(serviceId),
      materials_included: await this.getMaterialsIncluded(serviceId)
    };
  }
}
```

### 4.3 Customer Data Integration

#### Auto-population Service
```typescript
// CustomerDataService.ts
class CustomerDataService {
  async getCustomerInvoiceData(customerId: number): Promise<CustomerInvoiceData> {
    const customer = await this.getCustomer(customerId);
    const preferences = await this.getCustomerPreferences(customerId);
    const history = await this.getServiceHistory(customerId);
    
    return {
      billing_address: customer.billing_address || customer.address,
      preferred_payment_terms: preferences.payment_terms || 'Net 30',
      tax_exempt: customer.tax_exempt,
      discount_rate: preferences.discount_rate,
      recent_services: history.slice(0, 5),
      average_invoice_amount: history.reduce((sum, h) => sum + h.amount, 0) / history.length
    };
  }
}
```

### 4.4 CRM Dashboard Integration

#### Quick Actions Implementation
```typescript
// QuickActions.tsx
interface QuickActionsProps {
  onCreateInvoice: () => void;
  onSendInvoice: () => void;
}

// Features:
// - "Send Invoice" button opens invoice creation modal
// - Pre-populate with recent work orders
// - Quick customer selection
// - One-click invoice generation for completed work orders
```

#### Dashboard Metrics
```typescript
// InvoiceMetrics.ts
class InvoiceMetrics {
  async getDashboardMetrics(companyId: number): Promise<InvoiceMetrics> {
    return {
      monthly_revenue: await this.getMonthlyRevenue(companyId),
      outstanding_invoices: await this.getOutstandingInvoices(companyId),
      overdue_amount: await this.getOverdueAmount(companyId),
      average_payment_days: await this.getAveragePaymentDays(companyId),
      invoice_count_this_month: await this.getInvoiceCount(companyId),
      revenue_growth: await this.getRevenueGrowth(companyId)
    };
  }
}
```

## 5. Advanced Features

### 5.1 PDF Generation

#### PDF Template Engine
```typescript
// PDFGenerator.ts
class PDFGenerator {
  async generateInvoicePDF(invoiceId: number, templateId?: number): Promise<Buffer> {
    // 1. Get invoice data with all relationships
    const invoiceData = await this.getInvoiceWithDetails(invoiceId);
    
    // 2. Get company template or use default
    const template = await this.getInvoiceTemplate(templateId || invoiceData.company.default_template_id);
    
    // 3. Generate PDF using template engine
    const pdf = await this.renderPDF({
      template: template,
      data: invoiceData,
      options: {
        format: 'A4',
        margin: '1in',
        header: template.header_html,
        footer: template.footer_html
      }
    });
    
    return pdf;
  }
}
```

#### Template Customization
```typescript
// InvoiceTemplate.ts
interface InvoiceTemplate {
  id: number;
  company_id: number;
  name: string;
  header_html: string;
  body_html: string;
  footer_html: string;
  css_styles: string;
  variables: TemplateVariable[];
}

interface TemplateVariable {
  name: string;
  type: 'text' | 'number' | 'date' | 'currency';
  default_value?: string;
  required: boolean;
}
```

### 5.2 Email Integration

#### Email Service
```typescript
// EmailService.ts
class EmailService {
  async sendInvoiceEmail(invoiceId: number, recipients: string[], options: EmailOptions): Promise<EmailResult> {
    // 1. Generate PDF attachment
    const pdfBuffer = await this.pdfGenerator.generateInvoicePDF(invoiceId);
    
    // 2. Get email template
    const template = await this.getEmailTemplate('invoice_send');
    
    // 3. Render email content
    const emailContent = await this.renderEmailTemplate(template, {
      invoice: await this.getInvoice(invoiceId),
      company: await this.getCompany(),
      custom_message: options.message
    });
    
    // 4. Send email with attachment
    const result = await this.emailProvider.send({
      to: recipients,
      subject: options.subject || `Invoice ${invoice.invoice_number}`,
      html: emailContent,
      attachments: [{
        filename: `invoice-${invoice.invoice_number}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }]
    });
    
    // 5. Log email activity
    await this.logEmailActivity(invoiceId, recipients, result);
    
    return result;
  }
}
```

#### Email Templates
```typescript
// EmailTemplates.ts
interface EmailTemplate {
  id: number;
  name: string;
  subject_template: string;
  body_template: string;
  variables: string[];
}

// Default templates:
// - invoice_send: Initial invoice delivery
// - payment_reminder: Payment due reminder
// - overdue_notice: Overdue payment notice
// - payment_received: Payment confirmation
```

### 5.3 Payment Processing

#### Payment Gateway Integration
```typescript
// PaymentGateway.ts
class PaymentGateway {
  async createPaymentLink(invoiceId: number): Promise<PaymentLink> {
    const invoice = await this.getInvoice(invoiceId);
    
    const paymentLink = await this.gateway.createPaymentIntent({
      amount: invoice.total_amount,
      currency: 'USD',
      description: `Payment for Invoice ${invoice.invoice_number}`,
      metadata: {
        invoice_id: invoiceId,
        company_id: invoice.company_id
      },
      success_url: `${process.env.APP_URL}/invoices/${invoiceId}/payment-success`,
      cancel_url: `${process.env.APP_URL}/invoices/${invoiceId}`
    });
    
    return {
      payment_url: paymentLink.url,
      payment_intent_id: paymentLink.id,
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };
  }
}
```

#### Payment Webhooks
```typescript
// PaymentWebhooks.ts
class PaymentWebhooks {
  async handlePaymentSuccess(paymentIntentId: string): Promise<void> {
    // 1. Verify payment with gateway
    const payment = await this.gateway.retrievePaymentIntent(paymentIntentId);
    
    // 2. Record payment in database
    await this.recordPayment({
      invoice_id: payment.metadata.invoice_id,
      amount: payment.amount / 100, // Convert from cents
      payment_method: 'online',
      reference_number: payment.id,
      payment_date: new Date()
    });
    
    // 3. Update invoice status
    await this.updateInvoiceStatus(payment.metadata.invoice_id);
    
    // 4. Send confirmation email
    await this.sendPaymentConfirmation(payment.metadata.invoice_id);
  }
}
```

### 5.4 Reporting and Analytics

#### Invoice Analytics
```typescript
// InvoiceAnalytics.ts
class InvoiceAnalytics {
  async getRevenueAnalytics(companyId: number, period: string): Promise<RevenueAnalytics> {
    return {
      total_revenue: await this.getTotalRevenue(companyId, period),
      revenue_by_month: await this.getRevenueByMonth(companyId, period),
      revenue_by_service: await this.getRevenueByService(companyId, period),
      average_invoice_amount: await this.getAverageInvoiceAmount(companyId, period),
      payment_performance: await this.getPaymentPerformance(companyId, period),
      customer_analytics: await this.getCustomerAnalytics(companyId, period)
    };
  }
  
  async getPaymentAnalytics(companyId: number): Promise<PaymentAnalytics> {
    return {
      average_payment_days: await this.getAveragePaymentDays(companyId),
      payment_methods: await this.getPaymentMethodBreakdown(companyId),
      overdue_analysis: await this.getOverdueAnalysis(companyId),
      seasonal_trends: await this.getSeasonalTrends(companyId)
    };
  }
}
```

## 6. Mobile Optimization

### 6.1 Responsive Design

#### Mobile Invoice Creation
```typescript
// MobileInvoiceCreation.tsx
// Features:
// - Collapsible sections for small screens
// - Touch-optimized input fields
// - Swipe gestures for navigation
// - Simplified line item entry
// - Voice-to-text for descriptions
```

#### Mobile Invoice List
```typescript
// MobileInvoiceList.tsx
// Features:
// - Card-based layout instead of table
// - Pull-to-refresh functionality
// - Infinite scroll pagination
// - Quick action swipe gestures
// - Offline data caching
```

### 6.2 Offline Capabilities

#### Offline Storage
```typescript
// OfflineStorage.ts
class OfflineStorage {
  async saveDraftInvoice(invoiceData: InvoiceFormData): Promise<void> {
    // Save to IndexedDB for offline access
    await this.indexedDB.put('draft_invoices', invoiceData);
  }
  
  async syncWhenOnline(): Promise<void> {
    // Sync draft invoices when connection restored
    const drafts = await this.indexedDB.getAll('draft_invoices');
    for (const draft of drafts) {
      await this.apiService.createInvoice(draft);
      await this.indexedDB.delete('draft_invoices', draft.id);
    }
  }
}
```

## 7. Security and Compliance

### 7.1 Multi-tenant Security

#### Data Isolation
```typescript
// SecurityMiddleware.ts
class SecurityMiddleware {
  async validateInvoiceAccess(userId: number, invoiceId: number): Promise<boolean> {
    const user = await this.getUser(userId);
    const invoice = await this.getInvoice(invoiceId);
    
    // Ensure user can only access invoices from their company
    return user.company_id === invoice.company_id;
  }
  
  async validateInvoiceModification(userId: number, invoiceId: number): Promise<boolean> {
    const hasAccess = await this.validateInvoiceAccess(userId, invoiceId);
    const user = await this.getUser(userId);
    
    // Check role-based permissions
    return hasAccess && (user.role === 'admin' || user.role === 'manager');
  }
}
```

### 7.2 Data Protection

#### Audit Trails
```typescript
// AuditTrail.ts
class AuditTrail {
  async logInvoiceActivity(invoiceId: number, userId: number, action: string, details?: any): Promise<void> {
    await this.database.insert('audit_logs', {
      entity_type: 'invoice',
      entity_id: invoiceId,
      user_id: userId,
      action: action,
      details: JSON.stringify(details),
      ip_address: this.getClientIP(),
      user_agent: this.getUserAgent(),
      timestamp: new Date()
    });
  }
}
```

## 8. Implementation Timeline

### Phase 1: Foundation (Week 1)
- Database schema implementation
- Core API endpoints (CRUD operations)
- Basic authentication and authorization
- Unit tests for core functionality

### Phase 2: Core UI (Week 2)
- Invoice creation split-screen interface
- Basic form functionality and validation
- Real-time calculations
- Invoice preview component

### Phase 3: Integration (Week 3)
- Work order to invoice conversion
- Service catalog integration
- Customer data auto-population
- CRM dashboard integration

### Phase 4: Advanced Features (Week 4)
- PDF generation and templates
- Email functionality
- Payment tracking
- Basic reporting

### Phase 5: Polish and Testing (Week 5)
- Mobile optimization
- Performance optimization
- End-to-end testing
- User acceptance testing
- Documentation

## 9. Success Metrics

### Functional Requirements
- ✅ Invoice creation in under 3 minutes
- ✅ Real-time preview updates (< 100ms)
- ✅ PDF generation in under 2 seconds
- ✅ Email delivery in under 5 seconds
- ✅ Mobile responsiveness on all devices

### Technical Requirements
- ✅ 99.9% uptime
- ✅ Multi-tenant data isolation
- ✅ Secure payment processing
- ✅ Audit trail compliance
- ✅ Performance under load (100+ concurrent users)

### Business Requirements
- ✅ Reduced invoice creation time by 60%
- ✅ Improved cash flow tracking
- ✅ Professional customer experience
- ✅ Integrated business workflow
- ✅ Comprehensive reporting capabilities

## 10. Conclusion

This detailed implementation plan provides a comprehensive roadmap for building a professional, feature-rich Invoicing System that seamlessly integrates with the existing ServiceBook Pros CRM platform. The phased approach ensures systematic development while maintaining platform stability and delivering immediate value to contractors.

The system will transform the invoicing process from a time-consuming manual task to an efficient, automated workflow that enhances cash flow management and provides a professional experience for customers.

