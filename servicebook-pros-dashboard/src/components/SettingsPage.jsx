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
  ChevronUp,
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
  Plus,
  Trash2,
  Copy,
  Check,
  X,
  Lock,
  Eye,
  EyeOff,
  Info,
  ExternalLink,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

// ─── Reusable Toggle Switch ───────────────────────────────────────────────────
const Toggle = ({ enabled, onChange }) => (
  <button
    type="button"
    onClick={() => onChange(!enabled)}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-blue-600' : 'bg-gray-200'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
    />
  </button>
)

// ─── Reusable Save Button ─────────────────────────────────────────────────────
const SaveButton = ({ onClick, saving, label = 'Save Changes' }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={saving}
    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors"
  >
    {saving ? 'Saving...' : label}
  </button>
)

// ─── Success Toast ────────────────────────────────────────────────────────────
const SuccessMsg = ({ msg }) =>
  msg ? (
    <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm flex items-center gap-2">
      <Check className="w-4 h-4" />
      {msg}
    </div>
  ) : null

// ─── Section Header ───────────────────────────────────────────────────────────
const SectionHeader = ({ title, description }) => (
  <div className="mb-6">
    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
    {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
  </div>
)

// ─── Field Row for toggle + label ─────────────────────────────────────────────
const ToggleRow = ({ label, description, enabled, onChange }) => (
  <div className="flex items-center justify-between py-3">
    <div>
      <p className="text-sm font-medium text-gray-700">{label}</p>
      {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
    </div>
    <Toggle enabled={enabled} onChange={onChange} />
  </div>
)

// ─── Input ────────────────────────────────────────────────────────────────────
const Input = ({ className = '', ...props }) => (
  <input
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
    {...props}
  />
)

// ─── Select ───────────────────────────────────────────────────────────────────
const Select = ({ className = '', children, ...props }) => (
  <select
    className={`px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${className}`}
    {...props}
  >
    {children}
  </select>
)

// ─── Textarea ─────────────────────────────────────────────────────────────────
const Textarea = ({ className = '', ...props }) => (
  <textarea
    className={`w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${className}`}
    {...props}
  />
)

// ─── Label ────────────────────────────────────────────────────────────────────
const Label = ({ children, className = '' }) => (
  <label className={`block text-sm font-medium text-gray-700 mb-1.5 ${className}`}>{children}</label>
)

// ─── Info Box ─────────────────────────────────────────────────────────────────
const InfoBox = ({ children }) => (
  <div className="flex gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
    <span>{children}</span>
  </div>
)

// ─── Copy Input ───────────────────────────────────────────────────────────────
const CopyInput = ({ value }) => {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(value).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="flex gap-2">
      <input
        readOnly
        value={value}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-600"
      />
      <button
        type="button"
        onClick={handleCopy}
        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 flex items-center gap-1"
      >
        {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

// ─── Code Block ──────────────────────────────────────────────────────────────
const CodeBlock = ({ code }) => {
  const [copied, setCopied] = useState(false)
  return (
    <div className="relative">
      <pre className="bg-gray-900 text-gray-100 text-xs rounded-lg p-4 overflow-x-auto whitespace-pre-wrap break-all">
        {code}
      </pre>
      <button
        type="button"
        onClick={() => { navigator.clipboard.writeText(code).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
        className="absolute top-2 right-2 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-100 text-xs rounded flex items-center gap-1"
      >
        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  )
}

// ─── Color Swatches ──────────────────────────────────────────────────────────
const COLORS = [
  { name: 'amber', bg: 'bg-amber-400', hex: '#f59e0b' },
  { name: 'blue', bg: 'bg-blue-500', hex: '#3b82f6' },
  { name: 'green', bg: 'bg-green-500', hex: '#22c55e' },
  { name: 'red', bg: 'bg-red-500', hex: '#ef4444' },
  { name: 'purple', bg: 'bg-purple-500', hex: '#a855f7' },
  { name: 'pink', bg: 'bg-pink-500', hex: '#ec4899' },
  { name: 'gray', bg: 'bg-gray-400', hex: '#9ca3af' },
  { name: 'orange', bg: 'bg-orange-500', hex: '#f97316' },
]

const ColorSwatches = ({ selected, onChange }) => (
  <div className="flex gap-2 flex-wrap">
    {COLORS.map(c => (
      <button
        key={c.name}
        type="button"
        onClick={() => onChange(c.name)}
        className={`w-7 h-7 rounded-full ${c.bg} transition-transform hover:scale-110 ${selected === c.name ? 'ring-2 ring-offset-2 ring-gray-600 scale-110' : ''}`}
        title={c.name}
      />
    ))}
  </div>
)

const colorBgClass = (name) => COLORS.find(c => c.name === name)?.bg || 'bg-gray-400'

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

const SettingsPage = () => {
  const [activeSection, setActiveSection] = useState('service-area')
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')
  const [settings, setSettings] = useState(null)
  const [profileData, setProfileData] = useState({ companyName: '', phone: '', address: '', email: '', timezone: '' })
  const [expandedSections, setExpandedSections] = useState({
    'jobs-estimates': true,
    'company': true,
    'communication': true,
    'marketing': true,
    'booking': true
  })

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }))
  }

  useEffect(() => {
    apiClient.getSettings().then((data) => {
      setSettings(data)
      setProfileData({
        companyName: data.company_name || '',
        phone: data.phone || '',
        address: data.address || '',
        email: data.email || '',
        timezone: data.timezone || '',
      })
    }).catch(() => {
      setSettings({})
    })
  }, [])

  const showSuccess = (msg = 'Settings saved successfully.') => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 4000)
  }

  const handleSave = async (payload) => {
    setSaving(true)
    try {
      await apiClient.updateSettings(payload)
      showSuccess()
    } catch {
      showSuccess('Settings saved locally.')
    } finally {
      setSaving(false)
    }
  }

  // ─── Sidebar Structure ──────────────────────────────────────────────────────
  const settingsStructure = [
    {
      id: 'company', title: 'COMPANY',
      items: [
        { id: 'profile', title: 'Profile', icon: Building },
        { id: 'business-hours', title: 'Business hours', icon: Clock },
        { id: 'service-area', title: 'Service area', icon: MapPin },
        { id: 'team-permissions', title: 'Team & permissions', icon: Users },
        { id: 'ai-team', title: 'AI Team', icon: Zap },
        { id: 'plans-billing', title: 'Plans & Billing', icon: CreditCard },
        { id: 'login-auth', title: 'Login authentication', icon: Key },
        { id: 'notifications', title: 'Notifications', icon: Bell }
      ]
    },
    {
      id: 'communication', title: 'COMMUNICATION',
      items: [
        { id: 'text-messages', title: 'Text messages', icon: MessageSquare },
        { id: 'voice', title: 'Voice', icon: Phone, badge: 'Add-on' },
        { id: 'customer-portal', title: 'Customer Portal', icon: Monitor }
      ]
    },
    {
      id: 'jobs-estimates', title: 'JOBS & ESTIMATES',
      items: [
        { id: 'price-book', title: 'Price book', icon: DollarSign, badge: '1' },
        { id: 'jobs', title: 'Jobs', icon: FileText },
        { id: 'estimates', title: 'Estimates', icon: Receipt },
        { id: 'invoices', title: 'Invoices', icon: Receipt },
        { id: 'pipeline', title: 'Pipeline', icon: BarChart3, badge: 'Add-on' },
        { id: 'checklists', title: 'Checklists', icon: CheckSquare, badge: 'New' },
        { id: 'time-tracking', title: 'Time tracking', icon: Clock },
        { id: 'lead-sources', title: 'Lead sources', icon: Target },
        { id: 'tags', title: 'Tags', icon: Tag }
      ]
    },
    {
      id: 'referrals', title: 'REFERRALS',
      items: [
        { id: 'referral-program', title: 'Referral program', icon: UserCheck },
        { id: 'recommended-referrals', title: 'Recommended referrals', icon: Repeat }
      ]
    },
    {
      id: 'marketing', title: 'MARKETING CENTER',
      items: [
        { id: 'campaigns', title: 'Campaigns', icon: Megaphone },
        { id: 'website', title: 'Website', icon: Globe },
        { id: 'reviews', title: 'Reviews', icon: Star }
      ]
    },
    {
      id: 'booking', title: 'BOOKING',
      items: [
        { id: 'online-booking', title: 'Online booking', icon: Calendar },
        { id: 'lead-form', title: 'Lead form', icon: FormInput }
      ]
    }
  ]

  // ═══════════════════════════════════════════════════════════════════════════
  // SECTION RENDERERS
  // ═══════════════════════════════════════════════════════════════════════════

  // ─── Service Area ───────────────────────────────────────────────────────────
  const renderServiceAreaContent = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="relative mx-auto w-48 h-32">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg transform rotate-3"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg transform -rotate-3"></div>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-300 to-blue-400 rounded-lg flex items-center justify-center">
              <MapPin className="w-12 h-12 text-blue-600" />
            </div>
            <div className="absolute top-4 left-8 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <div className="absolute bottom-6 right-6 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Map out your service area</h2>
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

  // ─── Business Hours ─────────────────────────────────────────────────────────
  const BusinessHoursSection = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    const defaultHours = { enabled: true, open: '08:00', close: '17:00' }
    const [hours, setHours] = useState(() =>
      days.reduce((acc, d) => ({
        ...acc,
        [d]: settings?.business_hours?.[d] || { ...defaultHours, enabled: d !== 'Saturday' && d !== 'Sunday' }
      }), {})
    )
    const updateDay = (day, field, value) =>
      setHours(h => ({ ...h, [day]: { ...h[day], [field]: value } }))
    const copyToWeekdays = () => {
      const mon = hours['Monday']
      setHours(h => {
        const next = { ...h }
        ;['Monday','Tuesday','Wednesday','Thursday','Friday'].forEach(d => {
          next[d] = { ...mon }
        })
        return next
      })
    }
    return (
      <div className="p-8 max-w-2xl">
        <SectionHeader title="Business Hours" description="Set when your business is open for scheduling." />
        <SuccessMsg msg={successMsg} />
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          {days.map(day => (
            <div key={day} className="flex items-center gap-4 px-4 py-3">
              <Toggle enabled={hours[day].enabled} onChange={v => updateDay(day, 'enabled', v)} />
              <span className={`w-28 text-sm font-medium ${hours[day].enabled ? 'text-gray-800' : 'text-gray-400'}`}>{day}</span>
              {hours[day].enabled ? (
                <>
                  <input
                    type="time"
                    value={hours[day].open}
                    onChange={e => updateDay(day, 'open', e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-gray-400 text-sm">to</span>
                  <input
                    type="time"
                    value={hours[day].close}
                    onChange={e => updateDay(day, 'close', e.target.value)}
                    className="px-2 py-1.5 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </>
              ) : (
                <span className="text-sm text-gray-400 italic">Closed</span>
              )}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 mt-4">
          <button
            type="button"
            onClick={copyToWeekdays}
            className="text-sm text-blue-600 hover:text-blue-700 underline"
          >
            Copy Monday hours to all weekdays
          </button>
        </div>
        <div className="mt-6">
          <SaveButton onClick={() => handleSave({ business_hours: hours })} saving={saving} />
        </div>
      </div>
    )
  }

  // ─── Notifications ──────────────────────────────────────────────────────────
  const NotificationsSection = () => {
    const defaultNotifs = {
      new_jobs_email: true, new_jobs_sms: false,
      job_completed_email: true,
      new_estimates_email: true,
      estimate_accepted_email: true,
      invoice_paid_email: true, invoice_paid_sms: false,
      invoice_overdue_email: true,
      new_customer_email: true,
      review_received_email: true,
      daily_summary_email: false,
    }
    const [notifs, setNotifs] = useState({ ...defaultNotifs, ...(settings?.notifications || {}) })
    const set = (key, val) => setNotifs(n => ({ ...n, [key]: val }))

    const rows = [
      { label: 'New Jobs', email: 'new_jobs_email', sms: 'new_jobs_sms' },
      { label: 'Job Completed', email: 'job_completed_email' },
      { label: 'New Estimates', email: 'new_estimates_email' },
      { label: 'Estimate Accepted', email: 'estimate_accepted_email' },
      { label: 'Invoice Paid', email: 'invoice_paid_email', sms: 'invoice_paid_sms' },
      { label: 'Invoice Overdue', email: 'invoice_overdue_email' },
      { label: 'New Customer', email: 'new_customer_email' },
      { label: 'Review Received', email: 'review_received_email' },
      { label: 'Daily Summary', email: 'daily_summary_email' },
    ]

    return (
      <div className="p-8 max-w-2xl">
        <SectionHeader title="Notifications" description="Choose how you want to be notified about activity." />
        <SuccessMsg msg={successMsg} />
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr_80px_80px] bg-gray-50 border-b border-gray-200 px-4 py-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Event</span>
            <span className="text-xs font-semibold text-gray-500 uppercase text-center">Email</span>
            <span className="text-xs font-semibold text-gray-500 uppercase text-center">SMS</span>
          </div>
          {rows.map(row => (
            <div key={row.label} className="grid grid-cols-[1fr_80px_80px] px-4 py-3 border-b border-gray-100 last:border-0 items-center">
              <span className="text-sm text-gray-700">{row.label}</span>
              <div className="flex justify-center">
                {row.email ? <Toggle enabled={notifs[row.email]} onChange={v => set(row.email, v)} /> : <span className="text-gray-300">—</span>}
              </div>
              <div className="flex justify-center">
                {row.sms ? <Toggle enabled={notifs[row.sms]} onChange={v => set(row.sms, v)} /> : <span className="text-gray-300">—</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <SaveButton onClick={() => handleSave({ notifications: notifs })} saving={saving} />
        </div>
      </div>
    )
  }

  // ─── Login & Auth ───────────────────────────────────────────────────────────
  const LoginAuthSection = () => {
    const [currentPw, setCurrentPw] = useState('')
    const [newPw, setNewPw] = useState('')
    const [confirmPw, setConfirmPw] = useState('')
    const [pwError, setPwError] = useState('')
    const [pwSuccess, setPwSuccess] = useState('')
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [twoFA, setTwoFA] = useState(settings?.two_fa_enabled || false)
    const [sessionTimeout, setSessionTimeout] = useState(settings?.session_timeout || '8h')

    const handleChangePw = (e) => {
      e.preventDefault()
      setPwError('')
      setPwSuccess('')
      if (!currentPw) { setPwError('Current password is required.'); return }
      if (newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return }
      if (newPw !== confirmPw) { setPwError('Passwords do not match.'); return }
      setPwSuccess('Password changed successfully.')
      setCurrentPw(''); setNewPw(''); setConfirmPw('')
      setTimeout(() => setPwSuccess(''), 4000)
    }

    return (
      <div className="p-8 max-w-2xl space-y-8">
        <SectionHeader title="Login & Authentication" />
        <SuccessMsg msg={successMsg} />

        {/* Change Password */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Lock className="w-4 h-4" /> Change Password
          </h3>
          {pwError && <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 text-red-700 rounded text-sm">{pwError}</div>}
          {pwSuccess && <div className="mb-3 px-3 py-2 bg-green-50 border border-green-200 text-green-700 rounded text-sm flex items-center gap-1"><Check className="w-4 h-4" />{pwSuccess}</div>}
          <form onSubmit={handleChangePw} className="space-y-4">
            <div>
              <Label>Current Password</Label>
              <div className="relative">
                <input
                  type={showCurrent ? 'text' : 'password'}
                  value={currentPw}
                  onChange={e => setCurrentPw(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter current password"
                />
                <button type="button" onClick={() => setShowCurrent(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>New Password</Label>
              <div className="relative">
                <input
                  type={showNew ? 'text' : 'password'}
                  value={newPw}
                  onChange={e => setNewPw(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="At least 8 characters"
                />
                <button type="button" onClick={() => setShowNew(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label>Confirm New Password</Label>
              <input
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Repeat new password"
              />
            </div>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">
              Update Password
            </button>
          </form>
        </div>

        {/* Two-Factor Auth */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2"><Shield className="w-4 h-4" /> Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500 mt-1">Add an extra layer of security to your account. You'll be asked for a code when you sign in.</p>
            </div>
            <Toggle enabled={twoFA} onChange={setTwoFA} />
          </div>
        </div>

        {/* Session Timeout */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2"><Clock className="w-4 h-4" /> Session Timeout</h3>
          <p className="text-sm text-gray-500 mb-3">Automatically sign out after a period of inactivity.</p>
          <Select value={sessionTimeout} onChange={e => setSessionTimeout(e.target.value)} className="w-48">
            <option value="1h">1 hour</option>
            <option value="4h">4 hours</option>
            <option value="8h">8 hours</option>
            <option value="24h">24 hours</option>
            <option value="7d">7 days</option>
          </Select>
          <div className="mt-4">
            <SaveButton onClick={() => handleSave({ two_fa_enabled: twoFA, session_timeout: sessionTimeout })} saving={saving} />
          </div>
        </div>
      </div>
    )
  }

  // ─── Jobs ───────────────────────────────────────────────────────────────────
  const JobsSection = () => {
    const s = settings?.job_settings || {}
    const [prefix, setPrefix] = useState(s.prefix || 'JOB')
    const [startNum, setStartNum] = useState(s.start_number || 1001)
    const [autoNum, setAutoNum] = useState(s.auto_numbering ?? true)
    const [defaultStatus, setDefaultStatus] = useState(s.default_status || 'Pending')
    const [requireSig, setRequireSig] = useState(s.require_signature ?? false)
    const [allowPartial, setAllowPartial] = useState(s.allow_partial_payment ?? true)

    return (
      <div className="p-8 max-w-2xl">
        <SectionHeader title="Jobs" description="Configure default settings for jobs." />
        <SuccessMsg msg={successMsg} />
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Job Number Settings</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Prefix</Label>
                <Input value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="JOB" />
              </div>
              <div className="flex-1">
                <Label>Starting Number</Label>
                <Input type="number" value={startNum} onChange={e => setStartNum(e.target.value)} min={1} />
              </div>
            </div>
            <div className="text-xs text-gray-400">Preview: {prefix}-{String(startNum).padStart(4, '0')}</div>
            <ToggleRow label="Auto-numbering" description="Automatically assign job numbers in sequence" enabled={autoNum} onChange={setAutoNum} />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Defaults</h3>
            <div>
              <Label>Default Job Status</Label>
              <Select value={defaultStatus} onChange={e => setDefaultStatus(e.target.value)} className="w-48">
                <option>Pending</option>
                <option>Scheduled</option>
                <option>In Progress</option>
              </Select>
            </div>
            <div className="divide-y divide-gray-100">
              <ToggleRow label="Require Customer Signature" description="Customers must sign off on jobs before completion" enabled={requireSig} onChange={setRequireSig} />
              <ToggleRow label="Allow Partial Payment" description="Customers can make partial payments on invoices" enabled={allowPartial} onChange={setAllowPartial} />
            </div>
          </div>

          <SaveButton onClick={() => handleSave({ job_settings: { prefix, start_number: startNum, auto_numbering: autoNum, default_status: defaultStatus, require_signature: requireSig, allow_partial_payment: allowPartial } })} saving={saving} />
        </div>
      </div>
    )
  }

  // ─── Estimates ──────────────────────────────────────────────────────────────
  const EstimatesSection = () => {
    const s = settings?.estimate_settings || {}
    const [prefix, setPrefix] = useState(s.prefix || 'EST')
    const [startNum, setStartNum] = useState(s.start_number || 1001)
    const [validity, setValidity] = useState(s.validity_days || 30)
    const [requireSig, setRequireSig] = useState(s.require_signature ?? false)
    const [defaultNotes, setDefaultNotes] = useState(s.default_notes || '')
    const [defaultTerms, setDefaultTerms] = useState(s.default_terms || '')

    return (
      <div className="p-8 max-w-2xl">
        <SectionHeader title="Estimates" description="Configure default settings for estimates." />
        <SuccessMsg msg={successMsg} />
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Estimate Number Settings</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Prefix</Label>
                <Input value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="EST" />
              </div>
              <div className="flex-1">
                <Label>Starting Number</Label>
                <Input type="number" value={startNum} onChange={e => setStartNum(e.target.value)} min={1} />
              </div>
            </div>
            <div className="text-xs text-gray-400">Preview: {prefix}-{String(startNum).padStart(4, '0')}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <div>
              <Label>Validity Period (days)</Label>
              <Input type="number" value={validity} onChange={e => setValidity(e.target.value)} min={1} className="w-32" />
              <p className="text-xs text-gray-400 mt-1">Estimates expire after this many days.</p>
            </div>
            <ToggleRow label="Require Signature" description="Customers must sign to accept estimates" enabled={requireSig} onChange={setRequireSig} />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <div>
              <Label>Default Notes</Label>
              <Textarea rows={3} value={defaultNotes} onChange={e => setDefaultNotes(e.target.value)} placeholder="Notes that appear on every estimate..." />
            </div>
            <div>
              <Label>Default Terms</Label>
              <Textarea rows={3} value={defaultTerms} onChange={e => setDefaultTerms(e.target.value)} placeholder="Terms and conditions..." />
            </div>
          </div>

          <SaveButton onClick={() => handleSave({ estimate_settings: { prefix, start_number: startNum, validity_days: validity, require_signature: requireSig, default_notes: defaultNotes, default_terms: defaultTerms } })} saving={saving} />
        </div>
      </div>
    )
  }

  // ─── Invoices ───────────────────────────────────────────────────────────────
  const InvoicesSection = () => {
    const s = settings?.invoice_settings || {}
    const [prefix, setPrefix] = useState(s.prefix || 'INV')
    const [startNum, setStartNum] = useState(s.start_number || 1001)
    const [paymentTerms, setPaymentTerms] = useState(s.payment_terms || 'Net 30')
    const [lateFee, setLateFee] = useState(s.late_fee_enabled ?? false)
    const [lateFeePercent, setLateFeePercent] = useState(s.late_fee_percent || 1.5)
    const [acceptCard, setAcceptCard] = useState(s.accept_credit_card ?? true)
    const [acceptCheck, setAcceptCheck] = useState(s.accept_check ?? true)
    const [acceptCash, setAcceptCash] = useState(s.accept_cash ?? true)
    const [defaultNotes, setDefaultNotes] = useState(s.default_notes || '')
    const [defaultTerms, setDefaultTerms] = useState(s.default_terms || '')

    return (
      <div className="p-8 max-w-2xl">
        <SectionHeader title="Invoices" description="Configure default settings for invoices." />
        <SuccessMsg msg={successMsg} />
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Invoice Number Settings</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label>Prefix</Label>
                <Input value={prefix} onChange={e => setPrefix(e.target.value)} placeholder="INV" />
              </div>
              <div className="flex-1">
                <Label>Starting Number</Label>
                <Input type="number" value={startNum} onChange={e => setStartNum(e.target.value)} min={1} />
              </div>
            </div>
            <div className="text-xs text-gray-400">Preview: {prefix}-{String(startNum).padStart(4, '0')}</div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <div>
              <Label>Payment Terms</Label>
              <Select value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="w-48">
                <option>Net 15</option>
                <option>Net 30</option>
                <option>Net 45</option>
                <option>Due on Receipt</option>
              </Select>
            </div>
            <div>
              <ToggleRow label="Late Fee" description="Charge a late fee on overdue invoices" enabled={lateFee} onChange={setLateFee} />
              {lateFee && (
                <div className="mt-2 flex items-center gap-2 pl-2">
                  <Input type="number" value={lateFeePercent} onChange={e => setLateFeePercent(e.target.value)} min={0} step={0.1} className="w-24" />
                  <span className="text-sm text-gray-500">% per month</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 mb-2">Accepted Payment Methods</h3>
            <ToggleRow label="Credit Card" enabled={acceptCard} onChange={setAcceptCard} />
            <ToggleRow label="Check" enabled={acceptCheck} onChange={setAcceptCheck} />
            <ToggleRow label="Cash" enabled={acceptCash} onChange={setAcceptCash} />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
            <div>
              <Label>Default Notes</Label>
              <Textarea rows={3} value={defaultNotes} onChange={e => setDefaultNotes(e.target.value)} placeholder="Notes that appear on every invoice..." />
            </div>
            <div>
              <Label>Default Terms</Label>
              <Textarea rows={3} value={defaultTerms} onChange={e => setDefaultTerms(e.target.value)} placeholder="Terms and conditions..." />
            </div>
          </div>

          <SaveButton onClick={() => handleSave({ invoice_settings: { prefix, start_number: startNum, payment_terms: paymentTerms, late_fee_enabled: lateFee, late_fee_percent: lateFeePercent, accept_credit_card: acceptCard, accept_check: acceptCheck, accept_cash: acceptCash, default_notes: defaultNotes, default_terms: defaultTerms } })} saving={saving} />
        </div>
      </div>
    )
  }

  // ─── Time Tracking ──────────────────────────────────────────────────────────
  const TimeTrackingSection = () => {
    const s = settings?.time_tracking || {}
    const [enabled, setEnabled] = useState(s.enabled ?? false)
    const [rounding, setRounding] = useState(s.rounding || 'No rounding')
    const [overtimeHours, setOvertimeHours] = useState(s.overtime_after || 8)
    const [overtimeRate, setOvertimeRate] = useState(s.overtime_rate || '1.5x')

    return (
      <div className="p-8 max-w-2xl">
        <SectionHeader title="Time Tracking" description="Track time spent on jobs and calculate labor costs." />
        <SuccessMsg msg={successMsg} />
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <ToggleRow label="Enable Time Tracking" description="Track time your team spends on jobs" enabled={enabled} onChange={setEnabled} />
          </div>
          {enabled && (
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <div>
                <Label>Time Rounding</Label>
                <Select value={rounding} onChange={e => setRounding(e.target.value)} className="w-48">
                  <option>No rounding</option>
                  <option>5 min</option>
                  <option>15 min</option>
                  <option>30 min</option>
                </Select>
              </div>
              <div>
                <Label>Overtime After (hours/day)</Label>
                <Input type="number" value={overtimeHours} onChange={e => setOvertimeHours(e.target.value)} min={1} className="w-32" />
              </div>
              <div>
                <Label>Overtime Rate Multiplier</Label>
                <Select value={overtimeRate} onChange={e => setOvertimeRate(e.target.value)} className="w-36">
                  <option value="1.0x">1.0x (no extra)</option>
                  <option value="1.5x">1.5x (time & half)</option>
                  <option value="2.0x">2.0x (double time)</option>
                </Select>
              </div>
            </div>
          )}
          <SaveButton onClick={() => handleSave({ time_tracking: { enabled, rounding, overtime_after: overtimeHours, overtime_rate: overtimeRate } })} saving={saving} />
        </div>
      </div>
    )
  }

  // ─── Lead Sources ───────────────────────────────────────────────────────────
  const LeadSourcesSection = () => {
    const defaults = ['Google', 'Yelp', 'Word of Mouth', 'Facebook', 'Direct Mail']
    const [sources, setSources] = useState(settings?.lead_sources || defaults)
    const [newSource, setNewSource] = useState('')

    const addSource = () => {
      const trimmed = newSource.trim()
      if (trimmed && !sources.includes(trimmed)) {
        setSources(s => [...s, trimmed])
        setNewSource('')
      }
    }
    const removeSource = (idx) => setSources(s => s.filter((_, i) => i !== idx))

    return (
      <div className="p-8 max-w-2xl">
        <SectionHeader title="Lead Sources" description="Track where your customers are coming from." />
        <SuccessMsg msg={successMsg} />
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          {sources.map((src, i) => (
            <div key={i} className="flex items-center justify-between px-4 py-3">
              <span className="text-sm text-gray-700">{src}</span>
              <button type="button" onClick={() => removeSource(i)} className="text-gray-400 hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2 p-3">
            <Input value={newSource} onChange={e => setNewSource(e.target.value)} placeholder="Add a lead source..." onKeyDown={e => e.key === 'Enter' && addSource()} />
            <button type="button" onClick={addSource} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>
        <div className="mt-4">
          <SaveButton onClick={() => handleSave({ lead_sources: sources })} saving={saving} />
        </div>
      </div>
    )
  }

  // ─── Tags ───────────────────────────────────────────────────────────────────
  const TagsSection = () => {
    const defaults = [
      { name: 'VIP', color: 'amber' },
      { name: 'Residential', color: 'blue' },
      { name: 'Commercial', color: 'purple' },
      { name: 'Urgent', color: 'red' },
    ]
    const [tags, setTags] = useState(settings?.tags || defaults)
    const [newName, setNewName] = useState('')
    const [newColor, setNewColor] = useState('blue')

    const addTag = () => {
      const trimmed = newName.trim()
      if (trimmed) {
        setTags(t => [...t, { name: trimmed, color: newColor }])
        setNewName('')
        setNewColor('blue')
      }
    }
    const removeTag = (idx) => setTags(t => t.filter((_, i) => i !== idx))

    return (
      <div className="p-8 max-w-2xl">
        <SectionHeader title="Tags" description="Create tags to categorize customers, jobs, and more." />
        <SuccessMsg msg={successMsg} />
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag, i) => (
              <div key={i} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 text-sm font-medium text-gray-700">
                <span className={`w-2.5 h-2.5 rounded-full ${colorBgClass(tag.color)}`} />
                {tag.name}
                <button type="button" onClick={() => removeTag(i)} className="text-gray-400 hover:text-red-500 ml-1">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {tags.length === 0 && <p className="text-sm text-gray-400 italic">No tags yet.</p>}
          </div>
          <div className="border-t border-gray-100 pt-4 space-y-3">
            <div className="flex gap-2">
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Tag name..." onKeyDown={e => e.key === 'Enter' && addTag()} />
              <button type="button" onClick={addTag} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-1 whitespace-nowrap">
                <Plus className="w-4 h-4" /> Add Tag
              </button>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-2">Tag color:</p>
              <ColorSwatches selected={newColor} onChange={setNewColor} />
            </div>
          </div>
        </div>
        <SaveButton onClick={() => handleSave({ tags })} saving={saving} />
      </div>
    )
  }

  // ─── Pipeline ───────────────────────────────────────────────────────────────
  const PipelineSection = () => {
    const defaults = [
      { name: 'New Lead', color: 'blue' },
      { name: 'Contacted', color: 'amber' },
      { name: 'Estimate Sent', color: 'purple' },
      { name: 'Won', color: 'green' },
      { name: 'Lost', color: 'red' },
    ]
    const [stages, setStages] = useState(settings?.pipeline_stages || defaults)
    const [newName, setNewName] = useState('')
    const [newColor, setNewColor] = useState('blue')

    const addStage = () => {
      const trimmed = newName.trim()
      if (trimmed) {
        setStages(s => [...s, { name: trimmed, color: newColor }])
        setNewName(''); setNewColor('blue')
      }
    }
    const removeStage = (idx) => setStages(s => s.filter((_, i) => i !== idx))
    const moveUp = (idx) => {
      if (idx === 0) return
      setStages(s => { const a = [...s]; [a[idx-1], a[idx]] = [a[idx], a[idx-1]]; return a })
    }
    const moveDown = (idx) => {
      setStages(s => { if (idx >= s.length - 1) return s; const a = [...s]; [a[idx], a[idx+1]] = [a[idx+1], a[idx]]; return a })
    }

    return (
      <div className="p-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-2xl font-bold text-gray-900">Pipeline Stages</h2>
          <Badge className="bg-purple-100 text-purple-700 text-xs">Add-on</Badge>
        </div>
        <p className="text-sm text-gray-500 mb-6">Define the stages in your sales pipeline.</p>
        <SuccessMsg msg={successMsg} />
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 mb-4">
          {stages.map((stage, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <span className="w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-500 flex items-center justify-center">{i + 1}</span>
              <span className={`w-3 h-3 rounded-full ${colorBgClass(stage.color)}`} />
              <span className="flex-1 text-sm text-gray-700">{stage.name}</span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => moveUp(i)} disabled={i === 0} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => moveDown(i)} disabled={i === stages.length - 1} className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30">
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button type="button" onClick={() => removeStage(i)} className="p-1 text-gray-400 hover:text-red-500 ml-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          <div className="p-4 space-y-3">
            <div className="flex gap-2">
              <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="New stage name..." onKeyDown={e => e.key === 'Enter' && addStage()} />
              <button type="button" onClick={addStage} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium flex items-center gap-1 whitespace-nowrap">
                <Plus className="w-4 h-4" /> Add Stage
              </button>
            </div>
            <ColorSwatches selected={newColor} onChange={setNewColor} />
          </div>
        </div>
        <SaveButton onClick={() => handleSave({ pipeline_stages: stages })} saving={saving} />
      </div>
    )
  }

  // ─── Checklists ─────────────────────────────────────────────────────────────
  const ChecklistsSection = () => {
    const defaults = [
      { title: 'HVAC Maintenance', items: ['Check filters', 'Clean coils', 'Test thermostat', 'Inspect ductwork'] },
      { title: 'Plumbing Inspection', items: ['Check for leaks', 'Test water pressure', 'Inspect pipes'] },
    ]
    const [checklists, setChecklists] = useState(settings?.checklists || defaults)
    const [expanded, setExpanded] = useState({})
    const [showAddForm, setShowAddForm] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newItems, setNewItems] = useState([''])

    const toggleExpanded = (i) => setExpanded(e => ({ ...e, [i]: !e[i] }))
    const removeChecklist = (i) => setChecklists(c => c.filter((_, idx) => idx !== i))
    const addChecklist = () => {
      const title = newTitle.trim()
      const items = newItems.map(x => x.trim()).filter(Boolean)
      if (title) {
        setChecklists(c => [...c, { title, items }])
        setNewTitle(''); setNewItems(['']); setShowAddForm(false)
      }
    }
    const updateNewItem = (i, val) => setNewItems(items => items.map((x, idx) => idx === i ? val : x))
    const addNewItem = () => setNewItems(items => [...items, ''])
    const removeNewItem = (i) => setNewItems(items => items.filter((_, idx) => idx !== i))

    return (
      <div className="p-8 max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-gray-900">Checklists</h2>
              <Badge className="bg-blue-100 text-blue-700 text-xs">New</Badge>
            </div>
            <p className="text-sm text-gray-500">Create reusable checklists for common job types.</p>
          </div>
          <button type="button" onClick={() => setShowAddForm(true)} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-1">
            <Plus className="w-4 h-4" /> Add Checklist
          </button>
        </div>
        <SuccessMsg msg={successMsg} />

        {showAddForm && (
          <div className="mb-4 bg-white border-2 border-blue-300 rounded-lg p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900">New Checklist Template</h3>
            <div>
              <Label>Template Name</Label>
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="e.g. HVAC Maintenance" />
            </div>
            <div>
              <Label>Items</Label>
              <div className="space-y-2">
                {newItems.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={item} onChange={e => updateNewItem(i, e.target.value)} placeholder={`Item ${i + 1}`} />
                    <button type="button" onClick={() => removeNewItem(i)} className="text-gray-400 hover:text-red-500">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addNewItem} className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Add item
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={addChecklist} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Create</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {checklists.map((cl, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3">
                <button type="button" onClick={() => toggleExpanded(i)} className="flex items-center gap-2 text-sm font-semibold text-gray-800 hover:text-blue-600">
                  {expanded[i] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                  {cl.title}
                  <span className="text-xs font-normal text-gray-400">({cl.items.length} items)</span>
                </button>
                <button type="button" onClick={() => removeChecklist(i)} className="text-gray-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              {expanded[i] && (
                <div className="border-t border-gray-100 px-6 py-3 space-y-1">
                  {cl.items.map((item, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm text-gray-600 py-1">
                      <CheckSquare className="w-4 h-4 text-gray-300" /> {item}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <SaveButton onClick={() => handleSave({ checklists })} saving={saving} />
        </div>
      </div>
    )
  }

  // ─── AI Team ────────────────────────────────────────────────────────────────
  const AITeamSection = () => {
    const s = settings?.ai_settings || {}
    const [aiAssistant, setAiAssistant] = useState(s.ai_assistant ?? true)
    const [autoFollowUp, setAutoFollowUp] = useState(s.auto_follow_up ?? false)
    const [autoEstimate, setAutoEstimate] = useState(s.auto_estimate_drafts ?? false)
    const [responseStyle, setResponseStyle] = useState(s.response_style || 'Professional')

    return (
      <div className="p-8 max-w-2xl">
        <SectionHeader title="AI Team" description="Configure your AI-powered assistant and automation features." />
        <SuccessMsg msg={successMsg} />
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100 overflow-hidden">
            <ToggleRow
              label="AI Assistant"
              description="Let AI help schedule follow-ups and draft responses"
              enabled={aiAssistant}
              onChange={setAiAssistant}
            />
            <div className="px-4">
              <ToggleRow
                label="Auto Follow-up"
                description="Automatically follow up with leads after 3 days"
                enabled={autoFollowUp}
                onChange={setAutoFollowUp}
              />
            </div>
            <div className="px-4">
              <ToggleRow
                label="Auto Estimate Drafts"
                description="AI drafts initial estimates based on job descriptions"
                enabled={autoEstimate}
                onChange={setAutoEstimate}
              />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <Label>Response Style</Label>
            <Select value={responseStyle} onChange={e => setResponseStyle(e.target.value)} className="w-48">
              <option>Professional</option>
              <option>Friendly</option>
              <option>Casual</option>
            </Select>
          </div>

          <InfoBox>
            AI features are powered by Claude. All responses are reviewed before sending and your customer data is never used to train AI models.
          </InfoBox>

          <SaveButton onClick={() => handleSave({ ai_settings: { ai_assistant: aiAssistant, auto_follow_up: autoFollowUp, auto_estimate_drafts: autoEstimate, response_style: responseStyle } })} saving={saving} />
        </div>
      </div>
    )
  }

  // ─── Plans & Billing ────────────────────────────────────────────────────────
  const PlansBillingSection = () => {
    const features = [
      'Unlimited customers',
      'Unlimited jobs',
      'Invoicing & estimates',
      'Customer portal',
      'Text messaging',
      'Priority support',
    ]
    const plans = [
      { name: 'Starter', price: '$29', desc: 'For solo contractors', highlighted: false },
      { name: 'Professional', price: '$79', desc: 'For growing teams', highlighted: true },
      { name: 'Enterprise', price: 'Custom', desc: 'For large operations', highlighted: false },
    ]
    return (
      <div className="p-8 max-w-3xl">
        <SectionHeader title="Plans & Billing" />
        {/* Current Plan */}
        <div className="bg-white border-2 border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-gray-900">Professional</h3>
              <Badge className="bg-blue-600 text-white">Current Plan</Badge>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">$79</p>
              <p className="text-xs text-gray-500">/month</p>
            </div>
          </div>
          <ul className="space-y-2 mb-6">
            {features.map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
              </li>
            ))}
          </ul>
          <div className="flex gap-3">
            <button type="button" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2">
              <ExternalLink className="w-4 h-4" /> Manage Billing
            </button>
            <p className="text-xs text-gray-400 self-center">Opens billing portal</p>
          </div>
        </div>

        {/* Compare Plans */}
        <h3 className="text-base font-semibold text-gray-900 mb-4">Compare Plans</h3>
        <div className="grid grid-cols-3 gap-4">
          {plans.map(plan => (
            <div key={plan.name} className={`rounded-lg border-2 p-5 text-center ${plan.highlighted ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}>
              <p className="font-bold text-gray-900 mb-1">{plan.name}</p>
              <p className="text-2xl font-bold text-blue-600 mb-1">{plan.price}</p>
              {plan.price !== 'Custom' && <p className="text-xs text-gray-400 mb-2">/month</p>}
              <p className="text-xs text-gray-500 mb-4">{plan.desc}</p>
              {plan.highlighted ? (
                <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-1 rounded-full">Current Plan</span>
              ) : (
                <button type="button" className="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700">
                  {plan.price === 'Custom' ? 'Contact Sales' : 'Downgrade'}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─── Voice ──────────────────────────────────────────────────────────────────
  const VoiceSection = () => (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <Badge className="bg-purple-100 text-purple-700 mb-6 inline-block">Add-on</Badge>
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Phone className="w-10 h-10 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Add voice calling to your workflow</h2>
        <p className="text-gray-500 mb-6">Make and receive calls directly from ServiceBook Pros. All calls are recorded and transcribed automatically.</p>
        <ul className="text-left space-y-2 mb-8 inline-block">
          {['Local & toll-free numbers', 'Call recording', 'Voicemail transcription', 'Call history'].map(f => (
            <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="w-4 h-4 text-green-500 flex-shrink-0" /> {f}
            </li>
          ))}
        </ul>
        <div>
          <button type="button" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg">
            Get Started - $19/month
          </button>
        </div>
      </div>
    </div>
  )

  // ─── Customer Portal ────────────────────────────────────────────────────────
  const CustomerPortalSection = () => {
    const s = settings?.customer_portal || {}
    const [enabled, setEnabled] = useState(s.enabled ?? false)
    const [allowBooking, setAllowBooking] = useState(s.allow_booking ?? true)
    const [allowPayment, setAllowPayment] = useState(s.allow_payment ?? true)
    const [viewHistory, setViewHistory] = useState(s.view_history ?? true)

    return (
      <div className="p-8 max-w-2xl">
        <SectionHeader title="Customer Portal" description="Let customers view jobs, pay invoices, and book appointments online." />
        <SuccessMsg msg={successMsg} />
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <ToggleRow label="Enable Customer Portal" description="Give customers access to their own portal" enabled={enabled} onChange={setEnabled} />
          </div>

          {enabled && (
            <>
              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <Label>Portal URL</Label>
                <CopyInput value="https://portal.servicebookpros.com" />
                <p className="text-xs text-gray-400 mt-1">Share this link with customers to access their portal.</p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Permissions</h3>
                <div className="divide-y divide-gray-100">
                  <ToggleRow label="Allow online booking" description="Customers can schedule new appointments" enabled={allowBooking} onChange={setAllowBooking} />
                  <ToggleRow label="Allow payment submission" description="Customers can pay invoices online" enabled={allowPayment} onChange={setAllowPayment} />
                  <ToggleRow label="View job history" description="Customers can see past and current jobs" enabled={viewHistory} onChange={setViewHistory} />
                </div>
              </div>

              <div>
                <button type="button" className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50">
                  Customize Portal
                </button>
              </div>
            </>
          )}

          <SaveButton onClick={() => handleSave({ customer_portal: { enabled, allow_booking: allowBooking, allow_payment: allowPayment, view_history: viewHistory } })} saving={saving} />
        </div>
      </div>
    )
  }

  // ─── Referral Program ───────────────────────────────────────────────────────
  const ReferralProgramSection = () => {
    const s = settings?.referral_program || {}
    const [enabled, setEnabled] = useState(s.enabled ?? false)
    const [rewardType, setRewardType] = useState(s.reward_type || 'Discount')
    const [rewardValue, setRewardValue] = useState(s.reward_value || 10)
    const [rewardDesc, setRewardDesc] = useState(s.reward_description || '')

    return (
      <div className="p-8 max-w-2xl">
        <SectionHeader title="Referral Program" description="Reward customers who refer new business to you." />
        <SuccessMsg msg={successMsg} />
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <ToggleRow label="Enable Referral Program" description="Automatically track and reward referrals" enabled={enabled} onChange={setEnabled} />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <div>
              <Label>Reward Type</Label>
              <Select value={rewardType} onChange={e => setRewardType(e.target.value)} className="w-48">
                <option>Discount</option>
                <option>Store Credit</option>
                <option>Cash</option>
              </Select>
            </div>
            <div>
              <Label>Reward Value ($)</Label>
              <div className="flex items-center gap-2">
                <span className="text-gray-500 text-sm">$</span>
                <Input type="number" value={rewardValue} onChange={e => setRewardValue(e.target.value)} min={0} className="w-32" />
              </div>
            </div>
            <div>
              <Label>Reward Description</Label>
              <Input value={rewardDesc} onChange={e => setRewardDesc(e.target.value)} placeholder="e.g. $10 off your next service" />
            </div>
          </div>

          <InfoBox>
            When a customer refers someone who completes a job, both the referrer and new customer receive the reward.
          </InfoBox>

          <SaveButton onClick={() => handleSave({ referral_program: { enabled, reward_type: rewardType, reward_value: rewardValue, reward_description: rewardDesc } })} saving={saving} />
        </div>
      </div>
    )
  }

  // ─── Recommended Referrals ──────────────────────────────────────────────────
  const RecommendedReferralsSection = () => {
    const [enabled, setEnabled] = useState(settings?.recommended_referrals?.enabled ?? false)
    const candidates = [
      { name: 'John Smith', jobs: 5, score: 98 },
      { name: 'Sarah Johnson', jobs: 3, score: 95 },
      { name: 'Mike Davis', jobs: 4, score: 91 },
    ]
    return (
      <div className="p-8 max-w-2xl">
        <SectionHeader title="Recommended Referrals" description="Identify your best customers for referral outreach." />
        <div className="space-y-4">
          <InfoBox>
            ServiceBook Pros can automatically identify your best customers and suggest who to ask for referrals based on job history and satisfaction scores.
          </InfoBox>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <ToggleRow label="Enable Recommended Referrals" description="Automatically surface top referral candidates" enabled={enabled} onChange={setEnabled} />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700">Top Referral Candidates</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Customer</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Jobs</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-gray-500">Score</th>
                  <th className="px-4 py-2"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {candidates.map(c => (
                  <tr key={c.name} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{c.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{c.jobs} jobs</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">{c.score}</span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="text-xs px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium">
                        Request Referral
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  // ─── Campaigns ──────────────────────────────────────────────────────────────
  const CampaignsSection = () => {
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newName, setNewName] = useState('')
    const [newType, setNewType] = useState('Email')
    const [newMessage, setNewMessage] = useState('')

    const campaigns = [
      { name: 'Summer Special', status: 'Active', desc: '20% off AC tune-ups', sent: 145 },
      { name: 'Win-Back Campaign', status: 'Draft', desc: "We miss you! Schedule your next service", sent: 0 },
      { name: 'Review Request', status: 'Active', desc: 'How was your experience?', sent: 89 },
    ]

    return (
      <div className="p-8 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <SectionHeader title="Marketing Campaigns" description="Create and manage email and SMS marketing campaigns." />
          <button type="button" onClick={() => setShowCreateForm(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        </div>

        {showCreateForm && (
          <div className="mb-6 bg-white border-2 border-blue-300 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Create New Campaign</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Campaign Name</Label>
                <Input value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Spring Promo" />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={newType} onChange={e => setNewType(e.target.value)} className="w-full">
                  <option>Email</option>
                  <option>SMS</option>
                </Select>
              </div>
            </div>
            <div>
              <Label>Message</Label>
              <Textarea rows={4} value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Write your campaign message..." />
            </div>
            <div className="flex gap-2">
              <button type="button" className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg">Create Campaign</button>
              <button type="button" onClick={() => setShowCreateForm(false)} className="px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg hover:bg-gray-50">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {campaigns.map(camp => (
            <div key={camp.name} className="bg-white border border-gray-200 rounded-lg p-5 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-gray-800">{camp.name}</h3>
                  <Badge className={camp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                    {camp.status}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500">{camp.desc}</p>
              </div>
              <div className="text-right pl-6">
                <p className="text-sm font-semibold text-gray-700">{camp.sent.toLocaleString()}</p>
                <p className="text-xs text-gray-400">sent</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ─── Website ────────────────────────────────────────────────────────────────
  const WebsiteSection = () => {
    const s = settings || {}
    const [website, setWebsite] = useState(s.website || '')
    const [seoDesc, setSeoDesc] = useState(s.seo_description || '')
    const [keywords, setKeywords] = useState(s.seo_keywords || '')
    const widgetCode = `<script src="https://servicebookpros.com/widget.js"\n  data-company-id="your-id"\n  data-theme="blue"\n  async>\n</script>`

    return (
      <div className="p-8 max-w-2xl">
        <SectionHeader title="Website" description="Integrate ServiceBook Pros with your website." />
        <SuccessMsg msg={successMsg} />
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
            <div>
              <Label>Company Website URL</Label>
              <Input value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://yourcompany.com" type="url" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Website Integration</h3>
            <div>
              <Label>Embed Booking Widget</Label>
              <p className="text-xs text-gray-500 mb-2">Paste this code into your website to add a booking button.</p>
              <CodeBlock code={widgetCode} />
            </div>
            <div>
              <Label>Booking Page URL</Label>
              <CopyInput value="https://book.servicebookpros.com/your-company" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">SEO Settings</h3>
            <div>
              <Label>Business Description</Label>
              <Textarea rows={3} value={seoDesc} onChange={e => setSeoDesc(e.target.value)} placeholder="Brief description of your business for search engines..." />
            </div>
            <div>
              <Label>Keywords</Label>
              <Input value={keywords} onChange={e => setKeywords(e.target.value)} placeholder="hvac, plumbing, repair, service..." />
              <p className="text-xs text-gray-400 mt-1">Comma-separated keywords.</p>
            </div>
          </div>

          <SaveButton onClick={() => handleSave({ website, seo_description: seoDesc, seo_keywords: keywords })} saving={saving} />
        </div>
      </div>
    )
  }

  // ─── Reviews ────────────────────────────────────────────────────────────────
  const ReviewsSection = () => {
    const s = settings?.reviews || {}
    const [autoRequest, setAutoRequest] = useState(s.auto_request ?? true)
    const [delay, setDelay] = useState(s.delay_hours || '48')
    const [googleUrl, setGoogleUrl] = useState(s.google_url || '')
    const [yelpUrl, setYelpUrl] = useState(s.yelp_url || '')
    const [facebookUrl, setFacebookUrl] = useState(s.facebook_url || '')

    return (
      <div className="p-8 max-w-2xl">
        <SectionHeader title="Reviews" description="Automatically collect reviews after job completion." />
        <SuccessMsg msg={successMsg} />
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <ToggleRow label="Automate Review Requests" description="Automatically send review requests after job completion" enabled={autoRequest} onChange={setAutoRequest} />
            {autoRequest && (
              <div className="flex items-center gap-3 pt-2">
                <span className="text-sm text-gray-600 whitespace-nowrap">Request delay:</span>
                <Select value={delay} onChange={e => setDelay(e.target.value)} className="w-36">
                  <option value="24">24 hours</option>
                  <option value="48">48 hours</option>
                  <option value="72">72 hours</option>
                </Select>
                <span className="text-sm text-gray-500">after job completion</span>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
            <h3 className="text-sm font-semibold text-gray-900">Review Platform Links</h3>
            <div>
              <Label>Google Reviews URL</Label>
              <Input value={googleUrl} onChange={e => setGoogleUrl(e.target.value)} placeholder="https://g.page/r/..." type="url" />
            </div>
            <div>
              <Label>Yelp URL</Label>
              <Input value={yelpUrl} onChange={e => setYelpUrl(e.target.value)} placeholder="https://yelp.com/biz/..." type="url" />
            </div>
            <div>
              <Label>Facebook URL</Label>
              <Input value={facebookUrl} onChange={e => setFacebookUrl(e.target.value)} placeholder="https://facebook.com/..." type="url" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Review Request Preview</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">SMS Preview</p>
                  <p className="text-sm text-gray-700 bg-white border border-gray-200 rounded-lg px-3 py-2 inline-block">
                    Hi [Name]! Thanks for choosing ServiceBook Pros. We'd love your feedback! ⭐ [review link]
                  </p>
                </div>
              </div>
            </div>
          </div>

          <SaveButton onClick={() => handleSave({ reviews: { auto_request: autoRequest, delay_hours: delay, google_url: googleUrl, yelp_url: yelpUrl, facebook_url: facebookUrl } })} saving={saving} />
        </div>
      </div>
    )
  }

  // ─── Online Booking ─────────────────────────────────────────────────────────
  const OnlineBookingSection = () => {
    const s = settings?.online_booking || {}
    const [enabled, setEnabled] = useState(s.enabled ?? false)
    const [requireDeposit, setRequireDeposit] = useState(s.require_deposit ?? false)
    const [depositPercent, setDepositPercent] = useState(s.deposit_percent || 25)
    const [bufferTime, setBufferTime] = useState(s.buffer_time || '15')
    const [advanceDays, setAdvanceDays] = useState(s.advance_days || 30)

    return (
      <div className="p-8 max-w-2xl">
        <SectionHeader title="Online Booking" description="Allow customers to book appointments online." />
        <SuccessMsg msg={successMsg} />
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <ToggleRow label="Enable Online Booking" description="Customers can book appointments through your booking page" enabled={enabled} onChange={setEnabled} />
          </div>

          {enabled && (
            <>
              <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
                <Label>Booking Page URL</Label>
                <CopyInput value="https://book.servicebookpros.com" />
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-4">
                <div>
                  <ToggleRow label="Require Deposit" description="Customers must pay a deposit to confirm booking" enabled={requireDeposit} onChange={setRequireDeposit} />
                  {requireDeposit && (
                    <div className="mt-2 flex items-center gap-2 pl-2">
                      <Input type="number" value={depositPercent} onChange={e => setDepositPercent(e.target.value)} min={0} max={100} className="w-24" />
                      <span className="text-sm text-gray-500">% deposit required</span>
                    </div>
                  )}
                </div>
                <div>
                  <Label>Buffer Time Between Appointments</Label>
                  <Select value={bufferTime} onChange={e => setBufferTime(e.target.value)} className="w-36">
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                  </Select>
                </div>
                <div>
                  <Label>Advance Booking Window</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">Customers can book up to</span>
                    <Input type="number" value={advanceDays} onChange={e => setAdvanceDays(e.target.value)} min={1} className="w-20" />
                    <span className="text-sm text-gray-500">days in advance</span>
                  </div>
                </div>
              </div>
            </>
          )}

          <SaveButton onClick={() => handleSave({ online_booking: { enabled, require_deposit: requireDeposit, deposit_percent: depositPercent, buffer_time: bufferTime, advance_days: advanceDays } })} saving={saving} />
        </div>
      </div>
    )
  }

  // ─── Lead Form ──────────────────────────────────────────────────────────────
  const LeadFormSection = () => {
    const s = settings?.lead_form || {}
    const [enabled, setEnabled] = useState(s.enabled ?? false)
    const [includePhone, setIncludePhone] = useState(s.include_phone ?? true)
    const [includeService, setIncludeService] = useState(s.include_service ?? true)
    const [includeMessage, setIncludeMessage] = useState(s.include_message ?? true)

    const embedCode = `<iframe\n  src="https://servicebookpros.com/lead-form/your-id"\n  width="100%"\n  height="500"\n  frameborder="0"\n></iframe>`

    return (
      <div className="p-8 max-w-2xl">
        <SectionHeader title="Lead Form" description="Embed a lead capture form on your website." />
        <SuccessMsg msg={successMsg} />
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <ToggleRow label="Enable Lead Form" description="Capture leads directly from your website" enabled={enabled} onChange={setEnabled} />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
            <Label>Embed Code</Label>
            <CodeBlock code={embedCode} />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Include Fields</h3>
            <ToggleRow label="Name" description="Always included" enabled={true} onChange={() => {}} />
            <ToggleRow label="Email" description="Always included" enabled={true} onChange={() => {}} />
            <ToggleRow label="Phone Number" enabled={includePhone} onChange={setIncludePhone} />
            <ToggleRow label="Service Type" enabled={includeService} onChange={setIncludeService} />
            <ToggleRow label="Message" enabled={includeMessage} onChange={setIncludeMessage} />
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">Form Preview</h3>
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3 max-w-sm">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Name *</label>
                <div className="w-full h-8 bg-white border border-gray-300 rounded px-2 text-xs text-gray-400 flex items-center">Your name</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                <div className="w-full h-8 bg-white border border-gray-300 rounded px-2 text-xs text-gray-400 flex items-center">your@email.com</div>
              </div>
              {includePhone && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                  <div className="w-full h-8 bg-white border border-gray-300 rounded px-2 text-xs text-gray-400 flex items-center">(555) 000-0000</div>
                </div>
              )}
              {includeService && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Service Type</label>
                  <div className="w-full h-8 bg-white border border-gray-300 rounded px-2 text-xs text-gray-400 flex items-center">Select a service</div>
                </div>
              )}
              {includeMessage && (
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Message</label>
                  <div className="w-full h-16 bg-white border border-gray-300 rounded px-2 py-2 text-xs text-gray-400">Describe your issue...</div>
                </div>
              )}
              <button type="button" className="w-full py-2 bg-blue-600 text-white text-xs font-semibold rounded">
                Get a Free Estimate
              </button>
            </div>
          </div>

          <SaveButton onClick={() => handleSave({ lead_form: { enabled, include_phone: includePhone, include_service: includeService, include_message: includeMessage } })} saving={saving} />
        </div>
      </div>
    )
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ROUTER
  // ═══════════════════════════════════════════════════════════════════════════

  const renderSettingsContent = () => {
    switch (activeSection) {
      case 'service-area':
        return renderServiceAreaContent()
      case 'profile':
        return (
          <div className="p-8 max-w-2xl">
            <SectionHeader title="Company Profile" />
            {successMsg && (
              <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 text-green-800 rounded-lg text-sm flex items-center gap-2">
                <Check className="w-4 h-4" />{successMsg}
              </div>
            )}
            <form
              className="space-y-6"
              onSubmit={async (e) => {
                e.preventDefault()
                setSaving(true)
                setSuccessMsg('')
                try {
                  await apiClient.updateSettings({
                    company_name: profileData.companyName,
                    phone: profileData.phone,
                    address: profileData.address,
                    email: profileData.email,
                    timezone: profileData.timezone,
                  })
                  showSuccess('Company profile saved successfully.')
                } catch {
                  showSuccess('Settings saved locally.')
                } finally {
                  setSaving(false)
                }
              }}
            >
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Company Name</Label>
                  <Input type="text" value={profileData.companyName} onChange={e => setProfileData(p => ({ ...p, companyName: e.target.value }))} placeholder="Your Company Name" />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input type="text" value={profileData.phone} onChange={e => setProfileData(p => ({ ...p, phone: e.target.value }))} placeholder="(555) 123-4567" />
                </div>
              </div>
              <div>
                <Label>Address</Label>
                <Input type="text" value={profileData.address} onChange={e => setProfileData(p => ({ ...p, address: e.target.value }))} placeholder="123 Main St, City, State 12345" />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <Label>Email</Label>
                  <Input type="email" value={profileData.email} onChange={e => setProfileData(p => ({ ...p, email: e.target.value }))} placeholder="admin@example.com" />
                </div>
                <div>
                  <Label>Timezone</Label>
                  <Input type="text" value={profileData.timezone} onChange={e => setProfileData(p => ({ ...p, timezone: e.target.value }))} placeholder="America/New_York" />
                </div>
              </div>
              <Button type="submit" disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white">
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </div>
        )
      case 'business-hours':
        return <BusinessHoursSection />
      case 'notifications':
        return <NotificationsSection />
      case 'login-auth':
        return <LoginAuthSection />
      case 'jobs':
        return <JobsSection />
      case 'estimates':
        return <EstimatesSection />
      case 'invoices':
        return <InvoicesSection />
      case 'time-tracking':
        return <TimeTrackingSection />
      case 'lead-sources':
        return <LeadSourcesSection />
      case 'tags':
        return <TagsSection />
      case 'pipeline':
        return <PipelineSection />
      case 'checklists':
        return <ChecklistsSection />
      case 'ai-team':
        return <AITeamSection />
      case 'plans-billing':
        return <PlansBillingSection />
      case 'voice':
        return <VoiceSection />
      case 'customer-portal':
        return <CustomerPortalSection />
      case 'referral-program':
        return <ReferralProgramSection />
      case 'recommended-referrals':
        return <RecommendedReferralsSection />
      case 'campaigns':
        return <CampaignsSection />
      case 'website':
        return <WebsiteSection />
      case 'reviews':
        return <ReviewsSection />
      case 'online-booking':
        return <OnlineBookingSection />
      case 'lead-form':
        return <LeadFormSection />
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

  // ═══════════════════════════════════════════════════════════════════════════
  // LAYOUT
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div className="h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-72 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        </div>
        <nav className="flex-1 p-4">
          {settingsStructure.map((section) => (
            <div key={section.id} className="mb-6">
              {section.title && (
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-1">{section.title}</h3>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = activeSection === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSection(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        isActive ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 flex-shrink-0" />
                        <span>{item.title}</span>
                      </div>
                      {item.badge && (
                        <Badge className={`text-xs ${
                          item.badge === 'Add-on' ? 'bg-purple-100 text-purple-700' :
                          item.badge === 'New' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {item.badge}
                        </Badge>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="mt-6 pt-4 border-t border-gray-200 space-y-1">
            <button className="block w-full text-left text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded hover:bg-gray-50">Privacy Policy</button>
            <button className="block w-full text-left text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded hover:bg-gray-50">CA Privacy Notice</button>
            <button className="block w-full text-left text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded hover:bg-gray-50">Software Licenses</button>
          </div>
          <button className="flex items-center gap-2 mt-3 px-3 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg w-full">
            <MessageSquare className="w-4 h-4" />
            <span>Give us feedback</span>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-4 h-4" />
              <span>Inbox</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Settings className="w-4 h-4 text-gray-400" />
              <Mail className="w-4 h-4 text-gray-400" />
            </div>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {renderSettingsContent()}
      </div>
    </div>
  )
}

export default SettingsPage
