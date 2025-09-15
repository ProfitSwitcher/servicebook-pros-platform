import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Phone, 
  MessageSquare, 
  FileText, 
  PenTool, 
  Camera, 
  CheckCircle,
  AlertTriangle,
  Clock,
  Send,
  Save,
  RotateCcw,
  Download,
  Upload,
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Info,
  Clipboard,
  Edit3,
  Mail,
  MapPin,
  Calendar,
  DollarSign,
  FileCheck,
  UserCheck,
  MessageCircle,
  Signature,
  Image as ImageIcon,
  X,
  Plus,
  Minus
} from 'lucide-react';

const CustomerInteraction = ({ customer, currentJob, technician, onInteractionSave, onSignatureCapture }) => {
  const [activeTab, setActiveTab] = useState('communication'); // communication, questions, approval, signature
  const [isSignaturePadOpen, setIsSignaturePadOpen] = useState(false);
  const [signatureData, setSignatureData] = useState(null);
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastPosition, setLastPosition] = useState({ x: 0, y: 0 });

  // Communication state
  const [communication, setCommunication] = useState({
    type: 'note',
    subject: '',
    message: '',
    priority: 'normal',
    followUpRequired: false,
    followUpDate: '',
    customerResponse: '',
    communicationHistory: []
  });

  // Questions state
  const [questions, setQuestions] = useState({
    generalQuestions: [],
    urgentQuestions: [],
    newQuestion: {
      type: 'general',
      question: '',
      priority: 'normal',
      category: 'general'
    }
  });

  // Approval state
  const [approval, setApproval] = useState({
    workDescription: '',
    estimatedCost: '',
    materials: [],
    laborHours: '',
    startDate: '',
    completionDate: '',
    specialInstructions: '',
    customerApproval: null,
    approvalDate: null,
    approvalSignature: null,
    changes: []
  });

  // Sample data initialization
  useEffect(() => {
    const sampleCommunication = [
      {
        id: 'COMM001',
        type: 'note',
        subject: 'Initial Assessment',
        message: 'Customer reported kitchen sink leak. Confirmed issue with pipe fitting under sink.',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        technician: 'Mike Johnson',
        priority: 'normal'
      },
      {
        id: 'COMM002',
        type: 'phone',
        subject: 'Parts Availability',
        message: 'Called customer to confirm parts will arrive by 2 PM. Customer approved delay.',
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
        technician: 'Mike Johnson',
        priority: 'normal'
      }
    ];

    const sampleQuestions = {
      generalQuestions: [
        {
          id: 'Q001',
          question: 'What is the preferred time for future maintenance visits?',
          category: 'scheduling',
          priority: 'normal',
          status: 'pending',
          askedBy: 'Mike Johnson',
          askedAt: new Date(Date.now() - 30 * 60 * 1000)
        }
      ],
      urgentQuestions: [
        {
          id: 'UQ001',
          question: 'Do you want us to replace the entire pipe section or just the fitting?',
          category: 'scope',
          priority: 'urgent',
          status: 'pending',
          askedBy: 'Mike Johnson',
          askedAt: new Date(Date.now() - 15 * 60 * 1000)
        }
      ]
    };

    setCommunication(prev => ({ ...prev, communicationHistory: sampleCommunication }));
    setQuestions(prev => ({ ...prev, ...sampleQuestions }));
  }, []);

  // Signature pad functions
  const startDrawing = (e) => {
    if (!canvasRef.current) return;
    
    setIsDrawing(true);
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;
    setLastPosition({ x, y });
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastPosition.x, lastPosition.y);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.stroke();

    setLastPosition({ x, y });
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const saveSignature = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const signatureDataUrl = canvas.toDataURL();
    setSignatureData(signatureDataUrl);
    setIsSignaturePadOpen(false);
    
    // Update approval with signature
    setApproval(prev => ({
      ...prev,
      approvalSignature: signatureDataUrl,
      approvalDate: new Date(),
      customerApproval: true
    }));

    onSignatureCapture && onSignatureCapture(signatureDataUrl);
  };

  const addCommunication = () => {
    if (!communication.message.trim()) return;

    const newComm = {
      id: `COMM${Date.now()}`,
      type: communication.type,
      subject: communication.subject || 'Customer Communication',
      message: communication.message,
      timestamp: new Date(),
      technician: technician?.name || 'Current Technician',
      priority: communication.priority
    };

    setCommunication(prev => ({
      ...prev,
      communicationHistory: [newComm, ...prev.communicationHistory],
      subject: '',
      message: '',
      type: 'note'
    }));

    onInteractionSave && onInteractionSave('communication', newComm);
  };

  const addQuestion = () => {
    if (!questions.newQuestion.question.trim()) return;

    const newQ = {
      id: `Q${Date.now()}`,
      question: questions.newQuestion.question,
      category: questions.newQuestion.category,
      priority: questions.newQuestion.priority,
      type: questions.newQuestion.type,
      status: 'pending',
      askedBy: technician?.name || 'Current Technician',
      askedAt: new Date()
    };

    if (questions.newQuestion.type === 'urgent') {
      setQuestions(prev => ({
        ...prev,
        urgentQuestions: [newQ, ...prev.urgentQuestions],
        newQuestion: { type: 'general', question: '', priority: 'normal', category: 'general' }
      }));
    } else {
      setQuestions(prev => ({
        ...prev,
        generalQuestions: [newQ, ...prev.generalQuestions],
        newQuestion: { type: 'general', question: '', priority: 'normal', category: 'general' }
      }));
    }

    onInteractionSave && onInteractionSave('question', newQ);
  };

  const saveApproval = () => {
    const approvalData = {
      ...approval,
      approvedBy: customer?.name || 'Customer',
      approvedAt: new Date(),
      technician: technician?.name || 'Current Technician'
    };

    onInteractionSave && onInteractionSave('approval', approvalData);
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'answered': return 'bg-green-500';
      case 'resolved': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Customer Info Header */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{customer?.name || 'Customer Name'}</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Phone className="w-4 h-4" />
                  <span>{customer?.phone || '(406) 799-0536'}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{customer?.address || currentJob?.address}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <button
          onClick={() => setActiveTab('communication')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'communication'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <MessageSquare className="w-4 h-4 inline mr-1" />
          Communication
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'questions'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <AlertCircle className="w-4 h-4 inline mr-1" />
          Questions
        </button>
        <button
          onClick={() => setActiveTab('approval')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'approval'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <FileCheck className="w-4 h-4 inline mr-1" />
          Approval
        </button>
        <button
          onClick={() => setActiveTab('signature')}
          className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'signature'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Signature className="w-4 h-4 inline mr-1" />
          Signature
        </button>
      </div>

      {/* Communication Tab */}
      {activeTab === 'communication' && (
        <div className="space-y-4">
          {/* New Communication */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">New Communication</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="comm-type">Type</Label>
                <Select value={communication.type} onValueChange={(value) => 
                  setCommunication(prev => ({ ...prev, type: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="note">Note</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="text">Text Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={communication.subject}
                  onChange={(e) => setCommunication(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Communication subject..."
                />
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  value={communication.message}
                  onChange={(e) => setCommunication(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Enter your message or notes..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={communication.priority} onValueChange={(value) => 
                  setCommunication(prev => ({ ...prev, priority: value }))
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

              <Button onClick={addCommunication} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Save Communication
              </Button>
            </CardContent>
          </Card>

          {/* Communication History */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Communication History</h3>
            {communication.communicationHistory.map((comm) => (
              <Card key={comm.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(comm.priority)}>
                        {comm.type}
                      </Badge>
                      <h4 className="font-medium">{comm.subject}</h4>
                    </div>
                    <span className="text-sm text-gray-500">
                      {comm.timestamp.toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-2">{comm.message}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <User className="w-4 h-4" />
                    <span>{comm.technician}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Questions Tab */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          {/* New Question */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ask Customer Question</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="question-type">Question Type</Label>
                <Select value={questions.newQuestion.type} onValueChange={(value) => 
                  setQuestions(prev => ({ 
                    ...prev, 
                    newQuestion: { ...prev.newQuestion, type: value }
                  }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General Question</SelectItem>
                    <SelectItem value="urgent">Urgent Question</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={questions.newQuestion.category} onValueChange={(value) => 
                  setQuestions(prev => ({ 
                    ...prev, 
                    newQuestion: { ...prev.newQuestion, category: value }
                  }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="scope">Scope of Work</SelectItem>
                    <SelectItem value="scheduling">Scheduling</SelectItem>
                    <SelectItem value="materials">Materials</SelectItem>
                    <SelectItem value="access">Property Access</SelectItem>
                    <SelectItem value="preferences">Customer Preferences</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  value={questions.newQuestion.question}
                  onChange={(e) => setQuestions(prev => ({ 
                    ...prev, 
                    newQuestion: { ...prev.newQuestion, question: e.target.value }
                  }))}
                  placeholder="Enter your question for the customer..."
                  rows={3}
                />
              </div>

              <Button onClick={addQuestion} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Question
              </Button>
            </CardContent>
          </Card>

          {/* Urgent Questions */}
          {questions.urgentQuestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <h3 className="text-lg font-semibold text-red-700">Urgent Questions</h3>
              </div>
              {questions.urgentQuestions.map((question) => (
                <Card key={question.id} className="border-red-200">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-red-500">urgent</Badge>
                        <Badge variant="outline">{question.category}</Badge>
                      </div>
                      <Badge className={getStatusColor(question.status)}>
                        {question.status}
                      </Badge>
                    </div>
                    <p className="text-gray-900 mb-2 font-medium">{question.question}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Asked by {question.askedBy}</span>
                      <span>{question.askedAt.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* General Questions */}
          {questions.generalQuestions.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">General Questions</h3>
              {questions.generalQuestions.map((question) => (
                <Card key={question.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-blue-500">general</Badge>
                        <Badge variant="outline">{question.category}</Badge>
                      </div>
                      <Badge className={getStatusColor(question.status)}>
                        {question.status}
                      </Badge>
                    </div>
                    <p className="text-gray-900 mb-2">{question.question}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>Asked by {question.askedBy}</span>
                      <span>{question.askedAt.toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Approval Tab */}
      {activeTab === 'approval' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Work Approval</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="work-description">Work Description</Label>
                <Textarea
                  id="work-description"
                  value={approval.workDescription}
                  onChange={(e) => setApproval(prev => ({ ...prev, workDescription: e.target.value }))}
                  placeholder="Describe the work to be performed..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="estimated-cost">Estimated Cost</Label>
                  <Input
                    id="estimated-cost"
                    type="number"
                    value={approval.estimatedCost}
                    onChange={(e) => setApproval(prev => ({ ...prev, estimatedCost: e.target.value }))}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="labor-hours">Labor Hours</Label>
                  <Input
                    id="labor-hours"
                    type="number"
                    value={approval.laborHours}
                    onChange={(e) => setApproval(prev => ({ ...prev, laborHours: e.target.value }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={approval.startDate}
                    onChange={(e) => setApproval(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="completion-date">Completion Date</Label>
                  <Input
                    id="completion-date"
                    type="date"
                    value={approval.completionDate}
                    onChange={(e) => setApproval(prev => ({ ...prev, completionDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="special-instructions">Special Instructions</Label>
                <Textarea
                  id="special-instructions"
                  value={approval.specialInstructions}
                  onChange={(e) => setApproval(prev => ({ ...prev, specialInstructions: e.target.value }))}
                  placeholder="Any special instructions or notes..."
                  rows={2}
                />
              </div>

              {approval.customerApproval && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Customer Approved</span>
                  </div>
                  <p className="text-sm text-green-600 mt-1">
                    Approved on {approval.approvalDate?.toLocaleString()}
                  </p>
                </div>
              )}

              <Button onClick={saveApproval} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save Approval Details
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Signature Tab */}
      {activeTab === 'signature' && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Customer Signature</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isSignaturePadOpen && !signatureData && (
                <div className="text-center py-8">
                  <Signature className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Signature Captured</h3>
                  <p className="text-gray-600 mb-4">Capture customer signature for work approval</p>
                  <Button onClick={() => setIsSignaturePadOpen(true)}>
                    <PenTool className="w-4 h-4 mr-2" />
                    Capture Signature
                  </Button>
                </div>
              )}

              {signatureData && !isSignaturePadOpen && (
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <img src={signatureData} alt="Customer Signature" className="w-full h-32 object-contain" />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={() => setIsSignaturePadOpen(true)} variant="outline" className="flex-1">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Retake
                    </Button>
                    <Button onClick={() => {/* Download signature */}} variant="outline" className="flex-1">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              )}

              {isSignaturePadOpen && (
                <div className="space-y-4">
                  <div className="border-2 border-gray-300 rounded-lg bg-white">
                    <canvas
                      ref={canvasRef}
                      width={350}
                      height={200}
                      className="w-full h-48 cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                    />
                  </div>
                  <p className="text-sm text-gray-600 text-center">
                    Please sign above to approve the work
                  </p>
                  <div className="flex space-x-2">
                    <Button onClick={clearSignature} variant="outline" className="flex-1">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Clear
                    </Button>
                    <Button onClick={() => setIsSignaturePadOpen(false)} variant="outline" className="flex-1">
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </Button>
                    <Button onClick={saveSignature} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default CustomerInteraction;

