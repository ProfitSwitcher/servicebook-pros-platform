import React, { useState } from 'react'
import { 
  Home, 
  BarChart3, 
  MessageSquare, 
  Calendar, 
  Users, 
  DollarSign,
  FileText,
  Settings,
  Menu,
  X,
  Bell,
  Search,
  Plus,
  ChevronDown
} from 'lucide-react'

const MobileNavigation = ({ activeTab, setActiveTab, onNewAction }) => {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dash', icon: BarChart3 },
    { id: 'inbox', label: 'Inbox', icon: MessageSquare },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'my-money', label: 'Money', icon: DollarSign },
    { id: 'reporting', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  const quickActions = [
    { id: 'new-job', label: 'New Job', icon: Plus },
    { id: 'new-estimate', label: 'New Estimate', icon: FileText },
    { id: 'new-customer', label: 'New Customer', icon: Users },
    { id: 'schedule-appointment', label: 'Schedule', icon: Calendar }
  ]

  const notifications = [
    {
      id: 1,
      title: 'New job assigned',
      message: 'HVAC repair at 123 Main St',
      time: '5 min ago',
      type: 'job',
      unread: true
    },
    {
      id: 2,
      title: 'Customer message',
      message: 'John Smith replied to your estimate',
      time: '15 min ago',
      type: 'message',
      unread: true
    },
    {
      id: 3,
      title: 'Payment received',
      message: '$450.00 from Sarah Davis',
      time: '1 hour ago',
      type: 'payment',
      unread: false
    }
  ]

  const getTabLabel = (tabId) => {
    const item = navigationItems.find(item => item.id === tabId)
    return item ? item.label : 'ServiceBook Pros'
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowMobileMenu(true)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900">
            {getTabLabel(activeTab)}
          </h1>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-2 hover:bg-gray-100 rounded-lg relative"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              2
            </span>
          </button>

          <button
            onClick={() => onNewAction && onNewAction()}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-5 gap-1 px-2 py-2">
          {navigationItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = activeTab === item.id
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-5 h-5 mb-1" />
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setShowMobileMenu(false)} />
          
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-xl">
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">SB</span>
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">ServiceBook Pros</h2>
                  <p className="text-sm text-gray-600">Business Management</p>
                </div>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Quick Actions */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                {quickActions.map((action) => {
                  const Icon = action.icon
                  return (
                    <button
                      key={action.id}
                      onClick={() => {
                        onNewAction && onNewAction(action.id)
                        setShowMobileMenu(false)
                      }}
                      className="flex items-center space-x-2 p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Icon className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">{action.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Navigation Items */}
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Navigation</h3>
              <div className="space-y-1">
                {navigationItems.map((item) => {
                  const Icon = item.icon
                  const isActive = activeTab === item.id
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id)
                        setShowMobileMenu(false)
                      }}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                        isActive 
                          ? 'bg-blue-50 text-blue-600' 
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* User Profile */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-gray-600 font-medium text-sm">JD</span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">John Doe</div>
                  <div className="text-sm text-gray-600">Owner</div>
                </div>
                <button className="p-1 hover:bg-gray-100 rounded">
                  <ChevronDown className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Dropdown */}
      {showNotifications && (
        <div className="lg:hidden fixed top-16 right-4 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                  notification.unread ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    notification.unread ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {notification.title}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All Notifications
            </button>
          </div>
        </div>
      )}

      {/* Notification Overlay */}
      {showNotifications && (
        <div 
          className="lg:hidden fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}
    </>
  )
}

export default MobileNavigation

