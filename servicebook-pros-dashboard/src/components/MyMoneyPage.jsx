import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import apiClient from '../utils/apiClient'
import { 
  DollarSign,
  CreditCard,
  Building,
  Clock,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Plus,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Eye,
  Settings,
  HelpCircle
} from 'lucide-react'

const MyMoneyPage = () => {
  const [activeTab, setActiveTab] = useState('standard')
  const [activeSubItem, setActiveSubItem] = useState('payouts')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedSections, setExpandedSections] = useState({
    payments: true,
    businessFinancing: false,
    expenses: false,
    accounting: false,
    tax: false,
    settings: false
  })

  // Financial data state
  const [pendingTransactions, setPendingTransactions] = useState([])
  const [payoutHistory, setPayoutHistory] = useState([])
  const [invoices, setInvoices] = useState([])
  const [payments, setPayments] = useState([])

  // Compute pending total dynamically from invoices state
  const pendingTotal = invoices
    .filter(inv => inv.status === 'pending' || inv.status === 'unpaid' || inv.status === 'sent')
    .reduce((sum, inv) => {
      const amount = parseFloat(String(inv.total_amount || inv.amount || inv.totalAmount || '0').replace(/[$,]/g, ''))
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // Load financial data from API
  const loadFinancialData = async () => {
    setLoading(true)
    setError('')
    
    try {
      let invoicesData = []
      let paymentsData = []

      try {
        invoicesData = await apiClient.getInvoices({ status: 'pending' })
        if (!Array.isArray(invoicesData)) invoicesData = invoicesData?.invoices || invoicesData?.results || []
      } catch (err) {
        console.error('getInvoices not available:', err)
        invoicesData = []
      }

      try {
        paymentsData = await apiClient.getPayments()
        if (!Array.isArray(paymentsData)) paymentsData = paymentsData?.payments || paymentsData?.results || []
      } catch (err) {
        console.error('getPayments not available:', err)
        paymentsData = []
      }

      // Transform invoices to pending transactions format
      const pendingTxns = invoicesData.map(invoice => ({
        id: invoice.id,
        chargeDate: new Date(invoice.created_at).toLocaleDateString(),
        paymentMethod: invoice.payment_method || 'Credit Card',
        jobNumber: invoice.job_id?.toString() || 'N/A',
        customer: invoice.customer_name || 'Unknown Customer',
        amount: `$${invoice.total_amount?.toFixed(2) || '0.00'}`
      }))
      
      // Transform payments to payout history format
      const payouts = paymentsData.map(payment => ({
        id: payment.id,
        depositDate: new Date(payment.payment_date).toLocaleDateString(),
        totalAmount: `$${payment.amount?.toFixed(2) || '0.00'}`,
        status: payment.status === 'completed' ? 'Paid' : 'Pending'
      }))
      
      setPendingTransactions(pendingTxns)
      setPayoutHistory(payouts)
      setInvoices(invoicesData)
      setPayments(paymentsData)
      
    } catch (error) {
      console.error('Error loading financial data:', error)
      setError('Failed to load financial data')
      
      // Fall back to sample data
      setPendingTransactions([
        {
          id: 1,
          chargeDate: 'Sep 11, 2025',
          paymentMethod: 'Credit Card',
          jobNumber: '970',
          customer: 'Flori Skyland',
          amount: '$2,815.16'
        }
      ])
      
      setPayoutHistory([
        {
          id: 1,
          depositDate: 'Sep 10, 2025',
          totalAmount: '$478.74',
          status: 'Paid'
        },
        {
          id: 2,
          depositDate: 'Aug 27, 2025',
          totalAmount: '$1,131.14',
          status: 'Paid'
        },
        {
          id: 3,
          depositDate: 'Aug 20, 2025',
          totalAmount: '$19,765.77',
          status: 'Paid'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadFinancialData()
  }, [])

  // Sample data for sections not yet connected to API
  const samplePayoutHistory = [
    {
      id: 1,
      depositDate: 'Sep 10, 2025',
      totalAmount: '$478.74',
      status: 'Paid'
    },
    {
      id: 2,
      depositDate: 'Aug 27, 2025',
      totalAmount: '$1,131.14',
      status: 'Paid'
    },
    {
      id: 3,
      depositDate: 'Aug 20, 2025',
      totalAmount: '$19,765.77',
      status: 'Paid'
    },
    {
      id: 4,
      depositDate: 'Aug 13, 2025',
      totalAmount: '$1,198.07',
      status: 'Paid'
    }
  ]

  const sidebarItems = [
    {
      section: 'payments',
      title: 'Payments',
      icon: CreditCard,
      items: [
        { id: 'payouts', title: 'Payouts', active: true },
        { id: 'consumer-financing', title: 'Consumer financing' },
        { id: 'card-reader', title: 'Card reader' }
      ]
    },
    {
      section: 'businessFinancing',
      title: 'Business Financing',
      icon: Building,
      badge: '$33.2k',
      items: []
    },
    {
      section: 'expenses',
      title: 'Expenses',
      icon: DollarSign,
      badge: 'New',
      items: []
    },
    {
      section: 'accounting',
      title: 'Accounting',
      icon: Building,
      badge: 'Add-on',
      items: []
    },
    {
      section: 'tax',
      title: 'Tax',
      icon: Building,
      badge: 'Add-on',
      items: []
    },
    {
      section: 'settings',
      title: 'Settings',
      icon: Settings,
      items: []
    }
  ]

  const renderSidebar = () => (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900">My Money</h1>
      </div>
      
      <nav className="p-4">
        {sidebarItems.map((section) => {
          const Icon = section.icon
          const isExpanded = expandedSections[section.section]
          const hasItems = section.items && section.items.length > 0
          
          return (
            <div key={section.section} className="mb-2">
              <button
                onClick={() => hasItems && toggleSection(section.section)}
                className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4" />
                  <span>{section.title}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {section.badge && (
                    <Badge 
                      className={`text-xs ${
                        section.badge === 'Add-on' 
                          ? 'bg-purple-100 text-purple-700' 
                          : section.badge === 'New'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {section.badge}
                    </Badge>
                  )}
                  {hasItems && (
                    isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </button>
              
              {hasItems && isExpanded && (
                <div className="ml-6 mt-1 space-y-1">
                  {section.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveSubItem(item.id)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                        activeSubItem === item.id
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {item.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )
        })}
        
        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200">
          <button className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-700 px-3 py-2">
            <HelpCircle className="w-4 h-4" />
            <span>Give us feedback</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      </nav>
    </div>
  )

  const renderPayoutTabContent = () => {
    if (activeTab === 'standard') {
      return (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Deposit date</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Total amount</th>
                <th className="text-right py-3 px-4 font-medium text-gray-600">Payment</th>
              </tr>
            </thead>
            <tbody>
              {(payoutHistory.length > 0 ? payoutHistory : samplePayoutHistory).map((payout) => (
                <tr key={payout.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 text-gray-900">{payout.depositDate}</td>
                  <td className="py-4 px-4 text-right font-medium text-gray-900">{payout.totalAmount}</td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-gray-900">{payout.status}</span>
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
    }

    if (activeTab === 'instant') {
      return (
        <div className="py-12 text-center">
          <CreditCard className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Payouts</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Get paid within 30 minutes of completing a job. Enable instant payouts to accelerate your cash flow.
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Enable Instant Payouts
          </button>
        </div>
      )
    }

    if (activeTab === 'financing') {
      return (
        <div className="py-12 text-center">
          <Building className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Consumer Financing</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Offer your customers flexible financing options so they can afford larger projects without upfront costs.
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Learn More
          </button>
        </div>
      )
    }

    if (activeTab === 'check-deposits') {
      return (
        <div className="py-12 text-center">
          <CheckCircle className="w-12 h-12 text-purple-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Deposits</h3>
          <p className="text-gray-600 mb-6 max-w-sm mx-auto">
            Deposit checks directly from your mobile app. Take a photo and funds are processed automatically.
          </p>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Set Up Check Deposits
          </button>
        </div>
      )
    }

    return null
  }

  const renderPayoutTabs = () => (
    <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
      {[
        { id: 'standard', label: 'Standard' },
        { id: 'instant', label: 'Instant' },
        { id: 'financing', label: 'Financing' },
        { id: 'check-deposits', label: 'Check deposits', icon: CheckCircle }
      ].map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === tab.id
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          {tab.icon && <tab.icon className="w-4 h-4" />}
          {tab.label}
        </button>
      ))}
    </div>
  )

  const renderMainContent = () => (
    <div className="flex-1 p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
            <span>My Money</span>
            <ChevronRight className="w-4 h-4" />
            <span>Payouts</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Payouts</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-2" />
            Are you satisfied with this page?
          </Button>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Pending Transactions Summary */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Pending transactions</h2>
              <div className="text-3xl font-bold text-gray-900">
                ${pendingTotal > 0
                  ? pendingTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                  : pendingTransactions.reduce((sum, t) => {
                      const n = parseFloat(String(t.amount || '0').replace(/[$,]/g, ''))
                      return sum + (isNaN(n) ? 0 : n)
                    }, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                }
              </div>
            </div>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Transactions Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Pending transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Charge date</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Payment method</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Job #</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-600">Amount</th>
                </tr>
              </thead>
              <tbody>
                {pendingTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4 text-gray-900">{transaction.chargeDate}</td>
                    <td className="py-4 px-4 text-gray-900">{transaction.paymentMethod}</td>
                    <td className="py-4 px-4 text-gray-900">{transaction.jobNumber}</td>
                    <td className="py-4 px-4 text-gray-900">{transaction.customer}</td>
                    <td className="py-4 px-4 text-right font-medium text-gray-900">{transaction.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* My Payouts Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>My payouts</CardTitle>
            <Button variant="outline" size="sm">
              See all
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Payout Tabs */}
          {renderPayoutTabs()}

          {/* Payout Tab Content */}
          {renderPayoutTabContent()}
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="h-screen bg-gray-50 flex">
      {renderSidebar()}
      {renderMainContent()}
    </div>
  )
}

export default MyMoneyPage

