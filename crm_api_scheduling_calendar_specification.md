# ServiceBook Pros - CRM API Usage for Scheduling Calendar

## Overview
This document details the CRM API usage for the Scheduling Calendar component in the ServiceBook Pros CRM Dashboard. The Scheduling Calendar provides comprehensive appointment management with technician assignment, availability tracking, and calendar views.

## API Endpoints for Scheduling

### 1. Get Schedule Data
**Endpoint:** `GET /api/schedules`
**Purpose:** Retrieve schedule data for calendar views
**Authentication:** Required (company-scoped)

#### Request Parameters
```javascript
{
  view?: 'month' | 'week' | 'day',     // Calendar view type
  date?: string,                        // ISO date string for view center
  technician_id?: string,              // Filter by specific technician
  status?: 'scheduled' | 'completed' | 'cancelled',
  include_availability?: boolean        // Include technician availability slots
}
```

#### Response Format
```javascript
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "appt-2024-001",
        "work_order_id": "wo-2023-007",
        "customer_id": "cust-456",
        "customer": {
          "name": "Sarah K.",
          "company": "Heating Install Co",
          "phone": "(555) 234-5678",
          "address": "456 Oak Street, Anytown, CA"
        },
        "title": "Heating Install",
        "description": "Install new heating system",
        "start_time": "2024-07-08T13:00:00Z",
        "end_time": "2024-07-08T16:00:00Z",
        "status": "scheduled",
        "priority": "medium",
        "technician_id": "tech-lisa-t",
        "technician": {
          "name": "Lisa T",
          "specialization": "HVAC",
          "phone": "(555) 345-6789"
        },
        "job_type": "installation",
        "estimated_duration": 180,
        "color_code": "#10B981", // Green for HVAC
        "location": {
          "address": "456 Oak Street, Anytown, CA",
          "coordinates": {
            "lat": 34.0522,
            "lng": -118.2437
          }
        },
        "notes": "Customer will be home after 1 PM"
      }
    ],
    "technician_availability": [
      {
        "technician_id": "tech-mike-r",
        "name": "Mike R",
        "availability": [
          {
            "date": "2024-07-08",
            "slots": [
              {
                "start_time": "08:00",
                "end_time": "12:00",
                "status": "available"
              },
              {
                "start_time": "13:00",
                "end_time": "17:00",
                "status": "booked",
                "appointment_id": "appt-2024-002"
              }
            ]
          }
        ]
      }
    ],
    "calendar_meta": {
      "current_date": "2024-07-08",
      "view_start": "2024-07-01",
      "view_end": "2024-07-31",
      "total_appointments": 45,
      "available_slots": 23
    }
  }
}
```

### 2. Create Appointment
**Endpoint:** `POST /api/schedules`
**Purpose:** Schedule a new appointment
**Authentication:** Required (company-scoped)

#### Request Body
```javascript
{
  "work_order_id": "wo-2023-008",
  "customer_id": "cust-789",
  "title": "Electrical Panel Upgrade",
  "start_time": "2024-07-15T09:00:00Z",
  "estimated_duration": 240,
  "technician_id": "tech-alex-c",
  "priority": "high",
  "notes": "Customer requested morning appointment",
  "send_notifications": true
}
```

### 3. Update Appointment
**Endpoint:** `PATCH /api/schedules/{appointment_id}`
**Purpose:** Reschedule or modify appointment
**Authentication:** Required (company-scoped)

### 4. Get Technician Availability
**Endpoint:** `GET /api/technicians/availability`
**Purpose:** Check technician availability for scheduling
**Authentication:** Required (company-scoped)

## Frontend Implementation

### 1. Calendar Component Structure
```javascript
const SchedulingCalendar = () => {
  const [view, setView] = useState('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  const fetchScheduleData = async () => {
    const params = new URLSearchParams({
      view,
      date: currentDate.toISOString(),
      technician_id: selectedTechnician?.id || '',
      include_availability: 'true'
    });

    const response = await fetch(`/api/schedules?${params}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    const data = await response.json();
    setAppointments(data.data.appointments);
  };

  return (
    <div className="scheduling-calendar">
      <CalendarHeader 
        view={view}
        onViewChange={setView}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        technicians={technicians}
        selectedTechnician={selectedTechnician}
        onTechnicianFilter={setSelectedTechnician}
      />
      
      <CalendarGrid
        view={view}
        currentDate={currentDate}
        appointments={appointments}
        onAppointmentClick={handleAppointmentClick}
        onSlotClick={handleSlotClick}
      />
      
      <TodaysScheduleSidebar
        appointments={appointments.filter(isToday)}
        technicians={technicians}
      />
    </div>
  );
};
```

### 2. Color-Coded Appointment System
```javascript
const getJobTypeColor = (jobType, priority) => {
  const baseColors = {
    'electrical': '#3B82F6',    // Blue
    'hvac': '#10B981',          // Green  
    'plumbing': '#F59E0B',      // Orange
    'general': '#6B7280'        // Gray
  };
  
  const priorityModifiers = {
    'urgent': { opacity: 1, borderWidth: '3px' },
    'high': { opacity: 0.9, borderWidth: '2px' },
    'medium': { opacity: 0.7, borderWidth: '1px' },
    'low': { opacity: 0.5, borderWidth: '1px' }
  };
  
  return {
    backgroundColor: baseColors[jobType] || baseColors.general,
    ...priorityModifiers[priority]
  };
};
```

### 3. Quick Appointment Booking
```javascript
const QuickAppointmentModal = ({ isOpen, onClose, selectedSlot }) => {
  const [formData, setFormData] = useState({
    customer_id: '',
    title: '',
    estimated_duration: 120,
    technician_id: selectedSlot?.technician_id || '',
    priority: 'medium',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          start_time: selectedSlot.start_time,
          send_notifications: true
        })
      });

      if (response.ok) {
        onClose();
        // Refresh calendar data
        fetchScheduleData();
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-semibold">Quick Add Appointment</h3>
        
        <CustomerSelect
          value={formData.customer_id}
          onChange={(value) => setFormData(prev => ({ ...prev, customer_id: value }))}
        />
        
        <input
          type="text"
          placeholder="Appointment title"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          className="w-full p-2 border rounded"
        />
        
        <select
          value={formData.priority}
          onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
          className="w-full p-2 border rounded"
        >
          <option value="low">Low Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="high">High Priority</option>
          <option value="urgent">Urgent</option>
        </select>
        
        <div className="flex space-x-2">
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
            Schedule Appointment
          </button>
          <button type="button" onClick={onClose} className="bg-gray-300 px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};
```

## Integration Features

### 1. Work Order Integration
- Appointments automatically created from work orders
- Status synchronization between work orders and appointments
- Service details pre-populated from work order

### 2. Customer Integration
- Customer information displayed on appointments
- Quick access to customer history
- Contact information readily available

### 3. Technician Management
- Availability tracking and display
- Specialization-based assignment suggestions
- Performance metrics integration

### 4. Mobile Optimization
- Touch-friendly calendar navigation
- Swipe gestures for date navigation
- Optimized appointment cards for mobile screens

This specification ensures the Scheduling Calendar provides comprehensive appointment management with seamless integration into the CRM ecosystem.

