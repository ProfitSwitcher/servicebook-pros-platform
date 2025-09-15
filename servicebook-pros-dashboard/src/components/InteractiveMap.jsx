import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  MapPin, 
  Navigation, 
  Clock, 
  User, 
  Phone,
  Calendar,
  Filter,
  Layers,
  MoreHorizontal
} from 'lucide-react'

const InteractiveMap = () => {
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [selectedJob, setSelectedJob] = useState(null)
  
  const jobLocations = [
    {
      id: 1,
      title: 'HVAC Repair - Johnson Residence',
      address: '123 Oak Street, Miami, FL 33101',
      coordinates: { lat: 25.7617, lng: -80.1918 },
      status: 'completed',
      technician: 'Mike Johnson',
      time: '9:00 AM - 11:00 AM',
      date: 'Sep 12, 2025',
      jobType: 'HVAC',
      priority: 'high',
      customer: 'Sarah Johnson',
      phone: '(305) 555-0123',
      value: 850
    },
    {
      id: 2,
      title: 'Plumbing Installation - Smith Office',
      address: '456 Pine Avenue, Miami, FL 33102',
      coordinates: { lat: 25.7717, lng: -80.1818 },
      status: 'in-progress',
      technician: 'Sarah Davis',
      time: '11:30 AM - 2:30 PM',
      date: 'Sep 12, 2025',
      jobType: 'Plumbing',
      priority: 'medium',
      customer: 'John Smith',
      phone: '(305) 555-0456',
      value: 1200
    },
    {
      id: 3,
      title: 'Electrical Work - Davis Home',
      address: '789 Elm Road, Miami, FL 33103',
      coordinates: { lat: 25.7517, lng: -80.2018 },
      status: 'scheduled',
      technician: 'Tom Wilson',
      time: '2:00 PM - 4:00 PM',
      date: 'Sep 12, 2025',
      jobType: 'Electrical',
      priority: 'low',
      customer: 'Maria Davis',
      phone: '(305) 555-0789',
      value: 650
    },
    {
      id: 4,
      title: 'AC Maintenance - Wilson Building',
      address: '321 Maple Drive, Miami, FL 33104',
      coordinates: { lat: 25.7417, lng: -80.1718 },
      status: 'scheduled',
      technician: 'Lisa Brown',
      time: '4:30 PM - 6:00 PM',
      date: 'Sep 12, 2025',
      jobType: 'HVAC',
      priority: 'medium',
      customer: 'Robert Wilson',
      phone: '(305) 555-0321',
      value: 300
    },
    {
      id: 5,
      title: 'Emergency Plumbing - Green Corp',
      address: '654 Cedar Lane, Miami, FL 33105',
      coordinates: { lat: 25.7317, lng: -80.1618 },
      status: 'urgent',
      technician: 'Mike Johnson',
      time: 'ASAP',
      date: 'Sep 12, 2025',
      jobType: 'Plumbing',
      priority: 'urgent',
      customer: 'Green Corporation',
      phone: '(305) 555-0654',
      value: 450
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500'
      case 'in-progress': return 'bg-yellow-500'
      case 'scheduled': return 'bg-blue-500'
      case 'urgent': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      completed: 'bg-green-100 text-green-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800',
      urgent: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-red-600'
      case 'high': return 'text-orange-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const filteredJobs = selectedFilter === 'all' 
    ? jobLocations 
    : jobLocations.filter(job => job.status === selectedFilter)

  return (
    <div className="space-y-6">
      {/* Map Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold text-gray-900">Job Locations</h2>
          <div className="flex items-center space-x-2">
            <Button
              variant={selectedFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('all')}
            >
              All ({jobLocations.length})
            </Button>
            <Button
              variant={selectedFilter === 'scheduled' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('scheduled')}
            >
              Scheduled ({jobLocations.filter(j => j.status === 'scheduled').length})
            </Button>
            <Button
              variant={selectedFilter === 'in-progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('in-progress')}
            >
              Active ({jobLocations.filter(j => j.status === 'in-progress').length})
            </Button>
            <Button
              variant={selectedFilter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedFilter('completed')}
            >
              Completed ({jobLocations.filter(j => j.status === 'completed').length})
            </Button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Layers className="w-4 h-4 mr-2" />
            Layers
          </Button>
          <Button variant="outline" size="sm">
            <Navigation className="w-4 h-4 mr-2" />
            Directions
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Map Area */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Miami Service Area</CardTitle>
            <CardDescription>Real-time job locations and technician tracking</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg relative overflow-hidden">
              {/* Map Background */}
              <div className="absolute inset-0 bg-gray-200 rounded-lg">
                <div className="absolute inset-4 bg-white rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Interactive Map Integration</p>
                    <p className="text-sm text-gray-500 mt-1">Google Maps / Mapbox integration would be implemented here</p>
                  </div>
                </div>
              </div>

              {/* Job Location Markers */}
              <div className="absolute inset-0 p-8">
                {filteredJobs.map((job, index) => (
                  <div
                    key={job.id}
                    className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                      selectedJob?.id === job.id ? 'z-20' : 'z-10'
                    }`}
                    style={{
                      left: `${20 + (index * 15)}%`,
                      top: `${30 + (index * 12)}%`
                    }}
                    onClick={() => setSelectedJob(job)}
                  >
                    <div className={`w-4 h-4 rounded-full ${getStatusColor(job.status)} border-2 border-white shadow-lg animate-pulse`} />
                    {selectedJob?.id === job.id && (
                      <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border p-3 w-64 z-30">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium text-gray-900 text-sm">{job.title}</h4>
                          <Badge className={getStatusBadge(job.status)} variant="secondary">
                            {job.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-600 mb-2">{job.address}</p>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">{job.technician}</span>
                          <span className="font-medium text-gray-900">${job.value}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Status Legend</h4>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Completed</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">In Progress</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Scheduled</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">Urgent</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Job Details Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Job Details</CardTitle>
            <CardDescription>
              {selectedJob ? 'Selected job information' : 'Click on a map marker to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedJob ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">{selectedJob.title}</h3>
                  <Badge className={getStatusBadge(selectedJob.status)} variant="secondary">
                    {selectedJob.status.replace('-', ' ')}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Location</p>
                      <p className="text-sm text-gray-600">{selectedJob.address}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <User className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Customer</p>
                      <p className="text-sm text-gray-600">{selectedJob.customer}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Phone</p>
                      <p className="text-sm text-gray-600">{selectedJob.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Schedule</p>
                      <p className="text-sm text-gray-600">{selectedJob.date}</p>
                      <p className="text-sm text-gray-600">{selectedJob.time}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <User className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Technician</p>
                      <p className="text-sm text-gray-600">{selectedJob.technician}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Job Value</p>
                      <p className="text-lg font-bold text-green-600">${selectedJob.value}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Priority</p>
                      <p className={`text-sm font-medium ${getPriorityColor(selectedJob.priority)}`}>
                        {selectedJob.priority.toUpperCase()}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 pt-4">
                  <Button size="sm" className="flex-1">
                    <Navigation className="w-4 h-4 mr-2" />
                    Directions
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Call
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Select a job on the map to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Job List */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Jobs</CardTitle>
          <CardDescription>All scheduled jobs for {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedJob?.id === job.id 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
                onClick={() => setSelectedJob(job)}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(job.status)}`} />
                  <div>
                    <p className="font-medium text-gray-900">{job.title}</p>
                    <p className="text-sm text-gray-600">{job.address}</p>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="text-xs text-gray-500">{job.time}</span>
                      <span className="text-xs text-gray-500">{job.technician}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">${job.value}</p>
                  <Badge className={getStatusBadge(job.status)} variant="secondary">
                    {job.status.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InteractiveMap

