"""
AI-Powered Features Models for ServiceBook Pros
Handles intelligent job scheduling, predictive maintenance, automated insights, and smart recommendations
"""

from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import json

Base = declarative_base()

class AIJobRecommendation(Base):
    """AI-generated job scheduling and routing recommendations"""
    __tablename__ = 'ai_job_recommendations'
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    technician_id = Column(Integer, ForeignKey('technicians.id'), nullable=False)
    job_id = Column(Integer, ForeignKey('jobs.id'), nullable=False)
    
    # Recommendation details
    recommendation_type = Column(String(50), nullable=False)  # 'schedule', 'route', 'skill_match', 'priority'
    confidence_score = Column(Float, nullable=False)  # 0.0 to 1.0
    reasoning = Column(Text)
    
    # Scheduling recommendations
    recommended_start_time = Column(DateTime)
    recommended_duration = Column(Integer)  # minutes
    travel_time_estimate = Column(Integer)  # minutes
    
    # Route optimization
    route_order = Column(Integer)
    distance_savings = Column(Float)  # miles saved
    time_savings = Column(Integer)  # minutes saved
    
    # Skill matching
    skill_match_score = Column(Float)  # 0.0 to 1.0
    required_skills = Column(JSON)
    technician_skills = Column(JSON)
    
    # Priority scoring
    priority_score = Column(Float)  # 0.0 to 1.0
    urgency_factors = Column(JSON)
    
    # Status and feedback
    status = Column(String(20), default='pending')  # pending, accepted, rejected, implemented
    feedback_score = Column(Float)  # User feedback on recommendation quality
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class PredictiveMaintenance(Base):
    """Predictive maintenance insights and recommendations"""
    __tablename__ = 'predictive_maintenance'
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    customer_id = Column(Integer, ForeignKey('customers.id'), nullable=False)
    equipment_id = Column(String(100))  # Customer's equipment identifier
    
    # Equipment details
    equipment_type = Column(String(100), nullable=False)  # 'water_heater', 'hvac', 'plumbing'
    brand = Column(String(50))
    model = Column(String(50))
    installation_date = Column(DateTime)
    last_service_date = Column(DateTime)
    
    # Predictive analysis
    failure_probability = Column(Float, nullable=False)  # 0.0 to 1.0
    predicted_failure_date = Column(DateTime)
    confidence_level = Column(Float)  # 0.0 to 1.0
    
    # Risk factors
    risk_factors = Column(JSON)  # List of contributing factors
    maintenance_history = Column(JSON)  # Historical service data
    usage_patterns = Column(JSON)  # Usage intensity, frequency
    
    # Recommendations
    recommended_action = Column(String(100))  # 'schedule_maintenance', 'replace_part', 'monitor'
    recommended_date = Column(DateTime)
    estimated_cost = Column(Float)
    potential_savings = Column(Float)  # Cost savings from preventive action
    
    # Business impact
    downtime_risk = Column(Float)  # Hours of potential downtime
    emergency_call_probability = Column(Float)  # 0.0 to 1.0
    customer_satisfaction_impact = Column(Float)  # -1.0 to 1.0
    
    # Status tracking
    status = Column(String(20), default='active')  # active, scheduled, completed, dismissed
    notification_sent = Column(Boolean, default=False)
    customer_contacted = Column(Boolean, default=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AIInsight(Base):
    """AI-generated business insights and recommendations"""
    __tablename__ = 'ai_insights'
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    
    # Insight details
    insight_type = Column(String(50), nullable=False)  # 'revenue', 'efficiency', 'customer', 'operational'
    category = Column(String(50), nullable=False)  # 'opportunity', 'risk', 'trend', 'anomaly'
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    
    # Impact assessment
    impact_score = Column(Float, nullable=False)  # 0.0 to 1.0
    potential_value = Column(Float)  # Dollar value of opportunity/risk
    confidence_level = Column(Float)  # 0.0 to 1.0
    
    # Data sources
    data_sources = Column(JSON)  # List of data sources used
    analysis_period = Column(JSON)  # Start and end dates
    sample_size = Column(Integer)  # Number of data points analyzed
    
    # Recommendations
    recommended_actions = Column(JSON)  # List of actionable recommendations
    implementation_difficulty = Column(String(20))  # 'easy', 'medium', 'hard'
    estimated_implementation_time = Column(Integer)  # hours
    
    # Metrics and KPIs
    key_metrics = Column(JSON)  # Relevant metrics and their values
    trend_direction = Column(String(20))  # 'improving', 'declining', 'stable'
    comparison_period = Column(JSON)  # Comparison data
    
    # Status and feedback
    status = Column(String(20), default='new')  # new, viewed, in_progress, implemented, dismissed
    user_rating = Column(Float)  # User rating of insight quality
    implementation_notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class SmartAutomation(Base):
    """Automated business processes and smart workflows"""
    __tablename__ = 'smart_automations'
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    
    # Automation details
    automation_type = Column(String(50), nullable=False)  # 'scheduling', 'communication', 'pricing', 'follow_up'
    name = Column(String(100), nullable=False)
    description = Column(Text)
    
    # Trigger conditions
    trigger_type = Column(String(50), nullable=False)  # 'time_based', 'event_based', 'condition_based'
    trigger_conditions = Column(JSON)  # Conditions that activate automation
    
    # Actions to perform
    actions = Column(JSON, nullable=False)  # List of actions to execute
    action_sequence = Column(JSON)  # Order and timing of actions
    
    # Smart parameters
    learning_enabled = Column(Boolean, default=True)
    optimization_target = Column(String(50))  # 'efficiency', 'revenue', 'satisfaction'
    success_metrics = Column(JSON)  # Metrics to track success
    
    # Performance tracking
    execution_count = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)  # 0.0 to 1.0
    average_impact = Column(Float, default=0.0)
    last_optimization = Column(DateTime)
    
    # Configuration
    is_active = Column(Boolean, default=True)
    priority = Column(Integer, default=5)  # 1-10, higher = more important
    max_executions_per_day = Column(Integer, default=100)
    
    # Learning and adaptation
    performance_history = Column(JSON)  # Historical performance data
    learned_parameters = Column(JSON)  # AI-optimized parameters
    adaptation_rate = Column(Float, default=0.1)  # How quickly to adapt
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class CustomerBehaviorAnalysis(Base):
    """AI analysis of customer behavior patterns and preferences"""
    __tablename__ = 'customer_behavior_analysis'
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    customer_id = Column(Integer, ForeignKey('customers.id'), nullable=False)
    
    # Behavior patterns
    communication_preference = Column(String(20))  # 'phone', 'email', 'sms', 'mixed'
    preferred_contact_time = Column(JSON)  # Time preferences
    response_time_pattern = Column(JSON)  # How quickly they typically respond
    
    # Service patterns
    service_frequency = Column(Float)  # Average days between services
    seasonal_patterns = Column(JSON)  # Seasonal service preferences
    service_type_preferences = Column(JSON)  # Preferred service types
    
    # Financial behavior
    price_sensitivity = Column(Float)  # 0.0 to 1.0, higher = more sensitive
    payment_behavior = Column(JSON)  # Payment timing and method preferences
    upsell_receptivity = Column(Float)  # 0.0 to 1.0, likelihood to accept upsells
    
    # Satisfaction patterns
    satisfaction_trends = Column(JSON)  # Historical satisfaction scores
    complaint_patterns = Column(JSON)  # Types and frequency of complaints
    loyalty_score = Column(Float)  # 0.0 to 1.0, likelihood to stay with company
    
    # Predictive scores
    churn_risk = Column(Float)  # 0.0 to 1.0, likelihood to leave
    lifetime_value_prediction = Column(Float)  # Predicted total customer value
    next_service_prediction = Column(DateTime)  # When they'll likely need service
    
    # Recommendations
    engagement_strategy = Column(JSON)  # Recommended engagement approach
    pricing_strategy = Column(JSON)  # Recommended pricing approach
    service_recommendations = Column(JSON)  # Recommended services to offer
    
    # Analysis metadata
    data_quality_score = Column(Float)  # 0.0 to 1.0, quality of underlying data
    confidence_level = Column(Float)  # 0.0 to 1.0, confidence in analysis
    last_interaction_date = Column(DateTime)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class AIPerformanceMetrics(Base):
    """Track performance and accuracy of AI features"""
    __tablename__ = 'ai_performance_metrics'
    
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey('companies.id'), nullable=False)
    
    # Metric details
    feature_type = Column(String(50), nullable=False)  # 'job_recommendations', 'predictive_maintenance', etc.
    metric_name = Column(String(100), nullable=False)
    metric_value = Column(Float, nullable=False)
    
    # Context
    measurement_period = Column(JSON)  # Start and end dates
    sample_size = Column(Integer)
    baseline_value = Column(Float)  # Previous or benchmark value
    
    # Performance indicators
    accuracy_score = Column(Float)  # 0.0 to 1.0
    precision_score = Column(Float)  # 0.0 to 1.0
    recall_score = Column(Float)  # 0.0 to 1.0
    f1_score = Column(Float)  # 0.0 to 1.0
    
    # Business impact
    cost_savings = Column(Float)  # Dollar savings from AI feature
    revenue_impact = Column(Float)  # Revenue impact (positive or negative)
    efficiency_gain = Column(Float)  # Percentage efficiency improvement
    
    # User feedback
    user_satisfaction = Column(Float)  # 0.0 to 1.0
    adoption_rate = Column(Float)  # 0.0 to 1.0
    feature_usage_frequency = Column(Float)  # Uses per day/week
    
    created_at = Column(DateTime, default=datetime.utcnow)

# Utility functions for AI features
class AIFeatureUtils:
    """Utility functions for AI-powered features"""
    
    @staticmethod
    def calculate_job_priority_score(job_data, customer_data, business_rules):
        """Calculate AI-driven priority score for a job"""
        score = 0.0
        
        # Customer tier weight (30%)
        if customer_data.get('tier') == 'premium':
            score += 0.3
        elif customer_data.get('tier') == 'standard':
            score += 0.2
        else:
            score += 0.1
            
        # Urgency weight (25%)
        urgency_map = {'emergency': 0.25, 'urgent': 0.2, 'normal': 0.15, 'low': 0.1}
        score += urgency_map.get(job_data.get('urgency', 'normal'), 0.15)
        
        # Revenue potential weight (20%)
        estimated_value = job_data.get('estimated_value', 0)
        if estimated_value > 1000:
            score += 0.2
        elif estimated_value > 500:
            score += 0.15
        elif estimated_value > 200:
            score += 0.1
        else:
            score += 0.05
            
        # Schedule efficiency weight (15%)
        if job_data.get('location_efficiency', 0) > 0.8:
            score += 0.15
        elif job_data.get('location_efficiency', 0) > 0.6:
            score += 0.1
        else:
            score += 0.05
            
        # Customer satisfaction risk weight (10%)
        if customer_data.get('satisfaction_score', 5) < 3:
            score += 0.1  # High priority for at-risk customers
        elif customer_data.get('satisfaction_score', 5) > 4:
            score += 0.05
            
        return min(score, 1.0)
    
    @staticmethod
    def predict_equipment_failure(equipment_data, maintenance_history, usage_patterns):
        """Predict equipment failure probability using simple heuristics"""
        failure_probability = 0.0
        
        # Age factor
        age_years = equipment_data.get('age_years', 0)
        if age_years > 15:
            failure_probability += 0.4
        elif age_years > 10:
            failure_probability += 0.3
        elif age_years > 5:
            failure_probability += 0.2
        else:
            failure_probability += 0.1
            
        # Maintenance frequency factor
        last_maintenance_days = equipment_data.get('days_since_maintenance', 0)
        recommended_interval = equipment_data.get('recommended_maintenance_interval', 365)
        
        if last_maintenance_days > recommended_interval * 2:
            failure_probability += 0.3
        elif last_maintenance_days > recommended_interval * 1.5:
            failure_probability += 0.2
        elif last_maintenance_days > recommended_interval:
            failure_probability += 0.1
            
        # Usage intensity factor
        usage_intensity = usage_patterns.get('intensity', 'normal')
        if usage_intensity == 'heavy':
            failure_probability += 0.2
        elif usage_intensity == 'moderate':
            failure_probability += 0.1
            
        # Historical issues factor
        issue_count = len(maintenance_history.get('issues', []))
        if issue_count > 5:
            failure_probability += 0.2
        elif issue_count > 2:
            failure_probability += 0.1
            
        return min(failure_probability, 1.0)
    
    @staticmethod
    def generate_customer_insights(customer_data, job_history, payment_history):
        """Generate AI insights about customer behavior and value"""
        insights = []
        
        # Calculate customer lifetime value
        total_revenue = sum(job.get('total_amount', 0) for job in job_history)
        avg_job_value = total_revenue / len(job_history) if job_history else 0
        service_frequency = len(job_history) / max(customer_data.get('relationship_months', 1), 1) * 12
        
        predicted_clv = avg_job_value * service_frequency * 5  # 5-year projection
        
        insights.append({
            'type': 'customer_value',
            'title': 'Customer Lifetime Value Analysis',
            'description': f'Predicted 5-year value: ${predicted_clv:.2f}',
            'impact_score': min(predicted_clv / 10000, 1.0),
            'recommendations': [
                'Consider premium service offerings' if predicted_clv > 5000 else 'Focus on service quality retention',
                'Implement loyalty program' if service_frequency > 2 else 'Increase service frequency'
            ]
        })
        
        # Payment behavior analysis
        late_payments = sum(1 for payment in payment_history if payment.get('days_late', 0) > 0)
        payment_reliability = 1.0 - (late_payments / len(payment_history)) if payment_history else 1.0
        
        if payment_reliability < 0.8:
            insights.append({
                'type': 'payment_risk',
                'title': 'Payment Risk Assessment',
                'description': f'Customer has {late_payments} late payments out of {len(payment_history)} total',
                'impact_score': 1.0 - payment_reliability,
                'recommendations': [
                    'Require upfront payment for large jobs',
                    'Implement payment reminders',
                    'Consider payment plan options'
                ]
            })
            
        # Service frequency insights
        if service_frequency < 1:
            insights.append({
                'type': 'engagement_opportunity',
                'title': 'Low Service Frequency',
                'description': f'Customer uses services {service_frequency:.1f} times per year',
                'impact_score': 0.6,
                'recommendations': [
                    'Implement preventive maintenance program',
                    'Send seasonal service reminders',
                    'Offer service packages or subscriptions'
                ]
            })
            
        return insights

