import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { 
  MessageSquare,
  Mail,
  Phone,
  Send,
  Search,
  Filter,
  MoreHorizontal,
  User,
  Clock,
  Check,
  CheckCheck,
  AlertCircle,
  Plus,
  Paperclip,
  Smile,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

const CustomerInbox = ({ isOpen, onClose }) => {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [messageType, setMessageType] = useState('sms') // 'sms' or 'email'
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState([])
  const [showNewConversation, setShowNewConversation] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const messagesEndRef = useRef(null)

  // Sample data for demonstration
  const sampleConversations = [
    {
      id: 1,
      customer_id: 1,
      customer_name: 'John Meyer',
      customer_phone: '(406) 799-0536',
      customer_email: 'john.meyer@email.com',
      last_message: {
        id: 1,
        content: 'Thank you for the quick service today! Everything looks great.',
        message_type: 'sms',
        direction: 'inbound',
        created_at: '2025-09-12T14:30:00Z',
        read: false
      },
      unread_count: 1,
      messages: [
        {
          id: 1,
          content: 'Hi John, your technician Mike will arrive between 2-4 PM today for the HVAC repair.',
          message_type: 'sms',
          direction: 'outbound',
          created_at: '2025-09-12T10:00:00Z',
          status: 'delivered',
          read: true
        },
        {
          id: 2,
          content: 'Perfect, I\'ll be home. Thank you!',
          message_type: 'sms',
          direction: 'inbound',
          created_at: '2025-09-12T10:05:00Z',
          read: true
        },
        {
          id: 3,
          content: 'Thank you for the quick service today! Everything looks great.',
          message_type: 'sms',
          direction: 'inbound',
          created_at: '2025-09-12T14:30:00Z',
          read: false
        }
      ]
    },
    {
      id: 2,
      customer_id: 2,
      customer_name: 'Susan Scarr',
      customer_phone: '(770) 480-9498',
      customer_email: 'susan.scarr@email.com',
      last_message: {
        id: 4,
        content: 'Your estimate for the plumbing work is ready. Total: $1,250. Please let us know if you\'d like to proceed.',
        message_type: 'email',
        direction: 'outbound',
        created_at: '2025-09-12T11:15:00Z',
        read: true
      },
      unread_count: 0,
      messages: [
        {
          id: 4,
          content: 'Your estimate for the plumbing work is ready. Total: $1,250. Please let us know if you\'d like to proceed.',
          message_type: 'email',
          direction: 'outbound',
          subject: 'Your Estimate is Ready - ServiceBook Pros',
          created_at: '2025-09-12T11:15:00Z',
          status: 'delivered',
          read: true
        }
      ]
    },
    {
      id: 3,
      customer_id: 3,
      customer_name: 'Michael Pritchard',
      customer_phone: '(406) 546-9299',
      customer_email: 'michael.pritchard@email.com',
      last_message: {
        id: 5,
        content: 'Can we reschedule tomorrow\'s appointment to Friday instead?',
        message_type: 'sms',
        direction: 'inbound',
        created_at: '2025-09-12T09:45:00Z',
        read: false
      },
      unread_count: 1,
      messages: [
        {
          id: 5,
          content: 'Can we reschedule tomorrow\'s appointment to Friday instead?',
          message_type: 'sms',
          direction: 'inbound',
          created_at: '2025-09-12T09:45:00Z',
          read: false
        }
      ]
    }
  ]

  useEffect(() => {
    if (isOpen) {
      setConversations(sampleConversations)
      // In real implementation, fetch conversations from API
      // fetchConversations()
    }
  }, [isOpen])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation)
    setMessages(conversation.messages)
    setShowNewConversation(false)
    
    // Mark messages as read
    if (conversation.unread_count > 0) {
      // In real implementation, call API to mark as read
      const updatedConversations = conversations.map(conv => 
        conv.id === conversation.id 
          ? { ...conv, unread_count: 0, messages: conv.messages.map(msg => ({ ...msg, read: true })) }
          : conv
      )
      setConversations(updatedConversations)
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return

    const message = {
      id: Date.now(),
      content: newMessage,
      message_type: messageType,
      direction: 'outbound',
      created_at: new Date().toISOString(),
      status: 'sending',
      read: true
    }

    // Add message to current conversation
    setMessages(prev => [...prev, message])
    setNewMessage('')

    // In real implementation, send via API
    try {
      // const response = await sendMessage({
      //   customer_id: selectedConversation.customer_id,
      //   type: messageType,
      //   content: newMessage,
      //   to_phone: selectedConversation.customer_phone,
      //   to_email: selectedConversation.customer_email
      // })
      
      // Update message status
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, status: 'delivered' } : msg
        ))
      }, 1000)
    } catch (error) {
      // Handle error
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, status: 'failed' } : msg
      ))
    }
  }

  const getMessageStatusIcon = (status) => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400" />
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-blue-500" />
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />
      default:
        return <Check className="w-3 h-3 text-gray-400" />
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.customer_phone.includes(searchTerm) ||
    conv.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (!isOpen) return null

  return (
    <div className="fixed bottom-0 right-4 w-96 h-96 bg-white border border-gray-200 rounded-t-lg shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <h3 className="font-semibold">Customer Inbox</h3>
          {conversations.reduce((total, conv) => total + conv.unread_count, 0) > 0 && (
            <Badge className="bg-red-500 text-white">
              {conversations.reduce((total, conv) => total + conv.unread_count, 0)}
            </Badge>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowNewConversation(true)}
            className="text-white hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-blue-700"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col">
          {/* Search */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationSelect(conversation)}
                className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedConversation?.id === conversation.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start justify-between mb-1">
                  <h4 className="font-medium text-sm text-gray-900 truncate">
                    {conversation.customer_name}
                  </h4>
                  {conversation.unread_count > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {conversation.unread_count}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center space-x-1 mb-1">
                  {conversation.last_message.message_type === 'sms' ? (
                    <MessageSquare className="w-3 h-3 text-gray-400" />
                  ) : (
                    <Mail className="w-3 h-3 text-gray-400" />
                  )}
                  <span className="text-xs text-gray-500">
                    {conversation.customer_phone}
                  </span>
                </div>
                <p className="text-xs text-gray-600 truncate">
                  {conversation.last_message.content}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatTime(conversation.last_message.created_at)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        <div className="w-1/2 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Thread Header */}
              <div className="p-3 border-b border-gray-200">
                <h4 className="font-medium text-sm text-gray-900">
                  {selectedConversation.customer_name}
                </h4>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Phone className="w-3 h-3" />
                  <span>{selectedConversation.customer_phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <Mail className="w-3 h-3" />
                  <span>{selectedConversation.customer_email}</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-2 rounded-lg ${
                        message.direction === 'outbound'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      {message.subject && (
                        <div className="font-medium text-xs mb-1 opacity-75">
                          {message.subject}
                        </div>
                      )}
                      <p className="text-xs">{message.content}</p>
                      <div className={`flex items-center justify-between mt-1 text-xs ${
                        message.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        <span>{formatTime(message.created_at)}</span>
                        {message.direction === 'outbound' && (
                          <div className="flex items-center space-x-1">
                            {message.message_type === 'sms' ? (
                              <MessageSquare className="w-3 h-3" />
                            ) : (
                              <Mail className="w-3 h-3" />
                            )}
                            {getMessageStatusIcon(message.status)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-3 border-t border-gray-200">
                <div className="flex items-center space-x-2 mb-2">
                  <button
                    onClick={() => setMessageType('sms')}
                    className={`px-2 py-1 text-xs rounded ${
                      messageType === 'sms' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    SMS
                  </button>
                  <button
                    onClick={() => setMessageType('email')}
                    className={`px-2 py-1 text-xs rounded ${
                      messageType === 'email' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    Email
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder={`Type your ${messageType}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CustomerInbox

