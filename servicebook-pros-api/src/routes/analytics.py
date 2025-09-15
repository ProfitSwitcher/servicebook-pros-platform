from flask import Blueprint, request, jsonify
from src.models.user import db
from src.models.customer import Customer
from src.models.job import Job, JobStatus
from src.models.invoice import Invoice, InvoiceStatus
from src.models.estimate import Estimate, EstimateStatus
from src.routes.auth import token_required
from datetime import datetime, timedelta
from sqlalchemy import func, extract

analytics_bp = Blueprint('analytics', __name__)

@analytics_bp.route('/analytics/dashboard', methods=['GET'])
@token_required
def get_dashboard_analytics(current_user):
    try:
        # Get date range (default to last 30 days)
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=30)
        
        # Override with query parameters if provided
        if request.args.get('start_date'):
            start_date = datetime.fromisoformat(request.args.get('start_date'))
        if request.args.get('end_date'):
            end_date = datetime.fromisoformat(request.args.get('end_date'))
        
        # Customer metrics
        total_customers = Customer.query.filter_by(company_id=current_user.company_id).count()
        new_customers = Customer.query.filter(
            Customer.company_id == current_user.company_id,
            Customer.created_at >= start_date,
            Customer.created_at <= end_date
        ).count()
        
        # Job metrics
        total_jobs = Job.query.filter_by(company_id=current_user.company_id).count()
        completed_jobs = Job.query.filter_by(
            company_id=current_user.company_id,
            status=JobStatus.COMPLETED
        ).count()
        
        jobs_this_period = Job.query.filter(
            Job.company_id == current_user.company_id,
            Job.created_at >= start_date,
            Job.created_at <= end_date
        ).count()
        
        # Revenue metrics
        total_revenue = db.session.query(func.sum(Invoice.paid_amount))\
            .filter_by(company_id=current_user.company_id).scalar() or 0
        
        revenue_this_period = db.session.query(func.sum(Invoice.paid_amount))\
            .filter(
                Invoice.company_id == current_user.company_id,
                Invoice.paid_at >= start_date,
                Invoice.paid_at <= end_date
            ).scalar() or 0
        
        outstanding_invoices = db.session.query(func.sum(Invoice.balance_due))\
            .filter(
                Invoice.company_id == current_user.company_id,
                Invoice.balance_due > 0
            ).scalar() or 0
        
        # Estimate metrics
        estimates_sent = Estimate.query.filter(
            Estimate.company_id == current_user.company_id,
            Estimate.sent_at >= start_date,
            Estimate.sent_at <= end_date
        ).count()
        
        estimates_approved = Estimate.query.filter(
            Estimate.company_id == current_user.company_id,
            Estimate.approved_at >= start_date,
            Estimate.approved_at <= end_date
        ).count()
        
        conversion_rate = (estimates_approved / estimates_sent * 100) if estimates_sent > 0 else 0
        
        return jsonify({
            'period': {
                'start_date': start_date.isoformat(),
                'end_date': end_date.isoformat()
            },
            'customers': {
                'total': total_customers,
                'new_this_period': new_customers
            },
            'jobs': {
                'total': total_jobs,
                'completed': completed_jobs,
                'this_period': jobs_this_period,
                'completion_rate': (completed_jobs / total_jobs * 100) if total_jobs > 0 else 0
            },
            'revenue': {
                'total': total_revenue,
                'this_period': revenue_this_period,
                'outstanding': outstanding_invoices
            },
            'estimates': {
                'sent_this_period': estimates_sent,
                'approved_this_period': estimates_approved,
                'conversion_rate': conversion_rate
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get dashboard analytics: {str(e)}'}), 500

@analytics_bp.route('/analytics/revenue', methods=['GET'])
@token_required
def get_revenue_analytics(current_user):
    try:
        # Get date range and grouping
        period = request.args.get('period', 'month')  # day, week, month, year
        months_back = int(request.args.get('months_back', 12))
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=months_back * 30)
        
        # Revenue by period
        if period == 'month':
            revenue_data = db.session.query(
                extract('year', Invoice.paid_at).label('year'),
                extract('month', Invoice.paid_at).label('month'),
                func.sum(Invoice.paid_amount).label('revenue')
            ).filter(
                Invoice.company_id == current_user.company_id,
                Invoice.paid_at >= start_date,
                Invoice.paid_at <= end_date,
                Invoice.paid_amount > 0
            ).group_by(
                extract('year', Invoice.paid_at),
                extract('month', Invoice.paid_at)
            ).order_by('year', 'month').all()
        
        # Format revenue data
        revenue_chart = []
        for row in revenue_data:
            revenue_chart.append({
                'period': f"{int(row.year)}-{int(row.month):02d}",
                'revenue': float(row.revenue or 0)
            })
        
        # Revenue by service category
        category_revenue = db.session.query(
            Job.category,
            func.sum(Invoice.paid_amount).label('revenue')
        ).join(Invoice, Job.id == Invoice.job_id)\
        .filter(
            Job.company_id == current_user.company_id,
            Invoice.paid_at >= start_date,
            Invoice.paid_at <= end_date
        ).group_by(Job.category).all()
        
        category_data = [
            {
                'category': row.category or 'Other',
                'revenue': float(row.revenue or 0)
            }
            for row in category_revenue
        ]
        
        # Average job value
        avg_job_value = db.session.query(func.avg(Invoice.total_amount))\
            .filter(
                Invoice.company_id == current_user.company_id,
                Invoice.created_at >= start_date
            ).scalar() or 0
        
        return jsonify({
            'revenue_chart': revenue_chart,
            'category_revenue': category_data,
            'avg_job_value': float(avg_job_value),
            'period': period,
            'date_range': {
                'start': start_date.isoformat(),
                'end': end_date.isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get revenue analytics: {str(e)}'}), 500

@analytics_bp.route('/analytics/customers', methods=['GET'])
@token_required
def get_customer_analytics(current_user):
    try:
        # Customer acquisition over time
        months_back = int(request.args.get('months_back', 12))
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=months_back * 30)
        
        acquisition_data = db.session.query(
            extract('year', Customer.created_at).label('year'),
            extract('month', Customer.created_at).label('month'),
            func.count(Customer.id).label('new_customers')
        ).filter(
            Customer.company_id == current_user.company_id,
            Customer.created_at >= start_date,
            Customer.created_at <= end_date
        ).group_by(
            extract('year', Customer.created_at),
            extract('month', Customer.created_at)
        ).order_by('year', 'month').all()
        
        acquisition_chart = []
        for row in acquisition_data:
            acquisition_chart.append({
                'period': f"{int(row.year)}-{int(row.month):02d}",
                'new_customers': int(row.new_customers)
            })
        
        # Customer by type
        customer_types = db.session.query(
            Customer.customer_type,
            func.count(Customer.id).label('count')
        ).filter_by(company_id=current_user.company_id)\
        .group_by(Customer.customer_type).all()
        
        type_data = [
            {
                'type': row.customer_type or 'Unknown',
                'count': int(row.count)
            }
            for row in customer_types
        ]
        
        # Customer lifetime value
        customer_values = db.session.query(
            Customer.id,
            func.sum(Invoice.paid_amount).label('total_paid')
        ).join(Invoice, Customer.id == Invoice.customer_id)\
        .filter(Customer.company_id == current_user.company_id)\
        .group_by(Customer.id).all()
        
        if customer_values:
            avg_customer_value = sum(row.total_paid or 0 for row in customer_values) / len(customer_values)
            max_customer_value = max(row.total_paid or 0 for row in customer_values)
        else:
            avg_customer_value = 0
            max_customer_value = 0
        
        # Top customers by revenue
        top_customers = db.session.query(
            Customer.first_name,
            Customer.last_name,
            func.sum(Invoice.paid_amount).label('total_revenue'),
            func.count(Invoice.id).label('invoice_count')
        ).join(Invoice, Customer.id == Invoice.customer_id)\
        .filter(Customer.company_id == current_user.company_id)\
        .group_by(Customer.id, Customer.first_name, Customer.last_name)\
        .order_by(func.sum(Invoice.paid_amount).desc())\
        .limit(10).all()
        
        top_customers_data = [
            {
                'name': f"{row.first_name} {row.last_name}",
                'total_revenue': float(row.total_revenue or 0),
                'invoice_count': int(row.invoice_count)
            }
            for row in top_customers
        ]
        
        return jsonify({
            'acquisition_chart': acquisition_chart,
            'customer_types': type_data,
            'avg_customer_value': float(avg_customer_value),
            'max_customer_value': float(max_customer_value),
            'top_customers': top_customers_data
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get customer analytics: {str(e)}'}), 500

@analytics_bp.route('/analytics/jobs', methods=['GET'])
@token_required
def get_job_analytics(current_user):
    try:
        months_back = int(request.args.get('months_back', 12))
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=months_back * 30)
        
        # Jobs by status
        job_statuses = db.session.query(
            Job.status,
            func.count(Job.id).label('count')
        ).filter_by(company_id=current_user.company_id)\
        .group_by(Job.status).all()
        
        status_data = [
            {
                'status': row.status.value if row.status else 'Unknown',
                'count': int(row.count)
            }
            for row in job_statuses
        ]
        
        # Jobs by category
        job_categories = db.session.query(
            Job.category,
            func.count(Job.id).label('count'),
            func.avg(Job.actual_cost).label('avg_cost')
        ).filter_by(company_id=current_user.company_id)\
        .group_by(Job.category).all()
        
        category_data = [
            {
                'category': row.category or 'Other',
                'count': int(row.count),
                'avg_cost': float(row.avg_cost or 0)
            }
            for row in job_categories
        ]
        
        # Job completion over time
        completion_data = db.session.query(
            extract('year', Job.completed_at).label('year'),
            extract('month', Job.completed_at).label('month'),
            func.count(Job.id).label('completed_jobs')
        ).filter(
            Job.company_id == current_user.company_id,
            Job.completed_at >= start_date,
            Job.completed_at <= end_date,
            Job.status == JobStatus.COMPLETED
        ).group_by(
            extract('year', Job.completed_at),
            extract('month', Job.completed_at)
        ).order_by('year', 'month').all()
        
        completion_chart = []
        for row in completion_data:
            completion_chart.append({
                'period': f"{int(row.year)}-{int(row.month):02d}",
                'completed_jobs': int(row.completed_jobs)
            })
        
        # Average job duration
        completed_jobs = Job.query.filter(
            Job.company_id == current_user.company_id,
            Job.status == JobStatus.COMPLETED,
            Job.actual_start_time.isnot(None),
            Job.actual_end_time.isnot(None)
        ).all()
        
        if completed_jobs:
            total_duration = sum(
                (job.actual_end_time - job.actual_start_time).total_seconds() / 3600
                for job in completed_jobs
            )
            avg_duration_hours = total_duration / len(completed_jobs)
        else:
            avg_duration_hours = 0
        
        return jsonify({
            'job_statuses': status_data,
            'job_categories': category_data,
            'completion_chart': completion_chart,
            'avg_duration_hours': float(avg_duration_hours)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get job analytics: {str(e)}'}), 500

@analytics_bp.route('/analytics/financial-summary', methods=['GET'])
@token_required
def get_financial_summary(current_user):
    try:
        # Get current month and year
        now = datetime.utcnow()
        current_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_start = (current_month_start - timedelta(days=1)).replace(day=1)
        
        # Current month revenue
        current_month_revenue = db.session.query(func.sum(Invoice.paid_amount))\
            .filter(
                Invoice.company_id == current_user.company_id,
                Invoice.paid_at >= current_month_start
            ).scalar() or 0
        
        # Last month revenue
        last_month_revenue = db.session.query(func.sum(Invoice.paid_amount))\
            .filter(
                Invoice.company_id == current_user.company_id,
                Invoice.paid_at >= last_month_start,
                Invoice.paid_at < current_month_start
            ).scalar() or 0
        
        # Outstanding invoices
        outstanding_amount = db.session.query(func.sum(Invoice.balance_due))\
            .filter(
                Invoice.company_id == current_user.company_id,
                Invoice.balance_due > 0
            ).scalar() or 0
        
        # Overdue invoices
        overdue_amount = db.session.query(func.sum(Invoice.balance_due))\
            .filter(
                Invoice.company_id == current_user.company_id,
                Invoice.due_date < now,
                Invoice.balance_due > 0
            ).scalar() or 0
        
        # Estimate pipeline value
        pipeline_value = db.session.query(func.sum(Estimate.total_amount))\
            .filter(
                Estimate.company_id == current_user.company_id,
                Estimate.status.in_([EstimateStatus.SENT, EstimateStatus.VIEWED])
            ).scalar() or 0
        
        # Calculate growth rate
        growth_rate = 0
        if last_month_revenue > 0:
            growth_rate = ((current_month_revenue - last_month_revenue) / last_month_revenue) * 100
        
        return jsonify({
            'current_month_revenue': float(current_month_revenue),
            'last_month_revenue': float(last_month_revenue),
            'growth_rate': float(growth_rate),
            'outstanding_amount': float(outstanding_amount),
            'overdue_amount': float(overdue_amount),
            'pipeline_value': float(pipeline_value)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get financial summary: {str(e)}'}), 500

@analytics_bp.route('/analytics/performance', methods=['GET'])
@token_required
def get_performance_metrics(current_user):
    try:
        # Technician performance (if applicable)
        technician_performance = db.session.query(
            Job.assigned_technician_id,
            func.count(Job.id).label('jobs_completed'),
            func.avg(Job.labor_hours).label('avg_hours'),
            func.sum(Job.actual_cost).label('total_revenue')
        ).filter(
            Job.company_id == current_user.company_id,
            Job.status == JobStatus.COMPLETED,
            Job.assigned_technician_id.isnot(None)
        ).group_by(Job.assigned_technician_id).all()
        
        # Customer satisfaction (based on ratings)
        avg_rating = db.session.query(func.avg(Job.customer_rating))\
            .filter(
                Job.company_id == current_user.company_id,
                Job.customer_rating.isnot(None)
            ).scalar() or 0
        
        # Response time metrics
        response_times = db.session.query(
            func.avg(
                func.extract('epoch', Job.actual_start_time - Job.created_at) / 3600
            ).label('avg_response_hours')
        ).filter(
            Job.company_id == current_user.company_id,
            Job.actual_start_time.isnot(None)
        ).scalar() or 0
        
        return jsonify({
            'avg_customer_rating': float(avg_rating),
            'avg_response_time_hours': float(response_times),
            'technician_count': len(technician_performance)
        }), 200
        
    except Exception as e:
        return jsonify({'message': f'Failed to get performance metrics: {str(e)}'}), 500

