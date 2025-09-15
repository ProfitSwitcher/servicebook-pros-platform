# ServiceBook Pros - CRM API Usage for Active Work Orders

## Overview
This document details the CRM API usage for the Active Work Orders component in the ServiceBook Pros CRM Dashboard. The Active Work Orders section displays real-time work order information with status tracking, customer details, and quick action capabilities.

## API Endpoints for Work Orders

### 1. Get Active Work Orders
**Endpoint:** `GET /api/work-orders`
**Purpose:** Retrieve all active work orders for the current company
**Authentication:** Required (company-scoped)

#### Request Parameters
```javascript
// Query Parameters
{
  status?: 'pending' | 'in_progress' | 'completed' | 'cancelled',
  limit?: number,        // Default: 10 for dashboard
  offset?: number,       // For pagination
  customer_id?: string,  // Filter by specific customer
  technician_id?: string, // Filter by assigned technician
  priority?: 'low' | 'medium' | 'high' | 'urgent',
  date_from?: string,    // ISO date string
  date_to?: string       // ISO date string
}
```

#### Response Format
```javascript
{
  "success": true,
  "data": {
    "work_orders": [
      {
        "id": "wo-2023-001",
        "work_order_number": "WO-2023-001",
        "customer_id": "cust-123",
        "customer": {
          "id": "cust-123",
          "name": "John Smith",
          "company": "ABC Corp",
          "phone": "(555) 123-4567",
          "email": "john@abccorp.com",
          "address": "123 Business Lane, Anytown, CA 91234"
        },
        "title": "Electrical Panel Upgrade",
        "description": "Upgrade main electrical panel from 100A to 200A",
        "status": "in_progress",
        "priority": "high",
        "assigned_technician_id": "tech-456",
        "technician": {
          "id": "tech-456",
          "name": "Mike Rodriguez",
          "phone": "(555) 987-6543",
          "specialization": "electrical"
        },
        "scheduled_date": "2024-01-15T09:00:00Z",
        "estimated_duration": 240, // minutes
        "estimated_cost": 1250.00,
        "actual_cost": null,
        "services": [
          {
            "id": "svc-789",
            "service_id": "T811272",
            "description": "Electrical Panel Upgrade 200A",
            "quantity": 1,
            "unit_price": 850.00,
            "total": 850.00
          }
        ],
        "materials": [
          {
            "id": "mat-101",
            "material_id": "mat-panel-200a",
            "description": "200A Main Panel",
            "quantity": 1,
            "unit_cost": 250.00,
            "markup_percentage": 35,
            "total": 337.50
          }
        ],
        "created_at": "2024-01-10T14:30:00Z",
        "updated_at": "2024-01-14T16:45:00Z",
        "notes": "Customer requested upgrade due to new equipment installation"
      }
    ],
    "total_count": 28,
    "has_more": true
  }
}
```

### 2. Create New Work Order
**Endpoint:** `POST /api/work-orders`
**Purpose:** Create a new work order from the CRM Dashboard
**Authentication:** Required (company-scoped)

#### Request Body
```javascript
{
  "customer_id": "cust-123",
  "title": "HVAC Maintenance",
  "description": "Annual HVAC system maintenance and inspection",
  "priority": "medium",
  "assigned_technician_id": "tech-789",
  "scheduled_date": "2024-01-20T10:00:00Z",
  "estimated_duration": 120,
  "services": [
    {
      "service_id": "H529014",
      "quantity": 1,
      "notes": "Complete system inspection"
    }
  ],
  "materials": [
    {
      "material_id": "mat-filter-20x25",
      "quantity": 2
    }
  ],
  "notes": "Customer reported unusual noises from unit"
}
```

#### Response Format
```javascript
{
  "success": true,
  "data": {
    "work_order": {
      "id": "wo-2023-029",
      "work_order_number": "WO-2023-029",
      // ... full work order object as above
    }
  },
  "message": "Work order created successfully"
}
```

### 3. Update Work Order Status
**Endpoint:** `PATCH /api/work-orders/{work_order_id}/status`
**Purpose:** Update work order status from dashboard cards
**Authentication:** Required (company-scoped)

#### Request Body
```javascript
{
  "status": "completed",
  "notes": "Work completed successfully. Customer satisfied.",
  "actual_duration": 180, // minutes
  "actual_cost": 1150.00,
  "completion_photos": [
    "photo-url-1.jpg",
    "photo-url-2.jpg"
  ]
}
```

### 4. Get Work Order Details
**Endpoint:** `GET /api/work-orders/{work_order_id}`
**Purpose:** Get detailed information for a specific work order
**Authentication:** Required (company-scoped)

## Frontend Implementation for Active Work Orders Component

### 1. Dashboard Cards Layout
```javascript
// React Component Structure
const ActiveWorkOrdersSection = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // active, pending, in_progress

  // Fetch active work orders on component mount
  useEffect(() => {
    fetchActiveWorkOrders();
  }, [filter]);

  const fetchActiveWorkOrders = async () => {
    try {
      const response = await fetch('/api/work-orders?' + new URLSearchParams({
        status: filter === 'active' ? undefined : filter,
        limit: '6', // Show 6 cards on dashboard
        sort: 'priority,scheduled_date'
      }), {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      setWorkOrders(data.data.work_orders);
    } catch (error) {
      console.error('Error fetching work orders:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="active-work-orders-section">
      <div className="section-header">
        <h3>Active Work Orders</h3>
        <div className="filter-tabs">
          <button 
            className={filter === 'active' ? 'active' : ''}
            onClick={() => setFilter('active')}
          >
            All Active
          </button>
          <button 
            className={filter === 'pending' ? 'active' : ''}
            onClick={() => setFilter('pending')}
          >
            Pending
          </button>
          <button 
            className={filter === 'in_progress' ? 'active' : ''}
            onClick={() => setFilter('in_progress')}
          >
            In Progress
          </button>
        </div>
      </div>
      
      <div className="work-orders-grid">
        {workOrders.map(workOrder => (
          <WorkOrderCard 
            key={workOrder.id} 
            workOrder={workOrder}
            onStatusUpdate={handleStatusUpdate}
          />
        ))}
      </div>
    </div>
  );
};
```

### 2. Work Order Card Component
```javascript
const WorkOrderCard = ({ workOrder, onStatusUpdate }) => {
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'border-l-green-500',
      'medium': 'border-l-yellow-500',
      'high': 'border-l-orange-500',
      'urgent': 'border-l-red-500'
    };
    return colors[priority] || 'border-l-gray-500';
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const response = await fetch(`/api/work-orders/${workOrder.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          notes: `Status updated to ${newStatus} from dashboard`
        })
      });

      if (response.ok) {
        onStatusUpdate(workOrder.id, newStatus);
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <div className={`work-order-card border-l-4 ${getPriorityColor(workOrder.priority)} bg-white rounded-lg shadow-sm p-4`}>
      {/* Header with Work Order Number and Status */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">{workOrder.work_order_number}</h4>
          <p className="text-sm text-gray-600">{workOrder.title}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(workOrder.status)}`}>
          {workOrder.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>

      {/* Customer Information */}
      <div className="mb-3">
        <p className="font-medium text-gray-900">{workOrder.customer.name}</p>
        <p className="text-sm text-gray-600">{workOrder.customer.company}</p>
        <p className="text-sm text-gray-600">{workOrder.customer.phone}</p>
      </div>

      {/* Technician and Schedule */}
      <div className="mb-3">
        <div className="flex items-center text-sm text-gray-600 mb-1">
          <span className="font-medium">Technician:</span>
          <span className="ml-1">{workOrder.technician?.name || 'Unassigned'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span className="font-medium">Scheduled:</span>
          <span className="ml-1">
            {new Date(workOrder.scheduled_date).toLocaleDateString()} at{' '}
            {new Date(workOrder.scheduled_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </span>
        </div>
      </div>

      {/* Cost Information */}
      <div className="mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Estimated Cost:</span>
          <span className="font-medium">${workOrder.estimated_cost.toFixed(2)}</span>
        </div>
        {workOrder.actual_cost && (
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Actual Cost:</span>
            <span className="font-medium">${workOrder.actual_cost.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="flex space-x-2">
        <button 
          className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded hover:bg-blue-700"
          onClick={() => window.open(`/work-orders/${workOrder.id}`, '_blank')}
        >
          View Details
        </button>
        
        {workOrder.status === 'pending' && (
          <button 
            className="flex-1 bg-green-600 text-white text-sm py-2 px-3 rounded hover:bg-green-700"
            onClick={() => handleStatusChange('in_progress')}
          >
            Start Work
          </button>
        )}
        
        {workOrder.status === 'in_progress' && (
          <button 
            className="flex-1 bg-purple-600 text-white text-sm py-2 px-3 rounded hover:bg-purple-700"
            onClick={() => handleStatusChange('completed')}
          >
            Complete
          </button>
        )}
      </div>
    </div>
  );
};
```

### 3. Real-time Updates
```javascript
// WebSocket or polling for real-time updates
const useWorkOrderUpdates = () => {
  const [workOrders, setWorkOrders] = useState([]);

  useEffect(() => {
    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket(`wss://${window.location.host}/ws/work-orders`);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      
      if (update.type === 'work_order_updated') {
        setWorkOrders(prev => 
          prev.map(wo => 
            wo.id === update.work_order.id 
              ? { ...wo, ...update.work_order }
              : wo
          )
        );
      }
      
      if (update.type === 'work_order_created') {
        setWorkOrders(prev => [update.work_order, ...prev]);
      }
    };

    return () => ws.close();
  }, []);

  return workOrders;
};
```

## API Error Handling

### Error Response Format
```javascript
{
  "success": false,
  "error": {
    "code": "WORK_ORDER_NOT_FOUND",
    "message": "Work order not found or access denied",
    "details": {
      "work_order_id": "wo-2023-001"
    }
  }
}
```

### Common Error Codes
- `WORK_ORDER_NOT_FOUND`: Work order doesn't exist or user lacks access
- `INVALID_STATUS_TRANSITION`: Cannot change from current status to requested status
- `TECHNICIAN_NOT_AVAILABLE`: Assigned technician is not available for scheduled time
- `CUSTOMER_NOT_FOUND`: Referenced customer doesn't exist
- `VALIDATION_ERROR`: Request data validation failed
- `INSUFFICIENT_PERMISSIONS`: User lacks permission for this operation

## Performance Considerations

### 1. Pagination and Filtering
```javascript
// Efficient loading for dashboard
const fetchWorkOrders = async (page = 1, filters = {}) => {
  const params = new URLSearchParams({
    limit: '6',
    offset: (page - 1) * 6,
    ...filters
  });
  
  return fetch(`/api/work-orders?${params}`);
};
```

### 2. Caching Strategy
```javascript
// Cache work orders for 5 minutes
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const cachedFetch = async (url) => {
  const cacheKey = `work_orders_${url}`;
  const cached = localStorage.getItem(cacheKey);
  
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  
  const response = await fetch(url);
  const data = await response.json();
  
  localStorage.setItem(cacheKey, JSON.stringify({
    data,
    timestamp: Date.now()
  }));
  
  return data;
};
```

### 3. Optimistic Updates
```javascript
const updateWorkOrderStatus = async (workOrderId, newStatus) => {
  // Optimistically update UI
  setWorkOrders(prev => 
    prev.map(wo => 
      wo.id === workOrderId 
        ? { ...wo, status: newStatus }
        : wo
    )
  );
  
  try {
    await fetch(`/api/work-orders/${workOrderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
  } catch (error) {
    // Revert on error
    setWorkOrders(prev => 
      prev.map(wo => 
        wo.id === workOrderId 
          ? { ...wo, status: originalStatus }
          : wo
      )
    );
    throw error;
  }
};
```

## Integration with Other CRM Components

### 1. Customer Integration
- Click customer name to view customer details
- Quick access to customer history and contact information
- Integration with Recent Customers component

### 2. Scheduling Integration
- Work orders appear on Today's Schedule
- Calendar integration for scheduling and rescheduling
- Technician availability checking

### 3. Invoicing Integration
- Convert completed work orders to invoices
- Pre-populate invoice with work order details
- Track payment status for completed work

### 4. Analytics Integration
- Work order completion rates
- Average completion time
- Revenue per work order
- Technician performance metrics

This comprehensive API specification ensures the Active Work Orders component provides real-time, interactive work order management with seamless integration into the broader CRM ecosystem.

