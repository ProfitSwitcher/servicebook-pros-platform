from flask import Blueprint, Response

# The correct import path depends on how gunicorn loads the app.
# Production: gunicorn runs `src.main:app` from the servicebook-pros-backend/
# directory, so the package root is `src` and the import must be
# `from src.routes.jobs import _jobs`.  A bare `from routes.jobs import _jobs`
# works only when Python's cwd is already inside `src/`, which never happens
# in the Render/Railway deployment.  We try both so the module loads correctly
# in every environment (local dev with `python src/main.py` as well as
# gunicorn `src.main:app`).
try:
    from src.routes.jobs import _jobs
except ImportError:
    from routes.jobs import _jobs

calendar_bp = Blueprint('calendar', __name__)


@calendar_bp.route('/feed.ics', methods=['GET'])
def calendar_feed():
    """
    GET /api/calendar/feed.ics
    Returns all scheduled jobs as an iCalendar (ICS) feed.
    No authentication required — external calendar apps subscribe to this URL.
    Compatible with Google Calendar, Apple Calendar, and Outlook.
    """
    lines = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ServiceBook Pros//ServiceBook Pros//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:ServiceBook Pros Schedule',
        'X-WR-CALDESC:Jobs and appointments from ServiceBook Pros',
    ]

    for job in _jobs:
        date_str = (job.get('scheduled_date') or job.get('scheduledDate') or '').replace('-', '')
        if not date_str:
            continue

        title = job.get('title', 'Service Job')
        customer = job.get('customer_name', '')
        status = job.get('status', '')
        job_id = job.get('id', '')
        job_num = job.get('jobNumber', f'JOB-{job_id}')
        notes = job.get('notes', '') or ''
        # Escape special chars for ICS
        summary = f"{title} - {customer}" if customer else title
        description = f"Job #{job_num} | Status: {status}"
        if notes:
            description += f" | Notes: {notes[:100]}"

        ical_status = 'CANCELLED' if status == 'cancelled' else 'CONFIRMED'

        lines += [
            'BEGIN:VEVENT',
            f'UID:sbp-job-{job_id}@servicebookpros.com',
            f'DTSTART;VALUE=DATE:{date_str}',
            f'SUMMARY:{summary}',
            f'DESCRIPTION:{description}',
            f'STATUS:{ical_status}',
            'END:VEVENT',
        ]

    lines.append('END:VCALENDAR')
    ics_content = '\r\n'.join(lines)

    return Response(
        ics_content,
        status=200,
        headers={
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': 'inline; filename="servicebook.ics"',
        },
    )
