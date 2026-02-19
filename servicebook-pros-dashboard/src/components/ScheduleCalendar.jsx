import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import CalendarSettingsModal from './CalendarSettingsModal'
import ScheduleMapView from './ScheduleMapView'
import apiClient from '../utils/apiClient'
import { 
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Filter,
  Settings,
  MapPin,
  Clock,
  User,
  FileText,
  Wrench,
  CalendarDays,
  MoreHorizontal,
  Edit,
  Trash2,
  Phone,
  Mail,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

const ScheduleCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(null)
  const [hoveredDate, setHoveredDate] = useState(null)
  const [showAddMenu, setShowAddMenu] = useState(false)
  const [viewMode, setViewMode] = useState('calendar')
  const [filterText, setFilterText] = useState('')
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [teamCalendarsExpanded, setTeamCalendarsExpanded] = useState(true)
  const [selectedCalendars, setSelectedCalendars] = useState({
    team: true,
    personal: true,
    jobs: true,
    estimates: true
  })
  const [calendarSettings, setCalendarSettings] = useState({
    timezone: 'GMT-05:00',
    businessHoursOnly: true,
    showHolidays: true,
    displayOptions: {
      amount: false,
      arrivalWindow: true,
      cityState: false,
      customer: true,
      description: false,
      jobName: false,
      jobNumber: false,
      jobTags: false,
      phoneNumber: false,
      schedule: false,
      street: false,
      team: true,
      zipCode: false
    }
  })

  // State for events and jobs
  const [events, setEvents] = useState([])
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Sample events data as fallback
  const sampleEvents = [
    {
      id: 1,
      title: 'HVAC Repair - Johnson Residence',
      type: 'job',
      date: '2025-09-01',
      time: '9:00 AM - 11:00 AM',
      customer: 'Sarah Johnson',
      technician: 'Mike Johnson',
      address: '123 Oak Street, Miami, FL',
      phone: '(305) 555-0123',
      status: 'confirmed',
      priority: 'high',
      value: 850
    },
    {
      id: 2,
      title: 'Plumbing Estimate - Smith Office',
      type: 'estimate',
      date: '2025-09-12',
      time: '2:00 PM - 3:00 PM',
      customer: 'John Smith',
      technician: 'Sarah Davis',
      address: '456 Pine Avenue, Miami, FL',
      phone: '(305) 555-0456',
      status: 'pending',
      priority: 'medium',
      value: 1200
    },
    {
      id: 3,
      title: 'Team Meeting',
      type: 'event',
      date: '2025-09-14',
      time: '10:00 AM - 11:00 AM',
      location: 'Office Conference Room',
      attendees: ['Mike Johnson', 'Sarah Davis', 'Tom Wilson'],
      status: 'confirmed',
      priority: 'medium'
    },
    {
      id: 4,
      title: 'Electrical Work - Davis Home',
      type: 'job',
      date: '2025-09-14',
      time: '1:00 PM - 4:00 PM',
      customer: 'Maria Davis',
      technician: 'Tom Wilson',
      address: '789 Elm Road, Miami, FL',
      phone: '(305) 555-0789',
      status: 'confirmed',
      priority: 'low',
      value: 650
    }
  ]

  // Load schedule data from API
  const loadScheduleData = async () => {
    setLoading(true)
    setError('')
    
    try {
      // Load jobs and events from API
      const [jobsData, eventsData] = await Promise.all([
        apiClient.getJobs({ include_scheduled: true }),
        // If you have a separate events endpoint:
        // apiClient.getEvents()
        Promise.resolve([]) // For now, no separate events endpoint
      ])
      
      // Transform jobs into calendar events
      const jobEvents = jobsData.map(job => ({
        id: job.id,
        title: `${job.title} - ${job.customer_name || 'Customer'}`,
        type: 'job',
        date: job.scheduled_date ? job.scheduled_date.split('T')[0] : null,
        time: job.scheduled_time || 'All Day',
        customer: job.customer_name,
        technician: job.assigned_technician,
        address: job.address,
        phone: job.customer_phone,
        status: job.status,
        priority: job.priority || 'medium',
        value: job.estimated_value || 0
      })).filter(event => event.date) // Only include jobs with scheduled dates
      
      setJobs(jobsData)
      setEvents([...jobEvents, ...eventsData])
      
    } catch (error) {
      console.error('Error loading schedule data:', error)
      setError('Failed to load schedule data')
      // Fall back to sample data
      setEvents(sampleEvents)
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadScheduleData()
  }, [])

  // Create new job via API
  const createJob = async (jobData) => {
    try {
      const newJob = await apiClient.createJob(jobData)
      
      // Add to local state
      setJobs(prev => [...prev, newJob])
      
      // Convert to calendar event and add to events
      const jobEvent = {
        id: newJob.id,
        title: `${newJob.title} - ${newJob.customer_name || 'Customer'}`,
        type: 'job',
        date: newJob.scheduled_date ? newJob.scheduled_date.split('T')[0] : null,
        time: newJob.scheduled_time || 'All Day',
        customer: newJob.customer_name,
        technician: newJob.assigned_technician,
        address: newJob.address,
        phone: newJob.customer_phone,
        status: newJob.status,
        priority: newJob.priority || 'medium',
        value: newJob.estimated_value || 0
      }
      
      if (jobEvent.date) {
        setEvents(prev => [...prev, jobEvent])
      }
      
      return newJob
    } catch (error) {
      console.error('Error creating job:', error)
      throw error
    }
  }

  // Update job via API
  const updateJob = async (jobId, jobData) => {
    try {
      const updatedJob = await apiClient.updateJob(jobId, jobData)
      
      // Update local state
      setJobs(prev => prev.map(job => job.id === jobId ? updatedJob : job))
      
      // Update events
      const jobEvent = {
        id: updatedJob.id,
        title: `${updatedJob.title} - ${updatedJob.customer_name || 'Customer'}`,
        type: 'job',
        date: updatedJob.scheduled_date ? updatedJob.scheduled_date.split('T')[0] : null,
        time: updatedJob.scheduled_time || 'All Day',
        customer: updatedJob.customer_name,
        technician: updatedJob.assigned_technician,
        address: updatedJob.address,
        phone: updatedJob.customer_phone,
        status: updatedJob.status,
        priority: updatedJob.priority || 'medium',
        value: updatedJob.estimated_value || 0
      }
      
      setEvents(prev => prev.map(event => 
        event.id === jobId && event.type === 'job' ? jobEvent : event
      ))
      
      return updatedJob
    } catch (error) {
      console.error('Error updating job:', error)
      throw error
    }
  }

  const teamCalendars = [
    { id: 'team', name: 'Team calendars', color: '#3B82F6', enabled: true, isParent: true },
    { id: 'mike', name: 'Mike Johnson', color: '#10B981', enabled: true, isParent: false },
    { id: 'sarah', name: 'Sarah Davis', color: '#F59E0B', enabled: true, isParent: false },
    { id: 'tom', name: 'Tom Wilson', color: '#EF4444', enabled: true, isParent: false },
    { id: 'lisa', name: 'Lisa Brown', color: '#8B5CF6', enabled: true, isParent: false }
  ]

  const [teamCalendarStates, setTeamCalendarStates] = useState(
    teamCalendars.reduce((acc, cal) => ({ ...acc, [cal.id]: cal.enabled }), {})
  )

  // Calendar navigation
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      const prevDate = new Date(year, month, -startingDayOfWeek + i + 1)
      days.push({ date: prevDate, isCurrentMonth: false })
    }
    
    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push({ date: new Date(year, month, day), isCurrentMonth: true })
    }
    
    // Add empty cells for days after the last day of the month
    const remainingCells = 42 - days.length
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i)
      days.push({ date: nextDate, isCurrentMonth: false })
    }
    
    return days
  }

  const getEventsForDate = (date) => {
    const dateString = date.toISOString().split('T')[0]
    return events.filter(event => event.date === dateString)
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

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + direction)
    setCurrentDate(newDate)
  }

  const isToday = (date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
  }

  const handleDateHover = (date, isEntering) => {
    if (isEntering) {
      setHoveredDate(date)
    } else {
      setHoveredDate(null)
    }
  }

  const handleDateClick = (date) => {
    setSelectedDate(date)
    setShowAddMenu(true)
  }

  const [showAddJobModal, setShowAddJobModal] = useState(false)

  const handleAddItem = (type) => {
    setShowAddMenu(false)
    setShowAddJobModal(true)
  }

  const toggleTeamCalendar = (calendarId) => {
    setTeamCalendarStates(prev => ({
      ...prev,
      [calendarId]: !prev[calendarId]
    }))
  }

  const handleSettingsChange = (newSettings) => {
    setCalendarSettings(newSettings)
  }

  const handleCalendarSync = (provider) => {
    console.log(`Connecting to ${provider} calendar...`)
    
    if (provider === 'google') {
      // Show a modal explaining the OAuth setup requirement
      alert(`Google Calendar Integration Setup Required:

To enable Google Calendar sync, you need to:
1. Create a Google Cloud Project
2. Enable the Google Calendar API
3. Configure OAuth 2.0 credentials
4. Update the client ID in the application

For demo purposes, this would redirect to Google's OAuth flow.
In production, this requires proper backend OAuth handling.`)
      
      // In a real implementation, this would be:
      // const googleAuthUrl = `https://accounts.google.com/oauth/authorize?` +
      //   `client_id=${process.env.REACT_APP_GOOGLE_CLIENT_ID}&` +
      //   `redirect_uri=${encodeURIComponent(window.location.origin)}/auth/google&` +
      //   `response_type=code&` +
      //   `scope=${encodeURIComponent('https://www.googleapis.com/auth/calendar')}&` +
      //   `access_type=offline`
      // window.location.href = googleAuthUrl
      
    } else if (provider === 'icloud') {
      // iCloud Calendar integration
      alert(`iCloud Calendar Integration Setup Required:

To enable iCloud Calendar sync, you need to:
1. Set up CalDAV server integration
2. Configure iCloud app-specific passwords
3. Implement CalDAV protocol handling

For demo purposes, this shows the integration flow.
In production, this requires server-side CalDAV implementation.`)
      
      // For iCloud, you would typically use CalDAV protocol
      // This requires server-side implementation to handle CalDAV requests
      console.log('iCloud CalDAV integration would be implemented here')
    }
  }

  // Filter events based on team calendar visibility
  const getVisibleEvents = () => {
    return events.filter(event => {
      const calendar = teamCalendars.find(cal => 
        cal.name.toLowerCase().includes(event.technician?.toLowerCase() || '')
      )
      return !calendar || teamCalendarStates[calendar.id]
    })
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Schedule</h2>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              New
            </Button>
          </div>
          
          {/* Mini Calendar */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-700">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <div className="flex space-x-1">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-xs">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <div key={index} className="text-center text-gray-500 font-medium py-1">
                  {day}
                </div>
              ))}
              {getDaysInMonth(currentDate).slice(0, 35).map((day, index) => (
                <button
                  key={index}
                  className={`text-center py-1 text-xs rounded hover:bg-blue-100 ${
                    day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  } ${isToday(day.date) ? 'bg-blue-600 text-white' : ''}`}
                >
                  {day.date.getDate()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Filter by name or tag"
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Team Calendars */}
        <div className="flex-1 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-gray-900">Areas</h3>
            <Edit className="w-4 h-4 text-gray-400" />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="team-calendars"
                checked={teamCalendarStates.team}
                onChange={() => toggleTeamCalendar('team')}
                className="rounded border-gray-300"
              />
              <label htmlFor="team-calendars" className="text-sm text-gray-700 flex-1">
                Team calendars
              </label>
              <Filter className="w-4 h-4 text-gray-400" />
              <button
                onClick={() => setTeamCalendarsExpanded(!teamCalendarsExpanded)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                {teamCalendarsExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
            </div>
            
            {teamCalendarsExpanded && teamCalendars.filter(cal => !cal.isParent).map((calendar) => (
              <div key={calendar.id} className="flex items-center space-x-2 ml-6">
                <input
                  type="checkbox"
                  id={calendar.id}
                  checked={teamCalendarStates[calendar.id]}
                  onChange={() => toggleTeamCalendar(calendar.id)}
                  className="rounded border-gray-300"
                />
                <div 
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: calendar.color }}
                />
                <label htmlFor={calendar.id} className="text-sm text-gray-700 flex-1 cursor-pointer">
                  {calendar.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Calendar Sync */}
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-900 mb-3">Calendar Sync</h3>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => handleCalendarSync('google')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Connect Google Calendar
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start"
              onClick={() => handleCalendarSync('icloud')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Connect iCloud Calendar
            </Button>
          </div>
        </div>
      </div>

      {/* Main Calendar */}
      <div className="flex-1 flex flex-col">
        {/* Calendar Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    viewMode === 'calendar' ? 'bg-blue-600 text-white' : 'text-gray-600'
                  }`}
                >
                  CALENDAR
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-3 py-1 text-sm font-medium rounded-md ${
                    viewMode === 'map' ? 'bg-blue-600 text-white' : 'text-gray-600'
                  }`}
                >
                  MAP
                </button>
              </div>
              <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Month</option>
                <option>Week</option>
                <option>Day</option>
              </select>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowSettingsModal(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Calendar Grid or Map View */}
        {viewMode === 'calendar' ? (
          <div className="flex-1 bg-white">
            {/* Day Headers */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {dayNames.map((day, index) => (
                <div key={index} className="p-4 text-center text-sm font-medium text-gray-500 border-r border-gray-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 flex-1">
              {getDaysInMonth(currentDate).map((day, index) => {
                const dayEvents = getVisibleEvents().filter(event => 
                  event.date === day.date.toISOString().split('T')[0]
                )
                const isHovered = hoveredDate && formatDateKey(hoveredDate) === formatDateKey(day.date)
                
                return (
                  <div
                    key={index}
                    className={`min-h-32 border-r border-b border-gray-200 last:border-r-0 p-2 relative cursor-pointer hover:bg-gray-50 ${
                      !day.isCurrentMonth ? 'bg-gray-50' : ''
                    } ${isToday(day.date) ? 'bg-blue-50' : ''}`}
                    onMouseEnter={() => handleDateHover(day.date, true)}
                    onMouseLeave={() => handleDateHover(day.date, false)}
                    onClick={() => handleDateClick(day.date)}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      !day.isCurrentMonth ? 'text-gray-400' : 
                      isToday(day.date) ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                      {day.date.getDate()}
                    </div>
                    
                    {/* Events */}
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={`text-xs p-1 rounded text-white truncate ${getEventTypeColor(event.type)}`}
                          title={`${event.title} - ${event.time}`}
                        >
                          <div className="flex items-center space-x-1">
                            {getEventTypeIcon(event.type)}
                            <span>{event.title}</span>
                          </div>
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500 pl-1">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>

                    {/* Hover Menu */}
                    {isHovered && (
                      <div className="absolute top-2 right-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2 z-10">
                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddItem('job')
                            }}
                            className="p-1 hover:bg-gray-100 rounded text-xs"
                            title="Add Job"
                          >
                            <Wrench className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddItem('estimate')
                            }}
                            className="p-1 hover:bg-gray-100 rounded text-xs"
                            title="Add Estimate"
                          >
                            <FileText className="w-3 h-3" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleAddItem('event')
                            }}
                            className="p-1 hover:bg-gray-100 rounded text-xs"
                            title="Add Event"
                          >
                            <CalendarDays className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <ScheduleMapView 
            events={getVisibleEvents()} 
            selectedDate={selectedDate}
            teamCalendars={teamCalendars.map(cal => ({
              ...cal,
              enabled: teamCalendarStates[cal.id]
            }))}
          />
        )}
      </div>

      {/* Calendar Settings Modal */}
      <CalendarSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        settings={calendarSettings}
        onSettingsChange={handleSettingsChange}
      />

      {/* Add Menu Modal */}
      {showAddMenu && selectedDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold mb-4">
              Add to {selectedDate.toLocaleDateString()}
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => handleAddItem('job')}
                className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg border"
              >
                <Wrench className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Job</div>
                  <div className="text-sm text-gray-500">Schedule a service job</div>
                </div>
              </button>
              <button
                onClick={() => handleAddItem('estimate')}
                className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg border"
              >
                <FileText className="w-5 h-5 text-orange-600" />
                <div className="text-left">
                  <div className="font-medium">Estimate</div>
                  <div className="text-sm text-gray-500">Schedule an estimate appointment</div>
                </div>
              </button>
              <button
                onClick={() => handleAddItem('event')}
                className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg border"
              >
                <CalendarDays className="w-5 h-5 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Event</div>
                  <div className="text-sm text-gray-500">Add a calendar event</div>
                </div>
              </button>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowAddMenu(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Add Job Modal */}
      {showAddJobModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold">Schedule Job</h2>
              <button onClick={() => setShowAddJobModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
            </div>
            <div className="p-6 space-y-4">
              {selectedDate && (
                <p className="text-sm text-gray-600">Date: <strong>{new Date(selectedDate).toLocaleDateString()}</strong></p>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                <input type="text" id="sched-customer" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Customer name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type</label>
                <input type="text" id="sched-type" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. HVAC Service, Electrical" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input type="time" id="sched-time" className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAddJobModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
                <button onClick={() => setShowAddJobModal(false)} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Schedule</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ScheduleCalendar

