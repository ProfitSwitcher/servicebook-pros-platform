import React, { useState, useEffect } from 'react'
import apiClient from '../utils/apiClient'
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  DollarSign,
  Award,
  TrendingUp,
  Settings,
  Eye,
  EyeOff,
  Shield,
  User,
  Wrench,
  Star,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  Plus
} from 'lucide-react'

const TeamManagement = () => {
  const [activeTab, setActiveTab] = useState('team-members')
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newMember, setNewMember] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'Technician', hourlyRate: '' })
  const [creatingMember, setCreatingMember] = useState(false)

  // Sample team data
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: 'Mike Johnson',
      role: 'Lead Technician',
      email: 'mike.johnson@company.com',
      phone: '(555) 123-4567',
      avatar: null,
      status: 'active',
      hire_date: '2023-01-15',
      hourly_rate: 35.00,
      specialties: ['HVAC', 'Electrical'],
      permissions: ['view_jobs', 'edit_jobs', 'view_customers', 'create_estimates'],
      stats: {
        jobs_completed: 127,
        avg_rating: 4.8,
        revenue_generated: 45600,
        efficiency_score: 92
      },
      schedule: {
        monday: { start: '08:00', end: '17:00' },
        tuesday: { start: '08:00', end: '17:00' },
        wednesday: { start: '08:00', end: '17:00' },
        thursday: { start: '08:00', end: '17:00' },
        friday: { start: '08:00', end: '17:00' },
        saturday: { start: '09:00', end: '15:00' },
        sunday: { start: null, end: null }
      }
    },
    {
      id: 2,
      name: 'Sarah Davis',
      role: 'Senior Technician',
      email: 'sarah.davis@company.com',
      phone: '(555) 234-5678',
      avatar: null,
      status: 'active',
      hire_date: '2023-03-20',
      hourly_rate: 32.00,
      specialties: ['Plumbing', 'General Repair'],
      permissions: ['view_jobs', 'edit_jobs', 'view_customers'],
      stats: {
        jobs_completed: 98,
        avg_rating: 4.9,
        revenue_generated: 38200,
        efficiency_score: 88
      },
      schedule: {
        monday: { start: '08:00', end: '17:00' },
        tuesday: { start: '08:00', end: '17:00' },
        wednesday: { start: '08:00', end: '17:00' },
        thursday: { start: '08:00', end: '17:00' },
        friday: { start: '08:00', end: '17:00' },
        saturday: { start: null, end: null },
        sunday: { start: null, end: null }
      }
    },
    {
      id: 3,
      name: 'Tom Wilson',
      role: 'Technician',
      email: 'tom.wilson@company.com',
      phone: '(555) 345-6789',
      avatar: null,
      status: 'active',
      hire_date: '2023-06-10',
      hourly_rate: 28.00,
      specialties: ['HVAC'],
      permissions: ['view_jobs', 'view_customers'],
      stats: {
        jobs_completed: 76,
        avg_rating: 4.6,
        revenue_generated: 28400,
        efficiency_score: 85
      },
      schedule: {
        monday: { start: '08:00', end: '17:00' },
        tuesday: { start: '08:00', end: '17:00' },
        wednesday: { start: '08:00', end: '17:00' },
        thursday: { start: '08:00', end: '17:00' },
        friday: { start: '08:00', end: '17:00' },
        saturday: { start: null, end: null },
        sunday: { start: null, end: null }
      }
    },
    {
      id: 4,
      name: 'Lisa Brown',
      role: 'Apprentice',
      email: 'lisa.brown@company.com',
      phone: '(555) 456-7890',
      avatar: null,
      status: 'active',
      hire_date: '2023-09-01',
      hourly_rate: 22.00,
      specialties: ['General Repair'],
      permissions: ['view_jobs'],
      stats: {
        jobs_completed: 34,
        avg_rating: 4.4,
        revenue_generated: 12800,
        efficiency_score: 78
      },
      schedule: {
        monday: { start: '08:00', end: '17:00' },
        tuesday: { start: '08:00', end: '17:00' },
        wednesday: { start: '08:00', end: '17:00' },
        thursday: { start: '08:00', end: '17:00' },
        friday: { start: '08:00', end: '17:00' },
        saturday: { start: null, end: null },
        sunday: { start: null, end: null }
      }
    }
  ])

  useEffect(() => {
    const loadTeam = async () => {
      setLoading(true)
      try {
        const data = await apiClient.getTechnicians()
        const members = Array.isArray(data) ? data : data?.technicians || data?.results || []
        if (members.length > 0) {
          const mapped = members.map(m => ({
            id: m.id,
            name: `${m.first_name || ''} ${m.last_name || ''}`.trim() || m.username || m.name || 'Unknown',
            role: m.role || 'Technician',
            email: m.email || '',
            phone: m.phone || '',
            avatar: null,
            status: m.status || 'active',
            hire_date: m.created_at || new Date().toISOString(),
            hourly_rate: parseFloat(m.hourly_rate || 0),
            specialties: m.specialties || [],
            permissions: m.permissions || ['view_jobs'],
            stats: {
              jobs_completed: m.jobs_completed || 0,
              avg_rating: m.avg_rating || 0,
              revenue_generated: m.revenue_generated || 0,
              efficiency_score: m.efficiency_score || 0
            },
            schedule: m.schedule || {}
          }))
          setTeamMembers(mapped)
        }
      } catch (err) {
        console.error('Failed to load team members, using sample data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadTeam()
  }, [])

  const handleCreateMember = async () => {
    if (!newMember.firstName || !newMember.email) return
    setCreatingMember(true)
    const newEntry = {
      id: Date.now(),
      name: `${newMember.firstName} ${newMember.lastName}`.trim(),
      role: newMember.role,
      email: newMember.email,
      phone: newMember.phone,
      avatar: null,
      status: 'active',
      hire_date: new Date().toISOString(),
      hourly_rate: parseFloat(newMember.hourlyRate) || 0,
      specialties: [],
      permissions: ['view_jobs'],
      stats: { jobs_completed: 0, avg_rating: 0, revenue_generated: 0, efficiency_score: 0 },
      schedule: {}
    }
    try {
      const created = await apiClient.createTechnician({
        first_name: newMember.firstName,
        last_name: newMember.lastName,
        email: newMember.email,
        phone: newMember.phone,
        role: newMember.role,
        hourly_rate: parseFloat(newMember.hourlyRate) || 0
      })
      newEntry.id = created.id || newEntry.id
    } catch (err) {
      console.error('Failed to create team member via API:', err)
    }
    setTeamMembers(prev => [...prev, newEntry])
    setCreatingMember(false)
    setShowAddModal(false)
    setNewMember({ firstName: '', lastName: '', email: '', phone: '', role: 'Technician', hourlyRate: '' })
  }

  const filteredMembers = teamMembers.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getRoleColor = (role) => {
    switch (role.toLowerCase()) {
      case 'lead technician': return 'bg-purple-100 text-purple-800'
      case 'senior technician': return 'bg-blue-100 text-blue-800'
      case 'technician': return 'bg-green-100 text-green-800'
      case 'apprentice': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-red-100 text-red-800'
      case 'on-leave': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const handleViewDetails = (member) => {
    setSelectedMember(member)
    setShowDetailsModal(true)
  }

  const TeamMemberCard = ({ member }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
            <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(member.role)}`}>
              {member.role}
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(member.status)}`}>
            {member.status}
          </span>
          <button
            onClick={() => handleViewDetails(member)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Mail className="w-4 h-4" />
          <span>{member.email}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Phone className="w-4 h-4" />
          <span>{member.phone}</span>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <DollarSign className="w-4 h-4" />
          <span>{formatCurrency(member.hourly_rate)}/hour</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {member.specialties.map((specialty, index) => (
          <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
            {specialty}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-gray-900">{member.stats.jobs_completed}</div>
          <div className="text-gray-500">Jobs Completed</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-900 flex items-center justify-center">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            {member.stats.avg_rating}
          </div>
          <div className="text-gray-500">Avg Rating</div>
        </div>
      </div>
    </div>
  )

  const TeamMemberDetails = ({ member, onClose }) => {
    if (!member) return null

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{member.name}</h2>
                <p className="text-gray-600">{member.role}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Basic Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{member.email}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{member.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">Hired: {new Date(member.hire_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{formatCurrency(member.hourly_rate)}/hour</span>
                    </div>
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Specialties</h3>
                  <div className="flex flex-wrap gap-2">
                    {member.specialties.map((specialty, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                        {specialty}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Permissions</h3>
                  <div className="space-y-2">
                    {member.permissions.map((permission, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700 capitalize">{permission.replace('_', ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Performance Stats */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{member.stats.jobs_completed}</div>
                      <div className="text-sm text-blue-700">Jobs Completed</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600 flex items-center">
                        <Star className="w-5 h-5 mr-1" />
                        {member.stats.avg_rating}
                      </div>
                      <div className="text-sm text-yellow-700">Average Rating</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{formatCurrency(member.stats.revenue_generated)}</div>
                      <div className="text-sm text-green-700">Revenue Generated</div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{member.stats.efficiency_score}%</div>
                      <div className="text-sm text-purple-700">Efficiency Score</div>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Schedule</h3>
                  <div className="space-y-2">
                    {Object.entries(member.schedule).map(([day, hours]) => (
                      <div key={day} className="flex items-center justify-between py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-700 capitalize">{day}</span>
                        <span className="text-sm text-gray-600">
                          {hours.start && hours.end ? `${hours.start} - ${hours.end}` : 'Off'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                <Edit className="w-4 h-4 mr-2 inline" />
                Edit Details
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                <Calendar className="w-4 h-4 mr-2 inline" />
                View Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Team Management</h2>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('team-members')}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg ${
              activeTab === 'team-members' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Team Members</span>
          </button>
          
          <button
            onClick={() => setActiveTab('roles-permissions')}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg ${
              activeTab === 'roles-permissions' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Roles & Permissions</span>
          </button>
          
          <button
            onClick={() => setActiveTab('performance')}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg ${
              activeTab === 'performance' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Performance</span>
          </button>
          
          <button
            onClick={() => setActiveTab('schedules')}
            className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-lg ${
              activeTab === 'schedules' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Schedules</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'team-members' && 'Team Members'}
                {activeTab === 'roles-permissions' && 'Roles & Permissions'}
                {activeTab === 'performance' && 'Team Performance'}
                {activeTab === 'schedules' && 'Team Schedules'}
              </h1>
              <p className="text-gray-600">
                {activeTab === 'team-members' && `${teamMembers.length} team members`}
                {activeTab === 'roles-permissions' && 'Manage user roles and permissions'}
                {activeTab === 'performance' && 'Track team performance metrics'}
                {activeTab === 'schedules' && 'Manage team schedules and availability'}
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Team Member</span>
            </button>
          </div>

          {/* Search and Filters */}
          {activeTab === 'team-members' && (
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'team-members' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMembers.map(member => (
                <TeamMemberCard key={member.id} member={member} />
              ))}
            </div>
          )}

          {activeTab === 'roles-permissions' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Management</h3>
              <p className="text-gray-600">Configure roles and permissions for team members.</p>
              <div className="mt-6 space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">Lead Technician</h4>
                  <p className="text-sm text-gray-600 mt-1">Full access to all features and team management</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">Senior Technician</h4>
                  <p className="text-sm text-gray-600 mt-1">Can manage jobs, customers, and create estimates</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">Technician</h4>
                  <p className="text-sm text-gray-600 mt-1">Can view and update assigned jobs</p>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">Apprentice</h4>
                  <p className="text-sm text-gray-600 mt-1">Limited access to view jobs and basic information</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="text-2xl font-bold text-gray-900">335</div>
                  <div className="text-sm text-gray-600">Total Jobs Completed</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="text-2xl font-bold text-gray-900">4.7</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="text-2xl font-bold text-gray-900">{formatCurrency(125000)}</div>
                  <div className="text-sm text-gray-600">Total Revenue</div>
                </div>
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="text-2xl font-bold text-gray-900">86%</div>
                  <div className="text-sm text-gray-600">Team Efficiency</div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Individual Performance</h3>
                <div className="space-y-4">
                  {teamMembers.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-600">{member.role}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6 text-sm">
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{member.stats.jobs_completed}</div>
                          <div className="text-gray-600">Jobs</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{member.stats.avg_rating}</div>
                          <div className="text-gray-600">Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{formatCurrency(member.stats.revenue_generated)}</div>
                          <div className="text-gray-600">Revenue</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{member.stats.efficiency_score}%</div>
                          <div className="text-gray-600">Efficiency</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'schedules' && (
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Schedules</h3>
              <p className="text-gray-600 mb-6">Manage team member schedules and availability.</p>
              
              <div className="space-y-4">
                {teamMembers.map(member => (
                  <div key={member.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{member.name}</div>
                          <div className="text-sm text-gray-600">{member.role}</div>
                        </div>
                      </div>
                      <button className="text-sm text-blue-600 hover:text-blue-700">Edit Schedule</button>
                    </div>
                    
                    <div className="grid grid-cols-7 gap-2 text-sm">
                      {Object.entries(member.schedule).map(([day, hours]) => (
                        <div key={day} className="text-center">
                          <div className="font-medium text-gray-700 capitalize mb-1">{day.slice(0, 3)}</div>
                          <div className="text-gray-600">
                            {hours.start && hours.end ? (
                              <div>
                                <div>{hours.start}</div>
                                <div>{hours.end}</div>
                              </div>
                            ) : (
                              <div className="text-gray-400">Off</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Team Member Details Modal */}
      {showDetailsModal && (
        <TeamMemberDetails 
          member={selectedMember} 
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedMember(null)
          }} 
        />
      )}

      {/* Add Team Member Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Team Member</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    value={newMember.firstName}
                    onChange={(e) => setNewMember(prev => ({ ...prev, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={newMember.lastName}
                    onChange={(e) => setNewMember(prev => ({ ...prev, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="john.doe@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Lead Technician">Lead Technician</option>
                  <option value="Senior Technician">Senior Technician</option>
                  <option value="Technician">Technician</option>
                  <option value="Apprentice">Apprentice</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate ($)</label>
                <input
                  type="number"
                  value={newMember.hourlyRate}
                  onChange={(e) => setNewMember(prev => ({ ...prev, hourlyRate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="25.00"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateMember}
                disabled={creatingMember || !newMember.firstName || !newMember.email}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {creatingMember ? 'Adding...' : 'Add Member'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamManagement

