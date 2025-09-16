import React from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { CheckCircle, Users, DollarSign, Clock, Smartphone, BarChart3, Zap, Shield, Star, ArrowRight, Phone, Mail, MapPin } from 'lucide-react'
import './App.css'

function App() {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    scrollToSection(sectionId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">ServiceBook Pros</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a 
                href="#features" 
                onClick={(e) => handleNavClick(e, 'features')}
                className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Features
              </a>
              <a 
                href="#pricing" 
                onClick={(e) => handleNavClick(e, 'pricing')}
                className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Pricing
              </a>
              <a 
                href="#about" 
                onClick={(e) => handleNavClick(e, 'about')}
                className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
              >
                About
              </a>
              <a 
                href="#contact" 
                onClick={(e) => handleNavClick(e, 'contact')}
                className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
              >
                Contact
              </a>
            </nav>
            <div className="flex space-x-4">
  <Button variant="outline" onClick={(e) => handleNavClick(e, 'contact')}>Login</Button>
  <Button onClick={(e) => handleNavClick(e, 'contact')}>Book Demo</Button>
</div>

            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">
            Complete Contractor Platform
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Profit <span className="text-blue-600">Confidently</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The only platform contractors need: Professional flat rate pricing, customer relationship management, 
            and lead generation - all in one affordable solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline">
              Watch Demo
            </Button>
          </div>
          <p className="text-sm text-gray-500">
            No contracts • Love it or leave it • 1-day setup
          </p>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose ServiceBook Pros?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Stop paying for multiple tools. Get pricing, CRM, and lead generation in one platform 
              at the same cost as pricing-only solutions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <DollarSign className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Increase Average Ticket by 80%</CardTitle>
                <CardDescription>
                  Professional option presentation helps homeowners choose better solutions
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <Clock className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>1-Day Implementation</CardTitle>
                <CardDescription>
                  Get up and running immediately with our pre-built pricing database
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="text-center border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Industry Expert Pricing</CardTitle>
                <CardDescription>
                  Built by experts with 30+ years of flat rate pricing experience
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need in One Platform
            </h2>
            <p className="text-lg text-gray-600">
              Stop juggling multiple tools. ServiceBook Pros gives you everything in one place.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Professional Flat Rate Pricing
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Pre-built & Expert Pricing</h4>
                    <p className="text-gray-600">Thousands of tasks priced by industry experts with 30+ years experience</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Fully Customizable</h4>
                    <p className="text-gray-600">Adjust labor rates, markups, and pricing to fit your business perfectly</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Quarterly Updates</h4>
                    <p className="text-gray-600">Stay current with quarterly parts and pricing updates</p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-lg">Sample Pricing Item</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Service:</span>
                    <span>Outlet Testing (2500-3500 sq ft)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Code:</span>
                    <span>T811272</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Price:</span>
                    <span className="text-green-600 font-bold">$423.70</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    Includes testing all outlets for proper grounding. Essential for safe and efficient household electrical systems.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
            <Card className="p-6 order-2 lg:order-1">
              <CardHeader>
                <CardTitle className="text-lg">Customer Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">John Smith</p>
                      <p className="text-sm text-gray-600">Last service: HVAC Maintenance</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p className="text-sm text-gray-600">
                      "Excellent service! The technician was professional and explained everything clearly."
                    </p>
                    <div className="flex mt-2">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <div className="order-1 lg:order-2">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Complete Customer Relationship Management
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Customer Database</h4>
                    <p className="text-gray-600">Centralized customer information with complete service history</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Automated Follow-ups</h4>
                    <p className="text-gray-600">Email and text reminders for appointments and maintenance</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Customer Portal</h4>
                    <p className="text-gray-600">Secure online access to service history and invoices</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Lead Generation & Marketing
              </h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Website Integration</h4>
                    <p className="text-gray-600">Easy booking widget for your website</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Email Marketing</h4>
                    <p className="text-gray-600">Built-in tools for newsletters and promotions</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Lead Tracking</h4>
                    <p className="text-gray-600">Track leads from inquiry to closed sale</p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="p-6">
              <CardHeader>
                <CardTitle className="text-lg">Lead Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                    <span>New Leads</span>
                    <Badge variant="secondary">12</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
                    <span>Contacted</span>
                    <Badge variant="secondary">8</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                    <span>Scheduled</span>
                    <Badge variant="secondary">5</Badge>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-50 rounded">
                    <span>Closed</span>
                    <Badge variant="secondary">3</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600">
              Get more features than Profit Rhino at the same price
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Starter</CardTitle>
                <div className="text-4xl font-bold text-blue-600 mt-4">
                  $35<span className="text-lg text-gray-600">/month</span>
                </div>
                <CardDescription>Per technician</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Digital flat rate pricebook</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Pre-built & concise pricing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Quarterly parts updates</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Basic CRM features</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Lead tracking</span>
                  </li>
                </ul>
                <Button className="w-full mt-6">Get Started</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500">Most Popular</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Plus</CardTitle>
                <div className="text-4xl font-bold text-blue-600 mt-4">
                  $45<span className="text-lg text-gray-600">/month</span>
                </div>
                <CardDescription>Per technician</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Everything in Starter</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Completely customize price book</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>QuickBooks export</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Advanced CRM features</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Email marketing</span>
                  </li>
                </ul>
                <Button className="w-full mt-6">Get Started</Button>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-4xl font-bold text-blue-600 mt-4">
                  $55<span className="text-lg text-gray-600">/month</span>
                </div>
                <CardDescription>Per technician</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Everything in Plus</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Mobile sales tool</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Professional option presentation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Service agreements & financing</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Complete lead generation suite</span>
                  </li>
                </ul>
                <Button className="w-full mt-6">Get Started</Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              All plans include free US-based support and success coaching
            </p>
            <Badge variant="outline" className="text-sm">
              HVAC Light Commercial Add-on: $49/month per company
            </Badge>
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why ServiceBook Pros vs. Competitors?
            </h2>
            <p className="text-lg text-gray-600">
              Get more value for the same price as pricing-only solutions
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold text-blue-600">ServiceBook Pros</th>
                  <th className="text-center p-4 font-semibold">Profit Rhino</th>
                  <th className="text-center p-4 font-semibold">ServiceTitan</th>
                  <th className="text-center p-4 font-semibold">Housecall Pro</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-4 font-medium">Pricing</td>
                  <td className="text-center p-4 text-blue-600 font-semibold">$35-55/month</td>
                  <td className="text-center p-4">$35-55/month</td>
                  <td className="text-center p-4">$300-500/month</td>
                  <td className="text-center p-4">$49-149/month</td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-medium">Expert Flat Rate Pricing</td>
                  <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center p-4"><span className="text-gray-400">Limited</span></td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">CRM</td>
                  <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center p-4"><span className="text-red-500">✗</span></td>
                  <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                </tr>
                <tr className="border-b bg-gray-50">
                  <td className="p-4 font-medium">Lead Generation</td>
                  <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center p-4"><span className="text-red-500">✗</span></td>
                  <td className="text-center p-4"><CheckCircle className="h-5 w-5 text-green-500 mx-auto" /></td>
                  <td className="text-center p-4"><span className="text-red-500">✗</span></td>
                </tr>
                <tr className="border-b">
                  <td className="p-4 font-medium">Implementation Time</td>
                  <td className="text-center p-4 text-green-600 font-semibold">1 Day</td>
                  <td className="text-center p-4">1 Day</td>
                  <td className="text-center p-4">Weeks</td>
                  <td className="text-center p-4">Days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Profit Confidently?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of contractors who have increased their average ticket by 80% with ServiceBook Pros
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Book Live Demo
            </Button>
          </div>
          <p className="text-blue-200 mt-6">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              About ServiceBook Pros
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Built by contractors for contractors, ServiceBook Pros combines 30+ years of flat rate pricing expertise 
              with modern technology to help service businesses increase profitability and streamline operations.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h3>
              <p className="text-gray-600 mb-6">
                We believe every contractor deserves access to professional pricing strategies and business tools 
                that were previously only available to large companies. Our platform democratizes these tools, 
                making them affordable and accessible to businesses of all sizes.
              </p>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Industry Expertise</h4>
                    <p className="text-gray-600">30+ years of flat rate pricing experience</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Proven Results</h4>
                    <p className="text-gray-600">80% average ticket increase for our customers</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-gray-900">Customer Success</h4>
                    <p className="text-gray-600">Dedicated support and success coaching included</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h4 className="text-xl font-bold text-gray-900 mb-4">Why We're Different</h4>
              <ul className="space-y-3 text-gray-600">
                <li>• Built by actual contractors who understand your challenges</li>
                <li>• All-in-one platform eliminates the need for multiple tools</li>
                <li>• 1-day implementation gets you profitable immediately</li>
                <li>• Transparent pricing with no hidden fees or long-term contracts</li>
                <li>• Continuous updates and improvements based on user feedback</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Get Started Today
            </h2>
            <p className="text-lg text-gray-600">
              Ready to increase your average ticket by 80%? Contact us for a personalized demo.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Phone className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Phone</h4>
                    <p className="text-gray-600">855-710-2055</p>
                    <p className="text-sm text-gray-500">Monday - Friday, 8 AM - 6 PM EST</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Email</h4>
                    <p className="text-gray-600">sales@servicebookpros.com</p>
                    <p className="text-sm text-gray-500">We respond within 2 hours</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Location</h4>
                    <p className="text-gray-600">Vestal, NY</p>
                    <p className="text-sm text-gray-500">Serving contractors nationwide</p>
                  </div>
                </div>
              </div>
            </div>
            
            <Card className="p-8">
              <CardHeader>
                <CardTitle>Schedule a Demo</CardTitle>
                <CardDescription>
                  See how ServiceBook Pros can transform your business in just 15 minutes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input 
                      type="email" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input 
                      type="tel" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Type
                    </label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>Select your trade</option>
                      <option>Electrical</option>
                      <option>HVAC</option>
                      <option>Plumbing</option>
                      <option>General Contracting</option>
                      <option>Other</option>
                    </select>
                  </div>
                  
                  <Button className="w-full">
                    Schedule Demo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold">ServiceBook Pros</span>
              </div>
              <p className="text-gray-400">
                The complete contractor platform for pricing, CRM, and lead generation.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Training</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Contact</h3>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>855-710-2055</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4" />
                  <span>sales@servicebookpros.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <MapPin className="h-4 w-4" />
                  <span>Vestal, NY</span>
                </div>
              </div>
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

