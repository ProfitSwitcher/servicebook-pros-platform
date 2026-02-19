import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Label } from '@/components/ui/label.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select.jsx'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table.jsx'
import { API_BASE_URL } from '@/lib/config'
import { 
  Calendar,
  Users,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Search,
  Filter,
  TrendingUp,
  Wrench,
  Home,
  Zap,
  Droplets,
  Settings
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const API_BASE = API_BASE_URL

const CRMDashboard = () => {
  const [activeView, setActiveView] = useState('dashboard')
  const [workOrders, setWorkOrders] = useState([])
  const [customers, setCustomers] = useState([])
  const [revenueData, setRevenueData] = useState([])
  const [todaySchedule, setTodaySchedule] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [calendarDate, setCalendarDate] = useState(new Date())

  // Mock data for demonstration
  useEffect(() => {
    // Mock work orders
    setWorkOrders([
      {
        id: 'WO-2023-007',
        customer: 'Phil Johnson',
        service: 'Servicing Faucet',
        status: 'Pending',
        priority: 'Normal',
        technician: 'Mike R',
        scheduledDate: '2024-07-15',
        estimatedValue: 150
      },
      {
        id: 'WO-2023-007',
        customer: 'Mike Johnson',
        service: 'Servicing Heater',
        status: 'In Progress',
        priority: 'High',
        technician: 'Lisa T',
        scheduledDate: '2024-07-15',
        estimatedValue: 320
      },
      {
        id: 'WO-2023-005',
        customer: 'Jane Johnson',
        service: 'Connecting Heater',
        status: 'Not Started',
        priority: 'Normal',
        technician: 'Ben C',
        scheduledDate: '2024-07-16',
        estimatedValue: 280
      }
    ])

    // Mock customers
    setCustomers([
      { id: 1, name: 'John Smith', company: 'ABC Corp', email: 'john.smith@abc.com', phone: '(555) 123-4567' },
      { id: 2, name: 'Sarah Johnson', company: 'XYZ Inc', email: 'sarah@xyz.com', phone: '(555) 234-5678' },
      { id: 3, name: 'Mike Wilson', company: 'Tech Solutions', email: 'mike@tech.com', phone: '(555) 345-6789' }
    ])

    // Mock revenue data
    setRevenueData([
      { day: '1', revenue: 1200 },
      { day: '5', revenue: 800 },
      { day: '10', revenue: 1500 },
      { day: '15', revenue: 2100 },
      { day: '20', revenue: 1800 },
      { day: '25', revenue: 2400 },
      { day: '30', revenue: 1900 }
    ])

    // Mock today's schedule
    setTodaySchedule([
      { time: '9:00 AM', customer: 'John D.', service: 'A/C Repair', technician: 'Mike R', status: 'completed' },
      { time: '11:00 AM', customer: 'Sarah K.', service: 'Heating Install', technician: 'Lisa T', status: 'in-progress' },
      { time: '2:00 PM', customer: 'Mike W.', service: 'Electrical Panel', technician: 'Alex C', status: 'scheduled' }
    ])
  }, [])

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      'In Progress': { color: 'bg-blue-100 text-blue-800', icon: Settings },
      'Not Started': { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
      'Completed': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'completed': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'in-progress': { color: 'bg-blue-100 text-blue-800', icon: Settings },
      'scheduled': { color: 'bg-gray-100 text-gray-800', icon: Clock }
    }
    
    const config = statusConfig[status] || statusConfig['Not Started']
    const Icon = config.icon
    
    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      'High': 'bg-red-100 text-red-800',
      'Normal': 'bg-blue-100 text-blue-800',
      'Low': 'bg-green-100 text-green-800'
    }
    
    return (
      <Badge className={priorityConfig[priority] || priorityConfig['Normal']}>
        {priority}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeView} onValueChange={setActiveView}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="scheduling">Scheduling</TabsTrigger>
          <TabsTrigger value="pricing">Pricing Search</TabsTrigger>
        </TabsList>

        {/* Main Dashboard */}
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Today's Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todaySchedule.map((appointment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{appointment.time}</div>
                        <div className="text-sm text-gray-600">{appointment.customer}</div>
                        <div className="text-sm text-gray-500">{appointment.service}</div>
                        <div className="text-xs text-gray-400">Tech: {appointment.technician}</div>
                      </div>
                      <div>
                        {getStatusBadge(appointment.status)}
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  Quick Add Appointment
                </Button>
              </CardContent>
            </Card>

            {/* Active Work Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Active Work Orders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workOrders.slice(0, 4).map((order, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{order.id}</div>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="text-sm text-gray-600">{order.customer}</div>
                      <div className="text-sm text-gray-500">{order.service}</div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-gray-400">Tech: {order.technician}</div>
                        {getPriorityBadge(order.priority)}
                      </div>
                    </div>
                  ))}
                </div>
                <Button className="w-full mt-4" variant="outline">
                  View All Work Orders
                </Button>
              </CardContent>
            </Card>

            {/* Recent Customers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Recent Customers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {customers.map((customer) => (
                    <div key={customer.id} className="p-3 border rounded-lg">
                      <div className="font-medium">{customer.name}</div>
                      <div className="text-sm text-gray-600">{customer.company}</div>
                      <div className="text-sm text-gray-500">{customer.email}</div>
                      <div className="text-xs text-gray-400">{customer.phone}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Revenue Chart and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Revenue This Month
                </CardTitle>
                <CardDescription>USD 15,000</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks and shortcuts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" onClick={() => setActiveView('work-orders')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Work Order
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Send Invoice
                </Button>
                <Button className="w-full" variant="outline" onClick={() => setActiveView('scheduling')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Appointment
                </Button>
                <Button className="w-full" variant="outline" onClick={() => setActiveView('pricing')}>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Price Lookup
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Work Orders */}
        <TabsContent value="work-orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Work Orders Management
              </CardTitle>
              <CardDescription>
                Manage and track all work orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search work orders..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  New Work Order
                </Button>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Work Order #</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrders.map((order, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{order.id}</TableCell>
                        <TableCell>{order.customer}</TableCell>
                        <TableCell>{order.service}</TableCell>
                        <TableCell>{order.technician}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{getPriorityBadge(order.priority)}</TableCell>
                        <TableCell>${order.estimatedValue}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm">View</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduling */}
        <TabsContent value="scheduling" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Scheduling Calendar
              </CardTitle>
              <CardDescription>
                Manage appointments and technician schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Left Sidebar */}
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Today's Schedule</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {todaySchedule.map((appointment, index) => (
                        <div key={index} className="p-2 bg-blue-100 rounded text-xs">
                          <div className="font-medium">{appointment.customer}</div>
                          <div>{appointment.service}</div>
                          <div>{appointment.time}</div>
                          <div>Tech: {appointment.technician}</div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Technician Availability</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Mike R - Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Lisa T - Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm">Alex C - Busy</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Button className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Quick Add Appointment
                  </Button>
                </div>

                {/* Calendar Area */}
                <div className="lg:col-span-3">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
                        >‹</Button>
                        <h3 className="text-lg font-semibold min-w-[140px] text-center">
                          {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setCalendarDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
                        >›</Button>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Month</Button>
                        <Button variant="outline" size="sm">Week</Button>
                        <Button variant="outline" size="sm">Day</Button>
                      </div>
                    </div>
                    <Select>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filter by Technician" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Technicians</SelectItem>
                        <SelectItem value="mike">Mike R</SelectItem>
                        <SelectItem value="lisa">Lisa T</SelectItem>
                        <SelectItem value="alex">Alex C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Calendar Grid */}
                  <div className="border rounded-lg p-4">
                    <div className="grid grid-cols-7 gap-2 mb-4">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="text-center font-medium text-sm p-2">
                          {day}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 35 }, (_, i) => {
                        const day = i - 6 + 1
                        const hasAppointment = [8, 15, 22, 29].includes(day)
                        return (
                          <div key={i} className="h-20 border rounded p-1">
                            {day > 0 && day <= 31 && (
                              <>
                                <div className="text-sm">{day}</div>
                                {hasAppointment && (
                                  <div className="text-xs bg-blue-100 rounded p-1 mt-1">
                                    Appointment
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pricing Search */}
        <TabsContent value="pricing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Service & Pricing Lookup
              </CardTitle>
              <CardDescription>
                Search for services and build estimates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Categories Sidebar */}
                <div className="space-y-2">
                  <h3 className="font-semibold mb-4">Categories</h3>
                  <Button variant="outline" className="w-full justify-start">
                    <Zap className="w-4 h-4 mr-2" />
                    Electrical
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Home className="w-4 h-4 mr-2" />
                    HVAC
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Droplets className="w-4 h-4 mr-2" />
                    Plumbing
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Wrench className="w-4 h-4 mr-2" />
                    General
                  </Button>
                </div>

                {/* Service Lookup */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search for electrical, HVAC, or plumbing services..."
                      className="pl-10"
                    />
                  </div>

                  <div className="space-y-4">
                    {/* Service Items */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Outlet Testing</h4>
                        <Button size="sm">Add to Estimate</Button>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">Code: T811272</div>
                      <div className="text-sm text-gray-500 mb-3">
                        Full inspection and testing of all outlets in a standard residential room.
                      </div>
                      <div className="text-2xl font-bold text-green-600">$423.70</div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">HVAC Maintenance</h4>
                        <Button size="sm">Add to Estimate</Button>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">Code: H529014</div>
                      <div className="text-sm text-gray-500 mb-3">
                        Comprehensive annual tune-up for furnace and air conditioning units.
                      </div>
                      <div className="text-2xl font-bold text-green-600">$315.50</div>
                    </div>

                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Pipe Repair</h4>
                        <Button size="sm">Add to Estimate</Button>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">Code: H937881</div>
                      <div className="text-sm text-gray-500 mb-3">
                        Labor and materials for standard residential pipe leak repair.
                      </div>
                      <div className="text-2xl font-bold text-green-600">$589.95</div>
                    </div>
                  </div>
                </div>

                {/* Current Estimate */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Current Estimate</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Outlet Testing</span>
                          <span className="text-green-600">$423.70</span>
                        </div>
                        <div className="flex justify-between">
                          <span>HVAC Maintenance</span>
                          <span className="text-green-600">$315.50</span>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between text-lg font-bold">
                          <span>Total:</span>
                          <span>$739.20</span>
                        </div>
                      </div>
                      <Button className="w-full">
                        Finalize Estimate
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CRMDashboard

