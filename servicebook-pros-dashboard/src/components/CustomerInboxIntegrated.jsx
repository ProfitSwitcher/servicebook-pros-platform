import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  MessageSquare, 
  Mail, 
  Phone, 
  Send, 
  Search,
  Filter,
  MoreVertical,
  Paperclip,
  Smile,
  X,
  ChevronDown,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

const CustomerInboxIntegrated = ({ isOpen, onClose }) => {
  const [activeConversation, setActiveConversation] = useState(null)
  const [messageType, setMessageType] = useState('sms')
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const messagesEndRef = useRef(null)

  const [conversations] = useState([
    {
      id: 1,
      customer: {
        name: 'John Smith',
        phone: '+1 (555) 123-4567',
        email: 'john@example.com',
        avatar: 'JS'
      },
      lastMessage: {
        text: 'Thank you for the quick service!',
        timestamp: '2 min ago',
        type: 'sms',
        direction: 'inbound'
      },
      unreadCount: 2,
      status: 'active'
    },
    {
      id: 2,
      customer: {
        name: 'Sarah Johnson',
        phone: '+1 (555) 987-6543',
        email: 'sarah@example.com',
        avatar: 'SJ'
      },
      lastMessage: {
        text: 'When can you schedule the follow-up?',
        timestamp: '15 min ago',
        type: 'email',
        direction: 'inbound'
      },
      unreadCount: 1,
      status: 'pending'
    },
    {
      id: 3,
      customer: {
        name: 'Mike Wilson',
        phone: '+1 (555) 456-7890',
        email: 'mike@example.com',
        avatar: 'MW'
      },
      lastMessage: {
        text: 'Appointment confirmed for tomorrow at 2 PM',
        timestamp: '1 hour ago',
        type: 'sms',
        direction: 'outbound'
      },
      unreadCount: 0,
      status: 'completed'
    }
  ])

  const [messages] = useState({
    1: [
      {
        id: 1,
        text: 'Hi, I need to reschedule my appointment for tomorrow.',
        timestamp: '10:30 AM',
        type: 'sms',
        direction: 'inbound',
        status: 'delivered'
      },
      {
        id: 2,
        text: 'No problem! What time works better for you?',
        timestamp: '10:32 AM',
        type: 'sms',
        direction: 'outbound',
        status: 'delivered'
      },
      {
        id: 3,
        text: 'How about Friday at 3 PM?',
        timestamp: '10:35 AM',
        type: 'sms',
        direction: 'inbound',
        status: 'delivered'
      },
      {
        id: 4,
        text: 'Perfect! I\'ve rescheduled your appointment for Friday, March 15th at 3:00 PM. You\'ll receive a confirmation shortly.',
        timestamp: '10:36 AM',
        type: 'sms',
        direction: 'outbound',
        status: 'delivered'
      },
      {
        id: 5,
        text: 'Thank you for the quick service!',
        timestamp: '2 min ago',
        type: 'sms',
        direction: 'inbound',
        status: 'delivered'
      }
    ],
    2: [
      {
        id: 1,
        text: 'Thank you for completing the HVAC maintenance. Everything looks great!',
        timestamp: 'Yesterday 2:15 PM',
        type: 'email',
        direction: 'inbound',
        status: 'delivered',
        subject: 'Service Completion Feedback'
      },
      {
        id: 2,
        text: 'We\'re glad you\'re satisfied with our service! We recommend scheduling a follow-up maintenance in 6 months.',
        timestamp: 'Yesterday 3:20 PM',
        type: 'email',
        direction: 'outbound',
        status: 'delivered',
        subject: 'Re: Service Completion Feedback'
      },
      {
        id: 3,
        text: 'When can you schedule the follow-up?',
        timestamp: '15 min ago',
        type: 'email',
        direction: 'inbound',
        status: 'delivered',
        subject: 'Follow-up Maintenance Scheduling'
      }
    ]
  })

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [activeConversation, messages])

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.customer.phone.includes(searchTerm) ||
                         conv.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = filterType === 'all' || 
                         (filterType === 'unread' && conv.unreadCount > 0) ||
                         (filterType === 'sms' && conv.lastMessage.type === 'sms') ||
                         (filterType === 'email' && conv.lastMessage.type === 'email')
    
    return matchesSearch && matchesFilter
  })

  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeConversation) return

    // Here you would typically send the message via API
    console.log('Sending message:', {
      conversationId: activeConversation.id,
      type: messageType,
      message: newMessage,
      recipient: messageType === 'sms' ? activeConversation.customer.phone : activeConversation.customer.email
    })

    setNewMessage('')
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="w-3 h-3 text-green-500" />
      case 'pending':
        return <Clock className="w-3 h-3 text-yellow-500" />
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />
      default:
        return null
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-end p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <h2 className="text-lg font-semibold">Customer Inbox</h2>
            <Badge className="bg-blue-100 text-blue-700">
              {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)} unread
            </Badge>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Conversations List */}
          <div className="w-80 border-r border-gray-200 flex flex-col">
            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div className="flex gap-2">
                <select 
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="all">All Messages</option>
                  <option value="unread">Unread</option>
                  <option value="sms">SMS Only</option>
                  <option value="email">Email Only</option>
                </select>
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  onClick={() => setActiveConversation(conversation)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    activeConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700">
                      {conversation.customer.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm truncate">{conversation.customer.name}</h4>
                        <div className="flex items-center gap-1">
                          {conversation.lastMessage.type === 'sms' ? (
                            <MessageSquare className="w-3 h-3 text-gray-400" />
                          ) : (
                            <Mail className="w-3 h-3 text-gray-400" />
                          )}
                          <span className="text-xs text-gray-500">{conversation.lastMessage.timestamp}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 truncate">{conversation.lastMessage.text}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-gray-500">
                          {conversation.lastMessage.type === 'sms' ? conversation.customer.phone : conversation.customer.email}
                        </span>
                        {conversation.unreadCount > 0 && (
                          <Badge className="bg-blue-600 text-white text-xs">
                            {conversation.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Area */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700">
                        {activeConversation.customer.avatar}
                      </div>
                      <div>
                        <h3 className="font-medium">{activeConversation.customer.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {activeConversation.customer.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {activeConversation.customer.email}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages[activeConversation.id]?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.direction === 'outbound'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {message.subject && (
                          <div className="font-medium text-sm mb-1 opacity-90">
                            {message.subject}
                          </div>
                        )}
                        <p className="text-sm">{message.text}</p>
                        <div className={`flex items-center justify-between mt-2 text-xs ${
                          message.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span>{message.timestamp}</span>
                          <div className="flex items-center gap-1">
                            {message.type === 'sms' ? (
                              <MessageSquare className="w-3 h-3" />
                            ) : (
                              <Mail className="w-3 h-3" />
                            )}
                            {message.direction === 'outbound' && getStatusIcon(message.status)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center gap-2 mb-3">
                    <select 
                      value={messageType}
                      onChange={(e) => setMessageType(e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="sms">SMS</option>
                      <option value="email">Email</option>
                    </select>
                    <span className="text-sm text-gray-500">
                      to {messageType === 'sms' ? activeConversation.customer.phone : activeConversation.customer.email}
                    </span>
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Type your ${messageType} message...`}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        rows="3"
                        maxLength={messageType === 'sms' ? 160 : 1000}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                        {newMessage.length}/{messageType === 'sms' ? 160 : 1000}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="px-4 py-2"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p className="text-sm">Choose a customer conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomerInboxIntegrated

