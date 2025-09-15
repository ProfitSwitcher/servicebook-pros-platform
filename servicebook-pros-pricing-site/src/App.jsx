import React, { useState } from 'react'
import './App.css'
import { Button } from './components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Badge } from './components/ui/badge'
import { Input } from './components/ui/input'
import { Textarea } from './components/ui/textarea'
import { 
  CheckCircle, 
  Zap, 
  Users, 
  TrendingUp, 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Star,
  ArrowRight,
  Menu,
  X,
  Wrench,
  Calculator,
  Database,
  BarChart3
} from 'lucide-react'

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    businessType: '',
    message: ''
  })

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Handle form submission here
    alert('Thank you! We\'ll contact you within 24 hours to schedule your demo.')
  }

  const scrollToSection = (sectionId) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
    setIsMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-white smooth-scroll">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">ServiceBook Pros</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <button onClick={() => scrollToSection('features')} className="text-gray-700 hover:text-blue-600 transition-colors">
                Features
              </button>
              <button onClick={() => scrollToSection('pricing')} className="text-gray-700 hover:text-blue-600 transition-colors">
                Pricing
              </button>
              <button onClick={() => scrollToSection('about')} className="text-gray-700 hover:text-blue-600 transition-colors">
                About
              </button>
              <button onClick={() => scrollToSection('contact')} className="text-gray-700 hover:text-blue-600 transition-colors">
                Contact
              </button>
              <Button onClick={() => scrollToSection('contact')} className="bg-blue-600 hover:bg-blue-700">
                Start Free Trial
              </Button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-700 hover:text-blue-600"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
                <button onClick={() => scrollToSection('features')} className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                  Features
                </button>
                <button onClick={() => scrollToSection('pricing')} className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                  Pricing
                </button>
                <button onClick={() => scrollToSection('about')} className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                  About
                </button>
                <button onClick={() => scrollToSection('contact')} className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                  Contact
                </button>
                <Button onClick={() => scrollToSection('contact')} className="w-full mt-2 bg-blue-600 hover:bg-blue-700">
                  Start Free Trial
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-16 hero-gradient text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Profit Confidently
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-4xl mx-auto">
              The only platform contractors need: Professional flat rate pricing, customer relationship management, 
              and lead generation - all in one affordable solution
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button 
                onClick={() => scrollToSection('contact')} 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8 py-3"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-blue-600 text-lg px-8 py-3"
              >
                Watch Demo
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-blue-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>No contracts</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>Love it or leave it</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span>1-day setup</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Benefits */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Stop juggling multiple tools. ServiceBook Pros gives you everything in one place.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="feature-icon w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">80% Average Ticket Increase</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Professional flat rate pricing increases your average ticket by 80% compared to time and materials pricing.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="feature-icon w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">1-Day Implementation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Get up and running in just one day with our pre-built pricing database and simple setup process.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="feature-icon w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl">Industry Expert Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Thousands of tasks priced by industry experts with 30+ years experience in electrical, HVAC, and plumbing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Professional Flat Rate Pricing */}
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Professional Flat Rate Pricing
              </h3>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Pre-built & Expert Pricing</h4>
                    <p className="text-gray-600">Thousands of tasks priced by industry experts with 30+ years experience</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Fully Customizable</h4>
                    <p className="text-gray-600">Adjust labor rates, markups, and pricing to fit your business perfectly</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Quarterly Updates</h4>
                    <p className="text-gray-600">Stay current with quarterly parts and pricing updates</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Sample Pricing Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">Service:</p>
                    <p className="font-semibold">Code:</p>
                    <p className="font-semibold">Price:</p>
                  </div>
                  <div className="text-right">
                    <p>Outlet Testing (2500-3500 sq ft)</p>
                    <p>T811272</p>
                    <p className="text-2xl font-bold text-green-600">$423.70</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 border-t pt-3">
                  Includes testing all outlets for proper grounding. Essential for safe and efficient household electrical systems.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* CRM Section */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mt-20">
            <Card className="p-6 order-2 lg:order-1">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Customer Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold">John Smith</p>
                    <p className="text-sm text-gray-600">Last service: HVAC Maintenance</p>
                  </div>
                </div>
                <div className="flex text-yellow-400 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-gray-600">
                  "Excellent service! The technician was professional and explained everything clearly."
                </p>
              </CardContent>
            </Card>

            <div className="order-1 lg:order-2">
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Complete Customer Relationship Management
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Customer Database</h4>
                    <p className="text-gray-600">Centralized customer information with complete service history</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Automated Follow-ups</h4>
                    <p className="text-gray-600">Email and text reminders for appointments and maintenance</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Customer Portal</h4>
                    <p className="text-gray-600">Secure online access to service history and invoices</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lead Generation */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mt-20">
            <div>
              <h3 className="text-3xl font-bold text-gray-900 mb-6">
                Lead Pipeline
              </h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Website Integration</h4>
                    <p className="text-gray-600">Capture leads directly from your website with built-in forms</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Email Marketing</h4>
                    <p className="text-gray-600">Automated email campaigns to nurture leads and retain customers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Lead Tracking</h4>
                    <p className="text-gray-600">Track lead sources and conversion rates to optimize your marketing</p>
                  </div>
                </div>
              </div>
            </div>

            <Card className="p-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Lead Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">New Leads</span>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Qualified</span>
                  <Badge variant="secondary">8</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Proposals Sent</span>
                  <Badge variant="secondary">5</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Won</span>
                  <Badge className="bg-green-500">3</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that fits your business. All plans include our complete flat rate pricing database.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Starter Plan */}
            <Card className="pricing-card relative">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Starter</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$35</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <CardDescription className="mt-2">Perfect for getting started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Digital pricebook</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Pre-built pricing</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Quarterly updates</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Basic CRM</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Lead tracking</span>
                </div>
                <Button className="w-full mt-6" variant="outline">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Plus Plan */}
            <Card className="pricing-card relative border-blue-500 border-2">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-4 py-1">Most Popular</Badge>
              </div>
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Plus</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$45</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <CardDescription className="mt-2">Best value for growing businesses</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Everything in Starter</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Customization</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>QuickBooks export</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Advanced CRM</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Email marketing</span>
                </div>
                <Button className="w-full mt-6 bg-blue-600 hover:bg-blue-700">
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="pricing-card relative">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">$55</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <CardDescription className="mt-2">Complete business solution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Everything in Plus</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Mobile sales tool</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Option presentation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Service agreements</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Complete lead generation</span>
                </div>
                <Button className="w-full mt-6" variant="outline">
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Add-on */}
          <div className="mt-12 text-center">
            <Card className="max-w-md mx-auto">
              <CardHeader>
                <CardTitle className="text-xl">HVAC Light Commercial</CardTitle>
                <div className="mt-2">
                  <span className="text-2xl font-bold">$49</span>
                  <span className="text-gray-600">/month per company</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Specialized pricing for light commercial HVAC work
                </p>
                <Button variant="outline" className="w-full">
                  Add to Plan
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Competitor Comparison */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose ServiceBook Pros?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Compare our all-in-one solution with the competition
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg shadow-lg">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-4 font-semibold">Features</th>
                  <th className="text-center p-4 font-semibold text-blue-600">ServiceBook Pros</th>
                  <th className="text-center p-4 font-semibold">Profit Rhino</th>
                  <th className="text-center p-4 font-semibold">ServiceTitan</th>
                  <th className="text-center p-4 font-semibold">Housecall Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="p-4 font-medium">Flat Rate Pricing</td>
                  <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center p-4"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                </tr>
                <tr className="border-t bg-gray-50">
                  <td className="p-4 font-medium">Complete CRM</td>
                  <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center p-4"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                  <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-medium">Lead Generation</td>
                  <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center p-4"><X className="h-5 w-5 text-red-500 mx-auto" /></td>
                  <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-t bg-gray-50">
                  <td className="p-4 font-medium">Starting Price</td>
                  <td className="text-center p-4 font-bold text-green-600">$35/mo</td>
                  <td className="text-center p-4">$49/mo</td>
                  <td className="text-center p-4">$99/mo</td>
                  <td className="text-center p-4">$79/mo</td>
                </tr>
                <tr className="border-t">
                  <td className="p-4 font-medium">Setup Time</td>
                  <td className="text-center p-4 font-bold text-green-600">1 day</td>
                  <td className="text-center p-4">2-3 days</td>
                  <td className="text-center p-4">2-4 weeks</td>
                  <td className="text-center p-4">1-2 weeks</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Built by Contractors, for Contractors
              </h2>
              <div className="space-y-6 text-gray-600">
                <p className="text-lg">
                  Our mission is to democratize professional pricing tools for all contractors. 
                  We believe every contractor deserves access to the same pricing expertise that 
                  large companies use to maximize their profits.
                </p>
                <p>
                  With over 30 years of flat rate pricing expertise, we've helped thousands of 
                  contractors increase their average ticket and grow their businesses. Our team 
                  understands the unique challenges contractors face because we've been there.
                </p>
                <p>
                  ServiceBook Pros is different because we provide everything you need in one 
                  platform: professional pricing, customer management, and lead generation. 
                  No more juggling multiple tools or paying for features you don't need.
                </p>
              </div>
            </div>
            
            <div className="space-y-8">
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="feature-icon w-12 h-12 rounded-full flex items-center justify-center">
                    <Calculator className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">30+ Years Experience</h3>
                    <p className="text-gray-600">Industry expertise in flat rate pricing</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="feature-icon w-12 h-12 rounded-full flex items-center justify-center">
                    <Database className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Thousands of Tasks</h3>
                    <p className="text-gray-600">Comprehensive pricing database</p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="feature-icon w-12 h-12 rounded-full flex items-center justify-center">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">1-Day Implementation</h3>
                    <p className="text-gray-600">Get started immediately</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Ready to Increase Your Profits?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Schedule a demo and see how ServiceBook Pros can transform your business
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <Card className="p-8">
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl">Schedule Your Demo</CardTitle>
                <CardDescription>
                  Fill out the form below and we'll contact you within 24 hours to schedule your personalized demo.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Smith"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 mb-2">
                        Business Type *
                      </label>
                      <select
                        id="businessType"
                        name="businessType"
                        required
                        value={formData.businessType}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select your trade</option>
                        <option value="electrical">Electrical</option>
                        <option value="hvac">HVAC</option>
                        <option value="plumbing">Plumbing</option>
                        <option value="multi-trade">Multi-Trade</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Tell us about your business (optional)
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      placeholder="Tell us about your current pricing challenges and what you're looking for..."
                    />
                  </div>

                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-3">
                    Schedule My Demo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <div className="space-y-8">
              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-blue-600" />
                    Phone
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">855-710-2055</p>
                  <p className="text-gray-600">Monday - Friday, 8 AM - 6 PM EST</p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-blue-600" />
                    Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">sales@servicebookpros.com</p>
                  <p className="text-gray-600">We respond within 2 hours during business hours</p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">Vestal, NY</p>
                  <p className="text-gray-600">Serving contractors nationwide</p>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-600" />
                    Response Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">24 Hours</p>
                  <p className="text-gray-600">Guaranteed response to all demo requests</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Wrench className="h-8 w-8 text-blue-400" />
                <span className="text-xl font-bold">ServiceBook Pros</span>
              </div>
              <p className="text-gray-400">
                Professional flat rate pricing, CRM, and lead generation for contractors.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('features')} className="hover:text-white transition-colors">Features</button></li>
                <li><button onClick={() => scrollToSection('pricing')} className="hover:text-white transition-colors">Pricing</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Demo</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><button onClick={() => scrollToSection('about')} className="hover:text-white transition-colors">About</button></li>
                <li><button onClick={() => scrollToSection('contact')} className="hover:text-white transition-colors">Contact</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <ul className="space-y-2 text-gray-400">
                <li>855-710-2055</li>
                <li>sales@servicebookpros.com</li>
                <li>Vestal, NY</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ServiceBook Pros. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
