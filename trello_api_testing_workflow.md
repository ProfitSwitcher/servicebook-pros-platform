# ServiceBook Pros Invoice Management API - Trello Testing Workflow

## Overview

This document outlines how to use Trello for comprehensive API testing and validation instead of Postman. The workflow includes test case management, execution tracking, and results documentation using Trello's powerful project management features.

## Testing Board Structure

### 📋 API Testing Lists

1. **🧪 Test Planning** - Test case design and planning
2. **📝 Test Cases** - Individual test case cards
3. **🔄 Ready for Testing** - Tests ready to execute
4. **⚡ In Progress** - Currently executing tests
5. **✅ Passed** - Successfully completed tests
6. **❌ Failed** - Failed tests requiring attention
7. **🔧 Bug Fixes** - Issues found during testing
8. **📊 Test Reports** - Testing summaries and reports

## Test Case Card Structure

### 🧪 Individual Test Case Format

Each API endpoint test should be a separate card with this structure:

#### Card Title Format
`[METHOD] /endpoint-path - Test Description`

**Examples:**
- `[GET] /invoices - List invoices with pagination`
- `[POST] /invoices - Create invoice with valid data`
- `[PATCH] /invoices/:id - Update invoice status`

#### Card Description Template
```markdown
## Test Objective
Brief description of what this test validates

## API Endpoint
- **Method:** GET/POST/PATCH/DELETE
- **URL:** /api/invoices/:id
- **Authentication:** Required/Optional

## Test Data
### Request Headers
```json
{
  "Authorization": "Bearer {{jwt_token}}",
  "Content-Type": "application/json"
}
```

### Request Body (if applicable)
```json
{
  "customer_id": 1,
  "work_order_id": 2,
  "line_items": [...]
}
```

## Expected Response
### Status Code: 200
### Response Body:
```json
{
  "id": 123,
  "invoice_number": "INV-2025-001",
  "status": "draft"
}
```

## Test Steps
1. Set up test environment
2. Prepare test data
3. Execute API request
4. Validate response
5. Clean up test data

## Validation Criteria
- [ ] Correct HTTP status code
- [ ] Response structure matches schema
- [ ] Required fields present
- [ ] Data types correct
- [ ] Business logic validated
```

#### Checklist Template
```
Pre-test Setup:
- [ ] Test environment ready
- [ ] Authentication token valid
- [ ] Test data prepared
- [ ] Dependencies available

Test Execution:
- [ ] Request sent successfully
- [ ] Response received
- [ ] Status code verified
- [ ] Response time acceptable (<2s)

Response Validation:
- [ ] Required fields present
- [ ] Data types correct
- [ ] Values within expected ranges
- [ ] Business rules enforced
- [ ] Error handling works

Post-test Cleanup:
- [ ] Test data cleaned up
- [ ] Resources released
- [ ] Results documented
```

## Test Categories

### 🔵 Happy Path Tests

#### GET /invoices - List Invoices
**Test Cases:**
- Default pagination (first 10 invoices)
- Custom pagination (page 2, limit 5)
- Filter by status (draft, sent, paid)
- Filter by customer
- Filter by date range
- Search by invoice number
- Sort by date, amount, status

#### POST /invoices - Create Invoice
**Test Cases:**
- Create with minimum required fields
- Create with all optional fields
- Create with line items
- Create from work order conversion
- Auto-generate invoice number
- Calculate totals correctly

#### PATCH /invoices/:id - Update Invoice
**Test Cases:**
- Update customer information
- Update line items
- Update status (draft → sent → paid)
- Recalculate totals after changes
- Update due date

### 🟡 Edge Cases

#### Boundary Testing
- Maximum line items per invoice
- Maximum invoice amount
- Minimum required fields
- Date range limits
- Pagination limits

#### Data Validation
- Invalid customer ID
- Invalid work order ID
- Negative amounts
- Future dates in the past
- Invalid email formats

### 🔴 Error Scenarios

#### Authentication Errors
- Missing JWT token
- Expired JWT token
- Invalid JWT token
- Insufficient permissions

#### Validation Errors
- Missing required fields
- Invalid data types
- Business rule violations
- Duplicate invoice numbers

#### Not Found Errors
- Non-existent invoice ID
- Non-existent customer ID
- Non-existent work order ID

## Test Execution Workflow

### 1. Test Planning Phase

Create cards in **🧪 Test Planning** list:
- Define test scope and objectives
- Identify test scenarios
- Prepare test data requirements
- Set up test environment

### 2. Test Case Creation

Move detailed test cases to **📝 Test Cases** list:
- Create individual cards for each test
- Add comprehensive descriptions
- Include request/response examples
- Define validation criteria

### 3. Test Execution

Move cards through workflow:
1. **🔄 Ready for Testing** - Tests prepared and ready
2. **⚡ In Progress** - Currently executing
3. **✅ Passed** - Test successful
4. **❌ Failed** - Test failed, needs attention

### 4. Bug Tracking

Failed tests create cards in **🔧 Bug Fixes**:
- Link to original test case
- Include error details
- Assign to developer
- Track fix progress

## Test Documentation

### 📊 Test Results Format

For each executed test, add a comment with results:

```markdown
## Test Execution Results

**Date:** 2025-01-15 14:30:00
**Tester:** John Doe
**Environment:** Staging

### Request Details
- **URL:** https://api.servicebookpros.com/api/invoices
- **Method:** GET
- **Headers:** Authorization: Bearer xxx...
- **Body:** N/A

### Response Details
- **Status Code:** 200 ✅
- **Response Time:** 245ms ✅
- **Content-Type:** application/json ✅

### Response Body
```json
{
  "data": [...],
  "pagination": {...},
  "total": 42
}
```

### Validation Results
- [x] Status code 200
- [x] Response structure correct
- [x] Pagination working
- [x] Data types valid
- [x] Business logic correct

### Issues Found
None

### Overall Result: ✅ PASSED
```

## Automation Integration

### 🤖 Butler Automation Rules

```
# Move cards automatically based on test results
When a card is moved to "In Progress", add the "⚡ Testing" label
When a card is moved to "Passed", add the "✅ Success" label and remove "⚡ Testing" label
When a card is moved to "Failed", add the "❌ Failed" label and create a card in "Bug Fixes" list

# Daily test summary
Every day at 6:00 PM, create a card "Daily Test Summary - {date}" in "Test Reports" list

# Weekly test report
Every Friday at 5:00 PM, create a card "Weekly Test Report - Week {weeknumber}" in "Test Reports" list
```

### 📊 Custom Fields for Test Tracking

Add these custom fields to test cards:
- **Priority:** High/Medium/Low
- **Test Type:** Functional/Integration/Performance/Security
- **Environment:** Local/Staging/Production
- **Execution Time:** Number (minutes)
- **Last Executed:** Date
- **Pass Rate:** Percentage

## Test Data Management

### 🗄️ Test Data Cards

Create dedicated cards for test data management:

#### Test Users
```markdown
## Test User Accounts

### Admin User
- Email: admin@test.servicebookpros.com
- Password: TestAdmin123!
- Company: Test Company 1
- Role: Administrator

### Regular User
- Email: user@test.servicebookpros.com
- Password: TestUser123!
- Company: Test Company 1
- Role: User
```

#### Test Customers
```markdown
## Test Customer Data

### Customer 1
- Name: John Smith
- Email: john@testcustomer.com
- Phone: (555) 123-4567
- Address: 123 Test St, Test City, TC 12345

### Customer 2
- Name: ABC Corp
- Email: billing@abccorp.com
- Phone: (555) 987-6543
- Address: 456 Business Ave, Corp City, CC 67890
```

## Performance Testing

### ⚡ Performance Test Cards

#### Load Testing
```markdown
## Load Test - GET /invoices

### Test Objective
Validate API performance under normal load

### Test Configuration
- Concurrent Users: 50
- Duration: 5 minutes
- Ramp-up Time: 1 minute

### Success Criteria
- Average Response Time: < 500ms
- 95th Percentile: < 1000ms
- Error Rate: < 1%
- Throughput: > 100 requests/second

### Test Results
[Add results after execution]
```

#### Stress Testing
```markdown
## Stress Test - POST /invoices

### Test Objective
Determine breaking point for invoice creation

### Test Configuration
- Start: 10 users
- Increment: 10 users every 30 seconds
- Max Users: 200
- Duration: Until failure

### Success Criteria
- Identify maximum concurrent users
- Graceful degradation
- No data corruption
- Recovery after load reduction
```

## Security Testing

### 🔒 Security Test Cards

#### Authentication Testing
```markdown
## Security Test - JWT Token Validation

### Test Scenarios
- [ ] Valid token access
- [ ] Expired token rejection
- [ ] Invalid token rejection
- [ ] Missing token rejection
- [ ] Token tampering detection

### SQL Injection Testing
- [ ] Test all input fields
- [ ] Special characters in requests
- [ ] Malformed JSON payloads
- [ ] Database error exposure
```

## Integration Testing

### 🔗 Integration Test Cards

#### Work Order to Invoice Conversion
```markdown
## Integration Test - Work Order Conversion

### Test Flow
1. Create work order in scheduling system
2. Add line items and materials
3. Complete work order
4. Convert to invoice via API
5. Validate invoice data accuracy
6. Verify customer notification

### Validation Points
- [ ] All work order data transferred
- [ ] Line items correctly converted
- [ ] Pricing calculations accurate
- [ ] Customer information populated
- [ ] Invoice status set correctly
```

## Reporting and Analytics

### 📊 Test Metrics Dashboard

Create a card for tracking key metrics:

```markdown
## Test Metrics Dashboard

### Current Sprint Metrics
- Total Test Cases: 156
- Executed: 142
- Passed: 138
- Failed: 4
- Pass Rate: 97.2%

### Performance Metrics
- Average Response Time: 245ms
- 95th Percentile: 890ms
- Error Rate: 0.3%

### Coverage Metrics
- Endpoint Coverage: 100%
- Happy Path Coverage: 100%
- Error Scenario Coverage: 95%
- Edge Case Coverage: 85%

### Trend Analysis
- Pass Rate Trend: ↗️ Improving
- Performance Trend: ↗️ Stable
- Bug Discovery Rate: ↘️ Decreasing
```

## Best Practices

### 🎯 Test Management

1. **Consistent Naming** - Use standardized card titles
2. **Detailed Descriptions** - Include all necessary test information
3. **Regular Updates** - Keep test results current
4. **Clear Validation** - Define specific success criteria
5. **Proper Labeling** - Use labels for easy filtering

### 📈 Continuous Improvement

1. **Regular Reviews** - Weekly test result analysis
2. **Process Refinement** - Improve based on feedback
3. **Automation Opportunities** - Identify repetitive tests
4. **Knowledge Sharing** - Document lessons learned

### 🔄 Workflow Optimization

1. **Parallel Execution** - Run independent tests simultaneously
2. **Priority-Based Testing** - Focus on critical paths first
3. **Risk-Based Testing** - Allocate effort based on risk
4. **Regression Testing** - Maintain test suite for changes

---

## Getting Started Checklist

- [ ] Create testing board with proper structure
- [ ] Set up test case card templates
- [ ] Configure labels and custom fields
- [ ] Add Butler automation rules
- [ ] Create initial test cases for core endpoints
- [ ] Set up test data management cards
- [ ] Define test execution workflow
- [ ] Train team on testing process
- [ ] Begin executing test cases
- [ ] Track and report results

**Happy Testing!** 🧪

This Trello-based testing workflow provides comprehensive API testing capabilities without requiring Postman. Use it to ensure the ServiceBook Pros Invoice Management API meets all quality and performance requirements.

