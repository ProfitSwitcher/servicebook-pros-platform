import React, { useState, useEffect } from 'react'
import './App.css'

// API base URL
const API_BASE = 'https://3dhkilc8mm66.manus.space/api/pricing'

function App() {
  const [categories, setCategories] = useState([])
  const [subcategories, setSubcategories] = useState([])
  const [services, setServices] = useState([])
  const [currentView, setCurrentView] = useState('categories') // 'categories', 'subcategories', 'services'
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [selectedSubcategory, setSelectedSubcategory] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [estimate, setEstimate] = useState([])
  const [showEstimate, setShowEstimate] = useState(false)
  const [loading, setLoading] = useState(false)

  // Load categories on component mount
  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/categories`)
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSubcategories = async (categoryCode) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/categories/${categoryCode}/subcategories`)
      const data = await response.json()
      if (data.success) {
        setSubcategories(data.subcategories)
        setCurrentView('subcategories')
        setSelectedCategory(categoryCode)
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchServices = async (subcategoryCode) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/subcategories/${subcategoryCode}/services?per_page=50`)
      const data = await response.json()
      if (data.success) {
        setServices(data.services)
        setCurrentView('services')
        setSelectedSubcategory(subcategoryCode)
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchServices = async (query) => {
    if (!query.trim()) {
      setServices([])
      setCurrentView('categories')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(`${API_BASE}/services/search?q=${encodeURIComponent(query)}&per_page=50`)
      const data = await response.json()
      if (data.success) {
        setServices(data.services)
        setCurrentView('services')
        setSelectedCategory(null)
        setSelectedSubcategory(null)
      }
    } catch (error) {
      console.error('Error searching services:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToEstimate = (service) => {
    const existingItem = estimate.find(item => item.service_code === service.service_code)
    if (existingItem) {
      setEstimate(estimate.map(item =>
        item.service_code === service.service_code
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      setEstimate([...estimate, { ...service, quantity: 1 }])
    }
  }

  const updateQuantity = (serviceCode, newQuantity) => {
    if (newQuantity <= 0) {
      setEstimate(estimate.filter(item => item.service_code !== serviceCode))
    } else {
      setEstimate(estimate.map(item =>
        item.service_code === serviceCode
          ? { ...item, quantity: newQuantity }
          : item
      ))
    }
  }

  const calculateTotal = () => {
    return estimate.reduce((total, item) => total + (item.base_price * item.quantity), 0)
  }

  const generateInvoice = async () => {
    if (estimate.length === 0) {
      alert('Please add services to your estimate first.')
      return
    }

    const customerInfo = {
      name: prompt('Customer Name:') || 'Customer',
      address: prompt('Customer Address:') || '',
      email: prompt('Customer Email:') || '',
      phone: prompt('Customer Phone:') || ''
    }

    try {
      const response = await fetch(`${API_BASE}/invoices/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          estimate: estimate,
          customer: customerInfo
        })
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = 'servicebook-pros-invoice.html'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        alert('Error generating invoice')
      }
    } catch (error) {
      console.error('Error generating invoice:', error)
      alert('Error generating invoice')
    }
  }

  const goBack = () => {
    if (currentView === 'services') {
      if (selectedSubcategory) {
        // Go back to subcategories
        setCurrentView('subcategories')
        setServices([])
        setSelectedSubcategory(null)
      } else {
        // Go back to categories (from search results)
        setCurrentView('categories')
        setServices([])
        setSearchTerm('')
      }
    } else if (currentView === 'subcategories') {
      // Go back to categories
      setCurrentView('categories')
      setSubcategories([])
      setSelectedCategory(null)
    }
  }

  const renderBreadcrumb = () => {
    const breadcrumbs = []
    
    if (currentView === 'categories') {
      breadcrumbs.push('Categories')
    } else if (currentView === 'subcategories') {
      const category = categories.find(cat => cat.category_code === selectedCategory)
      breadcrumbs.push('Categories', category?.category_name || selectedCategory)
    } else if (currentView === 'services') {
      if (selectedSubcategory) {
        const category = categories.find(cat => cat.category_code === selectedCategory)
        const subcategory = subcategories.find(sub => sub.subcategory_code === selectedSubcategory)
        breadcrumbs.push('Categories', category?.category_name || selectedCategory, subcategory?.subcategory_name || selectedSubcategory)
      } else {
        breadcrumbs.push('Search Results')
      }
    }

    return (
      <div className="breadcrumb">
        {breadcrumbs.map((crumb, index) => (
          <span key={index}>
            {index > 0 && ' > '}
            {crumb}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <h1 className="logo">ServiceBook Pros</h1>
          <div className="header-actions">
            <button 
              className="estimate-btn"
              onClick={() => setShowEstimate(!showEstimate)}
            >
              Estimate ({estimate.length})
            </button>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search electrical services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && searchServices(searchTerm)}
          className="search-input"
        />
        <button 
          onClick={() => searchServices(searchTerm)}
          className="search-btn"
        >
          Search
        </button>
      </div>

      {/* Navigation */}
      <div className="navigation">
        {renderBreadcrumb()}
        {currentView !== 'categories' && (
          <button onClick={goBack} className="back-btn">
            ← Back
          </button>
        )}
      </div>

      {/* Main Content */}
      <main className="main-content">
        {loading && <div className="loading">Loading...</div>}

        {/* Categories View */}
        {currentView === 'categories' && !loading && (
          <div className="categories-grid">
            {categories.map((category) => (
              <div 
                key={category.category_code} 
                className="category-card"
                onClick={() => fetchSubcategories(category.category_code)}
              >
                <img 
                  src={category.image_url} 
                  alt={category.category_name}
                  className="category-image"
                />
                <div className="category-info">
                  <h3 className="category-name">{category.category_name}</h3>
                  <p className="category-description">{category.description}</p>
                  <span className="service-count">{category.service_count} services</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Subcategories View */}
        {currentView === 'subcategories' && !loading && (
          <div className="subcategories-grid">
            {subcategories.map((subcategory) => (
              <div 
                key={subcategory.subcategory_code} 
                className="subcategory-card"
                onClick={() => fetchServices(subcategory.subcategory_code)}
              >
                <img 
                  src={subcategory.image_url} 
                  alt={subcategory.subcategory_name}
                  className="subcategory-image"
                />
                <div className="subcategory-info">
                  <h3 className="subcategory-name">{subcategory.subcategory_name}</h3>
                  <p className="subcategory-description">{subcategory.description}</p>
                  <span className="service-count">{subcategory.service_count} services</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Services View */}
        {currentView === 'services' && !loading && (
          <div className="services-list">
            {services.map((service) => (
              <div key={service.service_code} className="service-card">
                <div className="service-info">
                  <div className="service-header">
                    <h3 className="service-name">{service.service_name}</h3>
                    <span className="service-code">{service.service_code}</span>
                  </div>
                  <p className="service-description">{service.description}</p>
                  <div className="service-details">
                    <span className="price">${service.base_price}</span>
                    <span className="labor-hours">{service.labor_hours} hrs</span>
                    {service.subcategory_name && (
                      <span className="subcategory">{service.subcategory_name}</span>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => addToEstimate(service)}
                  className="add-btn"
                >
                  Add to Estimate
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Estimate Sidebar */}
      {showEstimate && (
        <div className="estimate-sidebar">
          <div className="estimate-header">
            <h2>Estimate</h2>
            <button 
              onClick={() => setShowEstimate(false)}
              className="close-btn"
            >
              ×
            </button>
          </div>
          
          <div className="estimate-content">
            {estimate.length === 0 ? (
              <p>No services added yet</p>
            ) : (
              <>
                {estimate.map((item) => (
                  <div key={item.service_code} className="estimate-item">
                    <div className="item-info">
                      <h4>{item.service_name}</h4>
                      <span className="item-code">{item.service_code}</span>
                    </div>
                    <div className="item-controls">
                      <button 
                        onClick={() => updateQuantity(item.service_code, item.quantity - 1)}
                        className="qty-btn"
                      >
                        -
                      </button>
                      <span className="quantity">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.service_code, item.quantity + 1)}
                        className="qty-btn"
                      >
                        +
                      </button>
                    </div>
                    <div className="item-price">
                      ${(item.base_price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
                
                <div className="estimate-total">
                  <strong>Total: ${calculateTotal().toFixed(2)}</strong>
                </div>
                
                <button 
                  onClick={generateInvoice}
                  className="generate-invoice-btn"
                >
                  Generate Invoice
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default App

