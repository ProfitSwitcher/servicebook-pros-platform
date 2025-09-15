"""
Business Intelligence models for ServiceBook Pros
Advanced analytics, reporting, and predictive insights
"""

from src.models.user import db
from datetime import datetime, timedelta
import enum
import json

class ReportType(enum.Enum):
    REVENUE = 'revenue'
    CUSTOMER = 'customer'
    TECHNICIAN = 'technician'
    INVENTORY = 'inventory'
    COMMUNICATION = 'communication'
    OPERATIONAL = 'operational'
    FINANCIAL = 'financial'
    PREDICTIVE = 'predictive'

class ReportFrequency(enum.Enum):
    DAILY = 'daily'
    WEEKLY = 'weekly'
    MONTHLY = 'monthly'
    QUARTERLY = 'quarterly'
    YEARLY = 'yearly'
    CUSTOM = 'custom'

class MetricType(enum.Enum):
    REVENUE = 'revenue'
    COUNT = 'count'
    PERCENTAGE = 'percentage'
    AVERAGE = 'average'
    RATIO = 'ratio'
    TREND = 'trend'

class BusinessMetric(db.Model):
    __tablename__ = 'business_metrics'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # Metric identification
    metric_name = db.Column(db.String(200), nullable=False)
    metric_type = db.Column(db.Enum(MetricType), nullable=False)
    category = db.Column(db.String(100))
    
    # Metric value
    value = db.Column(db.Float, nullable=False)
    previous_value = db.Column(db.Float)
    target_value = db.Column(db.Float)
    
    # Time period
    period_start = db.Column(db.DateTime, nullable=False)
    period_end = db.Column(db.DateTime, nullable=False)
    
    # Metadata
    calculation_method = db.Column(db.Text)
    data_sources = db.Column(db.Text)  # JSON list of data sources
    
    # Timestamps
    calculated_at = db.Column(db.DateTime, default=datetime.utcnow)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'metric_name': self.metric_name,
            'metric_type': self.metric_type.value if self.metric_type else None,
            'category': self.category,
            'value': self.value,
            'previous_value': self.previous_value,
            'target_value': self.target_value,
            'period_start': self.period_start.isoformat() if self.period_start else None,
            'period_end': self.period_end.isoformat() if self.period_end else None,
            'calculation_method': self.calculation_method,
            'data_sources': json.loads(self.data_sources) if self.data_sources else [],
            'calculated_at': self.calculated_at.isoformat() if self.calculated_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'change_percentage': self.calculate_change_percentage(),
            'trend': self.get_trend()
        }
    
    def calculate_change_percentage(self):
        """Calculate percentage change from previous value"""
        if self.previous_value and self.previous_value != 0:
            return round(((self.value - self.previous_value) / self.previous_value) * 100, 2)
        return 0
    
    def get_trend(self):
        """Get trend direction"""
        if self.previous_value is None:
            return 'neutral'
        elif self.value > self.previous_value:
            return 'up'
        elif self.value < self.previous_value:
            return 'down'
        else:
            return 'neutral'

class CustomReport(db.Model):
    __tablename__ = 'custom_reports'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # Report details
    name = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    report_type = db.Column(db.Enum(ReportType), nullable=False)
    
    # Configuration
    filters = db.Column(db.Text)  # JSON filters
    metrics = db.Column(db.Text)  # JSON list of metrics to include
    chart_types = db.Column(db.Text)  # JSON chart configuration
    
    # Scheduling
    is_scheduled = db.Column(db.Boolean, default=False)
    frequency = db.Column(db.Enum(ReportFrequency))
    next_run_date = db.Column(db.DateTime)
    
    # Recipients
    email_recipients = db.Column(db.Text)  # JSON list of email addresses
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    last_generated = db.Column(db.DateTime)
    
    # Metadata
    created_by_user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'name': self.name,
            'description': self.description,
            'report_type': self.report_type.value if self.report_type else None,
            'filters': json.loads(self.filters) if self.filters else {},
            'metrics': json.loads(self.metrics) if self.metrics else [],
            'chart_types': json.loads(self.chart_types) if self.chart_types else {},
            'is_scheduled': self.is_scheduled,
            'frequency': self.frequency.value if self.frequency else None,
            'next_run_date': self.next_run_date.isoformat() if self.next_run_date else None,
            'email_recipients': json.loads(self.email_recipients) if self.email_recipients else [],
            'is_active': self.is_active,
            'last_generated': self.last_generated.isoformat() if self.last_generated else None,
            'created_by_user_id': self.created_by_user_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

class RevenueAnalytics(db.Model):
    __tablename__ = 'revenue_analytics'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # Time period
    period_start = db.Column(db.DateTime, nullable=False)
    period_end = db.Column(db.DateTime, nullable=False)
    period_type = db.Column(db.String(50))  # daily, weekly, monthly, quarterly, yearly
    
    # Revenue metrics
    total_revenue = db.Column(db.Float, default=0.0)
    recurring_revenue = db.Column(db.Float, default=0.0)
    new_customer_revenue = db.Column(db.Float, default=0.0)
    
    # Job metrics
    total_jobs = db.Column(db.Integer, default=0)
    completed_jobs = db.Column(db.Integer, default=0)
    average_job_value = db.Column(db.Float, default=0.0)
    
    # Customer metrics
    new_customers = db.Column(db.Integer, default=0)
    returning_customers = db.Column(db.Integer, default=0)
    customer_retention_rate = db.Column(db.Float, default=0.0)
    
    # Efficiency metrics
    average_completion_time = db.Column(db.Float, default=0.0)  # hours
    technician_utilization = db.Column(db.Float, default=0.0)  # percentage
    
    # Cost metrics
    total_costs = db.Column(db.Float, default=0.0)
    material_costs = db.Column(db.Float, default=0.0)
    labor_costs = db.Column(db.Float, default=0.0)
    overhead_costs = db.Column(db.Float, default=0.0)
    
    # Profitability
    gross_profit = db.Column(db.Float, default=0.0)
    net_profit = db.Column(db.Float, default=0.0)
    profit_margin = db.Column(db.Float, default=0.0)
    
    # Timestamps
    calculated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'period_start': self.period_start.isoformat() if self.period_start else None,
            'period_end': self.period_end.isoformat() if self.period_end else None,
            'period_type': self.period_type,
            'total_revenue': self.total_revenue,
            'recurring_revenue': self.recurring_revenue,
            'new_customer_revenue': self.new_customer_revenue,
            'total_jobs': self.total_jobs,
            'completed_jobs': self.completed_jobs,
            'average_job_value': self.average_job_value,
            'new_customers': self.new_customers,
            'returning_customers': self.returning_customers,
            'customer_retention_rate': self.customer_retention_rate,
            'average_completion_time': self.average_completion_time,
            'technician_utilization': self.technician_utilization,
            'total_costs': self.total_costs,
            'material_costs': self.material_costs,
            'labor_costs': self.labor_costs,
            'overhead_costs': self.overhead_costs,
            'gross_profit': self.gross_profit,
            'net_profit': self.net_profit,
            'profit_margin': self.profit_margin,
            'calculated_at': self.calculated_at.isoformat() if self.calculated_at else None
        }

class CustomerAnalytics(db.Model):
    __tablename__ = 'customer_analytics'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey('customers.id'), nullable=False)
    
    # Customer value metrics
    lifetime_value = db.Column(db.Float, default=0.0)
    total_spent = db.Column(db.Float, default=0.0)
    average_job_value = db.Column(db.Float, default=0.0)
    
    # Engagement metrics
    total_jobs = db.Column(db.Integer, default=0)
    last_job_date = db.Column(db.DateTime)
    days_since_last_job = db.Column(db.Integer, default=0)
    
    # Communication metrics
    total_communications = db.Column(db.Integer, default=0)
    response_rate = db.Column(db.Float, default=0.0)
    satisfaction_score = db.Column(db.Float)
    
    # Behavioral metrics
    preferred_technician_id = db.Column(db.Integer, db.ForeignKey('technicians.id'))
    preferred_service_types = db.Column(db.Text)  # JSON list
    seasonal_patterns = db.Column(db.Text)  # JSON data
    
    # Risk metrics
    churn_risk_score = db.Column(db.Float, default=0.0)
    payment_history_score = db.Column(db.Float, default=100.0)
    
    # Timestamps
    last_calculated = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'customer_id': self.customer_id,
            'lifetime_value': self.lifetime_value,
            'total_spent': self.total_spent,
            'average_job_value': self.average_job_value,
            'total_jobs': self.total_jobs,
            'last_job_date': self.last_job_date.isoformat() if self.last_job_date else None,
            'days_since_last_job': self.days_since_last_job,
            'total_communications': self.total_communications,
            'response_rate': self.response_rate,
            'satisfaction_score': self.satisfaction_score,
            'preferred_technician_id': self.preferred_technician_id,
            'preferred_service_types': json.loads(self.preferred_service_types) if self.preferred_service_types else [],
            'seasonal_patterns': json.loads(self.seasonal_patterns) if self.seasonal_patterns else {},
            'churn_risk_score': self.churn_risk_score,
            'payment_history_score': self.payment_history_score,
            'last_calculated': self.last_calculated.isoformat() if self.last_calculated else None
        }

class TechnicianPerformance(db.Model):
    __tablename__ = 'technician_performance'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    technician_id = db.Column(db.Integer, db.ForeignKey('technicians.id'), nullable=False)
    
    # Time period
    period_start = db.Column(db.DateTime, nullable=False)
    period_end = db.Column(db.DateTime, nullable=False)
    
    # Job performance
    jobs_completed = db.Column(db.Integer, default=0)
    jobs_scheduled = db.Column(db.Integer, default=0)
    completion_rate = db.Column(db.Float, default=0.0)
    
    # Time metrics
    total_hours_worked = db.Column(db.Float, default=0.0)
    billable_hours = db.Column(db.Float, default=0.0)
    utilization_rate = db.Column(db.Float, default=0.0)
    average_job_duration = db.Column(db.Float, default=0.0)
    
    # Revenue metrics
    revenue_generated = db.Column(db.Float, default=0.0)
    average_job_value = db.Column(db.Float, default=0.0)
    upsell_rate = db.Column(db.Float, default=0.0)
    
    # Quality metrics
    customer_satisfaction = db.Column(db.Float, default=0.0)
    callback_rate = db.Column(db.Float, default=0.0)
    first_time_fix_rate = db.Column(db.Float, default=0.0)
    
    # Efficiency metrics
    on_time_arrival_rate = db.Column(db.Float, default=0.0)
    material_waste_rate = db.Column(db.Float, default=0.0)
    
    # Timestamps
    calculated_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'technician_id': self.technician_id,
            'period_start': self.period_start.isoformat() if self.period_start else None,
            'period_end': self.period_end.isoformat() if self.period_end else None,
            'jobs_completed': self.jobs_completed,
            'jobs_scheduled': self.jobs_scheduled,
            'completion_rate': self.completion_rate,
            'total_hours_worked': self.total_hours_worked,
            'billable_hours': self.billable_hours,
            'utilization_rate': self.utilization_rate,
            'average_job_duration': self.average_job_duration,
            'revenue_generated': self.revenue_generated,
            'average_job_value': self.average_job_value,
            'upsell_rate': self.upsell_rate,
            'customer_satisfaction': self.customer_satisfaction,
            'callback_rate': self.callback_rate,
            'first_time_fix_rate': self.first_time_fix_rate,
            'on_time_arrival_rate': self.on_time_arrival_rate,
            'material_waste_rate': self.material_waste_rate,
            'calculated_at': self.calculated_at.isoformat() if self.calculated_at else None
        }

class PredictiveInsight(db.Model):
    __tablename__ = 'predictive_insights'
    
    id = db.Column(db.Integer, primary_key=True)
    company_id = db.Column(db.Integer, db.ForeignKey('companies.id'), nullable=False)
    
    # Insight details
    insight_type = db.Column(db.String(100), nullable=False)  # revenue_forecast, churn_prediction, etc.
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    
    # Prediction data
    predicted_value = db.Column(db.Float)
    confidence_score = db.Column(db.Float)  # 0-100
    prediction_period = db.Column(db.String(100))  # next_month, next_quarter, etc.
    
    # Supporting data
    historical_data = db.Column(db.Text)  # JSON historical trends
    factors = db.Column(db.Text)  # JSON list of contributing factors
    recommendations = db.Column(db.Text)  # JSON list of recommended actions
    
    # Status
    is_active = db.Column(db.Boolean, default=True)
    accuracy_score = db.Column(db.Float)  # Actual vs predicted (updated later)
    
    # Timestamps
    prediction_date = db.Column(db.DateTime, default=datetime.utcnow)
    target_date = db.Column(db.DateTime)  # When prediction should be validated
    
    def to_dict(self):
        return {
            'id': self.id,
            'company_id': self.company_id,
            'insight_type': self.insight_type,
            'title': self.title,
            'description': self.description,
            'predicted_value': self.predicted_value,
            'confidence_score': self.confidence_score,
            'prediction_period': self.prediction_period,
            'historical_data': json.loads(self.historical_data) if self.historical_data else {},
            'factors': json.loads(self.factors) if self.factors else [],
            'recommendations': json.loads(self.recommendations) if self.recommendations else [],
            'is_active': self.is_active,
            'accuracy_score': self.accuracy_score,
            'prediction_date': self.prediction_date.isoformat() if self.prediction_date else None,
            'target_date': self.target_date.isoformat() if self.target_date else None
        }

