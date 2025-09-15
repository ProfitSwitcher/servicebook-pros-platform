import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Camera, 
  Image, 
  Upload, 
  Trash2, 
  Eye, 
  CheckCircle, 
  Clock, 
  MapPin, 
  User,
  FileText,
  Download,
  Share,
  Tag,
  Calendar
} from 'lucide-react';

const PhotoDocumentation = ({ 
  currentJob, 
  technician, 
  onPhotoCapture, 
  onJobComplete,
  onReportGenerate 
}) => {
  const [activeTab, setActiveTab] = useState('photos');
  const [photos, setPhotos] = useState([
    {
      id: 1,
      url: '/api/placeholder/300/200',
      caption: 'Before - Kitchen sink leak',
      category: 'before',
      timestamp: new Date('2025-09-15T09:15:00'),
      location: 'Kitchen sink area'
    },
    {
      id: 2,
      url: '/api/placeholder/300/200',
      caption: 'Damaged pipe fitting',
      category: 'problem',
      timestamp: new Date('2025-09-15T09:30:00'),
      location: 'Under sink cabinet'
    },
    {
      id: 3,
      url: '/api/placeholder/300/200',
      caption: 'New pipe fitting installed',
      category: 'solution',
      timestamp: new Date('2025-09-15T10:45:00'),
      location: 'Under sink cabinet'
    }
  ]);
  
  const [jobCompletion, setJobCompletion] = useState({
    workPerformed: '',
    materialsUsed: [
      { item: 'Pipe fitting', quantity: 1, cost: 15.99 },
      { item: 'Sealant', quantity: 1, cost: 8.50 }
    ],
    timeSpent: '2.5',
    customerSatisfaction: 5,
    followUpRequired: false,
    notes: '',
    completionStatus: 'in-progress'
  });

  const fileInputRef = useRef(null);

  const handlePhotoUpload = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newPhoto = {
          id: Date.now() + Math.random(),
          url: e.target.result,
          caption: `Photo taken at ${new Date().toLocaleTimeString()}`,
          category: 'progress',
          timestamp: new Date(),
          location: currentJob?.address || 'Job site'
        };
        setPhotos(prev => [...prev, newPhoto]);
        onPhotoCapture?.(newPhoto);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeletePhoto = (photoId) => {
    setPhotos(prev => prev.filter(photo => photo.id !== photoId));
  };

  const handleJobComplete = () => {
    const completionData = {
      ...jobCompletion,
      completionStatus: 'completed',
      completedAt: new Date(),
      photos: photos,
      technician: technician
    };
    
    setJobCompletion(prev => ({ ...prev, completionStatus: 'completed' }));
    onJobComplete?.(completionData);
  };

  const generateReport = () => {
    const reportData = {
      job: currentJob,
      completion: jobCompletion,
      photos: photos,
      technician: technician,
      generatedAt: new Date()
    };
    
    onReportGenerate?.(reportData);
  };

  const getCategoryColor = (category) => {
    const colors = {
      before: 'bg-blue-100 text-blue-800',
      problem: 'bg-red-100 text-red-800',
      solution: 'bg-green-100 text-green-800',
      progress: 'bg-yellow-100 text-yellow-800',
      after: 'bg-purple-100 text-purple-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const renderPhotosTab = () => (
    <div className="space-y-4">
      {/* Photo Capture Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          onClick={() => fileInputRef.current?.click()}
          className="h-16 flex flex-col space-y-1"
        >
          <Camera className="w-6 h-6" />
          <span className="text-sm">Take Photo</span>
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => fileInputRef.current?.click()}
          className="h-16 flex flex-col space-y-1"
        >
          <Upload className="w-6 h-6" />
          <span className="text-sm">Upload Photo</span>
        </Button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        capture="environment"
        onChange={handlePhotoUpload}
        className="hidden"
      />

      {/* Photo Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Job Photos ({photos.length})</h3>
          <Badge variant="secondary">{photos.length} photos</Badge>
        </div>
        
        {photos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden">
            <div className="relative">
              <img 
                src={photo.url} 
                alt={photo.caption}
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 right-2 flex space-x-1">
                <Button size="sm" variant="secondary" className="p-2">
                  <Eye className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  className="p-2"
                  onClick={() => handleDeletePhoto(photo.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <Badge 
                className={`absolute top-2 left-2 ${getCategoryColor(photo.category)}`}
              >
                {photo.category}
              </Badge>
            </div>
            <CardContent className="p-3">
              <p className="font-medium text-sm">{photo.caption}</p>
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{photo.timestamp.toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3" />
                  <span>{photo.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCompletionTab = () => (
    <div className="space-y-4">
      {/* Job Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Job Status</CardTitle>
            <Badge 
              className={
                jobCompletion.completionStatus === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }
            >
              {jobCompletion.completionStatus === 'completed' ? 'Completed' : 'In Progress'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Work Performed */}
          <div>
            <label className="block text-sm font-medium mb-2">Work Performed</label>
            <textarea
              value={jobCompletion.workPerformed}
              onChange={(e) => setJobCompletion(prev => ({ ...prev, workPerformed: e.target.value }))}
              placeholder="Describe the work completed..."
              className="w-full p-3 border rounded-lg resize-none h-20"
            />
          </div>

          {/* Time Spent */}
          <div>
            <label className="block text-sm font-medium mb-2">Time Spent (hours)</label>
            <input
              type="number"
              step="0.5"
              value={jobCompletion.timeSpent}
              onChange={(e) => setJobCompletion(prev => ({ ...prev, timeSpent: e.target.value }))}
              className="w-full p-3 border rounded-lg"
              placeholder="2.5"
            />
          </div>

          {/* Materials Used */}
          <div>
            <label className="block text-sm font-medium mb-2">Materials Used</label>
            <div className="space-y-2">
              {jobCompletion.materialsUsed.map((material, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{material.item} (x{material.quantity})</span>
                  <span className="text-sm font-medium">${material.cost}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-medium">Total Materials:</span>
                <span className="font-medium">
                  ${jobCompletion.materialsUsed.reduce((sum, item) => sum + item.cost, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Customer Satisfaction */}
          <div>
            <label className="block text-sm font-medium mb-2">Customer Satisfaction</label>
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((rating) => (
                <Button
                  key={rating}
                  size="sm"
                  variant={jobCompletion.customerSatisfaction >= rating ? "default" : "outline"}
                  onClick={() => setJobCompletion(prev => ({ ...prev, customerSatisfaction: rating }))}
                  className="w-10 h-10"
                >
                  {rating}
                </Button>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Additional Notes</label>
            <textarea
              value={jobCompletion.notes}
              onChange={(e) => setJobCompletion(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes or observations..."
              className="w-full p-3 border rounded-lg resize-none h-16"
            />
          </div>
        </CardContent>
      </Card>

      {/* Completion Actions */}
      <div className="space-y-3">
        {jobCompletion.completionStatus !== 'completed' && (
          <Button 
            onClick={handleJobComplete}
            className="w-full h-12 bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-5 h-5 mr-2" />
            Complete Job
          </Button>
        )}
        
        <Button 
          variant="outline" 
          onClick={generateReport}
          className="w-full h-12"
        >
          <FileText className="w-5 h-5 mr-2" />
          Generate Report
        </Button>
      </div>
    </div>
  );

  const renderReportsTab = () => (
    <div className="space-y-4">
      {/* Job Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Job Summary Report</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Customer:</span>
              <p className="font-medium">{currentJob?.customer?.name || 'John Meyer'}</p>
            </div>
            <div>
              <span className="text-gray-500">Date:</span>
              <p className="font-medium">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <span className="text-gray-500">Technician:</span>
              <p className="font-medium">{technician?.name || 'Mike Johnson'}</p>
            </div>
            <div>
              <span className="text-gray-500">Duration:</span>
              <p className="font-medium">{jobCompletion.timeSpent} hours</p>
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Work Performed:</h4>
            <p className="text-sm text-gray-600">
              {jobCompletion.workPerformed || 'Kitchen sink leak repair - replaced damaged pipe fitting and applied new sealant.'}
            </p>
          </div>
          
          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Photos Captured:</h4>
            <p className="text-sm text-gray-600">{photos.length} photos documenting the work</p>
          </div>
        </CardContent>
      </Card>

      {/* Report Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="h-16 flex flex-col space-y-1">
          <Download className="w-6 h-6" />
          <span className="text-sm">Download PDF</span>
        </Button>
        
        <Button variant="outline" className="h-16 flex flex-col space-y-1">
          <Share className="w-6 h-6" />
          <span className="text-sm">Share Report</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className="grid grid-cols-3 gap-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={activeTab === 'photos' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('photos')}
          className="flex items-center space-x-1"
        >
          <Camera className="w-4 h-4" />
          <span>Photos</span>
          <Badge variant="secondary" className="ml-1">{photos.length}</Badge>
        </Button>
        
        <Button
          variant={activeTab === 'completion' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('completion')}
          className="flex items-center space-x-1"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Complete</span>
        </Button>
        
        <Button
          variant={activeTab === 'reports' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('reports')}
          className="flex items-center space-x-1"
        >
          <FileText className="w-4 h-4" />
          <span>Reports</span>
        </Button>
      </div>

      {/* Tab Content */}
      {activeTab === 'photos' && renderPhotosTab()}
      {activeTab === 'completion' && renderCompletionTab()}
      {activeTab === 'reports' && renderReportsTab()}
    </div>
  );
};

export default PhotoDocumentation;

