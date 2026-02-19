import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Calendar,
  MapPin,
  User,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  FileText,
  MessageSquare,
  Package,
  Wrench,
  Phone,
  Mail,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  ChevronDown,
  Star,
  Flag,
  Timer,
  Target,
  Clipboard,
  HelpCircle,
  Zap,
  X
} from 'lucide-react'
import apiClient from '../utils/apiClient'

const JobsManagement = () => {
  const [jobs, setJobs] = useState([])
  const [selectedJob, setSelectedJob] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showJobModal, setShowJobModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [loading, setLoading] = useState(false)
  const [timerRunning, setTimerRunning] = useState(false)
  const [newJob, setNewJob] = useState({ customerName: '', type: '', scheduledDate: '', priority: 'normal', address: '', notes: '' })
  const [creatingJob, setCreatingJob] = useState(false)

  // Sample jobs data
  const sampleJobs = [
    {
      id: 1,
      jobNumber: 'JOB-001',
      title: 'HVAC System Repair',
      customer: {
        name: 'John Meyer',
        phone: '(406) 799-0536',
        email: 'john.meyer@email.com',
        address: '1251 Golf View Drive, Seeley Lake, MT 59868'
      },
      status: 'in-progress',
      priority: 'high',
      assignedTechnician: 'Mike Johnson',
      scheduledDate: '2025-09-12',
      scheduledTime: '10:00 AM - 12:00 PM',
      estimatedDuration: '2 hours',
      totalAmount: '$485.00',
      scopeOfWork: 'Replace faulty compressor unit and check refrigerant levels. Inspect ductwork for leaks.',
      materials: [
        { name: 'Compressor Unit', quantity: 1, cost: '$285.00', urgent: false },
        { name: 'Refrigerant R-410A', quantity: '2 lbs', cost: '$45.00', urgent: true },
        { name: 'Duct Tape', quantity: 1, cost: '$12.00', urgent: false }
      ],
      timeTracking: {
        startTime: '10:15 AM',
        endTime: null,
        totalHours: 1.5,
        billableHours: 1.5
      },
      homeownerQuestions: [
        { id: 1, question: 'What is the warranty on the new compressor?', urgent: false, answered: true },
        { id: 2, question: 'When was the last maintenance performed?', urgent: false, answered: false }
      ],
      urgentQuestions: [
        { id: 1, question: 'Is there access to the electrical panel?', urgent: true, answered: false }
      ],
      notes: 'Customer mentioned unusual noises from unit for past week. Check for loose components.',
      createdDate: '2025-09-10',
      lastUpdated: '2025-09-12 09:30 AM'
    },
    {
      id: 2,
      jobNumber: 'JOB-002',
      title: 'Plumbing - Kitchen Sink Installation',
      customer: {
        name: 'Susan Scarr',
        phone: '(770) 480-9498',
        email: 'susan.scarr@email.com',
        address: '916 Grand Ave, Missoula, MT 59802'
      },
      status: 'scheduled',
      priority: 'medium',
      assignedTechnician: 'Tom Wilson',
      scheduledDate: '2025-09-13',
      scheduledTime: '2:00 PM - 4:00 PM',
      estimatedDuration: '2 hours',
      totalAmount: '$325.00',
      scopeOfWork: 'Install new kitchen sink and faucet. Connect plumbing and test for leaks.',
      materials: [
        { name: 'Kitchen Sink', quantity: 1, cost: '$185.00', urgent: false },
        { name: 'Faucet Assembly', quantity: 1, cost: '$95.00', urgent: false },
        { name: 'Plumbing Fittings', quantity: 1, cost: '$25.00', urgent: true }
      ],
      timeTracking: {
        startTime: null,
        endTime: null,
        totalHours: 0,
        billableHours: 0
      },
      homeownerQuestions: [
        { id: 1, question: 'What type of warranty comes with the sink?', urgent: false, answered: false }
      ],
      urgentQuestions: [],
      notes: 'Customer prefers morning installation if possible. Check water pressure.',
      createdDate: '2025-09-11',
      lastUpdated: '2025-09-11 03:45 PM'
    },
    {
      id: 3,
      jobNumber: 'JOB-003',
      title: 'Electrical - Panel Upgrade',
      customer: {
        name: 'Michael Pritchard',
        phone: '(406) 546-9299',
        email: 'michael.pritchard@email.com',
        address: '5855 La Voie Ln, Missoula, MT 59808'
      },
      status: 'completed',
      priority: 'high',
      assignedTechnician: 'Sarah Davis',
      scheduledDate: '2025-09-10',
      scheduledTime: '8:00 AM - 12:00 PM',
      estimatedDuration: '4 hours',
      totalAmount: '$1,250.00',
      scopeOfWork: 'Upgrade electrical panel from 100A to 200A. Install new breakers and update wiring.',
      materials: [
        { name: '200A Electrical Panel', quantity: 1, cost: '$485.00', urgent: false },
        { name: 'Circuit Breakers', quantity: 8, cost: '$240.00', urgent: false },
        { name: 'Electrical Wire', quantity: '100 ft', cost: '$125.00', urgent: false }
      ],
      timeTracking: {
        startTime: '8:00 AM',
        endTime: '12:30 PM',
        totalHours: 4.5,
        billableHours: 4.0
      },
      homeownerQuestions: [
        { id: 1, question: 'How long will the power be off?', urgent: false, answered: true },
        { id: 2, question: 'Do I need a permit for this work?', urgent: false, answered: true }
      ],
      urgentQuestions: [],
      notes: 'Job completed successfully. Customer very satisfied with work quality.',
      createdDate: '2025-09-08',
      lastUpdated: '2025-09-10 12:45 PM'
    }
  ]

  useEffect(() => {
    const loadJobs = async () => {
      setLoading(true)
      try {
        const data = await apiClient.getJobs()
        const loaded = Array.isArray(data) ? data : (data?.jobs || data?.results || [])
        setJobs(loaded.length > 0 ? loaded : sampleJobs)
      } catch (err) {
        console.error('Failed to load jobs:', err)
        setJobs(sampleJobs)
      } finally {
        setLoading(false)
      }
    }
    loadJobs()
  }, [])

  const handleCreateJob = async (e) => {
    e.preventDefault()
    setCreatingJob(true)
    try {
      const created = await apiClient.createJob(newJob)
      setJobs(prev => [created, ...prev])
      setShowJobModal(false)
      setNewJob({ customerName: '', type: '', scheduledDate: '', priority: 'normal', address: '', notes: '' })
    } catch (err) {
      console.error('Failed to create job:', err)
      setJobs(prev => [{ ...newJob, id: Date.now(), status: 'scheduled', jobNumber: `JOB-${Date.now()}` }, ...prev])
      setShowJobModal(false)
      setNewJob({ customerName: '', type: '', scheduledDate: '', priority: 'normal', address: '', notes: '' })
    } finally {
      setCreatingJob(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'in-progress': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      case 'on-hold': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-yellow-600'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Calendar className="w-4 h-4" />
      case 'in-progress': return <PlayCircle className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'cancelled': return <X className="w-4 h-4" />
      case 'on-hold': return <PauseCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.jobNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const renderJobCard = (job) => (
    <Card key={job.id} className="mb-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedJob(job)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              {getStatusIcon(job.status)}
              <span className="font-semibold text-lg">{job.jobNumber}</span>
            </div>
            <Badge className={getStatusColor(job.status)}>
              {job.status.replace('-', ' ').toUpperCase()}
            </Badge>
            {job.priority === 'high' && (
              <Flag className={`w-4 h-4 ${getPriorityColor(job.priority)}`} />
            )}
          </div>
          <div className="text-right">
            <div className="font-semibold text-lg">{job.totalAmount}</div>
            <div className="text-sm text-gray-500">{job.estimatedDuration}</div>
          </div>
        </div>

        <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="font-medium">{job.customer.name}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{job.customer.phone}</span>
            </div>
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{job.customer.address}</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-sm">{job.scheduledDate} • {job.scheduledTime}</span>
            </div>
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm">Assigned to: {job.assignedTechnician}</span>
            </div>
            {job.materials.some(m => m.urgent) && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-600">Urgent materials needed</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            {job.urgentQuestions.length > 0 && (
              <Badge className="bg-red-100 text-red-800">
                {job.urgentQuestions.length} Urgent Questions
              </Badge>
            )}
            {job.homeownerQuestions.filter(q => !q.answered).length > 0 && (
              <Badge className="bg-blue-100 text-blue-800">
                {job.homeownerQuestions.filter(q => !q.answered).length} Questions
              </Badge>
            )}
          </div>
          <div className="text-sm text-gray-500">
            Updated: {job.lastUpdated}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderJobDetails = () => {
    if (!selectedJob) return null

    const tabs = [
      { id: 'overview', label: 'Overview', icon: Eye },
      { id: 'scope', label: 'Scope of Work', icon: FileText },
      { id: 'materials', label: 'Materials', icon: Package, badge: selectedJob.materials.filter(m => m.urgent).length },
      { id: 'time', label: 'Time Tracking', icon: Timer },
      { id: 'questions', label: 'Homeowner Questions', icon: MessageSquare, badge: selectedJob.homeownerQuestions.filter(q => !q.answered).length },
      { id: 'urgent-questions', label: 'Urgent Questions', icon: AlertTriangle, badge: selectedJob.urgentQuestions.length },
      { id: 'notes', label: 'Notes', icon: Clipboard }
    ]

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg w-full max-w-6xl h-5/6 overflow-hidden">
          <div className="flex h-full">
            {/* Job Details Header */}
            <div className="flex-1 flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h2 className="text-2xl font-bold">{selectedJob.jobNumber}</h2>
                      <Badge className={getStatusColor(selectedJob.status)}>
                        {selectedJob.status.replace('-', ' ').toUpperCase()}
                      </Badge>
                      {selectedJob.priority === 'high' && (
                        <Flag className={`w-5 h-5 ${getPriorityColor(selectedJob.priority)}`} />
                      )}
                    </div>
                    <h3 className="text-xl text-gray-700 mb-2">{selectedJob.title}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{selectedJob.customer.name}</span>
                      <span>•</span>
                      <span>{selectedJob.scheduledDate}</span>
                      <span>•</span>
                      <span>{selectedJob.assignedTechnician}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Job
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedJob(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                          activeTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                        {tab.badge > 0 && (
                          <Badge className="bg-red-100 text-red-800 text-xs">
                            {tab.badge}
                          </Badge>
                        )}
                      </button>
                    )
                  })}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Customer Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <span className="font-medium">{selectedJob.customer.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <span>{selectedJob.customer.phone}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span>{selectedJob.customer.email}</span>
                          </div>
                          <div className="flex items-start space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500 mt-1" />
                            <span>{selectedJob.customer.address}</span>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-lg">Job Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-semibold">{selectedJob.totalAmount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Estimated Duration:</span>
                            <span>{selectedJob.estimatedDuration}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Scheduled:</span>
                            <span>{selectedJob.scheduledDate} • {selectedJob.scheduledTime}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Assigned to:</span>
                            <span>{selectedJob.assignedTechnician}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Priority:</span>
                            <span className={`font-medium ${getPriorityColor(selectedJob.priority)}`}>
                              {selectedJob.priority.toUpperCase()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}

                {activeTab === 'scope' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Scope of Work</CardTitle>
                      <CardDescription>Detailed description of work to be performed</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 leading-relaxed">{selectedJob.scopeOfWork}</p>
                      </div>
                      <div className="mt-4">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Scope
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'materials' && (
                  <div className="space-y-4">
                    {selectedJob.materials.filter(m => m.urgent).length > 0 && (
                      <Card className="border-red-200 bg-red-50">
                        <CardHeader>
                          <CardTitle className="text-lg text-red-800 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            Urgent Materials Needed
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {selectedJob.materials.filter(m => m.urgent).map((material, index) => (
                              <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                                <div>
                                  <div className="font-medium">{material.name}</div>
                                  <div className="text-sm text-gray-600">Quantity: {material.quantity}</div>
                                </div>
                                <div className="text-right">
                                  <div className="font-semibold">{material.cost}</div>
                                  <Badge className="bg-red-100 text-red-800">URGENT</Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">All Materials</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {selectedJob.materials.map((material, index) => (
                            <div key={index} className="flex justify-between items-center p-3 border rounded">
                              <div>
                                <div className="font-medium">{material.name}</div>
                                <div className="text-sm text-gray-600">Quantity: {material.quantity}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">{material.cost}</div>
                                {material.urgent && (
                                  <Badge className="bg-red-100 text-red-800">URGENT</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between items-center font-semibold">
                            <span>Total Materials Cost:</span>
                            <span>${selectedJob.materials.reduce((sum, m) => sum + parseFloat(String(m.cost).replace('$', '')), 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {activeTab === 'time' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Time Tracking</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Start Time:</span>
                            <span className="font-medium">{selectedJob.timeTracking.startTime || 'Not started'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">End Time:</span>
                            <span className="font-medium">{selectedJob.timeTracking.endTime || 'In progress'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Total Hours:</span>
                            <span className="font-medium">{selectedJob.timeTracking.totalHours}h</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Billable Hours:</span>
                            <span className="font-medium">{selectedJob.timeTracking.billableHours}h</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {selectedJob.status === 'in-progress' ? (
                            <Button className="w-full bg-red-600 hover:bg-red-700">
                              <PauseCircle className="w-4 h-4 mr-2" />
                              Stop Timer
                            </Button>
                          ) : selectedJob.status === 'scheduled' ? (
                            <Button className="w-full bg-green-600 hover:bg-green-700">
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Start Timer
                            </Button>
                          ) : (
                            <Button variant="outline" className="w-full">
                              <Timer className="w-4 h-4 mr-2" />
                              View Time Log
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'questions' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Homeowner Questions</CardTitle>
                      <CardDescription>General questions for the homeowner</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedJob.homeownerQuestions.map((question) => (
                          <div key={question.id} className={`p-4 border rounded-lg ${question.answered ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium">{question.question}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {question.answered ? (
                                  <Badge className="bg-green-100 text-green-800">Answered</Badge>
                                ) : (
                                  <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                        <Button variant="outline" size="sm">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Question
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'urgent-questions' && (
                  <Card className="border-red-200">
                    <CardHeader>
                      <CardTitle className="text-lg text-red-800 flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        Urgent Homeowner Questions
                      </CardTitle>
                      <CardDescription>Questions that need immediate attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {selectedJob.urgentQuestions.length > 0 ? (
                          selectedJob.urgentQuestions.map((question) => (
                            <div key={question.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="font-medium text-red-800">{question.question}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                  {question.answered ? (
                                    <Badge className="bg-green-100 text-green-800">Answered</Badge>
                                  ) : (
                                    <Badge className="bg-red-100 text-red-800">URGENT</Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <HelpCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                            <p>No urgent questions at this time</p>
                          </div>
                        )}
                        <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-50">
                          <Plus className="w-4 h-4 mr-2" />
                          Add Urgent Question
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {activeTab === 'notes' && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Job Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-gray-700">{selectedJob.notes}</p>
                        </div>
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">Add Note</label>
                          <textarea 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            rows="3"
                            placeholder="Add a note about this job..."
                          />
                          <Button size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Note
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Jobs Management</h1>
          <p className="text-gray-600 mt-1">Manage all your service jobs and track progress</p>
        </div>
        <Button onClick={() => setShowJobModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Job
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs, customers, or job numbers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Status</option>
          <option value="scheduled">Scheduled</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="on-hold">On Hold</option>
        </select>
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
                <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                <p className="text-2xl font-bold">{jobs.length}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'in-progress').length}</p>
              </div>
              <PlayCircle className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{jobs.filter(j => j.status === 'completed').length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Urgent Items</p>
                <p className="text-2xl font-bold">
                  {jobs.reduce((sum, job) => sum + job.materials.filter(m => m.urgent).length + job.urgentQuestions.length, 0)}
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length > 0 ? (
          filteredJobs.map(renderJobCard)
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Try adjusting your search or filters' 
                  : 'Get started by creating your first job'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={() => setShowJobModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Job
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Job Details Modal */}
      {selectedJob && renderJobDetails()}

      {/* Create Job Modal */}
      {showJobModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">New Job</h2>
              <button onClick={() => setShowJobModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">&times;</button>
            </div>
            <form onSubmit={handleCreateJob} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name *</label>
                <input type="text" required value={newJob.customerName} onChange={e => setNewJob({...newJob, customerName: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. John Smith" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Type *</label>
                <input type="text" required value={newJob.type} onChange={e => setNewJob({...newJob, type: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g. HVAC Repair" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
                  <input type="date" value={newJob.scheduledDate} onChange={e => setNewJob({...newJob, scheduledDate: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select value={newJob.priority} onChange={e => setNewJob({...newJob, priority: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input type="text" value={newJob.address} onChange={e => setNewJob({...newJob, address: e.target.value})} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Service address" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea value={newJob.notes} onChange={e => setNewJob({...newJob, notes: e.target.value})} rows={3} className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Job notes..." />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowJobModal(false)} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                <button type="submit" disabled={creatingJob} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-60">{creatingJob ? 'Creating...' : 'Create Job'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobsManagement

