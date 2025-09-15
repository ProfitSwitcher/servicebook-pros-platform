import React, { useState, useEffect } from 'react';
import TechnicianDashboard from './components/TechnicianDashboard';
import './App.css';

function App() {
  const [technician, setTechnician] = useState({
    firstName: 'Mike',
    lastName: 'Johnson',
    employeeId: 'TECH001',
    email: 'mike.johnson@servicebook.com',
    phone: '(406) 555-0123'
  });
  
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [selectedJob, setSelectedJob] = useState(null);
  const [isWorking, setIsWorking] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleJobSelect = (job) => {
    setSelectedJob(job);
    console.log('Selected job:', job);
  };

  const handleClockToggle = (working) => {
    setIsWorking(working);
    console.log('Clock status:', working ? 'Clocked In' : 'Clocked Out');
  };

  return (
    <div className="App">
      <TechnicianDashboard 
        technician={technician}
        onJobSelect={handleJobSelect}
        onClockToggle={handleClockToggle}
        isOnline={isOnline}
      />
    </div>
  );
}

export default App;
