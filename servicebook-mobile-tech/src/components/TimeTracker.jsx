import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Clock, 
  MapPin, 
  Play, 
  Pause, 
  Square,
  Navigation,
  Coffee,
  Wrench,
  Car,
  AlertCircle,
  CheckCircle,
  Timer,
  Calendar,
  User,
  FileText,
  Save,
  RotateCcw
} from 'lucide-react';

const TimeTracker = ({ technician, currentJob, onTimeUpdate, onBreakToggle }) => {
  const [isWorking, setIsWorking] = useState(false);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [breakStartTime, setBreakStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalBreakTime, setTotalBreakTime] = useState(0);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [workDescription, setWorkDescription] = useState('');
  const [tasksCompleted, setTasksCompleted] = useState(['']);
  const [materialsUsed, setMaterialsUsed] = useState(['']);
  const [timeEntries, setTimeEntries] = useState([]);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    let interval = null;
    
    if (isWorking && !isOnBreak) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor((now - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isWorking, isOnBreak, startTime]);

  useEffect(() => {
    // Get current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date()
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
      );
    }
  }, [isWorking]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleClockIn = () => {
    const now = new Date();
    setStartTime(now);
    setIsWorking(true);
    setElapsedTime(0);
    
    // Create time entry
    const newEntry = {
      id: Date.now(),
      type: 'clock_in',
      timestamp: now,
      location: currentLocation,
      jobId: currentJob?.id,
      description: 'Clocked in for work'
    };
    
    setTimeEntries(prev => [...prev, newEntry]);
    onTimeUpdate && onTimeUpdate({ action: 'clock_in', entry: newEntry });
  };

  const handleClockOut = () => {
    const now = new Date();
    const totalWorkedSeconds = elapsedTime - totalBreakTime;
    
    // Create time entry
    const newEntry = {
      id: Date.now(),
      type: 'clock_out',
      timestamp: now,
      location: currentLocation,
      jobId: currentJob?.id,
      totalTime: elapsedTime,
      workTime: totalWorkedSeconds,
      breakTime: totalBreakTime,
      workDescription,
      tasksCompleted: tasksCompleted.filter(task => task.trim()),
      materialsUsed: materialsUsed.filter(material => material.trim()),
      notes,
      description: 'Clocked out from work'
    };
    
    setTimeEntries(prev => [...prev, newEntry]);
    setIsWorking(false);
    setIsOnBreak(false);
    setStartTime(null);
    setBreakStartTime(null);
    setElapsedTime(0);
    setTotalBreakTime(0);
    
    onTimeUpdate && onTimeUpdate({ action: 'clock_out', entry: newEntry });
  };

  const handleBreakToggle = () => {
    const now = new Date();
    
    if (!isOnBreak) {
      // Start break
      setIsOnBreak(true);
      setBreakStartTime(now);
      
      const newEntry = {
        id: Date.now(),
        type: 'break_start',
        timestamp: now,
        location: currentLocation,
        jobId: currentJob?.id,
        description: 'Started break'
      };
      
      setTimeEntries(prev => [...prev, newEntry]);
      onBreakToggle && onBreakToggle({ action: 'break_start', entry: newEntry });
    } else {
      // End break
      const breakDuration = Math.floor((now - breakStartTime) / 1000);
      setTotalBreakTime(prev => prev + breakDuration);
      setIsOnBreak(false);
      setBreakStartTime(null);
      
      const newEntry = {
        id: Date.now(),
        type: 'break_end',
        timestamp: now,
        location: currentLocation,
        jobId: currentJob?.id,
        breakDuration,
        description: `Ended break (${formatTime(breakDuration)})`
      };
      
      setTimeEntries(prev => [...prev, newEntry]);
      onBreakToggle && onBreakToggle({ action: 'break_end', entry: newEntry });
    }
  };

  const addTask = () => {
    setTasksCompleted(prev => [...prev, '']);
  };

  const updateTask = (index, value) => {
    setTasksCompleted(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const removeTask = (index) => {
    setTasksCompleted(prev => prev.filter((_, i) => i !== index));
  };

  const addMaterial = () => {
    setMaterialsUsed(prev => [...prev, '']);
  };

  const updateMaterial = (index, value) => {
    setMaterialsUsed(prev => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const removeMaterial = (index) => {
    setMaterialsUsed(prev => prev.filter((_, i) => i !== index));
  };

  const saveProgress = () => {
    const progressEntry = {
      id: Date.now(),
      type: 'progress_save',
      timestamp: new Date(),
      location: currentLocation,
      jobId: currentJob?.id,
      workDescription,
      tasksCompleted: tasksCompleted.filter(task => task.trim()),
      materialsUsed: materialsUsed.filter(material => material.trim()),
      notes,
      description: 'Progress saved'
    };
    
    setTimeEntries(prev => [...prev, progressEntry]);
    onTimeUpdate && onTimeUpdate({ action: 'save_progress', entry: progressEntry });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Time Display */}
      <Card className={`${isWorking ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
        <CardContent className="p-4">
          <div className="text-center">
            <div className="text-4xl font-mono font-bold mb-2">
              {formatTime(elapsedTime)}
            </div>
            <div className="flex justify-center space-x-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Work: </span>
                {formatTime(elapsedTime - totalBreakTime)}
              </div>
              <div>
                <span className="font-medium">Break: </span>
                {formatTime(totalBreakTime)}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center space-x-2 mt-4">
            {!isWorking ? (
              <Button onClick={handleClockIn} className="bg-green-500 hover:bg-green-600">
                <Play className="w-4 h-4 mr-2" />
                Clock In
              </Button>
            ) : (
              <>
                <Button 
                  onClick={handleBreakToggle}
                  variant={isOnBreak ? "default" : "outline"}
                  className={isOnBreak ? "bg-blue-500 hover:bg-blue-600" : ""}
                >
                  {isOnBreak ? (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      End Break
                    </>
                  ) : (
                    <>
                      <Coffee className="w-4 h-4 mr-2" />
                      Take Break
                    </>
                  )}
                </Button>
                
                <Button onClick={handleClockOut} className="bg-red-500 hover:bg-red-600">
                  <Square className="w-4 h-4 mr-2" />
                  Clock Out
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Job Info */}
      {currentJob && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Wrench className="w-5 h-5 mr-2" />
              Current Job
            </CardTitle>
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
          </CardContent>
        </Card>
      )}

      {/* Location Info */}
      {currentLocation && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Location Tracked</span>
              </div>
              <Badge variant="outline" className="text-xs">
                ±{Math.round(currentLocation.accuracy)}m
              </Badge>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Work Description */}
      {isWorking && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Work Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="work-description">Work Description</Label>
              <Textarea
                id="work-description"
                placeholder="Describe the work being performed..."
                value={workDescription}
                onChange={(e) => setWorkDescription(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Tasks Completed */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Tasks Completed</Label>
                <Button size="sm" variant="outline" onClick={addTask}>
                  Add Task
                </Button>
              </div>
              <div className="space-y-2">
                {tasksCompleted.map((task, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      placeholder="Task description..."
                      value={task}
                      onChange={(e) => updateTask(index, e.target.value)}
                      className="flex-1"
                    />
                    {tasksCompleted.length > 1 && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => removeTask(index)}
                        className="px-2"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Materials Used */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Materials Used</Label>
                <Button size="sm" variant="outline" onClick={addMaterial}>
                  Add Material
                </Button>
              </div>
              <div className="space-y-2">
                {materialsUsed.map((material, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      placeholder="Material description..."
                      value={material}
                      onChange={(e) => updateMaterial(index, e.target.value)}
                      className="flex-1"
                    />
                    {materialsUsed.length > 1 && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => removeMaterial(index)}
                        className="px-2"
                      >
                        ×
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Any additional notes or observations..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1"
              />
            </div>

            {/* Save Progress */}
            <Button onClick={saveProgress} className="w-full" variant="outline">
              <Save className="w-4 h-4 mr-2" />
              Save Progress
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Time Entries Log */}
      {timeEntries.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Time Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {timeEntries.slice().reverse().map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    {entry.type === 'clock_in' && <Play className="w-4 h-4 text-green-500" />}
                    {entry.type === 'clock_out' && <Square className="w-4 h-4 text-red-500" />}
                    {entry.type === 'break_start' && <Coffee className="w-4 h-4 text-blue-500" />}
                    {entry.type === 'break_end' && <Play className="w-4 h-4 text-blue-500" />}
                    {entry.type === 'progress_save' && <Save className="w-4 h-4 text-gray-500" />}
                    <div>
                      <div className="text-sm font-medium">{entry.description}</div>
                      <div className="text-xs text-gray-500">
                        {entry.timestamp.toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  {entry.location && (
                    <Navigation className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TimeTracker;

