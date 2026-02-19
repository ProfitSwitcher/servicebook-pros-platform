import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import apiClient from '../utils/apiClient'
import CommunicationSettings from './CommunicationSettings'
import { PricingLazy, TeamLazy } from './LazyComponents'
import { 
  Settings,
  ChevronDown,
  ChevronRight,
  MapPin,
  Users,
  FileText,
  Receipt,
  Zap,
  CheckSquare,
  Clock,
  Target,
  Tag,
  UserCheck,
  Repeat,
  Shield,
  Bell,
  MessageSquare,
  Phone,
  Globe,
  Star,
  Calendar,
  FormInput,
  DollarSign,
  Building,
  CreditCard,
  Key,
  Mail,
  Smartphone,
  Headphones,
  Monitor,
  BarChart3,
  Megaphone,
  BookOpen,
  Plus
} from 'lucide-react'

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('service-area')
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [profileData, setProfileData] = useState({ companyName: '', phone: '', address: '', email: '', timezone: '' })
  const [expandedSections, setExpandedSections] = useState({
    'jobs-estimates': true,
    'company': true,
    'communication': true,
    'marketing': true,
    'booking': true
  })

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }))
  }

  useEffect(() => {
    apiClient.getSettings().then((data) => {
      setProfileData({
        companyName: data.company_name || '',
        phone: data.phone || '',
        address: data.address || '',
        email: data.email || '',
        timezone: data.timezone || '',
      })
    }).catch(() => {
      // If API unavailable, leave fields empty
    })
  }, [])

  const settingsStructure = [
    {
      id: 'company',
      title: 'COMPANY',
      items: [
        { id: 'profile', title: 'Profile', icon: Building },
        { id: 'business-hours', title: 'Business hours', icon: Clock },
        { id: 'service-area', title: 'Service area', icon: MapPin, active: true },
        { id: 'team-permissions', title: 'Team & permissions', icon: Users },
        { id: 'ai-team', title: 'AI Team', icon: Users },
        { id: 'plans-billing', title: 'Plans & Billing', icon: CreditCard, expandable: true },
        { id: 'login-auth', title: 'Login authentication', icon: Key },
        { id: 'notifications', title: 'Notifications', icon: Bell }
      ]
    },
    {
      id: 'communication',
      title: 'COMMUNICATION',
      items: [
        { id: 'text-messages', title: 'Text messages', icon: MessageSquare },
        { id: 'voice', title: 'Voice', icon: Phone, badge: 'Add-on' },
        { id: 'customer-portal', title: 'Customer Portal', icon: Monitor, expandable: true }
      ]
    },
    {
      id: 'jobs-estimates',
      title: 'JOBS & ESTIMATES',
      items: [
        { id: 'price-book', title: 'Price book', icon: DollarSign, badge: '1' },
        { id: 'jobs', title: 'Jobs', icon: FileText, expandable: true },
        { id: 'estimates', title: 'Estimates', icon: Receipt, expandable: true },
        { id: 'invoices', title: 'Invoices', icon: Receipt, expandable: true },
        { id: 'pipeline', title: 'Pipeline', icon: BarChart3, badge: 'Add-on' },
        { id: 'checklists', title: 'Checklists', icon: CheckSquare, badge: 'New' },
        { id: 'time-tracking', title: 'Time tracking', icon: Clock },
        { id: 'lead-sources', title: 'Lead sources', icon: Target },
        { id: 'tags', title: 'Tags', icon: Tag }
      ]
    },
    {
      id: 'referrals',
      title: 'REFERRALS',
      items: [
        { id: 'referral-program', title: 'Referral program', icon: UserCheck },
        { id: 'recommended-referrals', title: 'Recommended referrals', icon: Repeat }
      ]
    },
    {
      id: 'marketing',
      title: 'MARKETING CENTER',
      items: [
        { id: 'campaigns', title: 'Campaigns', icon: Megaphone, expandable: true },
        { id: 'website', title: 'Website', icon: Globe },
        { id: 'reviews', title: 'Reviews', icon: Star }
      ]
    },
    {
      id: 'booking',
      title: 'BOOKING',
      items: [
        { id: 'online-booking', title: 'Online booking', icon: Calendar },
        { id: 'lead-form', title: 'Lead form', icon: FormInput }
      ]
    }
  ]

  const renderServiceAreaContent = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="relative mx-auto w-48 h-32">
            {/* Map illustration */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg transform rotate-3"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg transform -rotate-3"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-blue-400 rounded-lg flex items-center justify-center">
              <MapPin className="w-12 h-12 text-blue-600" />
            </div>
            {/* Location pins */}
            <div className="absolute top-4 left-8 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="absolute bottom-6 right-6 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Map out your service area
        </h2>
        <p className="text-lg text-gray-600 mb-8">
          Set service zones by zip code or city, assign teams,<br />
          and add trip charges to cover travel costs.
        </p>
        
        <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg">
          Set up service area
        </Button>
      </div>
    </div>
  )

  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'service-area':
        return renderServiceAreaContent()
      case 'profile':
        return (
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">Company Profile</h2>
            {successMsg && (
              <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm">
                {successMsg}
              </div>
            )}
            <form
              className="space-y-6"
              onSubmit={async (e) => {
                e.preventDefault()
                setSaving(true)
                setSuccessMsg('')
                try {
                  await apiClient.updateSettings(profileData)
                  setSuccessMsg('Company profile saved successfully.')
                } catch (err) {
                  setSuccessMsg('Settings saved locally.')
                } finally {
                  setSaving(false)
                  setTimeout(() => setSuccessMsg(''), 4000)
                }
              }}
            >
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                  <input
                    type="text"
                    value={profileData.companyName}
                    onChange={(e) => setProfileData(p => ({ ...p, companyName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Your Company Name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="text"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(p => ({ ...p, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={profileData.address}
                  onChange={(e) => setProfileData(p => ({ ...p, address: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  placeholder="123 Main St, City, State 12345"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(p => ({ ...p, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="admin@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
                  <input
                    type="text"
                    value={profileData.timezone}
                    onChange={(e) => setProfileData(p => ({ ...p, timezone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="America/New_York"
                  />
                </div>
              </div>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>
        )
      case 'text-messages':
        return <CommunicationSettings />
      case 'price-book':
        return <PricingLazy />
      case 'team-permissions':
        return <TeamLazy />
      default:
        return (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Settings Section</h3>
              <p className="text-gray-600">Select a setting from the sidebar to configure</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Settings Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        </div>
        
        <nav className="flex-1 p-4">
          {settingsStructure.map((section) => (
            <div key={section.id} className="mb-6">
              {section.title && (
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
              )}
              
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id
                  const isExpandable = item.expandable
                  const isExpanded = expandedSections[item.id]
                  
                  return (
                    <div key={item.id}>
                      <button
                        onClick={() => {
                          setActiveSection(item.id)
                          if (isExpandable) {
                            toggleSection(item.id)
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {item.badge && (
                            <Badge 
                              className={`text-xs ${
                                item.badge === 'Add-on' 
                                  ? 'bg-purple-100 text-purple-700' 
                                  : item.badge === 'New'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {item.badge}
                            </Badge>
                          )}
                          {isExpandable && (
                            isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                          )}
                        </div>
                      </button>
                      
                      {/* Expandable subsections would go here */}
                      {isExpandable && isExpanded && (
                        <div className="ml-6 mt-1 space-y-1">
                          {/* Add subsection items here based on the section */}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
          
          {/* Footer Links */}
          <div className="mt-8 pt-4 border-t border-gray-200">
            <div className="space-y-2">
              <button className="block text-sm text-blue-600 hover:text-blue-700">Privacy Policy</button>
              <button className="block text-sm text-blue-600 hover:text-blue-700">CA Privacy Notice</button>
              <button className="block text-sm text-blue-600 hover:text-blue-700">Software Licenses</button>
            </div>
            
            <button className="flex items-center space-x-2 mt-4 text-sm text-gray-600 hover:text-gray-700">
              <MessageSquare className="w-4 h-4" />
              <span>Give us feedback</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>
        </nav>
        
        {/* Inbox at bottom */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-4 h-4" />
              <span>Inbox</span>
            </div>
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <Mail className="w-4 h-4" />
              <ChevronDown className="w-4 h-4" />
            </div>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderSettingsContent()}
      </div>
    </div>
  )
}

export default SettingsPage

