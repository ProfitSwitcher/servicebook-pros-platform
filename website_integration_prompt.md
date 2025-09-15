# ServiceBook Pros Website Integration Prompt

## Project Overview
Integrate a complete flat rate pricing database (4,153 electrical services across 26 categories) into the ServiceBook Pros website. Create a seamless connection between the React frontend and Flask backend to provide contractors with a professional pricing lookup and estimate building system.

## Database Specifications

### Backend API (Flask)
- **Base URL**: `http://localhost:5000/api/`
- **Database**: SQLite with 4,153 pricing items
- **Categories**: 26 electrical service categories
- **Service Codes**: Professional format (TRO001, SER001, PAN001, etc.)

### Key API Endpoints
```
GET /api/pricing-items - All pricing items
GET /api/categories - All 26 categories
GET /api/pricing-items?category_id=X - Items by category
GET /api/pricing-items?search=keyword - Search functionality
POST /api/invoices - Create new invoice
GET /api/invoices - List all invoices
GET /api/customers - Customer management
```

### Database Schema
```sql
PricingItem:
- id (Primary Key)
- code (Service Code: TRO001, SER001, etc.)
- title (Service Title)
- description (Detailed description)
- category_id (Foreign Key)
- base_price (Decimal)
- labor_hours (Decimal)
- material_cost (Decimal)

Category:
- id (Primary Key)
- name (Category Name)
- description (Category Description)
```

## Frontend Requirements

### 1. Main Pricing Interface
Create a professional contractor-facing pricing lookup system:

**Search & Filter Section:**
- Search bar with real-time filtering
- Category dropdown (26 categories)
- Category filter buttons/tabs
- Results counter showing "X of 4,153 services"

**Pricing Display Grid:**
- Service cards showing:
  - Service code (TRO001, SER001, etc.)
  - Service title
  - Description (truncated with "Read more")
  - Price in large, bold text
  - Labor hours estimate
  - "Add to Estimate" button
- Responsive grid (3-4 cards per row desktop, 1-2 mobile)
- Infinite scroll or pagination for 4,153 items

**Estimate Sidebar:**
- Running list of selected services
- Quantity controls (+/- buttons)
- Line item totals
- Subtotal calculation
- Tax calculation (configurable %)
- Grand total
- "Create Invoice" button
- "Clear Estimate" button

### 2. Category Organization
**26 Categories to implement:**
1. Appliance & Equipment Wiring
2. Audio & Visual
3. Baseboard & Wall Heaters
4. Breakers & Fuses
5. Bulbs & Ballasts
6. Ceiling Fans & Controls
7. Data, Phone, Security
8. Disconnects & Safety Switches
9. Doorbells & Cctv
10. Ev & Rv Stations
11. Exhaust Fans
12. Exterior & Specialty Lighting
13. Fire & Safety
14. Generators
15. Home Automation & Controls
16. Install Customers Supplied Items
17. Interior Lighting
18. Miscellaneous Electrical
19. Panels & Sub Panels
20. Piping, Raceways & Boxes
21. Service Entrances & Upgrades
22. Switches, Outlets & Control Devices
23. Thermostats
24. Troubleshooting, Code & Repair
25. Water Heaters
26. Wiring & Adding Circuits

### 3. Search Functionality
Implement comprehensive search across:
- Service codes (TRO001, SER001, etc.)
- Service titles
- Descriptions
- Category names
- Price ranges

**Search Features:**
- Real-time search as user types
- Search suggestions/autocomplete
- "No results found" handling
- Search result highlighting
- Recent searches (localStorage)

### 4. Invoice Generation
**Invoice Creation Flow:**
1. User builds estimate with multiple services
2. Clicks "Create Invoice"
3. System generates unique invoice number
4. Saves to database with line items
5. Shows success modal with invoice number
6. Clears estimate for next job

**Invoice Data Structure:**
```json
{
  "invoice_number": "INV-20250904-ABC123",
  "customer_id": 1,
  "line_items": [
    {
      "service_code": "TRO001",
      "description": "Service description",
      "quantity": 1,
      "unit_price": 523.80,
      "total": 523.80
    }
  ],
  "subtotal": 523.80,
  "tax_rate": 0.085,
  "tax_amount": 44.52,
  "total": 568.32,
  "status": "draft"
}
```

## Technical Implementation

### Frontend Technology Stack
- **React 18+** with functional components and hooks
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Query** for data fetching and caching
- **React Router** for navigation
- **Zustand** or **Redux Toolkit** for state management

### Key React Components to Build

**1. PricingSearch Component**
```jsx
interface PricingSearchProps {
  onSearch: (query: string) => void;
  onCategoryFilter: (categoryId: number) => void;
}
```

**2. ServiceCard Component**
```jsx
interface ServiceCardProps {
  service: {
    id: number;
    code: string;
    title: string;
    description: string;
    base_price: number;
    labor_hours: number;
    category: string;
  };
  onAddToEstimate: (service: Service) => void;
}
```

**3. EstimateSidebar Component**
```jsx
interface EstimateSidebarProps {
  items: EstimateItem[];
  onUpdateQuantity: (id: number, quantity: number) => void;
  onRemoveItem: (id: number) => void;
  onCreateInvoice: () => void;
  onClearEstimate: () => void;
}
```

**4. CategoryFilter Component**
```jsx
interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: number | null;
  onCategorySelect: (categoryId: number) => void;
}
```

### API Integration Patterns

**Data Fetching with React Query:**
```jsx
// Fetch all pricing items
const { data: pricingItems, isLoading } = useQuery({
  queryKey: ['pricing-items'],
  queryFn: () => api.get('/pricing-items').then(res => res.data)
});

// Search pricing items
const { data: searchResults } = useQuery({
  queryKey: ['pricing-items', searchQuery, categoryId],
  queryFn: () => api.get(`/pricing-items?search=${searchQuery}&category_id=${categoryId}`)
});
```

**State Management:**
```jsx
// Estimate state management
const useEstimateStore = create((set) => ({
  items: [],
  addItem: (service) => set((state) => ({
    items: [...state.items, { ...service, quantity: 1 }]
  })),
  updateQuantity: (id, quantity) => set((state) => ({
    items: state.items.map(item => 
      item.id === id ? { ...item, quantity } : item
    )
  })),
  removeItem: (id) => set((state) => ({
    items: state.items.filter(item => item.id !== id)
  })),
  clearEstimate: () => set({ items: [] })
}));
```

### Performance Optimization

**1. Virtualization for Large Lists**
- Use `react-window` or `react-virtualized` for 4,153 items
- Implement infinite scrolling with `react-infinite-scroll-component`

**2. Search Optimization**
- Debounce search input (300ms delay)
- Cache search results with React Query
- Implement search result pagination

**3. Data Caching**
- Cache pricing items and categories
- Use React Query for automatic background refetching
- Implement optimistic updates for estimate changes

### Mobile Responsiveness

**Responsive Design Requirements:**
- Mobile-first approach
- Touch-friendly buttons (minimum 44px)
- Collapsible sidebar on mobile
- Swipe gestures for category navigation
- Large, readable text for job site use

**Mobile-Specific Features:**
- Sticky search bar
- Bottom sheet for estimate summary
- Quick category tabs
- Large "Add to Estimate" buttons

## Integration Steps

### Phase 1: Basic Integration
1. Set up API client and base components
2. Implement pricing item display
3. Add basic search functionality
4. Create estimate building functionality

### Phase 2: Advanced Features
1. Add category filtering
2. Implement invoice generation
3. Add customer management
4. Create invoice history

### Phase 3: Optimization
1. Add virtualization for performance
2. Implement advanced search features
3. Add mobile optimizations
4. Performance testing and optimization

## Testing Requirements

**Unit Tests:**
- Component rendering
- API integration
- State management
- Search functionality

**Integration Tests:**
- End-to-end estimate building
- Invoice creation workflow
- Search and filter combinations

**Performance Tests:**
- Large dataset handling (4,153 items)
- Search performance
- Mobile performance

## Deployment Considerations

**Environment Variables:**
```env
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_TAX_RATE=0.085
REACT_APP_COMPANY_NAME=ServiceBook Pros
```

**Build Optimization:**
- Code splitting by routes
- Lazy loading for heavy components
- Bundle size optimization
- CDN integration for static assets

## Success Metrics

**Functionality:**
- All 4,153 pricing items accessible
- Search returns results in <500ms
- Estimate building works seamlessly
- Invoice generation completes successfully

**Performance:**
- Initial page load <3 seconds
- Search results display <1 second
- Mobile performance score >90
- Bundle size <2MB

**User Experience:**
- Intuitive navigation through 26 categories
- Easy estimate building workflow
- Professional invoice generation
- Mobile-friendly interface

This integration will create a professional, production-ready pricing system that contractors can use confidently in the field while providing ServiceBook Pros with a competitive advantage over Profit Rhino and other competitors.

