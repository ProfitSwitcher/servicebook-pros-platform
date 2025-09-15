"""
PDF Generation utility for ServiceBook Pros invoices
"""

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_LEFT, TA_RIGHT, TA_CENTER
from datetime import datetime
import io
import os

class InvoicePDFGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
    
    def setup_custom_styles(self):
        """Setup custom paragraph styles for the invoice"""
        self.styles.add(ParagraphStyle(
            name='InvoiceTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#2563eb'),
            alignment=TA_CENTER,
            spaceAfter=20
        ))
        
        self.styles.add(ParagraphStyle(
            name='CompanyName',
            parent=self.styles['Heading2'],
            fontSize=18,
            textColor=colors.HexColor('#1f2937'),
            alignment=TA_LEFT,
            spaceAfter=10
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading3'],
            fontSize=12,
            textColor=colors.HexColor('#374151'),
            alignment=TA_LEFT,
            spaceAfter=8,
            spaceBefore=15
        ))
        
        self.styles.add(ParagraphStyle(
            name='InvoiceInfo',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#6b7280'),
            alignment=TA_LEFT
        ))
        
        self.styles.add(ParagraphStyle(
            name='TotalAmount',
            parent=self.styles['Normal'],
            fontSize=14,
            textColor=colors.HexColor('#059669'),
            alignment=TA_RIGHT,
            fontName='Helvetica-Bold'
        ))

    def generate_invoice_pdf(self, invoice_data, company_data, customer_data, line_items):
        """
        Generate a PDF invoice
        
        Args:
            invoice_data: Dictionary containing invoice information
            company_data: Dictionary containing company information
            customer_data: Dictionary containing customer information
            line_items: List of dictionaries containing line item information
        
        Returns:
            BytesIO object containing the PDF data
        """
        buffer = io.BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        # Build the PDF content
        story = []
        
        # Header with company info and invoice title
        story.extend(self._build_header(company_data, invoice_data))
        
        # Customer information
        story.extend(self._build_customer_section(customer_data))
        
        # Invoice details
        story.extend(self._build_invoice_details(invoice_data))
        
        # Line items table
        story.extend(self._build_line_items_table(line_items))
        
        # Totals section
        story.extend(self._build_totals_section(invoice_data))
        
        # Footer
        story.extend(self._build_footer(company_data))
        
        # Build the PDF
        doc.build(story)
        buffer.seek(0)
        return buffer

    def _build_header(self, company_data, invoice_data):
        """Build the header section with company info and invoice title"""
        elements = []
        
        # Company name
        company_name = Paragraph(
            company_data.get('company_name', 'ServiceBook Pros'),
            self.styles['CompanyName']
        )
        elements.append(company_name)
        
        # Company address
        if company_data.get('address'):
            address_lines = [
                company_data.get('address', ''),
                f"{company_data.get('city', '')}, {company_data.get('state', '')} {company_data.get('zip_code', '')}".strip(', '),
                company_data.get('contact_phone', ''),
                company_data.get('contact_email', '')
            ]
            address_text = '<br/>'.join([line for line in address_lines if line.strip()])
            address = Paragraph(address_text, self.styles['InvoiceInfo'])
            elements.append(address)
        
        elements.append(Spacer(1, 20))
        
        # Invoice title
        invoice_title = Paragraph('INVOICE', self.styles['InvoiceTitle'])
        elements.append(invoice_title)
        
        elements.append(Spacer(1, 20))
        
        return elements

    def _build_customer_section(self, customer_data):
        """Build the customer information section"""
        elements = []
        
        # Bill To header
        bill_to = Paragraph('Bill To:', self.styles['SectionHeader'])
        elements.append(bill_to)
        
        # Customer details
        customer_lines = [
            customer_data.get('name', ''),
            customer_data.get('company', ''),
            customer_data.get('address', ''),
            f"{customer_data.get('city', '')}, {customer_data.get('state', '')} {customer_data.get('zip_code', '')}".strip(', '),
            customer_data.get('phone', ''),
            customer_data.get('email', '')
        ]
        customer_text = '<br/>'.join([line for line in customer_lines if line.strip()])
        customer_info = Paragraph(customer_text, self.styles['Normal'])
        elements.append(customer_info)
        
        elements.append(Spacer(1, 20))
        
        return elements

    def _build_invoice_details(self, invoice_data):
        """Build the invoice details section"""
        elements = []
        
        # Create a table for invoice details
        invoice_details = [
            ['Invoice Number:', invoice_data.get('invoice_number', '')],
            ['Invoice Date:', invoice_data.get('invoice_date', datetime.now().strftime('%B %d, %Y'))],
            ['Due Date:', invoice_data.get('due_date', '')],
            ['Status:', invoice_data.get('status', 'Draft').title()]
        ]
        
        details_table = Table(
            invoice_details,
            colWidths=[2*inch, 3*inch]
        )
        
        details_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'LEFT'),
            ('ALIGN', (1, 0), (1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (1, 0), (1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(details_table)
        elements.append(Spacer(1, 20))
        
        return elements

    def _build_line_items_table(self, line_items):
        """Build the line items table"""
        elements = []
        
        # Table header
        table_data = [
            ['Description', 'Quantity', 'Rate', 'Amount']
        ]
        
        # Add line items
        for item in line_items:
            table_data.append([
                item.get('description', ''),
                str(item.get('quantity', 0)),
                f"${float(item.get('unit_price', 0)):.2f}",
                f"${float(item.get('total_price', 0)):.2f}"
            ])
        
        # Create the table
        items_table = Table(
            table_data,
            colWidths=[3.5*inch, 1*inch, 1*inch, 1*inch]
        )
        
        # Style the table
        items_table.setStyle(TableStyle([
            # Header row
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#f3f4f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#374151')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            
            # Data rows
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ALIGN', (1, 1), (-1, -1), 'RIGHT'),
            ('ALIGN', (0, 1), (0, -1), 'LEFT'),
            ('BOTTOMPADDING', (0, 1), (-1, -1), 8),
            
            # Grid
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
            
            # Alternating row colors
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')])
        ]))
        
        elements.append(items_table)
        elements.append(Spacer(1, 20))
        
        return elements

    def _build_totals_section(self, invoice_data):
        """Build the totals section"""
        elements = []
        
        # Calculate totals
        subtotal = float(invoice_data.get('subtotal', 0))
        tax_amount = float(invoice_data.get('tax_amount', 0))
        total_amount = float(invoice_data.get('total_amount', 0))
        
        # Create totals table
        totals_data = [
            ['Subtotal:', f"${subtotal:.2f}"],
            ['Tax:', f"${tax_amount:.2f}"],
            ['', ''],  # Empty row for spacing
            ['Total:', f"${total_amount:.2f}"]
        ]
        
        totals_table = Table(
            totals_data,
            colWidths=[4.5*inch, 1*inch]
        )
        
        totals_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
            ('FONTNAME', (0, 0), (0, -2), 'Helvetica'),
            ('FONTNAME', (1, 0), (1, -2), 'Helvetica'),
            ('FONTNAME', (0, -1), (-1, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -2), 10),
            ('FONTSIZE', (0, -1), (-1, -1), 12),
            ('TEXTCOLOR', (0, -1), (-1, -1), colors.HexColor('#059669')),
            ('LINEABOVE', (0, -1), (-1, -1), 2, colors.HexColor('#059669')),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        
        elements.append(totals_table)
        elements.append(Spacer(1, 30))
        
        return elements

    def _build_footer(self, company_data):
        """Build the footer section"""
        elements = []
        
        # Payment terms or notes
        if company_data.get('payment_terms'):
            terms_header = Paragraph('Payment Terms:', self.styles['SectionHeader'])
            elements.append(terms_header)
            
            terms_text = Paragraph(company_data.get('payment_terms'), self.styles['Normal'])
            elements.append(terms_text)
            elements.append(Spacer(1, 20))
        
        # Thank you message
        thank_you = Paragraph(
            'Thank you for your business!',
            self.styles['Normal']
        )
        elements.append(thank_you)
        
        return elements

def generate_invoice_pdf(invoice_data, company_data, customer_data, line_items):
    """
    Convenience function to generate an invoice PDF
    
    Returns:
        BytesIO object containing the PDF data
    """
    generator = InvoicePDFGenerator()
    return generator.generate_invoice_pdf(invoice_data, company_data, customer_data, line_items)

