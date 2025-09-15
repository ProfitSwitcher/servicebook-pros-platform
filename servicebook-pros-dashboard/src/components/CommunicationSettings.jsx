import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Settings, 
  Copy, 
  Check, 
  Upload, 
  Send, 
  Save,
  Edit,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react'

const CommunicationSettings = () => {
  const [activeTab, setActiveTab] = useState('sms')
  const [domainStatus, setDomainStatus] = useState('verified')
  const [apiKeyVisible, setApiKeyVisible] = useState(false)
  const [currentTemplate, setCurrentTemplate] = useState('appointment')
  const [showTestModal, setShowTestModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState(null)

  const [smsConfig, setSmsConfig] = useState({
    phoneNumber: '+1 (555) 123-7890',
    autoReply: true,
    businessHoursOnly: true,
    autoReplyMessage: "Thank you for contacting us! We'll get back to you soon during business hours."
  })

  const [emailConfig, setEmailConfig] = useState({
    customDomain: 'yourbusiness.com',
    sendgridApiKey: 'SG.************cz',
    fromEmail: 'noreply@yourbusiness.com',
    fromName: 'Your Business',
    signature: 'John Smith, Your Business'
  })

  const [templates, setTemplates] = useState({
    appointment: {
      sms: 'Hi {customer_name}, reminder: appointment on {appointment_time}. Reply STOP to opt out.',
      email: {
        subject: 'Appointment Reminder',
        content: '<p>Hi {customer_name},</p><p>This is a reminder for your appointment on {appointment_time}.</p><p>Thank you!</p>'
      }
    },
    estimate: {
      sms: 'Hi {customer_name}, your estimate is ready! Total: ${amount}. View: {estimate_link}',
      email: {
        subject: 'Your Estimate is Ready',
        content: '<p>Hi {customer_name},</p><p>Your estimate is ready for ${amount}.</p><p>Please review and let us know if you have questions.</p>'
      }
    },
    completion: {
      sms: 'Hi {customer_name}, your service is complete! Thank you for choosing us.',
      email: {
        subject: 'Service Completed',
        content: '<p>Hi {customer_name},</p><p>We have completed your service.</p><p>Thank you for choosing us!</p>'
      }
    }
  })

  const availableNumbers = [
    { number: '+1 (406) 555-0101', areaCode: '406', region: 'Montana', cost: '$1.00' },
    { number: '+1 (406) 555-0102', areaCode: '406', region: 'Montana', cost: '$1.00' },
    { number: '+1 (719) 555-0201', areaCode: '719', region: 'Colorado', cost: '$1.00' }
  ]

  const dnsRecords = [
    { type: 'SPF', value: 'v=spf1 include:sendgrid.net ~all' },
    { type: 'DKIM', value: 'abcXf07pcwYAGQBNu1RBIUC=' },
    { type: 'DMARC', value: 'v=DMARC1; p=none; rua=mailto:dmarc@yourbusiness.com' }
  ]

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      showNotification('Copied to clipboard!')
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSaveSettings = async () => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      showNotification('Settings saved successfully!')
    } catch (error) {
      showNotification('Failed to save settings', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendTest = async (type, recipient) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      showNotification(`Test ${type} sent to ${recipient}!`)
      setShowTestModal(false)
    } catch (error) {
      showNotification(`Failed to send test ${type}`, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const renderSMSConfiguration = () => (
    <div className="space-y-6">
      {/* Current Phone Number */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5" />
            SMS Configuration
          </CardTitle>
          <CardDescription>Manage your Twilio SMS settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Current Phone Number</label>
            <div className="flex items-center gap-3">
              <input 
                type="text" 
                value={smsConfig.phoneNumber}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
              />
              <Badge className="bg-green-100 text-green-700">Active</Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="autoReply"
                checked={smsConfig.autoReply}
                onChange={(e) => setSmsConfig({...smsConfig, autoReply: e.target.checked})}
                className="rounded"
              />
              <label htmlFor="autoReply" className="text-sm">Enable auto-reply</label>
            </div>
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="businessHours"
                checked={smsConfig.businessHoursOnly}
                onChange={(e) => setSmsConfig({...smsConfig, businessHoursOnly: e.target.checked})}
                className="rounded"
              />
              <label htmlFor="businessHours" className="text-sm">Business hours only</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Auto-Reply Message</label>
            <textarea 
              value={smsConfig.autoReplyMessage}
              onChange={(e) => setSmsConfig({...smsConfig, autoReplyMessage: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows="3"
              maxLength="160"
            />
            <div className="text-xs text-gray-500 mt-1">
              {smsConfig.autoReplyMessage.length}/160 characters
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Numbers */}
      <Card>
        <CardHeader>
          <CardTitle>Available Phone Numbers</CardTitle>
          <CardDescription>Purchase additional numbers for your business</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableNumbers.map((number, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-medium">{number.number}</div>
                  <div className="text-sm text-gray-500">{number.region} ({number.areaCode})</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{number.cost}/month</span>
                  <Button size="sm">Purchase</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderEmailConfiguration = () => (
    <div className="space-y-6">
      {/* Domain Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5" />
            Email Domain Configuration
          </CardTitle>
          <CardDescription>Set up your custom email domain</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Custom Domain</label>
            <div className="flex items-center gap-3">
              <input 
                type="text" 
                value={emailConfig.customDomain}
                onChange={(e) => setEmailConfig({...emailConfig, customDomain: e.target.value})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
              />
              <Badge className={`${domainStatus === 'verified' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                {domainStatus === 'verified' ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Pending
                  </>
                )}
              </Badge>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">From Email</label>
              <input 
                type="email" 
                value={emailConfig.fromEmail}
                onChange={(e) => setEmailConfig({...emailConfig, fromEmail: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">From Name</label>
              <input 
                type="text" 
                value={emailConfig.fromName}
                onChange={(e) => setEmailConfig({...emailConfig, fromName: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">SendGrid API Key</label>
            <div className="flex items-center gap-2">
              <input 
                type={apiKeyVisible ? "text" : "password"}
                value={emailConfig.sendgridApiKey}
                onChange={(e) => setEmailConfig({...emailConfig, sendgridApiKey: e.target.value})}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm"
              />
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setApiKeyVisible(!apiKeyVisible)}
              >
                {apiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DNS Records */}
      <Card>
        <CardHeader>
          <CardTitle>DNS Records</CardTitle>
          <CardDescription>Add these records to your domain's DNS settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dnsRecords.map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm">{record.type}</div>
                  <div className="text-xs text-gray-600 font-mono break-all">{record.value}</div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => copyToClipboard(record.value)}
                >
                  <Copy className="w-3 h-3 mr-1" />
                  Copy
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderTemplates = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Message Templates</CardTitle>
          <CardDescription>Customize your automated messages</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Template Selector */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {Object.keys(templates).map((template) => (
              <button
                key={template}
                onClick={() => setCurrentTemplate(template)}
                className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentTemplate === template
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {template.charAt(0).toUpperCase() + template.slice(1)}
              </button>
            ))}
          </div>

          {/* SMS Template */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">SMS Template</label>
              <textarea 
                value={templates[currentTemplate].sms}
                onChange={(e) => setTemplates({
                  ...templates,
                  [currentTemplate]: {
                    ...templates[currentTemplate],
                    sms: e.target.value
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows="3"
                maxLength="160"
              />
              <div className="text-xs text-gray-500 mt-1">
                {templates[currentTemplate].sms.length}/160 characters
              </div>
            </div>

            {/* Email Template */}
            <div>
              <label className="block text-sm font-medium mb-2">Email Subject</label>
              <input 
                type="text"
                value={templates[currentTemplate].email.subject}
                onChange={(e) => setTemplates({
                  ...templates,
                  [currentTemplate]: {
                    ...templates[currentTemplate],
                    email: {
                      ...templates[currentTemplate].email,
                      subject: e.target.value
                    }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email Content</label>
              <textarea 
                value={templates[currentTemplate].email.content}
                onChange={(e) => setTemplates({
                  ...templates,
                  [currentTemplate]: {
                    ...templates[currentTemplate],
                    email: {
                      ...templates[currentTemplate].email,
                      content: e.target.value
                    }
                  }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                rows="6"
              />
            </div>

            {/* Merge Fields Helper */}
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-sm font-medium text-blue-900 mb-2">Available Merge Fields:</div>
              <div className="text-xs text-blue-700 space-x-2">
                <span className="bg-blue-100 px-2 py-1 rounded">{'{customer_name}'}</span>
                <span className="bg-blue-100 px-2 py-1 rounded">{'{appointment_time}'}</span>
                <span className="bg-blue-100 px-2 py-1 rounded">{'{amount}'}</span>
                <span className="bg-blue-100 px-2 py-1 rounded">{'{job_address}'}</span>
                <span className="bg-blue-100 px-2 py-1 rounded">{'{technician_name}'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Communication Settings</h1>
          <p className="text-gray-600 mt-2">Configure SMS and email communication for your business</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowTestModal(true)}>
            <Send className="w-4 h-4 mr-2" />
            Send Test
          </Button>
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            {isLoading ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        {[
          { id: 'sms', label: 'SMS Configuration', icon: MessageSquare },
          { id: 'email', label: 'Email Setup', icon: Mail },
          { id: 'templates', label: 'Templates', icon: Edit }
        ].map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="min-h-[600px]">
        {activeTab === 'sms' && renderSMSConfiguration()}
        {activeTab === 'email' && renderEmailConfiguration()}
        {activeTab === 'templates' && renderTemplates()}
      </div>

      {/* Test Modal */}
      {showTestModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Send Test Message</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Recipient</label>
                <input 
                  type="text" 
                  placeholder="Phone number or email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Template</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                  <option value="appointment">Appointment Reminder</option>
                  <option value="estimate">Estimate Ready</option>
                  <option value="completion">Job Completion</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowTestModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleSendTest('SMS', '+1234567890')}>
                Send Test
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {notification.message}
          </div>
        </div>
      )}
    </div>
  )
}

export default CommunicationSettings

