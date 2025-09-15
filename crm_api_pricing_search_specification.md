# ServiceBook Pros - CRM API Usage for Pricing Search Interface

## Overview
This document details the CRM API usage for the Pricing Search Interface in the ServiceBook Pros CRM Dashboard. The Pricing Search Interface provides real-time service catalog search, pricing lookup, and estimate building capabilities for contractors.

## API Endpoints for Pricing Search

### 1. Search Services
**Endpoint:** `GET /api/services/search`
**Purpose:** Search service catalog with real-time filtering
**Authentication:** Required (company-scoped)

#### Request Parameters
```javascript
{
  q?: string,                    // Search query
  category?: 'electrical' | 'hvac' | 'plumbing' | 'general',
  subcategory?: string,          // Specific subcategory filter
  price_min?: number,            // Minimum price filter
  price_max?: number,            // Maximum price filter
  limit?: number,                // Results per page (default: 20)
  offset?: number,               // Pagination offset
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'name'
}
```

#### Response Format
```javascript
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "svc-T811272",
        "service_code": "T811272",
        "name": "Outlet Testing",
        "category": "electrical",
        "subcategory": "testing",
        "description": "Full inspection and testing of all outlets in a standard residential room.",
        "base_price": 350.00,
        "company_price": 423.70,        // With company markup
        "labor_hours": 2.5,
        "difficulty": "medium",
        "materials_included": false,
        "common_materials": [
          {
            "material_id": "mat-outlet-standard",
            "description": "Standard Outlet",
            "typical_quantity": 1,
            "unit_price": 12.50
          }
        ],
        "tags": ["testing", "safety", "inspection", "residential"],
        "popularity_score": 8.5,
        "last_used": "2024-01-10T14:30:00Z"
      },
      {
        "id": "svc-H529014", 
        "service_code": "H529014",
        "name": "HVAC Maintenance",
        "category": "hvac",
        "subcategory": "maintenance",
        "description": "Comprehensive annual tune-up for furnace and air conditioning units.",
        "base_price": 250.00,
        "company_price": 315.50,
        "labor_hours": 2.0,
        "difficulty": "easy",
        "materials_included": true,
        "common_materials": [
          {
            "material_id": "mat-filter-20x25",
            "description": "20x25 Air Filter",
            "typical_quantity": 2,
            "unit_price": 8.50
          }
        ],
        "tags": ["maintenance", "hvac", "annual", "tune-up"],
        "popularity_score": 9.2,
        "last_used": "2024-01-08T09:15:00Z"
      }
    ],
    "categories": [
      {
        "name": "electrical",
        "count": 45,
        "subcategories": [
          { "name": "installation", "count": 15 },
          { "name": "repair", "count": 18 },
          { "name": "testing", "count": 12 }
        ]
      },
      {
        "name": "hvac", 
        "count": 32,
        "subcategories": [
          { "name": "installation", "count": 10 },
          { "name": "maintenance", "count": 12 },
          { "name": "repair", "count": 10 }
        ]
      }
    ],
    "total_results": 77,
    "search_suggestions": [
      "outlet installation",
      "panel upgrade", 
      "hvac tune-up"
    ]
  }
}
```

### 2. Get Service Details
**Endpoint:** `GET /api/services/{service_id}`
**Purpose:** Get detailed information for a specific service
**Authentication:** Required (company-scoped)

#### Response Format
```javascript
{
  "success": true,
  "data": {
    "service": {
      "id": "svc-T811272",
      "service_code": "T811272", 
      "name": "Outlet Testing",
      "category": "electrical",
      "subcategory": "testing",
      "description": "Full inspection and testing of all outlets in a standard residential room.",
      "detailed_description": "Comprehensive electrical outlet testing including voltage verification, ground fault testing, polarity checks, and safety inspection. Includes documentation of findings and recommendations.",
      "base_price": 350.00,
      "company_price": 423.70,
      "pricing_breakdown": {
        "base_labor": 250.00,
        "base_materials": 50.00,
        "base_overhead": 50.00,
        "company_markup": 20.5,        // Percentage
        "final_price": 423.70
      },
      "labor_hours": 2.5,
      "difficulty": "medium",
      "required_certifications": ["electrical"],
      "tools_required": ["multimeter", "gfci_tester", "outlet_tester"],
      "safety_requirements": ["ppe", "lockout_tagout"],
      "materials_included": false,
      "recommended_materials": [
        {
          "material_id": "mat-outlet-standard",
          "description": "Standard 15A Outlet",
          "category": "electrical",
          "typical_quantity": 1,
          "unit_cost": 8.50,
          "unit_price": 12.50,
          "markup_percentage": 35
        }
      ],
      "related_services": [
        {
          "service_id": "svc-T811273",
          "name": "Outlet Installation",
          "price": 185.50
        }
      ],
      "usage_statistics": {
        "times_used": 45,
        "average_rating": 4.8,
        "last_used": "2024-01-10T14:30:00Z",
        "popular_with": ["residential", "commercial"]
      }
    }
  }
}
```

### 3. Create Estimate
**Endpoint:** `POST /api/estimates`
**Purpose:** Create a new estimate from selected services
**Authentication:** Required (company-scoped)

#### Request Body
```javascript
{
  "customer_id": "cust-123",
  "estimate_name": "Electrical Inspection & Repair",
  "services": [
    {
      "service_id": "svc-T811272",
      "quantity": 1,
      "custom_price": null,        // Use default pricing
      "notes": "Testing all outlets in main floor"
    },
    {
      "service_id": "svc-H529014", 
      "quantity": 1,
      "custom_price": 350.00,      // Custom pricing override
      "notes": "Annual HVAC maintenance"
    }
  ],
  "materials": [
    {
      "material_id": "mat-outlet-standard",
      "quantity": 3,
      "custom_price": null
    }
  ],
  "discount_percentage": 0,
  "tax_rate": 8.5,
  "notes": "Comprehensive home inspection and maintenance package",
  "valid_until": "2024-02-15T23:59:59Z"
}
```

#### Response Format
```javascript
{
  "success": true,
  "data": {
    "estimate": {
      "id": "est-2024-001",
      "estimate_number": "EST-2024-001",
      "customer_id": "cust-123",
      "customer": {
        "name": "John Smith",
        "company": "ABC Corp",
        "email": "john@abccorp.com"
      },
      "status": "draft",
      "created_date": "2024-01-15T10:30:00Z",
      "valid_until": "2024-02-15T23:59:59Z",
      "line_items": [
        {
          "type": "service",
          "service_id": "svc-T811272",
          "description": "Outlet Testing",
          "quantity": 1,
          "unit_price": 423.70,
          "total": 423.70
        },
        {
          "type": "service", 
          "service_id": "svc-H529014",
          "description": "HVAC Maintenance",
          "quantity": 1,
          "unit_price": 350.00,
          "total": 350.00
        },
        {
          "type": "material",
          "material_id": "mat-outlet-standard", 
          "description": "Standard 15A Outlet",
          "quantity": 3,
          "unit_price": 12.50,
          "total": 37.50
        }
      ],
      "subtotal": 811.20,
      "discount_amount": 0,
      "tax_amount": 68.95,
      "total_amount": 880.15,
      "notes": "Comprehensive home inspection and maintenance package"
    }
  }
}
```

### 4. Convert Estimate to Work Order
**Endpoint:** `POST /api/estimates/{estimate_id}/convert`
**Purpose:** Convert approved estimate to work order
**Authentication:** Required (company-scoped)

#### Request Body
```javascript
{
  "scheduled_date": "2024-01-20T09:00:00Z",
  "assigned_technician_id": "tech-456",
  "priority": "medium",
  "notes": "Customer approved estimate - proceed with work"
}
```

## Frontend Implementation

### 1. Pricing Search Interface
```javascript
const PricingSearchInterface = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [services, setServices] = useState([]);
  const [currentEstimate, setCurrentEstimate] = useState({
    services: [],
    materials: [],
    subtotal: 0,
    tax_amount: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);

  const searchServices = async (query, category = '') => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        category: category,
        limit: '20',
        sort: 'relevance'
      });

      const response = await fetch(`/api/services/search?${params}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      const data = await response.json();
      setServices(data.data.services);
    } catch (error) {
      console.error('Error searching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToEstimate = (service) => {
    setCurrentEstimate(prev => {
      const existingIndex = prev.services.findIndex(s => s.service_id === service.id);
      
      if (existingIndex >= 0) {
        // Increase quantity if already in estimate
        const updatedServices = [...prev.services];
        updatedServices[existingIndex].quantity += 1;
        return {
          ...prev,
          services: updatedServices
        };
      } else {
        // Add new service to estimate
        return {
          ...prev,
          services: [
            ...prev.services,
            {
              service_id: service.id,
              name: service.name,
              description: service.description,
              quantity: 1,
              unit_price: service.company_price,
              total: service.company_price
            }
          ]
        };
      }
    });
  };

  const calculateEstimateTotal = () => {
    const subtotal = currentEstimate.services.reduce((sum, service) => {
      return sum + (service.quantity * service.unit_price);
    }, 0) + currentEstimate.materials.reduce((sum, material) => {
      return sum + (material.quantity * material.unit_price);
    }, 0);
    
    const tax_amount = subtotal * 0.085; // 8.5% tax
    const total = subtotal + tax_amount;
    
    return { subtotal, tax_amount, total };
  };

  useEffect(() => {
    if (searchQuery.length > 2) {
      const debounceTimer = setTimeout(() => {
        searchServices(searchQuery, selectedCategory);
      }, 300);
      
      return () => clearTimeout(debounceTimer);
    }
  }, [searchQuery, selectedCategory]);

  const { subtotal, tax_amount, total } = calculateEstimateTotal();

  return (
    <div className="pricing-search-interface grid grid-cols-3 gap-6 h-screen">
      {/* Left Column - Categories */}
      <div className="categories-sidebar bg-blue-600 text-white p-4">
        <h3 className="text-lg font-semibold mb-4">Categories</h3>
        <div className="space-y-2">
          {[
            { id: '', name: 'All Services', icon: '🔧' },
            { id: 'electrical', name: 'Electrical', icon: '⚡' },
            { id: 'hvac', name: 'HVAC', icon: '❄️' },
            { id: 'plumbing', name: 'Plumbing', icon: '🚰' },
            { id: 'general', name: 'General', icon: '🛠️' }
          ].map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`w-full text-left p-3 rounded flex items-center space-x-2 ${
                selectedCategory === category.id 
                  ? 'bg-blue-800' 
                  : 'hover:bg-blue-700'
              }`}
            >
              <span>{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Middle Column - Search & Results */}
      <div className="search-results-section">
        {/* Search Bar */}
        <div className="search-bar mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search for electrical, HVAC, or plumbing services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-3 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <button className="absolute right-3 top-3 text-blue-600">
              🔍
            </button>
          </div>
        </div>

        {/* Service Results */}
        <div className="service-results">
          <h3 className="text-lg font-semibold mb-3">Service & Pricing Lookup</h3>
          
          {loading ? (
            <div className="text-center py-8">Loading services...</div>
          ) : (
            <div className="space-y-3">
              {services.map(service => (
                <ServiceCard
                  key={service.id}
                  service={service}
                  onAddToEstimate={addToEstimate}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Current Estimate */}
      <div className="current-estimate-section bg-gray-50 p-4">
        <h3 className="text-lg font-semibold mb-4">Current Estimate</h3>
        
        {currentEstimate.services.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No services added yet</p>
            <p className="text-sm">Click "Add to Estimate" to get started</p>
          </div>
        ) : (
          <>
            <div className="estimate-items space-y-2 mb-4">
              {currentEstimate.services.map((service, index) => (
                <EstimateLineItem
                  key={index}
                  item={service}
                  onQuantityChange={(newQuantity) => {
                    const updatedServices = [...currentEstimate.services];
                    updatedServices[index].quantity = newQuantity;
                    updatedServices[index].total = newQuantity * service.unit_price;
                    setCurrentEstimate(prev => ({
                      ...prev,
                      services: updatedServices
                    }));
                  }}
                  onRemove={() => {
                    setCurrentEstimate(prev => ({
                      ...prev,
                      services: prev.services.filter((_, i) => i !== index)
                    }));
                  }}
                />
              ))}
            </div>

            <div className="estimate-totals bg-white p-4 rounded border">
              <div className="flex justify-between mb-2">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Tax (8.5%):</span>
                <span>${tax_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2">
                <span>Total:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => finalizeEstimate()}
              className="w-full bg-blue-600 text-white py-3 rounded-lg mt-4 font-semibold"
            >
              Finalize Estimate
            </button>
          </>
        )}
      </div>
    </div>
  );
};
```

### 2. Service Card Component
```javascript
const ServiceCard = ({ service, onAddToEstimate }) => {
  const getCategoryColor = (category) => {
    const colors = {
      'electrical': 'border-l-blue-500 bg-blue-50',
      'hvac': 'border-l-green-500 bg-green-50', 
      'plumbing': 'border-l-orange-500 bg-orange-50',
      'general': 'border-l-gray-500 bg-gray-50'
    };
    return colors[category] || colors.general;
  };

  return (
    <div className={`service-card border-l-4 ${getCategoryColor(service.category)} bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-gray-900">{service.name}</h4>
          <p className="text-sm text-gray-600">Code: {service.service_code}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">
            ${service.company_price.toFixed(2)}
          </div>
          {service.base_price !== service.company_price && (
            <div className="text-sm text-gray-500 line-through">
              ${service.base_price.toFixed(2)}
            </div>
          )}
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-3">{service.description}</p>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
        <span>⏱️ {service.labor_hours}h</span>
        <span>📊 {service.difficulty}</span>
        <span>⭐ {service.popularity_score}/10</span>
      </div>

      {service.common_materials && service.common_materials.length > 0 && (
        <div className="materials-preview mb-3">
          <p className="text-xs text-gray-500 mb-1">Common materials:</p>
          <div className="flex flex-wrap gap-1">
            {service.common_materials.slice(0, 2).map((material, index) => (
              <span key={index} className="text-xs bg-gray-200 px-2 py-1 rounded">
                {material.description}
              </span>
            ))}
            {service.common_materials.length > 2 && (
              <span className="text-xs text-gray-500">
                +{service.common_materials.length - 2} more
              </span>
            )}
          </div>
        </div>
      )}

      <button
        onClick={() => onAddToEstimate(service)}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        Add to Estimate
      </button>
    </div>
  );
};
```

### 3. Estimate Line Item Component
```javascript
const EstimateLineItem = ({ item, onQuantityChange, onRemove }) => {
  return (
    <div className="estimate-line-item bg-white p-3 rounded border">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h5 className="font-medium text-sm">{item.name}</h5>
          <p className="text-xs text-gray-600">{item.description}</p>
        </div>
        <button
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 ml-2"
        >
          ×
        </button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onQuantityChange(Math.max(1, item.quantity - 1))}
            className="w-6 h-6 bg-gray-200 rounded text-sm"
          >
            -
          </button>
          <span className="w-8 text-center text-sm">{item.quantity}</span>
          <button
            onClick={() => onQuantityChange(item.quantity + 1)}
            className="w-6 h-6 bg-gray-200 rounded text-sm"
          >
            +
          </button>
        </div>
        
        <div className="text-right">
          <div className="font-medium">${item.total.toFixed(2)}</div>
          <div className="text-xs text-gray-500">
            ${item.unit_price.toFixed(2)} each
          </div>
        </div>
      </div>
    </div>
  );
};
```

## Integration Features

### 1. Real-time Search
- Debounced search queries for performance
- Category-based filtering
- Autocomplete suggestions
- Search history tracking

### 2. Estimate Management
- Running total calculations
- Tax calculations
- Discount applications
- Save and recall estimates

### 3. Work Order Integration
- Convert estimates to work orders
- Customer assignment
- Scheduling integration
- Status tracking

### 4. Mobile Optimization
- Touch-friendly interface
- Responsive grid layouts
- Swipe gestures for categories
- Optimized for field use

This comprehensive specification ensures the Pricing Search Interface provides powerful service discovery and estimate building capabilities with seamless integration into the CRM workflow.

