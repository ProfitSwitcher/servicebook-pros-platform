# ServiceBook Pros - CRM Backend Architecture

This document outlines the backend architecture for the ServiceBook Pros CRM system. The architecture is designed to be scalable, secure, and maintainable, supporting a multi-tenant system for various contractor companies.




## 1. System Architecture

The backend will be a multi-tenant, service-oriented architecture (SOA) built on a modern technology stack. This approach ensures that each company's data is isolated and secure while allowing for efficient resource sharing and scalability.

### 1.1. Multi-Tenant Design

A single application instance will serve multiple customer companies (tenants). Each tenant's data will be isolated using a schema-per-tenant approach, where each company has its own dedicated database schema. This provides a strong balance of data isolation and cost-effectiveness.

### 1.2. Service-Oriented Architecture (SOA)

The backend will be composed of several independent services, each responsible for a specific business domain:

- **Identity & Access Management (IAM) Service**: Handles user authentication, authorization, and company registration.
- **Company & User Management Service**: Manages company profiles, user roles, and permissions.
- **Customer Management Service**: Core CRM functionality, including customer data, service history, and communication logs.
- **Work Order & Scheduling Service**: Manages job scheduling, dispatching, and work order tracking.
- **Pricing & Invoicing Service**: Handles the flat rate pricing database, invoicing, and payment processing integration.
- **Notifications Service**: Manages email, SMS, and in-app notifications.

### 1.3. Technology Stack

- **Backend Framework**: Flask (Python)
- **Database**: PostgreSQL with a schema-per-tenant model
- **Authentication**: JWT (JSON Web Tokens) for stateless authentication
- **API Gateway**: A lightweight gateway to route requests to the appropriate services
- **Containerization**: Docker for packaging and deploying services
- **Orchestration**: Kubernetes for managing containerized applications (future scalability)




## 2. Database Schema

The database will be designed with a schema-per-tenant model. The following tables will exist within each tenant's schema:

### 2.1. Core CRM Tables

- **Customers**: Stores customer information (name, contact details, address, etc.).
- **Contacts**: Multiple contacts per customer (e.g., for commercial clients).
- **ServiceLocations**: Multiple service locations per customer.
- **WorkOrders**: Details of each job, including status, scheduled date, assigned technician, and scope of work.
- **LineItems**: Items included in a work order (parts, labor, etc.).
- **Invoices**: Invoicing details, including line items, totals, and payment status.
- **Payments**: Records of payments made against invoices.
- **Communications**: Log of all communications with the customer (emails, calls, texts).

### 2.2. Company & User Management Tables

- **Companies**: Stores information about each tenant company.
- **Users**: User accounts for each company, with roles and permissions.
- **Roles**: Defines user roles (e.g., Admin, Technician, Office Staff).
- **Permissions**: Defines specific permissions for each role.

### 2.3. Pricing Tables

- **PricingItems**: The master list of all flat-rate pricing items.
- **Categories**: Categories for pricing items (e.g., Electrical, HVAC, Plumbing).
- **LaborRates**: Company-specific labor rates and markups.



