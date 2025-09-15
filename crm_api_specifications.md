# ServiceBook Pros - CRM API Specifications

This document provides a detailed specification for the ServiceBook Pros CRM RESTful API. It includes data models, endpoint definitions, request/response formats, and authentication requirements.




## 1. Data Models

### 1.1. Customer

| Field | Type | Description |
|---|---|---|
| id | integer | Unique identifier for the customer |
| company_id | integer | Foreign key to the Companies table |
| first_name | string | Customer's first name |
| last_name | string | Customer's last name |
| email | string | Customer's email address |
| phone | string | Customer's phone number |
| address | string | Customer's primary address |
| city | string | City |
| state | string | State |
| zip_code | string | Zip code |
| created_at | datetime | Timestamp of creation |
| updated_at | datetime | Timestamp of last update |

### 1.2. WorkOrder

| Field | Type | Description |
|---|---|---|
| id | integer | Unique identifier for the work order |
| customer_id | integer | Foreign key to the Customers table |
| status | string | Status of the work order (e.g., Scheduled, In Progress, Completed, Canceled) |
| scheduled_date | datetime | Date and time of the scheduled service |
| completion_date | datetime | Date and time of completion |
| technician_id | integer | Foreign key to the Users table (technician) |
| scope_of_work | text | Detailed description of the work to be performed |
| notes | text | Internal notes about the work order |
| created_at | datetime | Timestamp of creation |
| updated_at | datetime | Timestamp of last update |

### 1.3. Invoice

| Field | Type | Description |
|---|---|---|
| id | integer | Unique identifier for the invoice |
| work_order_id | integer | Foreign key to the WorkOrders table |
| total_amount | decimal | Total amount of the invoice |
| amount_paid | decimal | Amount paid by the customer |
| due_date | date | Due date for the payment |
| status | string | Status of the invoice (e.g., Draft, Sent, Paid, Overdue) |
| created_at | datetime | Timestamp of creation |
| updated_at | datetime | Timestamp of last update |




## 2. API Endpoints

All endpoints require JWT-based authentication. The base URL for the API is `/api/v1/`.

### 2.1. Customers

- **GET /customers**: Retrieve a list of all customers.
- **GET /customers/{id}**: Retrieve a single customer by ID.
- **POST /customers**: Create a new customer.
- **PUT /customers/{id}**: Update an existing customer.
- **DELETE /customers/{id}**: Delete a customer.

### 2.2. Work Orders

- **GET /workorders**: Retrieve a list of all work orders.
- **GET /workorders/{id}**: Retrieve a single work order by ID.
- **POST /workorders**: Create a new work order.
- **PUT /workorders/{id}**: Update an existing work order.
- **DELETE /workorders/{id}**: Delete a work order.

### 2.3. Invoices

- **GET /invoices**: Retrieve a list of all invoices.
- **GET /invoices/{id}**: Retrieve a single invoice by ID.
- **POST /invoices**: Create a new invoice from a work order.
- **PUT /invoices/{id}**: Update an existing invoice.
- **DELETE /invoices/{id}**: Delete an invoice.



