import React, { useState } from 'react'
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
  MoreHorizontal,
  Wrench,
  FileText,
  CalendarDays
} from 'lucide-react'

const ScheduleMapView = ({ events, selectedDate, teamCalendars }) => {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedFilter, setSelectedFilter] = useState('all')

  // Filter events based on selected date and team calendars
  const getFilteredEvents = () => {
    let filtered = events

    // Filter by date if selected
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0]
      filtered = filtered.filter(event => event.date === dateString)
    }

    // Filter by team calendar visibility
    filtered = filtered.filter(event => {
      const calendar = teamCalendars.find(cal => 
        cal.name.toLowerCase().includes(event.technician?.toLowerCase() || '')
      )
      return !calendar || calendar.enabled
    })

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(event => event.type === selectedFilter)
    }

    return filtered
  }

  const getEventTypeColor = (type) => {
    switch (type) {
      case 'job': return 'bg-blue-500'
      case 'estimate': return 'bg-orange-500'
      case 'event': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getEventTypeIcon = (type) => {
    switch (type) {
      case 'job': return <Wrench className="w-3 h-3" />
      case 'estimate': return <FileText className="w-3 h-3" />
      case 'event': return <CalendarDays className="w-3 h-3" />
      default: return <Calendar className="w-3 h-3" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500'
      case 'pending': return 'bg-yellow-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredEvents = getFilteredEvents()

  return (
    <div className="h-full flex">
      {/* Map Area */}
      <div className="flex-1 relative">
        {/* Map Controls */}
        <div className="absolute top-4 left-4 z-10 flex space-x-2">
          <Button
            variant={selectedFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('all')}
          >
            All ({filteredEvents.length})
          </Button>
          <Button
            variant={selectedFilter === 'job' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('job')}
          >
            Jobs ({filteredEvents.filter(e => e.type === 'job').length})
          </Button>
          <Button
            variant={selectedFilter === 'estimate' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('estimate')}
          >
            Estimates ({filteredEvents.filter(e => e.type === 'estimate').length})
          </Button>
          <Button
            variant={selectedFilter === 'event' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedFilter('event')}
          >
            Events ({filteredEvents.filter(e => e.type === 'event').length})
          </Button>
        </div>

        <div className="absolute top-4 right-4 z-10 flex space-x-2">
          <Button variant="outline" size="sm">
            <Layers className="w-4 h-4 mr-2" />
            Layers
          </Button>
          <Button variant="outline" size="sm">
            <Navigation className="w-4 h-4 mr-2" />
            Directions
          </Button>
        </div>

        {/* Map Container */}
        <div className="h-full bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
          {/* Map Background */}
          <div className="absolute inset-0 bg-gray-200">
            <div className="absolute inset-4 bg-white rounded border-2 border-dashed border-gray-300 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Schedule Map View</p>
                <p className="text-sm text-gray-500 mt-2">
                  {selectedDate 
                    ? `Showing events for ${selectedDate.toLocaleDateString()}`
                    : 'Interactive map showing scheduled jobs and appointments'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Event Markers */}
          <div className="absolute inset-0 p-8">
            {filteredEvents.map((event, index) => (
              <div
                key={event.id}
                className={`absolute cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                  selectedEvent?.id === event.id ? 'z-20' : 'z-10'
                }`}
                style={{
                  left: `${20 + (index * 12)}%`,
                  top: `${25 + (index * 15)}%`
                }}
                onClick={() => setSelectedEvent(event)}
              >
                <div className={`w-5 h-5 rounded-full ${getEventTypeColor(event.type)} border-2 border-white shadow-lg animate-pulse flex items-center justify-center`}>
                  <div className="text-white">
                    {getEventTypeIcon(event.type)}
                  </div>
                </div>
                
                {selectedEvent?.id === event.id && (
                  <div className="absolute top-8 left-1/2 transform -translate-x-1/2 bg-white rounded-lg shadow-xl border p-4 w-80 z-30">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                      <Badge className={getStatusBadge(event.status)} variant="secondary">
                        {event.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      {event.address && (
                        <div className="flex items-start space-x-2">
                          <MapPin className="w-3 h-3 text-gray-500 mt-0.5" />
                          <span className="text-gray-600">{event.address}</span>
                        </div>
                      )}
                      
                      {event.customer && (
                        <div className="flex items-center space-x-2">
                          <User className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-600">{event.customer}</span>
                        </div>
                      )}
                      
                      {event.technician && (
                        <div className="flex items-center space-x-2">
                          <User className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-600">Tech: {event.technician}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-gray-500" />
                        <span className="text-gray-600">{event.time}</span>
                      </div>
                      
                      {event.phone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="w-3 h-3 text-gray-500" />
                          <span className="text-gray-600">{event.phone}</span>
                        </div>
                      )}
                      
                      {event.value && (
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="font-medium text-gray-900">Value: ${event.value}</span>
                          <span className={`text-xs px-2 py-1 rounded ${getEventTypeColor(event.type)} text-white`}>
                            {event.type.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 pt-3 mt-3 border-t">
                      <Button size="sm" className="flex-1 text-xs">
                        <Navigation className="w-3 h-3 mr-1" />
                        Directions
                      </Button>
                      {event.phone && (
                        <Button variant="outline" size="sm" className="flex-1 text-xs">
                          <Phone className="w-3 h-3 mr-1" />
                          Call
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Event Types</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                  <Wrench className="w-2 h-2 text-white" />
                </div>
                <span className="text-xs text-gray-600">Jobs</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                  <FileText className="w-2 h-2 text-white" />
                </div>
                <span className="text-xs text-gray-600">Estimates</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full flex items-center justify-center">
                  <CalendarDays className="w-2 h-2 text-white" />
                </div>
                <span className="text-xs text-gray-600">Events</span>
              </div>
            </div>
          </div>

          {/* Status Legend */}
          <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg p-3">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Status</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Confirmed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Pending</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-xs text-gray-600">Cancelled</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event List Sidebar */}
      <div className="w-80 bg-white border-l border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {selectedDate 
              ? `Events for ${selectedDate.toLocaleDateString()}`
              : 'All Events'
            }
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-3">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedEvent?.id === event.id 
                    ? 'bg-blue-50 border-blue-200' 
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
                onClick={() => setSelectedEvent(event)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getEventTypeColor(event.type)} flex items-center justify-center`}>
                      {getEventTypeIcon(event.type)}
                    </div>
                    <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                  </div>
                  <Badge className={getStatusBadge(event.status)} variant="secondary">
                    {event.status}
                  </Badge>
                </div>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-3 h-3" />
                    <span>{event.time}</span>
                  </div>
                  
                  {event.customer && (
                    <div className="flex items-center space-x-2">
                      <User className="w-3 h-3" />
                      <span>{event.customer}</span>
                    </div>
                  )}
                  
                  {event.technician && (
                    <div className="flex items-center space-x-2">
                      <User className="w-3 h-3" />
                      <span>Tech: {event.technician}</span>
                    </div>
                  )}
                  
                  {event.address && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-3 h-3 mt-0.5" />
                      <span className="line-clamp-2">{event.address}</span>
                    </div>
                  )}
                  
                  {event.value && (
                    <div className="flex justify-between items-center pt-2 border-t">
                      <span className="font-medium text-gray-900">${event.value}</span>
                      <span className={`text-xs px-2 py-1 rounded ${getEventTypeColor(event.type)} text-white`}>
                        {event.type.toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-8">
                <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No events found</p>
                <p className="text-sm text-gray-400 mt-1">
                  {selectedDate 
                    ? 'No events scheduled for this date'
                    : 'Try adjusting your filters'
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ScheduleMapView

