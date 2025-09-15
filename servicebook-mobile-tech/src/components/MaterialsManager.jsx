import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  MapPin,
  User,
  Wrench,
  ShoppingCart,
  Scan,
  Camera,
  FileText,
  Send,
  Filter,
  ArrowLeft,
  Star,
  Minus,
  RotateCcw,
  AlertCircle,
  Info
} from 'lucide-react';

const MaterialsManager = ({ technician, currentJob, onMaterialRequest, onInventoryUpdate }) => {
  const [activeView, setActiveView] = useState('inventory'); // inventory, request, history
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [inventory, setInventory] = useState([]);
  const [requestCart, setRequestCart] = useState([]);
  const [requestHistory, setRequestHistory] = useState([]);
  const [newRequest, setNewRequest] = useState({
    jobId: currentJob?.id || '',
    priority: 'normal',
    notes: '',
    deliveryLocation: currentJob?.address || '',
    requestedBy: technician?.id || 'TECH001'
  });

  // Sample inventory data
  useEffect(() => {
    const sampleInventory = [
      {
        id: 'INV001',
        name: 'PVC Pipe 1/2"',
        category: 'Plumbing',
        stockLevel: 25,
        minStock: 10,
        unit: 'ft',
        location: 'Warehouse A-1',
        cost: 2.50,
        supplier: 'PlumbCorp',
        lastUpdated: new Date(),
        status: 'in_stock'
      },
      {
        id: 'INV002',
        name: 'Pipe Sealant',
        category: 'Plumbing',
        stockLevel: 8,
        minStock: 15,
        unit: 'tube',
        location: 'Warehouse A-2',
        cost: 12.99,
        supplier: 'SealTech',
        lastUpdated: new Date(),
        status: 'low_stock'
      },
      {
        id: 'INV003',
        name: 'Water Heater Filter',
        category: 'HVAC',
        stockLevel: 0,
        minStock: 5,
        unit: 'each',
        location: 'Warehouse B-1',
        cost: 45.00,
        supplier: 'FilterPro',
        lastUpdated: new Date(),
        status: 'out_of_stock'
      },
      {
        id: 'INV004',
        name: 'Drain Snake 25ft',
        category: 'Tools',
        stockLevel: 3,
        minStock: 2,
        unit: 'each',
        location: 'Tool Room',
        cost: 89.99,
        supplier: 'ToolMaster',
        lastUpdated: new Date(),
        status: 'in_stock'
      },
      {
        id: 'INV005',
        name: 'Cleaning Solution',
        category: 'Chemicals',
        stockLevel: 12,
        minStock: 8,
        unit: 'gallon',
        location: 'Chemical Storage',
        cost: 18.50,
        supplier: 'ChemClean',
        lastUpdated: new Date(),
        status: 'in_stock'
      },
      {
        id: 'INV006',
        name: 'Anode Rod',
        category: 'HVAC',
        stockLevel: 4,
        minStock: 10,
        unit: 'each',
        location: 'Warehouse B-2',
        cost: 35.75,
        supplier: 'HeatParts',
        lastUpdated: new Date(),
        status: 'low_stock'
      }
    ];

    const sampleRequests = [
      {
        id: 'REQ001',
        jobId: 'JOB001',
        customerName: 'John Meyer',
        items: [
          { id: 'INV001', name: 'PVC Pipe 1/2"', quantity: 10, unit: 'ft' },
          { id: 'INV002', name: 'Pipe Sealant', quantity: 2, unit: 'tube' }
        ],
        priority: 'urgent',
        status: 'approved',
        requestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        approvedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        deliveryLocation: '1251 Golf View Drive, Seeley Lake, MT',
        notes: 'Needed for kitchen sink repair - customer waiting',
        estimatedDelivery: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes from now
      },
      {
        id: 'REQ002',
        jobId: 'JOB002',
        customerName: 'Bruce Hall',
        items: [
          { id: 'INV003', name: 'Water Heater Filter', quantity: 1, unit: 'each' },
          { id: 'INV006', name: 'Anode Rod', quantity: 1, unit: 'each' }
        ],
        priority: 'normal',
        status: 'pending',
        requestedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        deliveryLocation: '270 A Street, Seeley Lake, MT',
        notes: 'Annual maintenance - scheduled for 1:00 PM',
        estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
      }
    ];

    setInventory(sampleInventory);
    setRequestHistory(sampleRequests);
  }, []);

  const getStockStatusColor = (status) => {
    switch (status) {
      case 'in_stock': return 'bg-green-500';
      case 'low_stock': return 'bg-yellow-500';
      case 'out_of_stock': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getRequestStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'approved': return 'bg-green-500';
      case 'delivered': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category.toLowerCase() === filterCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const addToCart = (item, quantity = 1) => {
    setRequestCart(prev => {
      const existingItem = prev.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      } else {
        return [...prev, { ...item, quantity }];
      }
    });
  };

  const removeFromCart = (itemId) => {
    setRequestCart(prev => prev.filter(item => item.id !== itemId));
  };

  const updateCartQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setRequestCart(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const submitRequest = () => {
    if (requestCart.length === 0) return;

    const request = {
      id: `REQ${Date.now()}`,
      jobId: newRequest.jobId,
      customerName: currentJob?.customer || 'Unknown',
      items: requestCart.map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit: item.unit
      })),
      priority: newRequest.priority,
      status: 'pending',
      requestedAt: new Date(),
      deliveryLocation: newRequest.deliveryLocation,
      notes: newRequest.notes,
      requestedBy: technician?.id || 'TECH001',
      estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
    };

    setRequestHistory(prev => [request, ...prev]);
    setRequestCart([]);
    setNewRequest({
      jobId: currentJob?.id || '',
      priority: 'normal',
      notes: '',
      deliveryLocation: currentJob?.address || '',
      requestedBy: technician?.id || 'TECH001'
    });

    onMaterialRequest && onMaterialRequest(request);
    setActiveView('history');
  };

  const categories = ['all', ...new Set(inventory.map(item => item.category))];

  return (
    <div className="space-y-4 pb-20">
      {/* Header with View Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveView('inventory')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeView === 'inventory'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Package className="w-4 h-4 inline mr-1" />
          Inventory
        </button>
        <button
          onClick={() => setActiveView('request')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors relative ${
            activeView === 'request'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <ShoppingCart className="w-4 h-4 inline mr-1" />
          Request
          {requestCart.length > 0 && (
            <Badge className="absolute -top-1 -right-1 bg-red-500 text-white text-xs min-w-[1.25rem] h-5">
              {requestCart.length}
            </Badge>
          )}
        </button>
        <button
          onClick={() => setActiveView('history')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeView === 'history'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Clock className="w-4 h-4 inline mr-1" />
          History
        </button>
      </div>

      {/* Inventory View */}
      {activeView === 'inventory' && (
        <>
          {/* Search and Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search materials..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Inventory Items */}
          <div className="space-y-3">
            {filteredInventory.map((item) => (
              <Card key={item.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="font-medium">{item.name}</h3>
                        <Badge className={getStockStatusColor(item.status)} variant="default">
                          {item.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Package className="w-4 h-4" />
                          <span>{item.category}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>{item.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Stock:</span>
                          <span className={item.stockLevel <= item.minStock ? 'text-red-600 font-medium' : ''}>
                            {item.stockLevel} {item.unit}
                          </span>
                          {item.stockLevel <= item.minStock && (
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">Cost:</span>
                          <span>${item.cost.toFixed(2)} per {item.unit}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex flex-col space-y-2">
                      <Button
                        size="sm"
                        onClick={() => addToCart(item, 1)}
                        disabled={item.stockLevel === 0}
                        className="min-w-[80px]"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                      
                      {item.stockLevel <= item.minStock && (
                        <Badge variant="outline" className="text-xs text-red-600 border-red-200">
                          Low Stock
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Request Cart View */}
      {activeView === 'request' && (
        <>
          {/* Cart Items */}
          {requestCart.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Request Cart</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRequestCart([])}
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Clear
                </Button>
              </div>

              {requestCart.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">{item.category}</p>
                        <p className="text-sm text-gray-500">
                          ${item.cost.toFixed(2)} per {item.unit}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        
                        <span className="w-12 text-center font-medium">
                          {item.quantity}
                        </span>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 p-0"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFromCart(item.id)}
                          className="w-8 h-8 p-0 text-red-600 hover:text-red-700"
                        >
                          ×
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Request Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Request Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newRequest.priority} onValueChange={(value) => 
                      setNewRequest(prev => ({ ...prev, priority: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="delivery-location">Delivery Location</Label>
                    <Input
                      id="delivery-location"
                      value={newRequest.deliveryLocation}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, deliveryLocation: e.target.value }))}
                      placeholder="Enter delivery address..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={newRequest.notes}
                      onChange={(e) => setNewRequest(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes or special instructions..."
                      rows={3}
                    />
                  </div>

                  <Button onClick={submitRequest} className="w-full">
                    <Send className="w-4 h-4 mr-2" />
                    Submit Request
                  </Button>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cart is Empty</h3>
              <p className="text-gray-600 mb-4">Add materials from inventory to create a request</p>
              <Button onClick={() => setActiveView('inventory')}>
                Browse Inventory
              </Button>
            </div>
          )}
        </>
      )}

      {/* Request History View */}
      {activeView === 'history' && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Request History</h3>
          
          {requestHistory.map((request) => (
            <Card key={request.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">Request #{request.id}</h4>
                      <Badge className={getRequestStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                      <Badge className={getPriorityColor(request.priority)} variant="outline">
                        {request.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{request.customerName}</p>
                    <p className="text-sm text-gray-500">
                      {request.requestedAt.toLocaleString()}
                    </p>
                  </div>
                  
                  {request.status === 'approved' && (
                    <div className="text-right">
                      <div className="flex items-center space-x-1 text-green-600">
                        <Truck className="w-4 h-4" />
                        <span className="text-sm font-medium">En Route</span>
                      </div>
                      <p className="text-xs text-gray-500">
                        ETA: {request.estimatedDelivery?.toLocaleTimeString()}
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span>{request.deliveryLocation}</span>
                  </div>
                  
                  {request.notes && (
                    <div className="flex items-start space-x-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-500 mt-0.5" />
                      <span className="text-gray-600">{request.notes}</span>
                    </div>
                  )}

                  <div className="mt-3">
                    <p className="text-sm font-medium mb-2">Items:</p>
                    <div className="space-y-1">
                      {request.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{item.name}</span>
                          <span className="text-gray-600">
                            {item.quantity} {item.unit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MaterialsManager;

