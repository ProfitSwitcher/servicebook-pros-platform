"""
Business Intelligence API routes for ServiceBook Pros
Advanced analytics, reporting, and predictive insights
"""

from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.business_intelligence import (
    BusinessMetric, CustomReport, RevenueAnalytics, 
    CustomerAnalytics, TechnicianPerformance, PredictiveInsight,
    ReportType, ReportFrequency, MetricType
)
from src.models.customer import Customer
from src.models.job import Job, JobStatus
from src.models.technician import Technician
from src.models.invoice import Invoice
from datetime import datetime, timedelta
import json
from sqlalchemy import func, and_, or_

business_intelligence_bp = Blueprint('business_intelligence', __name__)

# Business Metrics Endpoints
@business_intelligence_bp.route('/metrics', methods=['GET'])
def get_business_metrics():
    """Get business metrics with filtering"""
    try:
        company_id = request.args.get('company_id', 1)
        category = request.args.get('category')
        metric_type = request.args.get('metric_type')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = BusinessMetric.query.filter_by(company_id=company_id)
        
        if category:
            query = query.filter_by(category=category)
        if metric_type:
            query = query.filter_by(metric_type=MetricType(metric_type))
        if start_date:
            query = query.filter(BusinessMetric.period_start >= datetime.fromisoformat(start_date))
        if end_date:
            query = query.filter(BusinessMetric.period_end <= datetime.fromisoformat(end_date))
        
        metrics = query.order_by(BusinessMetric.calculated_at.desc()).all()
        
        return jsonify({
            'success': True,
            'metrics': [metric.to_dict() for metric in metrics],
            'total': len(metrics)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@business_intelligence_bp.route('/metrics/calculate', methods=['POST'])
def calculate_business_metrics():
    """Calculate and store business metrics for a period"""
    try:
        data = request.get_json()
        company_id = data.get('company_id', 1)
        period_start = datetime.fromisoformat(data.get('period_start'))
        period_end = datetime.fromisoformat(data.get('period_end'))
        
        # Calculate key business metrics
        metrics = []
        
        # Revenue metrics
        total_revenue = db.session.query(func.sum(Invoice.total_amount)).filter(
            and_(
                Invoice.company_id == company_id,
                Invoice.created_at >= period_start,
                Invoice.created_at <= period_end,
                Invoice.status == 'paid'
            )
        ).scalar() or 0
        
        metrics.append(BusinessMetric(
            company_id=company_id,
            metric_name='Total Revenue',
            metric_type=MetricType.REVENUE,
            category='revenue',
            value=total_revenue,
            period_start=period_start,
            period_end=period_end,
            calculation_method='Sum of paid invoices'
        ))
        
        # Customer metrics
        new_customers = db.session.query(func.count(Customer.id)).filter(
            and_(
                Customer.company_id == company_id,
                Customer.created_at >= period_start,
                Customer.created_at <= period_end
            )
        ).scalar() or 0
        
        metrics.append(BusinessMetric(
            company_id=company_id,
            metric_name='New Customers',
            metric_type=MetricType.COUNT,
            category='customer',
            value=new_customers,
            period_start=period_start,
            period_end=period_end,
            calculation_method='Count of new customer registrations'
        ))
        
        # Job metrics
        completed_jobs = db.session.query(func.count(Job.id)).filter(
            and_(
                Job.company_id == company_id,
                Job.updated_at >= period_start,
                Job.updated_at <= period_end,
                Job.status == JobStatus.COMPLETED
            )
        ).scalar() or 0
        
        metrics.append(BusinessMetric(
            company_id=company_id,
            metric_name='Completed Jobs',
            metric_type=MetricType.COUNT,
            category='operational',
            value=completed_jobs,
            period_start=period_start,
            period_end=period_end,
            calculation_method='Count of completed jobs'
        ))
        
        # Average job value
        avg_job_value = total_revenue / completed_jobs if completed_jobs > 0 else 0
        
        metrics.append(BusinessMetric(
            company_id=company_id,
            metric_name='Average Job Value',
            metric_type=MetricType.AVERAGE,
            category='revenue',
            value=avg_job_value,
            period_start=period_start,
            period_end=period_end,
            calculation_method='Total revenue / completed jobs'
        ))
        
        # Save all metrics
        for metric in metrics:
            db.session.add(metric)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Calculated {len(metrics)} business metrics',
            'metrics': [metric.to_dict() for metric in metrics]
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Revenue Analytics Endpoints
@business_intelligence_bp.route('/revenue/analytics', methods=['GET'])
def get_revenue_analytics():
    """Get revenue analytics for a period"""
    try:
        company_id = request.args.get('company_id', 1)
        period_type = request.args.get('period_type', 'monthly')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = RevenueAnalytics.query.filter_by(company_id=company_id)
        
        if period_type:
            query = query.filter_by(period_type=period_type)
        if start_date:
            query = query.filter(RevenueAnalytics.period_start >= datetime.fromisoformat(start_date))
        if end_date:
            query = query.filter(RevenueAnalytics.period_end <= datetime.fromisoformat(end_date))
        
        analytics = query.order_by(RevenueAnalytics.period_start.desc()).all()
        
        return jsonify({
            'success': True,
            'analytics': [analytic.to_dict() for analytic in analytics],
            'total': len(analytics)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@business_intelligence_bp.route('/revenue/calculate', methods=['POST'])
def calculate_revenue_analytics():
    """Calculate comprehensive revenue analytics"""
    try:
        data = request.get_json()
        company_id = data.get('company_id', 1)
        period_start = datetime.fromisoformat(data.get('period_start'))
        period_end = datetime.fromisoformat(data.get('period_end'))
        period_type = data.get('period_type', 'monthly')
        
        # Calculate revenue analytics
        total_revenue = db.session.query(func.sum(Invoice.total_amount)).filter(
            and_(
                Invoice.company_id == company_id,
                Invoice.created_at >= period_start,
                Invoice.created_at <= period_end,
                Invoice.status == 'paid'
            )
        ).scalar() or 0
        
        total_jobs = db.session.query(func.count(Job.id)).filter(
            and_(
                Job.company_id == company_id,
                Job.created_at >= period_start,
                Job.created_at <= period_end
            )
        ).scalar() or 0
        
        completed_jobs = db.session.query(func.count(Job.id)).filter(
            and_(
                Job.company_id == company_id,
                Job.updated_at >= period_start,
                Job.updated_at <= period_end,
                Job.status == JobStatus.COMPLETED
            )
        ).scalar() or 0
        
        new_customers = db.session.query(func.count(Customer.id)).filter(
            and_(
                Customer.company_id == company_id,
                Customer.created_at >= period_start,
                Customer.created_at <= period_end
            )
        ).scalar() or 0
        
        # Calculate derived metrics
        average_job_value = total_revenue / completed_jobs if completed_jobs > 0 else 0
        completion_rate = (completed_jobs / total_jobs * 100) if total_jobs > 0 else 0
        
        # Create revenue analytics record
        analytics = RevenueAnalytics(
            company_id=company_id,
            period_start=period_start,
            period_end=period_end,
            period_type=period_type,
            total_revenue=total_revenue,
            total_jobs=total_jobs,
            completed_jobs=completed_jobs,
            average_job_value=average_job_value,
            new_customers=new_customers,
            # Add more calculated metrics as needed
            gross_profit=total_revenue * 0.7,  # Assuming 70% gross margin
            profit_margin=70.0
        )
        
        db.session.add(analytics)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Revenue analytics calculated successfully',
            'analytics': analytics.to_dict()
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Customer Analytics Endpoints
@business_intelligence_bp.route('/customers/analytics', methods=['GET'])
def get_customer_analytics():
    """Get customer analytics"""
    try:
        company_id = request.args.get('company_id', 1)
        customer_id = request.args.get('customer_id')
        
        query = CustomerAnalytics.query.filter_by(company_id=company_id)
        
        if customer_id:
            query = query.filter_by(customer_id=customer_id)
        
        analytics = query.order_by(CustomerAnalytics.last_calculated.desc()).all()
        
        return jsonify({
            'success': True,
            'analytics': [analytic.to_dict() for analytic in analytics],
            'total': len(analytics)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@business_intelligence_bp.route('/customers/calculate', methods=['POST'])
def calculate_customer_analytics():
    """Calculate customer analytics for all customers"""
    try:
        data = request.get_json()
        company_id = data.get('company_id', 1)
        
        customers = Customer.query.filter_by(company_id=company_id).all()
        analytics_records = []
        
        for customer in customers:
            # Calculate customer metrics
            total_spent = db.session.query(func.sum(Invoice.total_amount)).filter(
                and_(
                    Invoice.customer_id == customer.id,
                    Invoice.status == 'paid'
                )
            ).scalar() or 0
            
            total_jobs = db.session.query(func.count(Job.id)).filter_by(
                customer_id=customer.id
            ).scalar() or 0
            
            last_job = db.session.query(Job).filter_by(
                customer_id=customer.id
            ).order_by(Job.created_at.desc()).first()
            
            last_job_date = last_job.created_at if last_job else None
            days_since_last_job = (datetime.utcnow() - last_job_date).days if last_job_date else 999
            
            average_job_value = total_spent / total_jobs if total_jobs > 0 else 0
            
            # Calculate churn risk (simple algorithm)
            churn_risk = min(days_since_last_job / 365 * 100, 100)  # Higher risk with more days
            
            analytics = CustomerAnalytics(
                company_id=company_id,
                customer_id=customer.id,
                lifetime_value=total_spent * 1.5,  # Estimated LTV
                total_spent=total_spent,
                average_job_value=average_job_value,
                total_jobs=total_jobs,
                last_job_date=last_job_date,
                days_since_last_job=days_since_last_job,
                churn_risk_score=churn_risk
            )
            
            analytics_records.append(analytics)
            db.session.add(analytics)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Calculated analytics for {len(analytics_records)} customers',
            'analytics': [record.to_dict() for record in analytics_records]
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Technician Performance Endpoints
@business_intelligence_bp.route('/technicians/performance', methods=['GET'])
def get_technician_performance():
    """Get technician performance analytics"""
    try:
        company_id = request.args.get('company_id', 1)
        technician_id = request.args.get('technician_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')
        
        query = TechnicianPerformance.query.filter_by(company_id=company_id)
        
        if technician_id:
            query = query.filter_by(technician_id=technician_id)
        if start_date:
            query = query.filter(TechnicianPerformance.period_start >= datetime.fromisoformat(start_date))
        if end_date:
            query = query.filter(TechnicianPerformance.period_end <= datetime.fromisoformat(end_date))
        
        performance = query.order_by(TechnicianPerformance.calculated_at.desc()).all()
        
        return jsonify({
            'success': True,
            'performance': [perf.to_dict() for perf in performance],
            'total': len(performance)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

# Predictive Insights Endpoints
@business_intelligence_bp.route('/insights', methods=['GET'])
def get_predictive_insights():
    """Get predictive insights"""
    try:
        company_id = request.args.get('company_id', 1)
        insight_type = request.args.get('insight_type')
        
        query = PredictiveInsight.query.filter_by(company_id=company_id, is_active=True)
        
        if insight_type:
            query = query.filter_by(insight_type=insight_type)
        
        insights = query.order_by(PredictiveInsight.prediction_date.desc()).all()
        
        return jsonify({
            'success': True,
            'insights': [insight.to_dict() for insight in insights],
            'total': len(insights)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@business_intelligence_bp.route('/insights/generate', methods=['POST'])
def generate_predictive_insights():
    """Generate predictive insights"""
    try:
        data = request.get_json()
        company_id = data.get('company_id', 1)
        
        insights = []
        
        # Revenue forecast insight
        # Get historical revenue data
        historical_revenue = db.session.query(
            func.sum(Invoice.total_amount)
        ).filter(
            and_(
                Invoice.company_id == company_id,
                Invoice.status == 'paid',
                Invoice.created_at >= datetime.utcnow() - timedelta(days=90)
            )
        ).scalar() or 0
        
        # Simple forecast (could be enhanced with ML)
        predicted_revenue = historical_revenue * 1.1  # 10% growth assumption
        
        revenue_insight = PredictiveInsight(
            company_id=company_id,
            insight_type='revenue_forecast',
            title='Next Month Revenue Forecast',
            description=f'Based on historical trends, predicted revenue for next month is ${predicted_revenue:,.2f}',
            predicted_value=predicted_revenue,
            confidence_score=75.0,
            prediction_period='next_month',
            factors=json.dumps([
                'Historical revenue trends',
                'Seasonal patterns',
                'Current job pipeline'
            ]),
            recommendations=json.dumps([
                'Focus on high-value services',
                'Increase customer retention efforts',
                'Optimize technician scheduling'
            ]),
            target_date=datetime.utcnow() + timedelta(days=30)
        )
        
        insights.append(revenue_insight)
        
        # Customer churn prediction
        high_risk_customers = db.session.query(func.count(CustomerAnalytics.id)).filter(
            and_(
                CustomerAnalytics.company_id == company_id,
                CustomerAnalytics.churn_risk_score > 70
            )
        ).scalar() or 0
        
        churn_insight = PredictiveInsight(
            company_id=company_id,
            insight_type='churn_prediction',
            title='Customer Churn Risk Alert',
            description=f'{high_risk_customers} customers are at high risk of churning',
            predicted_value=high_risk_customers,
            confidence_score=80.0,
            prediction_period='next_quarter',
            factors=json.dumps([
                'Days since last service',
                'Communication frequency',
                'Payment history'
            ]),
            recommendations=json.dumps([
                'Reach out to high-risk customers',
                'Offer maintenance packages',
                'Improve follow-up processes'
            ])
        )
        
        insights.append(churn_insight)
        
        # Save insights
        for insight in insights:
            db.session.add(insight)
        
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Generated {len(insights)} predictive insights',
            'insights': [insight.to_dict() for insight in insights]
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Custom Reports Endpoints
@business_intelligence_bp.route('/reports', methods=['GET'])
def get_custom_reports():
    """Get custom reports"""
    try:
        company_id = request.args.get('company_id', 1)
        report_type = request.args.get('report_type')
        
        query = CustomReport.query.filter_by(company_id=company_id, is_active=True)
        
        if report_type:
            query = query.filter_by(report_type=ReportType(report_type))
        
        reports = query.order_by(CustomReport.created_at.desc()).all()
        
        return jsonify({
            'success': True,
            'reports': [report.to_dict() for report in reports],
            'total': len(reports)
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@business_intelligence_bp.route('/reports', methods=['POST'])
def create_custom_report():
    """Create a new custom report"""
    try:
        data = request.get_json()
        
        report = CustomReport(
            company_id=data.get('company_id', 1),
            name=data['name'],
            description=data.get('description'),
            report_type=ReportType(data['report_type']),
            filters=json.dumps(data.get('filters', {})),
            metrics=json.dumps(data.get('metrics', [])),
            chart_types=json.dumps(data.get('chart_types', {})),
            is_scheduled=data.get('is_scheduled', False),
            frequency=ReportFrequency(data['frequency']) if data.get('frequency') else None,
            email_recipients=json.dumps(data.get('email_recipients', [])),
            created_by_user_id=data.get('created_by_user_id')
        )
        
        db.session.add(report)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Custom report created successfully',
            'report': report.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'success': False, 'error': str(e)}), 500

# Dashboard Summary Endpoint
@business_intelligence_bp.route('/dashboard/summary', methods=['GET'])
def get_dashboard_summary():
    """Get comprehensive dashboard summary"""
    try:
        company_id = request.args.get('company_id', 1)
        period_days = int(request.args.get('period_days', 30))
        
        start_date = datetime.utcnow() - timedelta(days=period_days)
        end_date = datetime.utcnow()
        
        # Key metrics
        total_revenue = db.session.query(func.sum(Invoice.total_amount)).filter(
            and_(
                Invoice.company_id == company_id,
                Invoice.created_at >= start_date,
                Invoice.status == 'paid'
            )
        ).scalar() or 0
        
        total_jobs = db.session.query(func.count(Job.id)).filter(
            and_(
                Job.company_id == company_id,
                Job.created_at >= start_date
            )
        ).scalar() or 0
        
        completed_jobs = db.session.query(func.count(Job.id)).filter(
            and_(
                Job.company_id == company_id,
                Job.updated_at >= start_date,
                Job.status == JobStatus.COMPLETED
            )
        ).scalar() or 0
        
        new_customers = db.session.query(func.count(Customer.id)).filter(
            and_(
                Customer.company_id == company_id,
                Customer.created_at >= start_date
            )
        ).scalar() or 0
        
        # Get recent insights
        recent_insights = PredictiveInsight.query.filter_by(
            company_id=company_id, 
            is_active=True
        ).order_by(PredictiveInsight.prediction_date.desc()).limit(5).all()
        
        # Calculate trends (compare with previous period)
        prev_start = start_date - timedelta(days=period_days)
        prev_revenue = db.session.query(func.sum(Invoice.total_amount)).filter(
            and_(
                Invoice.company_id == company_id,
                Invoice.created_at >= prev_start,
                Invoice.created_at < start_date,
                Invoice.status == 'paid'
            )
        ).scalar() or 0
        
        revenue_trend = ((total_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue > 0 else 0
        
        return jsonify({
            'success': True,
            'summary': {
                'period_days': period_days,
                'total_revenue': total_revenue,
                'total_jobs': total_jobs,
                'completed_jobs': completed_jobs,
                'new_customers': new_customers,
                'average_job_value': total_revenue / completed_jobs if completed_jobs > 0 else 0,
                'completion_rate': (completed_jobs / total_jobs * 100) if total_jobs > 0 else 0,
                'revenue_trend': round(revenue_trend, 2),
                'insights': [insight.to_dict() for insight in recent_insights]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

