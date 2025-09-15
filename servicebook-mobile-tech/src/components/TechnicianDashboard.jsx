import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CustomerInteraction from './CustomerInteraction';
import MaterialsManager from './MaterialsManager';
import TimeTracker from './TimeTracker';
import PhotoDocumentation from './PhotoDocumentation';
import PWAInstaller from './PWAInstaller';
import OfflineIndicator from './OfflineIndicator';
import { offlineManager } from '../utils/offlineManager';
import { 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  Calendar, 
  CheckCircle, 
  AlertCircle,
  PlayCircle,
  PauseCircle,
  Navigation,
  Wrench,
  Package,
  Camera,
  MessageSquare,
  FileText,
  Star,
  Battery,
  Wifi,
  Signal,
  Timer,
  ArrowLeft
} from 'lucide-react';
import '../App.css';

const TechnicianDashboard = ({ technician, onJobSelect, onClockToggle, isOnline }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isWorking, setIsWorking] = useState(false);
  const [todayJobs, setTodayJobs] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);
  const [activeView, setActiveView] = useState('dashboard'); // dashboard, timetracker, materials, customer
  const [timeEntries, setTimeEntries] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Initialize offline functionality
    const initializeOfflineData = async () => {
      try {
        // Load jobs from offline storage first
        const offlineJobs = await offlineManager.getJobs(technician?.id);
        if (offlineJobs.length > 0) {
          setTodayJobs(offlineJobs);
        } else {
          // Load mock data and store offline
          const mockJobs = [
            {
              id: 1,
              customer: 'John Meyer',
              address: '1251 Golf View Drive, Seeley Lake, MT',
              phone: '(406) 799-0536',
              scheduledTime: '09:00 AM',
              estimatedDuration: '2 hours',
              priority: 'high',
              status: 'scheduled',
              jobType: 'Plumbing Repair',
              description: 'Kitchen sink leak repair',
              materials: ['Pipe fittings', 'Sealant'],
              notes: 'Customer will be home all day',
              technician_id: technician?.id || 1
            },
            {
              id: 2,
              customer: 'Bruce Hall',
              address: '270 A Street, Seeley Lake, MT',
              phone: '(406) 799-0537',
              scheduledTime: '01:00 PM',
              estimatedDuration: '1.5 hours',
              priority: 'normal',
              status: 'scheduled',
              jobType: 'Water Heater Service',
              description: 'Annual maintenance check',
              materials: ['Filter', 'Anode rod'],
              notes: 'Access through basement',
              technician_id: technician?.id || 1
            },
            {
              id: 3,
              customer: 'Susan Scarr',
              address: '916 Grand Ave, Missoula, MT',
              phone: '(406) 799-0538',
              scheduledTime: '03:30 PM',
              estimatedDuration: '1 hour',
              priority: 'normal',
              status: 'scheduled',
              jobType: 'Drain Cleaning',
              description: 'Bathroom drain clog',
              materials: ['Drain snake', 'Cleaning solution'],
              notes: 'Elderly customer, be patient',
              technician_id: technician?.id || 1
            }
          ];
          
          setTodayJobs(mockJobs);
          
          // Store jobs offline for future use
          for (const job of mockJobs) {
            await offlineManager.storeJob(job);
          }
        }
      } catch (error) {
        console.error('Failed to initialize offline data:', error);
      }
    };

    initializeOfflineData();

    return () => clearInterval(timer);
  }, [technician]);

  const handleClockToggle = async () => {
    setIsWorking(!isWorking);
    onClockToggle(!isWorking);
    
    try {
      if (!isWorking) {
        await offlineManager.clockIn(technician?.id || 1);
        setActiveView('timetracker');
      } else {
        await offlineManager.clockOut(technician?.id || 1);
      }
    } catch (error) {
      console.error('Failed to record clock action:', error);
    }
  };

  const handleJobStart = async (job) => {
    setCurrentJob(job);
    setActiveView('timetracker');
    onJobSelect(job);
    
    try {
      await offlineManager.startJob(job.id, technician?.id || 1);
    } catch (error) {
      console.error('Failed to start job:', error);
    }
  };

  const handleTimeUpdate = async (timeData) => {
    setTimeEntries(prev => [...prev, timeData.entry]);
    
    try {
      await offlineManager.storeTimeEntry(timeData.entry);
    } catch (error) {
      console.error('Failed to store time entry:', error);
    }
  };

  const handleBreakToggle = (breakData) => {
    console.log('Break toggle:', breakData);
  };

  const handleMaterialRequest = async (request) => {
    try {
      await offlineManager.requestMaterials(
        currentJob?.id || request.job_id,
        request.materials,
        request.priority
      );
      console.log('Material request submitted:', request);
    } catch (error) {
      console.error('Failed to submit material request:', error);
    }
  };

  const handleInventoryUpdate = (update) => {
    console.log('Inventory update:', update);
    // In a real app, this would update the backend inventory
  };

  const handleInteractionSave = async (type, data) => {
    try {
      if (type === 'customer_notes' && currentJob) {
        await offlineManager.addToSyncQueue('UPDATE_CUSTOMER_NOTES', {
          customer_id: currentJob.customer_id,
          notes: data.notes,
          type: data.type
        });
      }
      console.log('Customer interaction saved:', type, data);
    } catch (error) {
      console.error('Failed to save customer interaction:', error);
    }
  };

  const handlePhotoCapture = async (photo) => {
    try {
      await offlineManager.capturePhoto(
        currentJob?.id || photo.job_id,
        photo.file,
        photo.category,
        photo.description
      );
      console.log('Photo captured and stored offline');
    } catch (error) {
      console.error('Failed to capture photo:', error);
    }
  };

  const handleSignatureCapture = (signatureData) => {
    console.log('Signature captured:', signatureData);
    // In a real app, this would save the signature to the backend
  };

  const handleJobComplete = (completionData) => {
    console.log('Job completed:', completionData);
    // API call to mark job as complete
  };

  const handleReportGenerate = (reportData) => {
    console.log('Report generated:', reportData);
    // API call to generate and save report
  };

  const handleBackToDashboard = () => {
    setActiveView('dashboard');
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'urgent': return 'bg-red-600';
      case 'normal': return 'bg-blue-500';
      case 'low': return 'bg-gray-500';
      default: return 'bg-blue-500';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'scheduled': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Status Bar */}
      <div className="bg-white border-b px-4 py-2 flex justify-between items-center text-sm">
        <div className="flex items-center space-x-2">
          <span className="font-medium">{currentTime.toLocaleTimeString()}</span>
          <div className="flex items-center space-x-1">
            <Signal className="w-4 h-4" />
            <Wifi className="w-4 h-4" />
            <Battery className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span className="text-xs">{isOnline ? 'Online' : 'Offline'}</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-blue-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {(activeView === 'timetracker' || activeView === 'materials' || activeView === 'customer' || activeView === 'photos') && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToDashboard}
                className="text-white hover:bg-blue-700 p-2"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-xl font-bold">
                {activeView === 'dashboard' ? 'Dashboard' : 
                 activeView === 'timetracker' ? 'Time Tracker' : 
                 activeView === 'materials' ? 'Materials' : 
                 activeView === 'customer' ? 'Customer' :
                 activeView === 'photos' ? 'Photos & Reports' : 'Dashboard'}
              </h1>
              <p className="text-blue-100 text-sm">Employee ID: {technician?.employeeId || 'TECH001'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-blue-100">Today</p>
            <p className="text-lg font-semibold">{currentTime.toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {activeView === 'dashboard' ? (
          <>
            {/* Clock In/Out Section */}
            <Card className="mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full ${isWorking ? 'bg-green-100' : 'bg-gray-100'}`}>
                      {isWorking ? (
                        <PauseCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <PlayCircle className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{isWorking ? 'Currently Working' : 'Not Clocked In'}</p>
                      <p className="text-sm text-gray-500">
                        {isWorking ? 'Started at 8:00 AM' : 'Ready to start your day'}
                      </p>
                    </div>
                  </div>
                  <Button 
                    onClick={handleClockToggle}
                    className={isWorking ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}
                  >
                    {isWorking ? 'Clock Out' : 'Clock In'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Current Job */}
            {currentJob && (
              <Card className="border-blue-500 border-2 mb-4">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-blue-600">Current Job</CardTitle>
                    <Badge className="bg-yellow-500">In Progress</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="font-medium">{currentJob.customer}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-500" />
                      <span className="text-sm text-gray-600">{currentJob.address}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Wrench className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{currentJob.jobType}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Navigation className="w-4 h-4 mr-1" />
                      Navigate
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                    <Button size="sm" onClick={() => setActiveView('timetracker')} className="flex-1">
                      <Timer className="w-4 h-4 mr-1" />
                      Track Time
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Today's Schedule */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold">Today's Schedule</h2>
                <Badge variant="outline">{todayJobs.length} jobs</Badge>
              </div>

              <div className="space-y-3">
                {todayJobs.map((job) => (
                  <Card key={job.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Badge className={getPriorityColor(job.priority)} variant="default">
                              {job.priority}
                            </Badge>
                            <Badge className={getStatusColor(job.status)} variant="outline">
                              {job.status}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <User className="w-4 h-4 text-gray-500" />
                              <span className="font-medium">{job.customer}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{job.scheduledTime} ({job.estimatedDuration})</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-4 h-4 text-gray-500" />
                              <span className="text-sm text-gray-600">{job.address}</span>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Wrench className="w-4 h-4 text-gray-500" />
                              <span className="text-sm">{job.jobType}</span>
                            </div>
                            
                            <p className="text-sm text-gray-600 mt-2">{job.description}</p>
                            
                            {job.notes && (
                              <div className="flex items-start space-x-2 mt-2">
                                <FileText className="w-4 h-4 text-yellow-500 mt-0.5" />
                                <span className="text-sm text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                                  {job.notes}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="ml-4 flex flex-col space-y-2">
                          <Button 
                            size="sm" 
                            onClick={() => handleJobStart(job)}
                            disabled={job.status === 'completed'}
                          >
                            {job.status === 'completed' ? 'Completed' : 'Start Job'}
                          </Button>
                          
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline" className="p-2">
                              <Navigation className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="p-2">
                              <Phone className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      {job.materials && job.materials.length > 0 && (
                        <div className="mt-3 pt-3 border-t">
                          <div className="flex items-center space-x-2 mb-2">
                            <Package className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-medium">Required Materials:</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {job.materials.map((material, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {material}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="outline" className="h-16 flex flex-col space-y-1">
                  <Package className="w-6 h-6" />
                  <span className="text-sm">Request Materials</span>
                </Button>
                
                <Button variant="outline" className="h-16 flex flex-col space-y-1" onClick={() => setActiveView('photos')}>
                  <Camera className="w-6 h-6" />
                  <span className="text-sm">Take Photos</span>
                </Button>
                  <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex flex-col items-center space-y-1 h-16 w-20"
                  onClick={() => setActiveView('customer')}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span className="text-sm">Customer Notes</span>
                </Button>    
                <Button variant="outline" className="h-16 flex flex-col space-y-1">
                  <FileText className="w-6 h-6" />
                  <span className="text-sm">Job Reports</span>
                </Button>
              </div>
            </div>
          </>
        ) : activeView === 'customer' ? (
          /* Customer Interaction View */
          <CustomerInteraction 
            customer={currentJob?.customer}
            currentJob={currentJob}
            technician={technician}
            onInteractionSave={handleInteractionSave}
            onSignatureCapture={handleSignatureCapture}
          />
        ) : activeView === 'photos' ? (
          /* Photo Documentation View */
          <PhotoDocumentation 
            currentJob={currentJob}
            technician={technician}
            onPhotoCapture={handlePhotoCapture}
            onJobComplete={handleJobComplete}
            onReportGenerate={handleReportGenerate}
          />
        ) : activeView === 'materials' ? (
          /* Materials Manager View */
          <MaterialsManager 
            technician={technician}
            currentJob={currentJob}
            onMaterialRequest={handleMaterialRequest}
            onInventoryUpdate={handleInventoryUpdate}
          />
        ) : (
          /* Time Tracker View */
          <TimeTracker 
            technician={technician}
            currentJob={currentJob}
            onTimeUpdate={handleTimeUpdate}
            onBreakToggle={handleBreakToggle}
          />
        )}
      </div>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="grid grid-cols-4 h-16">
          <button 
            className={`flex flex-col items-center justify-center space-y-1 ${activeView === 'dashboard' ? 'text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveView('dashboard')}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-xs">Schedule</span>
          </button>
          
          <button 
            className={`flex flex-col items-center justify-center space-y-1 ${activeView === 'timetracker' ? 'text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveView('timetracker')}
          >
            <Timer className="w-5 h-5" />
            <span className="text-xs">Time</span>
          </button>
          
          <button 
            className={`flex flex-col items-center justify-center space-y-1 ${activeView === 'materials' ? 'text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveView('materials')}
          >
            <Package className="w-5 h-5" />
            <span className="text-xs">Materials</span>
          </button>
          
          <button className="flex flex-col items-center justify-center space-y-1 text-gray-500">
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </button>
        </div>
      </div>

      {/* PWA Installer */}
      <PWAInstaller />
      
      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  );
};

export default TechnicianDashboard;

