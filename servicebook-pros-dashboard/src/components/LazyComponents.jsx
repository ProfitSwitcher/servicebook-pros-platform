import { lazy, Suspense } from 'react'
import { Card, CardContent } from './ui/card'
import { Loader2 } from 'lucide-react'

// Loading component
const LoadingSpinner = ({ message = "Loading..." }) => (
  <div className="flex items-center justify-center p-8">
    <div className="flex flex-col items-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      <p className="text-sm text-gray-600">{message}</p>
    </div>
  </div>
)

// Lazy load all major components
export const LazyComprehensiveDashboard = lazy(() => import('./ComprehensiveDashboard'))
export const LazyCustomersPage = lazy(() => import('./CustomersPage'))
export const LazyScheduleCalendar = lazy(() => import('./ScheduleCalendar'))
export const LazyMyMoneyPage = lazy(() => import('./MyMoneyPage'))
export const LazyReportingPage = lazy(() => import('./ReportingPage'))
export const LazyJobsManagement = lazy(() => import('./JobsManagement'))
export const LazyEstimatesManagement = lazy(() => import('./EstimatesManagement'))
export const LazyPricingCatalog = lazy(() => import('./PricingCatalog'))
export const LazyTeamManagement = lazy(() => import('./TeamManagement'))
export const LazyInvoiceManagement = lazy(() => import('./InvoiceManagement'))
export const LazySettingsPage = lazy(() => import('./SettingsPage'))

// Wrapper component with Suspense
export const LazyWrapper = ({ children, fallback }) => (
  <Suspense fallback={fallback || <LoadingSpinner />}>
    {children}
  </Suspense>
)

// Specific lazy wrappers for each component
export const DashboardLazy = (props) => (
  <LazyWrapper fallback={<LoadingSpinner message="Loading Dashboard..." />}>
    <LazyComprehensiveDashboard {...props} />
  </LazyWrapper>
)

export const CustomersLazy = (props) => (
  <LazyWrapper fallback={<LoadingSpinner message="Loading Customers..." />}>
    <LazyCustomersPage {...props} />
  </LazyWrapper>
)

export const ScheduleLazy = (props) => (
  <LazyWrapper fallback={<LoadingSpinner message="Loading Schedule..." />}>
    <LazyScheduleCalendar {...props} />
  </LazyWrapper>
)

export const MyMoneyLazy = (props) => (
  <LazyWrapper fallback={<LoadingSpinner message="Loading Financial Data..." />}>
    <LazyMyMoneyPage {...props} />
  </LazyWrapper>
)

export const ReportingLazy = (props) => (
  <LazyWrapper fallback={<LoadingSpinner message="Loading Reports..." />}>
    <LazyReportingPage {...props} />
  </LazyWrapper>
)

export const JobsLazy = (props) => (
  <LazyWrapper fallback={<LoadingSpinner message="Loading Jobs..." />}>
    <LazyJobsManagement {...props} />
  </LazyWrapper>
)

export const EstimatesLazy = (props) => (
  <LazyWrapper fallback={<LoadingSpinner message="Loading Estimates..." />}>
    <LazyEstimatesManagement {...props} />
  </LazyWrapper>
)

export const PricingLazy = (props) => (
  <LazyWrapper fallback={<LoadingSpinner message="Loading Pricing..." />}>
    <LazyPricingCatalog {...props} />
  </LazyWrapper>
)

export const TeamLazy = (props) => (
  <LazyWrapper fallback={<LoadingSpinner message="Loading Team..." />}>
    <LazyTeamManagement {...props} />
  </LazyWrapper>
)

export const InvoiceLazy = (props) => (
  <LazyWrapper fallback={<LoadingSpinner message="Loading Invoices..." />}>
    <LazyInvoiceManagement {...props} />
  </LazyWrapper>
)

export const SettingsLazy = (props) => (
  <LazyWrapper fallback={<LoadingSpinner message="Loading Settings..." />}>
    <LazySettingsPage {...props} />
  </LazyWrapper>
)

