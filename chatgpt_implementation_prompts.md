# ServiceBook Pros - ChatGPT Implementation Prompts

This document provides a complete set of prompts for developing the ServiceBook Pros CRM backend using ChatGPT and Flask. These prompts are designed to guide a developer through the entire implementation process, from setting up the project to building out the API endpoints.




## 1. Project Setup

**Prompt:**

"You are an expert Flask developer. I need you to create a new Flask project for a CRM system called ServiceBook Pros. The project should have the following structure:

- A main `app.py` file
- A `models` directory for database models
- A `routes` directory for API routes
- A `services` directory for business logic
- A `config.py` file for configuration settings

Set up a basic Flask application in `app.py` and create empty `__init__.py` files in the directories to make them Python packages. Also, create a `requirements.txt` file with the necessary dependencies: Flask, Flask-SQLAlchemy, Flask-Migrate, Flask-JWT-Extended, and Flask-Cors."




## 2. Database Models

**Prompt:**

"Using Flask-SQLAlchemy, create the database models for the ServiceBook Pros CRM. The models should be in the `models` directory. Create the following models with the specified fields:

- **Company**: `id`, `name`, `address`, `phone`, `email`, `created_at`, `updated_at`
- **User**: `id`, `company_id` (foreign key), `first_name`, `last_name`, `email`, `password_hash`, `role_id` (foreign key), `created_at`, `updated_at`
- **Role**: `id`, `name` (e.g., Admin, Technician)
- **Customer**: `id`, `company_id` (foreign key), `first_name`, `last_name`, `email`, `phone`, `address`, `created_at`, `updated_at`
- **WorkOrder**: `id`, `customer_id` (foreign key), `status`, `scheduled_date`, `completion_date`, `technician_id` (foreign key), `scope_of_work`, `notes`, `created_at`, `updated_at`
- **Invoice**: `id`, `work_order_id` (foreign key), `total_amount`, `amount_paid`, `due_date`, `status`, `created_at`, `updated_at`

Define the relationships between the models (e.g., a Company has many Users, a Customer has many WorkOrders)."




## 3. API Routes

**Prompt:**

"Create the API routes for the Customer resource in the `routes` directory. Use Flask Blueprints to organize the routes. The routes should handle the following operations:

- **GET /api/v1/customers**: Retrieve a list of all customers.
- **GET /api/v1/customers/{id}**: Retrieve a single customer by ID.
- **POST /api/v1/customers**: Create a new customer.
- **PUT /api/v1/customers/{id}**: Update an existing customer.
- **DELETE /api/v1/customers/{id}**: Delete a customer.

Implement the basic logic for each route, including request parsing, data validation, and JSON responses. Use JWT for authentication on all routes."



