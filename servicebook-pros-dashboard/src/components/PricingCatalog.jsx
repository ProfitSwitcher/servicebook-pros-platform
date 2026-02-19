import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Plus,
  Search,
  Filter,
  Settings,
  DollarSign,
  Wrench,
  Zap,
  Droplets,
  Wind,
  Home,
  Edit,
  Trash2,
  Copy,
  Eye,
  ChevronRight,
  ChevronDown,
  X,
  Calculator,
  TrendingUp,
  Percent,
  Save,
  RefreshCw
} from 'lucide-react'
import apiClient from '../utils/apiClient'

const PricingCatalog = () => {
  const [pricingItems, setPricingItems] = useState([])
  const [categories, setCategories] = useState([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [laborRate, setLaborRate] = useState(125)
  const [loading, setLoading] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [newPricingItem, setNewPricingItem] = useState({ title: '', category: 'hvac', code: '', description: '', laborHours: 1, materialCost: 0, profitMargin: 35, unit: 'each' })
  const [creatingPricingItem, setCreatingPricingItem] = useState(false)

  // Sample categories
  const sampleCategories = [
    { id: 'hvac', name: 'HVAC', icon: Wind, color: 'bg-blue-100 text-blue-800', profitMargin: 35 },
    { id: 'plumbing', name: 'Plumbing', icon: Droplets, color: 'bg-cyan-100 text-cyan-800', profitMargin: 40 },
    { id: 'electrical', name: 'Electrical', icon: Zap, color: 'bg-yellow-100 text-yellow-800', profitMargin: 45 },
    { id: 'general', name: 'General Repair', icon: Wrench, color: 'bg-gray-100 text-gray-800', profitMargin: 30 }
  ]

  // Sample pricing items (Profit Rhino style)
  const samplePricingItems = [
    {
      id: 1,
      category: 'hvac',
      code: 'HVAC-001',
      title: 'AC Unit Diagnostic & Repair',
      description: 'Complete diagnostic of AC unit including electrical connections, refrigerant levels, compressor function, and thermostat calibration. Includes minor repairs and adjustments.',
      laborHours: 2,
      materialCost: 45.00,
      laborCost: 250.00, // 2 hours * $125/hr
      profitMargin: 35,
      totalPrice: 398.25, // (250 + 45) * 1.35
      tags: ['diagnostic', 'repair', 'ac'],
      lastUpdated: '2025-09-12'
    },
    {
      id: 2,
      category: 'hvac',
      code: 'HVAC-002',
      title: 'Furnace Filter Replacement & Tune-up',
      description: 'Replace furnace filter, clean blower assembly, check gas connections, test safety controls, and perform complete system tune-up for optimal efficiency.',
      laborHours: 1.5,
      materialCost: 25.00,
      laborCost: 187.50, // 1.5 hours * $125/hr
      profitMargin: 35,
      totalPrice: 286.88, // (187.50 + 25) * 1.35
      tags: ['maintenance', 'filter', 'furnace'],
      lastUpdated: '2025-09-12'
    },
    {
      id: 3,
      category: 'plumbing',
      code: 'PLUMB-001',
      title: 'Toilet Installation & Removal',
      description: 'Remove existing toilet, install new toilet with wax ring, supply line, and mounting hardware. Test for leaks and proper operation. Includes disposal of old toilet.',
      laborHours: 2.5,
      materialCost: 85.00,
      laborCost: 312.50, // 2.5 hours * $125/hr
      profitMargin: 40,
      totalPrice: 556.25, // (312.50 + 85) * 1.40
      tags: ['installation', 'toilet', 'bathroom'],
      lastUpdated: '2025-09-12'
    },
    {
      id: 4,
      category: 'plumbing',
      code: 'PLUMB-002',
      title: 'Kitchen Sink Faucet Repair',
      description: 'Diagnose and repair kitchen sink faucet issues including leaks, low water pressure, or handle problems. Replace cartridges, O-rings, or aerators as needed.',
      laborHours: 1,
      materialCost: 35.00,
      laborCost: 125.00, // 1 hour * $125/hr
      profitMargin: 40,
      totalPrice: 224.00, // (125 + 35) * 1.40
      tags: ['repair', 'faucet', 'kitchen'],
      lastUpdated: '2025-09-12'
    },
    {
      id: 5,
      category: 'electrical',
      code: 'ELEC-001',
      title: 'Outlet Installation (GFCI)',
      description: 'Install new GFCI outlet including running wire from panel, installing outlet box, connecting wiring, and testing for proper ground fault protection.',
      laborHours: 2,
      materialCost: 65.00,
      laborCost: 250.00, // 2 hours * $125/hr
      profitMargin: 45,
      totalPrice: 456.75, // (250 + 65) * 1.45
      tags: ['installation', 'outlet', 'gfci', 'safety'],
      lastUpdated: '2025-09-12'
    },
    {
      id: 6,
      category: 'electrical',
      code: 'ELEC-002',
      title: 'Circuit Breaker Replacement',
      description: 'Replace faulty circuit breaker in electrical panel. Includes testing circuit load, installing new breaker, and verifying proper operation and safety.',
      laborHours: 1.5,
      materialCost: 45.00,
      laborCost: 187.50, // 1.5 hours * $125/hr
      profitMargin: 45,
      totalPrice: 337.13, // (187.50 + 45) * 1.45
      tags: ['replacement', 'breaker', 'electrical panel'],
      lastUpdated: '2025-09-12'
    }
  ]

  useEffect(() => {
    setCategories(sampleCategories)
    const loadPricing = async () => {
      setLoading(true)
      try {
        const data = await apiClient.getPricing()
        const items = Array.isArray(data) ? data : (data?.items || data?.results || [])
        setPricingItems(items.length > 0 ? items : samplePricingItems)
      } catch (err) {
        console.error('Failed to load pricing:', err)
        setPricingItems(samplePricingItems)
      } finally {
        setLoading(false)
      }
    }
    loadPricing()
  }, [])

  // Recalculate all pricing when labor rate changes
  const updateLaborRate = (newRate) => {
    setLaborRate(newRate)
    const updatedItems = pricingItems.map(item => {
      const newLaborCost = item.laborHours * newRate
      const newTotalPrice = (newLaborCost + item.materialCost) * (1 + item.profitMargin / 100)
      return {
        ...item,
        laborCost: newLaborCost,
        totalPrice: newTotalPrice
      }
    })
    setPricingItems(updatedItems)
  }

  const getCategoryIcon = (categoryId) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.icon : Wrench
  }

  const getCategoryColor = (categoryId) => {
    const category = categories.find(c => c.id === categoryId)
    return category ? category.color : 'bg-gray-100 text-gray-800'
  }

  const filteredItems = pricingItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const renderPricingCard = (item) => {
    const Icon = getCategoryIcon(item.category)
    return (
      <Card key={item.id} className="mb-4 hover:shadow-md transition-shadow">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <Icon className="w-6 h-6 text-gray-600" />
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-lg">{item.code}</span>
                  <Badge className={getCategoryColor(item.category)}>
                    {categories.find(c => c.id === item.category)?.name}
                  </Badge>
                </div>
                <h3 className="text-xl font-semibold mt-1">{item.title}</h3>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-600">${item.totalPrice.toFixed(2)}</div>
              <div className="text-sm text-gray-500">{item.laborHours}h labor</div>
            </div>
          </div>

          <p className="text-gray-700 mb-4 leading-relaxed">{item.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Labor Hours</div>
              <div className="font-semibold">{item.laborHours}h</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Labor Cost</div>
              <div className="font-semibold">${item.laborCost.toFixed(2)}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Materials</div>
              <div className="font-semibold">${item.materialCost.toFixed(2)}</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Profit Margin</div>
              <div className="font-semibold">{item.profitMargin}%</div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              {item.tags.map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const duplicate = { ...item, id: undefined, title: `${item.title} (Copy)`, code: `${item.code}-COPY` }
                setPricingItems(prev => [...prev, { ...duplicate, id: Date.now() }])
                apiClient.createPricing(duplicate).catch(() => {})
              }}>
                <Copy className="w-4 h-4 mr-2" />
                Duplicate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderSettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Pricing Settings</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowSettingsModal(false)}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Labor Rate Setting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="w-5 h-5 mr-2" />
                Labor Rate Configuration
              </CardTitle>
              <CardDescription>
                Adjust your hourly labor rate. This will automatically update all pricing items.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hourly Labor Rate
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      value={laborRate}
                      onChange={(e) => setLaborRate(parseFloat(e.target.value) || 0)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      step="0.01"
                      min="0"
                    />
                  </div>
                </div>
                <div className="pt-6">
                  <Button onClick={() => updateLaborRate(laborRate)}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Update All Prices
                  </Button>
                </div>
              </div>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Impact:</strong> Updating the labor rate will recalculate {pricingItems.length} pricing items automatically.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Category Profit Margins */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Category Profit Margins
              </CardTitle>
              <CardDescription>
                Set profit margins for each service category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map(category => {
                  const Icon = category.icon
                  return (
                    <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Icon className="w-5 h-5 text-gray-600" />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={category.profitMargin}
                          onChange={(e) => {
                            const newMargin = parseFloat(e.target.value) || 0
                            setCategories(cats => cats.map(c => 
                              c.id === category.id ? { ...c, profitMargin: newMargin } : c
                            ))
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                          step="1"
                          min="0"
                          max="100"
                        />
                        <Percent className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-3 mt-6">
          <Button variant="outline" onClick={() => setShowSettingsModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => {
            updateLaborRate(laborRate)
            setShowSettingsModal(false)
          }}>
            <Save className="w-4 h-4 mr-2" />
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pricing Catalog</h1>
          <p className="text-gray-600 mt-1">Manage your flat-rate pricing and service catalog</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => setShowSettingsModal(true)}>
            <Settings className="w-4 h-4 mr-2" />
            Pricing Settings
          </Button>
          <Button onClick={() => setShowPricingModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Pricing Item
          </Button>
        </div>
      </div>

      {/* Current Labor Rate Display */}
      <Card className="mb-6 bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Calculator className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-semibold text-blue-900">Current Labor Rate</div>
                <div className="text-sm text-blue-700">All pricing is calculated using this rate</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">${laborRate.toFixed(2)}/hour</div>
              <Button variant="outline" size="sm" onClick={() => setShowSettingsModal(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Adjust Rate
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          onClick={() => setSelectedCategory('all')}
          className="flex items-center space-x-2"
        >
          <Home className="w-4 h-4" />
          <span>All Categories</span>
          <Badge variant="secondary">{pricingItems.length}</Badge>
        </Button>
        {categories.map(category => {
          const Icon = category.icon
          const count = pricingItems.filter(item => item.category === category.id).length
          return (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className="flex items-center space-x-2"
            >
              <Icon className="w-4 h-4" />
              <span>{category.name}</span>
              <Badge variant="secondary">{count}</Badge>
            </Button>
          )
        })}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search pricing items, codes, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Items</p>
                <p className="text-2xl font-bold">{pricingItems.length}</p>
              </div>
              <Wrench className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Price</p>
                <p className="text-2xl font-bold">
                  ${(pricingItems.reduce((sum, item) => sum + item.totalPrice, 0) / pricingItems.length || 0).toFixed(0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Home className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Margin</p>
                <p className="text-2xl font-bold">
                  {(categories.reduce((sum, cat) => sum + cat.profitMargin, 0) / categories.length || 0).toFixed(0)}%
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pricing Items List */}
      <div className="space-y-4">
        {filteredItems.length > 0 ? (
          filteredItems.map(renderPricingCard)
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <Wrench className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pricing items found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by creating your first pricing item'
                }
              </p>
              {!searchTerm && selectedCategory === 'all' && (
                <Button onClick={() => setShowPricingModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Pricing Item
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Settings Modal */}
      {showSettingsModal && renderSettingsModal()}

      {/* Edit Pricing Item Modal */}
      {editingItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Edit Pricing Item</h2>
              <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault()
              try {
                await apiClient.updatePricing(editingItem.id, editingItem)
              } catch (err) {
                console.error('Failed to update pricing item:', err)
              }
              setPricingItems(prev => prev.map(p => p.id === editingItem.id ? editingItem : p))
              setEditingItem(null)
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name</label>
                <input type="text" value={editingItem.title || editingItem.name || ''} onChange={e => setEditingItem({...editingItem, title: e.target.value, name: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                  <input type="number" step="0.01" value={editingItem.totalPrice || editingItem.price || 0} onChange={e => setEditingItem({...editingItem, totalPrice: parseFloat(e.target.value), price: parseFloat(e.target.value)})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Labor Hours</label>
                  <input type="number" step="0.25" min="0" value={editingItem.laborHours || 1} onChange={e => setEditingItem({...editingItem, laborHours: parseFloat(e.target.value)})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={editingItem.description || ''} onChange={e => setEditingItem({...editingItem, description: e.target.value})} rows={2} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingItem(null)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Pricing Item Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">New Pricing Item</h2>
              <button onClick={() => setShowPricingModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault()
              setCreatingPricingItem(true)
              try {
                const created = await apiClient.createPricing(newPricingItem)
                setPricingItems(prev => [...prev, created])
              } catch (err) {
                const laborCost = newPricingItem.laborHours * laborRate
                const totalPrice = (laborCost + newPricingItem.materialCost) * (1 + newPricingItem.profitMargin / 100)
                setPricingItems(prev => [...prev, { ...newPricingItem, id: Date.now(), laborCost, totalPrice }])
              } finally {
                setCreatingPricingItem(false)
                setShowPricingModal(false)
                setNewPricingItem({ title: '', category: 'hvac', code: '', description: '', laborHours: 1, materialCost: 0, profitMargin: 35, unit: 'each' })
              }
            }} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Name *</label>
                <input type="text" required value={newPricingItem.title} onChange={e => setNewPricingItem({...newPricingItem, title: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. AC Tune-Up" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Code</label>
                  <input type="text" value={newPricingItem.code} onChange={e => setNewPricingItem({...newPricingItem, code: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. HVAC-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select value={newPricingItem.category} onChange={e => setNewPricingItem({...newPricingItem, category: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Labor Hours</label>
                  <input type="number" step="0.25" min="0" value={newPricingItem.laborHours} onChange={e => setNewPricingItem({...newPricingItem, laborHours: parseFloat(e.target.value) || 0})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Material Cost ($)</label>
                  <input type="number" step="0.01" min="0" value={newPricingItem.materialCost} onChange={e => setNewPricingItem({...newPricingItem, materialCost: parseFloat(e.target.value) || 0})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profit Margin (%)</label>
                <input type="number" step="1" min="0" max="100" value={newPricingItem.profitMargin} onChange={e => setNewPricingItem({...newPricingItem, profitMargin: parseFloat(e.target.value) || 0})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowPricingModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={creatingPricingItem} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60">{creatingPricingItem ? 'Creating...' : 'Create Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default PricingCatalog

