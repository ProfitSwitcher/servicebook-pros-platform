


# ServiceBook Pros - Final Delivery

**Project:** ServiceBook Pros Multi-Tenant Platform
**Date:** September 10, 2025

## 1. Introduction

This document marks the final delivery of the ServiceBook Pros multi-tenant platform, a comprehensive flat-rate pricing system designed to compete with leading solutions like Profit Rhino and Housecall Pro. The platform empowers electrical, plumbing, and HVAC contractors to manage their own pricing while leveraging a shared, extensive service and materials catalog.

This project has been a significant undertaking, involving the development of a robust multi-tenant backend, a user-friendly frontend dashboard, and a comprehensive set of features to support the needs of modern service businesses. The platform is designed to be scalable, secure, and easy to use, providing a powerful tool for contractors to streamline their pricing and operations.

This document provides a complete overview of the platform, including its architecture, features, deployment details, and a comprehensive user guide. It is intended to serve as a complete reference for using and managing the ServiceBook Pros platform.

**Key Achievements:**

- **Multi-Tenant Architecture:** Securely isolates company data while allowing for shared resources.
- **Invoice Management:** A complete system for creating, managing, and tracking invoices.
- **CRM Dashboard:** A comprehensive dashboard with scheduling, work order management, and customer insights.
- **Customizable Pricing:** Companies can set their own labor rates, tax rates, and material markups.
- **Comprehensive Catalogs:** Includes extensive service and materials catalogs for electrical, plumbing, and HVAC.
- **User-Friendly Dashboard:** An intuitive interface for managing services, pricing, and company settings.
- **Admin Panel:** System-wide management capabilities for administrators.
- **Scalable and Secure:** Built on a modern technology stack with security and scalability in mind.

We are confident that the ServiceBook Pros platform will provide a significant competitive advantage to its users, and we are excited to see it in action.




## 2. Platform Architecture

The ServiceBook Pros platform is built on a modern, scalable, and secure technology stack, designed to support a multi-tenant environment with a high degree of customization.

### 2.1. Technology Stack

- **Backend:** Flask (Python)
- **Frontend:** React (JavaScript)
- **Database:** SQLite (for portability and ease of setup)
- **Deployment:** The backend is deployed as a Flask application, and the frontend is a static React application.

### 2.2. Multi-Tenant Architecture

The platform's multi-tenant architecture is designed to provide complete data isolation between companies while allowing for shared resources like the master service and materials catalogs. This is achieved through a combination of database schema design and application logic.

- **Company Isolation:** Each company's data is isolated through the use of a `company_id` in all relevant database tables. This ensures that a company can only access its own data.
- **Shared Catalogs:** The master service and materials catalogs are shared across all companies, providing a consistent and comprehensive set of services and materials.
- **Custom Pricing:** Companies can customize their pricing by setting their own labor rates, tax rates, and material markups. This allows for a high degree of flexibility in pricing.

### 2.3. Database Schema

The database schema is designed to support the multi-tenant architecture and the platform's features. The key tables include:

- **`companies`:** Stores information about each company, including their name, contact information, and default settings.
- **`users`:** Stores user information, including their username, password, and user type (admin, company_admin, user).
- **`company_users`:** Maps users to companies and defines their role within the company.
- **`service_categories` & `service_subcategories`:** Defines the structure of the service catalog.
- **`master_services`:** The master service catalog, shared across all companies.
- **`company_services`:** Company-specific pricing and settings for each service.
- **`material_categories` & `material_subcategories`:** Defines the structure of the materials catalog.
- **`master_materials`:** The master materials catalog, shared across all companies.
- **`company_materials`:** Company-specific pricing and settings for each material.




## 3. Features

The ServiceBook Pros platform includes a comprehensive set of features designed to meet the needs of modern service businesses.

### 3.1. CRM Dashboard

- **Comprehensive Overview:** A central dashboard providing a complete overview of the business, including today's schedule, active work orders, recent customers, and revenue metrics.
- **Scheduling Calendar:** A full-featured calendar for managing appointments, technician schedules, and availability.
- **Work Order Management:** A complete system for creating, tracking, and managing work orders from start to finish.
- **Customer Management:** A centralized database for managing customer information, including contact details, service history, and communication logs.
- **Pricing & Estimate Builder:** A powerful tool for searching services, building estimates, and finalizing quotes for customers.

### 3.2. Invoice Management

- **Professional Invoicing:** Create and send professional invoices with detailed line items, taxes, and payment terms.
- **Invoice Tracking:** Track the status of all invoices, from creation to payment, with real-time updates.
- **Payment Processing:** Record payments, manage payment history, and integrate with payment gateways (future feature).
- **Automated Reminders:** Set up automated reminders for overdue invoices to ensure timely payments (future feature).

### 3.3. Company Management

- **Company Profiles:** Each company has a profile with their name, contact information, and default settings.
- **User Management:** Companies can manage their own users, including adding, removing, and assigning roles.
- **Custom Branding:** Companies can customize the look and feel of their dashboard (future feature).

### 3.2. Pricing Management

- **Labor Rates:** Companies can set their own default labor rates, which are used to calculate service prices.
- **Tax Rates:** Companies can set their own default tax rates, which are applied to all services.
- **Material Markup:** Companies can set a default markup percentage for materials, which is used to calculate the final price of materials.
- **Custom Service Pricing:** Companies can override the default pricing for any service in the master catalog.

### 3.3. Service Catalog

- **Master Service Catalog:** A comprehensive catalog of services for electrical, plumbing, and HVAC.
- **Service Categories & Subcategories:** Services are organized into categories and subcategories for easy navigation.
- **Service Details:** Each service includes a detailed description, estimated time, and base material cost.

### 3.4. Materials Catalog

- **Master Materials Catalog:** A comprehensive catalog of materials for electrical, plumbing, and HVAC.
- **Material Categories & Subcategories:** Materials are organized into categories and subcategories for easy navigation.
- **Material Details:** Each material includes a detailed description, unit of measure, and base cost.
- **Company-Specific Material Pricing:** Companies can set their own custom pricing and markup for each material.

### 3.5. Admin Panel

- **System-Wide Management:** Administrators have access to a system-wide admin panel for managing companies, users, and system settings.
- **Company Management:** Admins can create, update, and delete companies.
- **User Management:** Admins can manage all users across all companies.
- **System Settings:** Admins can configure system-wide settings, such as default labor rates and tax rates.
- **Backup & Restore:** Admins can create and restore system backups (placeholder feature).




## 4. Deployment

The ServiceBook Pros platform is deployed as a set of two services: a backend Flask application and a frontend React application.

### 4.1. Backend Deployment

The backend is a Flask application that provides the API for the platform. It is deployed as a standalone service and can be accessed at the following URL:

- **Backend URL:** [https://kkh7ikc79odv.manus.space](https://kkh7ikc79odv.manus.space)

### 4.2. Frontend Deployment

The frontend is a React application that provides the user interface for the platform. It is deployed as a static website and can be accessed at the following URL:

- **Frontend URL:** (To be provided after user publishes the deployment)

**Note:** The frontend is currently pointing to the old backend URL. To test the latest features, you will need to update the API endpoint in the frontend code to point to the new backend URL.

### 4.3. Demo Accounts

The following demo accounts are available for testing the platform:

- **Demo Company Admin:**
  - **Username:** `demo_admin`
  - **Password:** `demo123`
- **Miami Company Admin:**
  - **Username:** `miami_admin`
  - **Password:** `miami123`
- **System Admin:**
  - **Username:** `system_admin`
  - **Password:** `admin123`




## 5. User Guide

This user guide provides a comprehensive overview of how to use the ServiceBook Pros platform.

### 5.1. Getting Started

To get started with the ServiceBook Pros platform, you will need to log in with your company credentials. If you do not have an account, please contact your company administrator.

1.  **Navigate to the login page:** Open your web browser and navigate to the frontend URL.
2.  **Enter your credentials:** Enter your username and password in the login form.
3.  **Click "Login":** Click the "Login" button to access your company dashboard.

### 5.2. Dashboard Overview

Once you have logged in, you will be taken to your company dashboard. The dashboard provides a comprehensive overview of your business operations.

- **Navigation:** The main navigation bar on the left allows you to switch between the different modules of the platform, including Dashboard, Customers, Work Orders, Scheduling, Invoicing, and Reports.
- **Dashboard:** The main dashboard provides a real-time overview of your business, including Today's Schedule, Active Work Orders, Recent Customers, and a Revenue This Month chart.
- **Quick Actions:** The dashboard also includes quick action buttons for common tasks like creating a work order or sending an invoice.

### 5.3. Managing Services

To manage your company's services, navigate to the "Services" section of the dashboard. Here you can view the master service catalog and customize the pricing for each service.

- **View Services:** The service catalog is organized by categories and subcategories. You can browse the catalog to find the services you need.
- **Customize Pricing:** To customize the pricing for a service, click on the service to open the details view. Here you can override the default labor hours and material cost to set your own custom price.

### 5.4. Managing Materials

To manage your company's materials, navigate to the "Materials" section of the dashboard. Here you can view the master materials catalog and customize the pricing for each material.

- **View Materials:** The materials catalog is organized by categories and subcategories. You can browse the catalog to find the materials you need.
- **Customize Pricing:** To customize the pricing for a material, click on the material to open the details view. Here you can set a custom cost and markup percentage to calculate the final price of the material.

### 5.5. Company Settings

To manage your company's settings, navigate to the "Settings" section of the dashboard. Here you can update your company's profile, manage users, and configure your default labor and tax rates.

- **Company Profile:** Update your company's name, contact information, and other details.
- **User Management:** Add, remove, and manage users for your company.
- **Labor & Tax Rates:** Set your company's default labor and tax rates, which are used to calculate service prices.

### 5.6. Admin Panel

If you are a system administrator, you will have access to the admin panel. The admin panel allows you to manage all companies, users, and system-wide settings.

- **Dashboard:** The admin dashboard provides an overview of the entire system, including statistics on companies, users, and catalog items.
- **Company Management:** Create, update, and delete companies.
- **User Management:** Manage all users across all companies.
- **System Settings:** Configure system-wide settings and features.




## 6. Conclusion

The ServiceBook Pros platform is a powerful and flexible solution for service businesses looking to streamline their pricing and operations. With its multi-tenant architecture, customizable pricing, and comprehensive service and materials catalogs, the platform provides a complete solution for managing a modern service business.

We are confident that the ServiceBook Pros platform will be a valuable asset to its users, and we look forward to seeing it in action. We are committed to the continued development and improvement of the platform, and we welcome any feedback or suggestions you may have.

Thank you for the opportunity to work on this exciting project. We are proud of the final product and we are confident that it will meet and exceed your expectations.


