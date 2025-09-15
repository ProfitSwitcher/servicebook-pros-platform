# ServiceBook Pros Invoice Management API - Postman Collection Setup Guide

## Overview

This guide will help you set up and use the comprehensive Postman collection for testing the ServiceBook Pros Invoice Management API. The collection includes all endpoints, authentication, environment variables, and automated tests.

## Files Included

1. **ServiceBook_Pros_Invoice_Management_API.postman_collection.json** - Main API collection
2. **ServiceBook_Pros_API_Environment.postman_environment.json** - Environment variables
3. **postman_collection_setup_guide.md** - This setup guide

## Quick Setup

### 1. Import Collection and Environment

1. **Open Postman**
2. **Import Collection:**
   - Click "Import" button
   - Select `ServiceBook_Pros_Invoice_Management_API.postman_collection.json`
   - Click "Import"

3. **Import Environment:**
   - Click "Import" button
   - Select `ServiceBook_Pros_API_Environment.postman_environment.json`
   - Click "Import"

4. **Select Environment:**
   - Click the environment dropdown (top right)
   - Select "ServiceBook Pros API Environment"

### 2. Configure Authentication

1. **Get JWT Token:**
   - First, authenticate with the ServiceBook Pros API
   - Copy your JWT token

2. **Set Token in Environment:**
   - Click the environment dropdown
   - Click "Edit" next to "ServiceBook Pros API Environment"
   - Find the `jwt_token` variable
   - Paste your token in the "Current Value" field
   - Click "Save"

### 3. Update Base URL (if needed)

The collection is pre-configured with these URLs:
- **Production:** `https://api.servicebookpros.com/api`
- **Local Development:** `http://localhost:5000/api`
- **Staging:** `https://staging-api.servicebookpros.com/api`

To change the active URL:
1. Edit the environment
2. Enable/disable the appropriate `base_url` variable
3. Save changes

## Collection Structure

### 📁 Invoice Management
Core invoice CRUD operations:
- **Get All Invoices** - Paginated list with filtering
- **Get Invoice by ID** - Detailed invoice view
- **Create Invoice** - New invoice with line items
- **Update Invoice** - Modify existing invoice
- **Delete Invoice** - Remove draft invoices

### 📁 Invoice Actions
Invoice-specific operations:
- **Send Invoice** - Email delivery with PDF
- **Generate Invoice PDF** - PDF download
- **Duplicate Invoice** - Create copies

### 📁 Line Items Management
Manage invoice line items:
- **Add Line Item** - Add new line items
- **Update Line Item** - Modify existing items
- **Delete Line Item** - Remove line items

### 📁 Payment Management
Record and track payments:
- **Record Payment** - Add payment records
- **Get Payment History** - View all payments
- **Update Payment** - Modify payment records
- **Delete Payment** - Remove payment records

### 📁 Integration Endpoints
System integration features:
- **Convert Work Order to Invoice** - Automated conversion
- **Get Customer Invoices** - Customer-specific invoices
- **Get Service Pricing** - Real-time service pricing
- **Get Material Pricing** - Material cost lookup

### 📁 Error Scenarios
Test error handling:
- **Get Non-existent Invoice** - 404 error testing
- **Create Invoice with Invalid Data** - Validation testing
- **Unauthorized Request** - Authentication testing

## Environment Variables

### Authentication
- `jwt_token` - Your authentication token
- `refresh_token` - Token refresh capability
- `company_id` - Multi-tenant company ID
- `user_id` - Current user identifier

### API Configuration
- `base_url` - API base URL
- `api_version` - API version (v1)
- `timeout` - Request timeout (30000ms)
- `rate_limit_requests` - Rate limiting (100/min)

### Test Data
- `customer_id` - Test customer ID
- `work_order_id` - Test work order ID
- `invoice_id` - Dynamic invoice ID (auto-set)
- `line_item_id` - Dynamic line item ID (auto-set)
- `payment_id` - Dynamic payment ID (auto-set)

### Dynamic Variables
- `current_date` - Auto-generated current date
- `future_date` - Auto-generated future date (30 days)

## Running Tests

### Individual Requests
1. Select any request from the collection
2. Ensure the environment is selected
3. Click "Send"
4. View response and test results in the "Test Results" tab

### Collection Runner
1. Click the collection name
2. Click "Run" button
3. Select requests to run
4. Configure iterations and delay
5. Click "Run ServiceBook Pros - Invoice Management API"

### Automated Test Scripts

Each request includes comprehensive test scripts that verify:
- **Response Status Codes** - Correct HTTP status
- **Response Structure** - Required fields present
- **Data Validation** - Correct data types and values
- **Business Logic** - Calculations and relationships
- **Error Handling** - Proper error responses

## Test Scenarios

### Happy Path Testing
1. **Create Invoice** → **Add Line Items** → **Send Invoice** → **Record Payment**
2. **Convert Work Order** → **Update Invoice** → **Generate PDF**
3. **Duplicate Invoice** → **Modify** → **Send to Customer**

### Error Testing
1. **Invalid Authentication** - Test without token
2. **Invalid Data** - Test with malformed requests
3. **Not Found** - Test with non-existent IDs
4. **Business Rules** - Test status restrictions

### Integration Testing
1. **Work Order Conversion** - End-to-end workflow
2. **Customer Analytics** - Cross-module data
3. **Pricing Integration** - Service and material pricing
4. **Multi-tenant Security** - Company data isolation

## Advanced Features

### Pre-request Scripts
- **Automatic Date Generation** - Current and future dates
- **Environment Setup** - Base URL configuration
- **Token Validation** - Authentication checks

### Test Scripts
- **Response Validation** - Comprehensive data checks
- **Variable Extraction** - Auto-set IDs for chaining
- **Business Logic Testing** - Calculation verification
- **Error Scenario Handling** - Proper error responses

### Dynamic Variables
- **Auto-generated IDs** - Seamless request chaining
- **Date Management** - Automatic date calculations
- **Environment Switching** - Easy environment changes

## Troubleshooting

### Common Issues

1. **401 Unauthorized**
   - Check JWT token is set correctly
   - Verify token hasn't expired
   - Ensure proper authentication headers

2. **404 Not Found**
   - Verify base URL is correct
   - Check endpoint paths
   - Ensure IDs exist in the system

3. **400 Bad Request**
   - Validate request body format
   - Check required fields
   - Verify data types

4. **Rate Limiting**
   - Reduce request frequency
   - Check rate limit headers
   - Implement delays between requests

### Debug Tips

1. **Enable Console Logging**
   - Open Postman Console (View → Show Postman Console)
   - Add `console.log()` statements in scripts

2. **Check Environment Variables**
   - Verify all required variables are set
   - Check variable scoping (environment vs. global)

3. **Validate Request Data**
   - Use JSON validators for request bodies
   - Check data types and formats

4. **Monitor Network**
   - Check network connectivity
   - Verify SSL certificates
   - Monitor response times

## Best Practices

### Security
- **Never commit tokens** to version control
- **Use environment variables** for sensitive data
- **Rotate tokens regularly** for security
- **Test with limited permissions** when possible

### Testing
- **Run tests frequently** during development
- **Use collection runner** for comprehensive testing
- **Monitor test results** for regressions
- **Document test scenarios** for team use

### Maintenance
- **Keep collection updated** with API changes
- **Update environment variables** as needed
- **Review test scripts** for accuracy
- **Share collections** with team members

## Support

For questions or issues with the Postman collection:

1. **Check API Documentation** - Review endpoint specifications
2. **Validate Environment** - Ensure proper configuration
3. **Test Individual Requests** - Isolate issues
4. **Contact Development Team** - For API-specific issues

## Version History

- **v1.0.0** - Initial release with complete Invoice Management API
- Comprehensive test coverage
- Full environment configuration
- Error scenario testing
- Integration endpoint support

---

**Happy Testing!** 🚀

This Postman collection provides comprehensive testing capabilities for the ServiceBook Pros Invoice Management API. Use it to validate functionality, test integrations, and ensure reliable API performance.

