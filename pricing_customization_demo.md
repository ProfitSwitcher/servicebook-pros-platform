# ServiceBook Pros Multi-Tenant Pricing Customization Demo

## 🏢 **Multi-Tenant Company Isolation**

### Elite Electrical Services (Austin, TX)
- **Company Code:** FVZ9ICP8
- **User:** Sarah Johnson (elite_admin)
- **Base Labor Rate:** $195/hour
- **Tax Rate:** 8.25% (Texas combined)
- **Location:** Austin, TX 78701

### Coastal Electric Co (Miami, FL)
- **Company Code:** E1AYCCIK  
- **User:** Mike Rodriguez (coastal_admin)
- **Base Labor Rate:** $175/hour
- **Tax Rate:** 7.00% (Florida rate)
- **Location:** Miami, FL 33139

## 💰 **Pricing Customization Features**

### 1. Labor Rate Management
Each company can create multiple labor rates:

**Elite Electrical Example:**
```json
{
  "standard_rate": {
    "description": "Standard Electrical Work",
    "hourly_cost": 117.00,
    "hourly_price": 195.00,
    "markup_percentage": 66.67,
    "is_default": true
  },
  "emergency_rate": {
    "description": "Emergency After-Hours",
    "hourly_cost": 117.00,
    "hourly_price": 295.00,
    "markup_percentage": 152.14,
    "is_default": false
  },
  "apprentice_rate": {
    "description": "Apprentice Work",
    "hourly_cost": 75.00,
    "hourly_price": 125.00,
    "markup_percentage": 66.67,
    "is_default": false
  }
}
```

**Coastal Electric Example:**
```json
{
  "standard_rate": {
    "description": "Standard Electrical Work",
    "hourly_cost": 105.00,
    "hourly_price": 175.00,
    "markup_percentage": 66.67,
    "is_default": true
  },
  "weekend_rate": {
    "description": "Weekend Premium",
    "hourly_cost": 105.00,
    "hourly_price": 225.00,
    "markup_percentage": 114.29,
    "is_default": false
  }
}
```

### 2. Tax Rate Management
Companies can create multiple tax rates for different scenarios:

**Elite Electrical (Texas):**
```json
{
  "texas_state": {
    "description": "Texas State Tax",
    "rate": 0.0625,
    "is_default": false
  },
  "austin_local": {
    "description": "Austin Local Tax",
    "rate": 0.02,
    "is_default": false
  },
  "combined_default": {
    "description": "Texas Combined Rate",
    "rate": 0.0825,
    "is_default": true
  }
}
```

**Coastal Electric (Florida):**
```json
{
  "florida_state": {
    "description": "Florida State Tax",
    "rate": 0.06,
    "is_default": false
  },
  "miami_local": {
    "description": "Miami-Dade Local",
    "rate": 0.01,
    "is_default": false
  },
  "combined_default": {
    "description": "Florida Combined Rate",
    "rate": 0.07,
    "is_default": true
  }
}
```

### 3. Service Price Customization
Each company can override individual service pricing:

**Example: Basic Electrical Safety Inspection (EL-01-001)**

**Master Service Data:**
- Base Regional Price: $325.00
- Labor Hours: 2.0
- Material Cost: $25.00

**Elite Electrical Custom Pricing:**
```json
{
  "service_code": "EL-01-001",
  "custom_name": "Premium Safety Inspection",
  "custom_description": "Comprehensive electrical safety inspection with infrared imaging and detailed report",
  "pricing_method": "fixed_price",
  "custom_price": 495.00,
  "effective_price": 495.00
}
```

**Coastal Electric Custom Pricing:**
```json
{
  "service_code": "EL-01-001", 
  "custom_name": "Standard Safety Inspection",
  "custom_description": "Professional electrical safety inspection",
  "pricing_method": "percentage_adjustment",
  "adjustment_percentage": -10.0,
  "calculated_price": 375.00,
  "effective_price": 337.50
}
```

### 4. Bulk Pricing Adjustments
Companies can apply bulk adjustments to categories:

**Elite Electrical - Premium Positioning:**
```json
{
  "adjustment_type": "increase",
  "method": "percentage",
  "amount": 15.0,
  "apply_to": "all_services",
  "reason": "Premium service positioning"
}
```

**Coastal Electric - Competitive Pricing:**
```json
{
  "adjustment_type": "decrease", 
  "method": "percentage",
  "amount": 8.0,
  "apply_to": "troubleshooting_category",
  "reason": "Competitive market positioning"
}
```

## 🔐 **Data Isolation Examples**

### Same Service, Different Company Pricing

**Service: Install GFCI Outlet (EL-02-015)**
- Master Price: $180.00
- Labor: 1.0 hour
- Materials: $35.00

**Elite Electrical (FVZ9ICP8):**
- Labor Rate: $195/hour
- Calculated Price: $230.00 (1.0 × $195 + $35)
- Tax Applied: 8.25%
- Final Price: $248.98

**Coastal Electric (E1AYCCIK):**
- Labor Rate: $175/hour  
- Calculated Price: $210.00 (1.0 × $175 + $35)
- Tax Applied: 7.00%
- Final Price: $224.70

### Company-Specific Features

**Elite Electrical Dashboard:**
- Can only see FVZ9ICP8 company data
- Cannot access Coastal Electric information
- Custom pricing reflects $195/hour labor rate
- Texas tax rates and regulations

**Coastal Electric Dashboard:**
- Can only see E1AYCCIK company data
- Cannot access Elite Electrical information  
- Custom pricing reflects $175/hour labor rate
- Florida tax rates and regulations

## 🎯 **Business Impact**

### Revenue Optimization
- **Elite:** Premium pricing strategy (+15-20% over base)
- **Coastal:** Competitive pricing strategy (-5-10% under competitors)
- **Both:** Maintain profitability with different market approaches

### Operational Efficiency
- **Automated Calculations:** Labor rates automatically update all service pricing
- **Regional Compliance:** Tax rates match local requirements
- **Brand Consistency:** Each company maintains their pricing strategy
- **Scalability:** System handles hundreds of companies independently

## 🚀 **System Capabilities Proven**

✅ **Multi-Tenant Architecture:** Complete data isolation
✅ **Custom Labor Rates:** Multiple rates per company
✅ **Custom Tax Rates:** Regional compliance support  
✅ **Service Customization:** Individual price overrides
✅ **Bulk Adjustments:** Category-wide pricing changes
✅ **Automatic Calculations:** Real-time price updates
✅ **Professional Interface:** Mobile-optimized dashboards
✅ **Secure Authentication:** Company-specific access control

The ServiceBook Pros multi-tenant system provides electrical contractors with complete pricing control while maintaining the simplicity and power they need to compete with larger companies.

