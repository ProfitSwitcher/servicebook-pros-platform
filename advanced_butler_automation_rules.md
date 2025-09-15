# Advanced Butler Automation Rules for ServiceBook Pros Invoice Management API

## Overview

This document provides a comprehensive collection of advanced Butler automation rules specifically designed for the ServiceBook Pros Invoice Management API project. These rules automate complex workflows, enhance team collaboration, and ensure project quality and consistency.

---

## Table of Contents

1. [Workflow Automation Rules](#workflow-automation-rules)
2. [Quality Assurance Rules](#quality-assurance-rules)
3. [Team Communication Rules](#team-communication-rules)
4. [Project Management Rules](#project-management-rules)
5. [Performance Monitoring Rules](#performance-monitoring-rules)
6. [Security and Compliance Rules](#security-and-compliance-rules)
7. [Sprint Management Rules](#sprint-management-rules)
8. [Documentation Rules](#documentation-rules)
9. [Emergency Response Rules](#emergency-response-rules)
10. [Analytics and Reporting Rules](#analytics-and-reporting-rules)

---

## Workflow Automation Rules

### 1. Smart Card Progression

**Rule: Automatic Label Management**
```
When a card is moved to list "🔄 In Progress"
Add the "In Progress" label to the card
Remove the "Planned" label from the card
Set due date to 5 days from now
Add comment "Work started on {date} - target completion {duedate}"
```

**Rule: Code Review Assignment**
```
When a card is moved to list "👀 Code Review"
Add the "Code Review" label to the card
Remove the "In Progress" label from the card
If the card has label "Backend", add member @john-backend-lead
If the card has label "Frontend", add member @sarah-frontend-lead
If the card has label "Database", add member @mike-database-expert
Post comment "@{assigned-reviewer} Please review this code. Priority: {priority-label}"
```

**Rule: Testing Workflow**
```
When a card is moved to list "🧪 Testing"
Add the "Testing" label to the card
Remove the "Code Review" label from the card
Add member @david-qa-lead
Create checklist "Testing Requirements" with items:
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Performance tests pass
- [ ] Security tests pass
- [ ] Documentation updated
```

### 2. Intelligent Card Routing

**Rule: Priority-Based Assignment**
```
When a card with label "High Priority" is created
Move the card to list "🔄 In Progress"
Add comment "HIGH PRIORITY: This card has been fast-tracked to In Progress"
Set due date to 3 days from now
Add member @project-manager
Send notification to #urgent-tasks channel
```

**Rule: Dependency Management**
```
When a card is moved to list "✅ Done"
Find cards in any list that contain "{cardname}" in the description
Add comment to those cards "Dependency completed: {cardname} is now done"
If all dependencies are complete, add label "Ready to Start"
```

**Rule: Blocked Card Handling**
```
When a card title contains "BLOCKED"
Add the "Blocked" label to the card
Move the card to list "🚫 Blocked Items"
Add comment "Card blocked on {date}. Reason: {first-comment}"
Set due date to tomorrow
Add member @project-manager
Create follow-up card "Resolve blocker for: {cardname}" in "📋 API Planning & Design"
```

---

## Quality Assurance Rules

### 3. Automated Quality Checks

**Rule: Definition of Done Validation**
```
When a card is moved to list "✅ Done"
If the card does not have all checklist items completed
Move the card back to "🧪 Testing"
Add comment "❌ Definition of Done not met. Please complete all checklist items."
Add label "Needs Completion"
Add member who moved the card
```

**Rule: Code Review Requirements**
```
When a card is moved to list "👀 Code Review"
If the card does not have a checklist
Create checklist "Code Review Checklist" with items:
- [ ] Code follows style guidelines
- [ ] Unit tests included and passing
- [ ] Documentation updated
- [ ] No security vulnerabilities
- [ ] Performance impact assessed
- [ ] Error handling implemented
```

**Rule: Testing Coverage Validation**
```
When a card with label "API" is moved to "🧪 Testing"
Create checklist "API Testing Requirements" with items:
- [ ] Happy path tests created
- [ ] Error scenario tests created
- [ ] Performance tests completed
- [ ] Security tests passed
- [ ] Integration tests verified
- [ ] Documentation examples tested
Add comment "API testing checklist created. All items must be completed before moving to Done."
```

### 4. Bug Tracking and Resolution

**Rule: Bug Card Creation**
```
When a card title contains "BUG:"
Add the "Bug" label to the card
Add the "High Priority" label to the card
Move the card to list "🔄 In Progress"
Add member @qa-lead
Add member @project-manager
Create checklist "Bug Resolution" with items:
- [ ] Bug reproduced
- [ ] Root cause identified
- [ ] Fix implemented
- [ ] Fix tested
- [ ] Regression tests added
```

**Rule: Bug Resolution Tracking**
```
When a card with label "Bug" is moved to "✅ Done"
Add comment "🐛 Bug resolved on {date}"
Create card "Post-mortem: {cardname}" in "📚 Documentation"
Add checklist to post-mortem card:
- [ ] Root cause analysis completed
- [ ] Prevention measures identified
- [ ] Process improvements documented
- [ ] Team lessons learned shared
```

---

## Team Communication Rules

### 5. Smart Notifications

**Rule: Overdue Card Alerts**
```
Every day at 9:00 AM
For each card that is overdue
Add comment "⚠️ This card is overdue by {days-overdue} days"
Add label "Overdue"
Add member @project-manager
If overdue by more than 3 days, add member @team-lead
```

**Rule: Daily Standup Preparation**
```
Every weekday at 8:30 AM
Create card "Daily Standup - {date}" in list "📋 API Planning & Design"
Add description:
"## Today's Focus
- Review cards in 'In Progress'
- Identify blockers
- Plan daily commitments

## In Progress Cards:
{list-cards-in-progress}

## Blocked Cards:
{list-cards-with-blocked-label}

## Due Today:
{list-cards-due-today}"
Add all team members
Set due date to 9:00 AM today
```

**Rule: Code Review Reminders**
```
Every day at 2:00 PM
For each card in "👀 Code Review" for more than 24 hours
Add comment "🔔 Gentle reminder: This code review has been pending for {hours-in-list} hours"
Add member assigned to the card
If pending for more than 48 hours, add member @team-lead
```

### 6. Collaboration Enhancement

**Rule: Expert Assignment**
```
When a card is created with label "Database"
Add member @database-expert
Add comment "Database expert assigned for consultation"

When a card is created with label "Security"
Add member @security-expert
Add comment "Security expert assigned for review"

When a card is created with label "Performance"
Add member @performance-expert
Add comment "Performance expert assigned for optimization"
```

**Rule: Knowledge Sharing**
```
When a card with label "Learning" is moved to "✅ Done"
Create card "Knowledge Share: {cardname}" in "📚 Documentation"
Add description "Share learnings from {cardname} with the team"
Add checklist:
- [ ] Document key learnings
- [ ] Create team presentation
- [ ] Schedule knowledge sharing session
- [ ] Update team wiki
Add member who completed the original card
```

---

## Project Management Rules

### 7. Sprint Management

**Rule: Sprint Planning Automation**
```
Every Monday at 10:00 AM
Create card "Sprint Planning - Week of {date}" in "📋 API Planning & Design"
Add description:
"## Sprint Goals
- Review completed work from last week
- Plan upcoming week priorities
- Assign new cards to team members

## Metrics from Last Week:
- Cards completed: {count-cards-moved-to-done-last-week}
- Average cycle time: {average-cycle-time}
- Blockers encountered: {count-blocked-cards-last-week}

## This Week's Capacity:
{list-team-members-with-availability}"
Add all team members
Set due date to 11:00 AM today
```

**Rule: Sprint Retrospective**
```
Every Friday at 4:00 PM
Create card "Sprint Retrospective - Week of {date}" in "📚 Documentation"
Add description:
"## What Went Well
{list-cards-completed-this-week}

## What Could Be Improved
{list-cards-that-took-longer-than-expected}

## Action Items for Next Week
- [ ] Review process improvements
- [ ] Address identified blockers
- [ ] Implement team feedback

## Metrics This Week:
- Velocity: {cards-completed}
- Cycle time: {average-cycle-time}
- Quality: {percentage-cards-without-rework}"
Add all team members
```

### 8. Capacity Management

**Rule: Work-in-Progress Limits**
```
When a card is moved to list "🔄 In Progress"
If the member assigned to the card has more than 3 cards in "In Progress"
Add comment "⚠️ WIP Limit Warning: {member} now has {count} cards in progress"
Add label "WIP Limit Exceeded"
Add member @project-manager
```

**Rule: Team Load Balancing**
```
Every day at 5:00 PM
For each team member with 0 cards in "🔄 In Progress"
Add comment to "Sprint Planning" card "{member} has capacity for additional work"

For each team member with more than 4 cards in "🔄 In Progress"
Add comment to "Sprint Planning" card "⚠️ {member} may be overloaded with {count} active cards"
```

---

## Performance Monitoring Rules

### 9. Cycle Time Tracking

**Rule: Cycle Time Alerts**
```
When a card is moved to list "✅ Done"
Calculate days between creation and completion
If cycle time > 10 days, add comment "⏱️ Long cycle time: {cycle-time} days"
If cycle time > 15 days, add label "Process Improvement Needed"
If cycle time > 20 days, add member @process-improvement-lead
```

**Rule: Bottleneck Detection**
```
Every day at 6:00 PM
If "👀 Code Review" has more than 5 cards
Create card "Bottleneck Alert: Code Review Queue" in "📋 API Planning & Design"
Add description "Code review queue has {count} cards. Consider adding reviewers."
Add member @team-lead

If "🧪 Testing" has more than 3 cards
Create card "Bottleneck Alert: Testing Queue" in "📋 API Planning & Design"
Add description "Testing queue has {count} cards. Consider parallelizing tests."
Add member @qa-lead
```

### 10. Quality Metrics

**Rule: Rework Tracking**
```
When a card is moved from "✅ Done" back to any other list
Add label "Rework Required"
Add comment "🔄 Rework needed: Card moved back from Done on {date}"
Create card "Rework Analysis: {cardname}" in "📚 Documentation"
Add checklist to analysis card:
- [ ] Identify why rework was needed
- [ ] Document prevention measures
- [ ] Update process if necessary
```

**Rule: Success Rate Monitoring**
```
Every Friday at 5:00 PM
Calculate percentage of cards completed without rework this week
If success rate < 80%, create card "Quality Review Needed" in "📋 API Planning & Design"
Add description "Success rate this week: {success-rate}%. Target: 90%+"
Add member @quality-lead
Add member @project-manager
```

---

## Security and Compliance Rules

### 11. Security Review Automation

**Rule: Security-Sensitive Card Handling**
```
When a card is created with label "Security"
Add the "Security Review Required" label
Add member @security-expert
Create checklist "Security Review" with items:
- [ ] Threat model reviewed
- [ ] Security tests completed
- [ ] Vulnerability scan passed
- [ ] Compliance requirements met
- [ ] Security documentation updated
Add comment "🔒 Security review required before implementation"
```

**Rule: Compliance Tracking**
```
When a card with label "API" is moved to "✅ Done"
Create checklist "Compliance Verification" with items:
- [ ] API documentation complete
- [ ] Rate limiting implemented
- [ ] Authentication verified
- [ ] Data validation confirmed
- [ ] Error handling standardized
- [ ] Logging implemented
```

### 12. Data Protection Rules

**Rule: Sensitive Data Handling**
```
When a card description contains "customer data" or "payment" or "personal information"
Add the "Data Protection" label
Add member @data-protection-officer
Add comment "🛡️ This card involves sensitive data. Ensure GDPR/compliance requirements are met."
Create checklist "Data Protection Requirements" with items:
- [ ] Data minimization applied
- [ ] Encryption implemented
- [ ] Access controls verified
- [ ] Audit logging enabled
- [ ] Data retention policy applied
```

---

## Sprint Management Rules

### 13. Advanced Sprint Automation

**Rule: Sprint Velocity Tracking**
```
Every Friday at 6:00 PM
Count cards moved to "✅ Done" this week
Calculate story points completed (if using custom fields)
Create card "Sprint Velocity - Week {week-number}" in "📚 Documentation"
Add description:
"## Sprint Metrics
- Cards completed: {cards-completed}
- Story points: {story-points-completed}
- Team velocity: {velocity-trend}
- Cycle time average: {average-cycle-time}

## Trends
- Velocity vs last week: {velocity-comparison}
- Quality metrics: {quality-percentage}
- Blocker frequency: {blocker-count}"
```

**Rule: Sprint Goal Tracking**
```
When a card with label "Sprint Goal" is moved to "✅ Done"
Add comment "🎯 Sprint goal achieved: {cardname}"
Calculate percentage of sprint goals completed
If all sprint goals complete, create celebration card "Sprint Goals Achieved! 🎉"
```

### 14. Resource Planning

**Rule: Skill-Based Assignment**
```
When a card is created with label "Backend"
If @backend-expert has fewer than 3 active cards, assign @backend-expert
Otherwise, assign @backend-junior and add @backend-expert as reviewer

When a card is created with label "Frontend"
If @frontend-expert has fewer than 3 active cards, assign @frontend-expert
Otherwise, assign @frontend-junior and add @frontend-expert as reviewer
```

**Rule: Cross-Training Opportunities**
```
When a card with label "Learning Opportunity" is created
Add member who requested cross-training
Add member who is the subject matter expert
Add comment "🎓 Cross-training opportunity: {expert} will mentor {learner}"
Create checklist "Cross-Training Plan" with items:
- [ ] Knowledge transfer session scheduled
- [ ] Documentation reviewed
- [ ] Hands-on practice completed
- [ ] Competency assessment passed
```

---

## Documentation Rules

### 15. Automated Documentation

**Rule: API Documentation Updates**
```
When a card with label "API" is moved to "✅ Done"
Create card "Update API Documentation: {cardname}" in "📚 Documentation"
Add description "Update API documentation for completed endpoint"
Add checklist:
- [ ] Endpoint documentation updated
- [ ] Request/response examples added
- [ ] Error codes documented
- [ ] Rate limiting information updated
- [ ] Authentication requirements specified
Add member @technical-writer
```

**Rule: Knowledge Base Maintenance**
```
When a card with label "Process Improvement" is moved to "✅ Done"
Create card "Update Knowledge Base: {cardname}" in "📚 Documentation"
Add description "Document process improvement in team knowledge base"
Add checklist:
- [ ] Process change documented
- [ ] Before/after comparison created
- [ ] Team training materials updated
- [ ] Knowledge base article published
```

### 16. Learning and Development

**Rule: Skill Development Tracking**
```
When a card with label "Learning" is created
Add custom field "Skill Level" with options: Beginner, Intermediate, Advanced
Add custom field "Learning Type" with options: Technical, Process, Tool
Create checklist "Learning Plan" with items:
- [ ] Learning objectives defined
- [ ] Resources identified
- [ ] Practice exercises planned
- [ ] Assessment criteria established
- [ ] Knowledge sharing scheduled
```

---

## Emergency Response Rules

### 17. Incident Management

**Rule: Critical Issue Handling**
```
When a card title contains "CRITICAL" or "URGENT" or "PRODUCTION"
Add the "Critical" label
Move the card to list "🔄 In Progress"
Add all team leads as members
Set due date to 4 hours from now
Create card "Incident Response: {cardname}" in "📋 API Planning & Design"
Add comment "🚨 Critical issue detected. All hands on deck."
Send notification to #emergency-response channel
```

**Rule: Incident Resolution Tracking**
```
When a card with label "Critical" is moved to "✅ Done"
Create card "Post-Incident Review: {cardname}" in "📚 Documentation"
Add description "Conduct post-incident review for critical issue"
Add checklist "Post-Incident Analysis" with items:
- [ ] Timeline of events documented
- [ ] Root cause analysis completed
- [ ] Impact assessment finished
- [ ] Prevention measures identified
- [ ] Process improvements implemented
- [ ] Team debrief conducted
Add all team members
Set due date to 3 days from now
```

### 18. Escalation Procedures

**Rule: Automatic Escalation**
```
When a card has been in "🚫 Blocked Items" for more than 2 days
Add comment "⬆️ Escalating blocked item after 2 days"
Add member @team-lead
Add label "Escalated"

When a card has been in "🚫 Blocked Items" for more than 5 days
Add comment "⬆️⬆️ Critical escalation after 5 days"
Add member @project-manager
Add member @department-head
Add label "Critical Escalation"
```

---

## Analytics and Reporting Rules

### 19. Automated Reporting

**Rule: Weekly Team Report**
```
Every Friday at 7:00 PM
Create card "Weekly Team Report - {date}" in "📚 Documentation"
Add description:
"## Team Performance This Week

### Completed Work
{list-cards-completed-this-week}

### In Progress
{list-cards-in-progress}

### Blocked Items
{list-blocked-cards}

### Metrics
- Velocity: {cards-completed} cards
- Average cycle time: {average-cycle-time} days
- Code review turnaround: {average-review-time} hours
- Bug rate: {bugs-found}/{total-cards} = {bug-percentage}%

### Trends
- Velocity trend: {velocity-trend}
- Quality trend: {quality-trend}
- Team satisfaction: {satisfaction-score}

### Next Week Focus
{list-high-priority-cards-for-next-week}"
Add member @project-manager
```

**Rule: Monthly Project Health Report**
```
On the 1st day of every month at 9:00 AM
Create card "Monthly Project Health Report - {month} {year}" in "📚 Documentation"
Add description:
"## Project Health Dashboard

### Overall Progress
- Total cards completed: {total-cards-completed}
- Sprint goals achieved: {sprint-goals-percentage}%
- On-time delivery rate: {on-time-percentage}%

### Quality Metrics
- Bug rate: {monthly-bug-rate}%
- Rework rate: {rework-percentage}%
- Code review efficiency: {review-efficiency}

### Team Performance
- Team velocity: {monthly-velocity}
- Capacity utilization: {capacity-percentage}%
- Cross-training progress: {cross-training-status}

### Risk Assessment
- Current blockers: {active-blockers}
- Resource constraints: {resource-issues}
- Technical debt: {technical-debt-cards}

### Recommendations
{automated-recommendations-based-on-metrics}"
Add member @project-manager
Add member @team-lead
```

### 20. Predictive Analytics

**Rule: Delivery Prediction**
```
Every Monday at 11:00 AM
Calculate remaining work based on current backlog
Estimate completion date based on current velocity
If projected delivery date > target date
Create card "Delivery Risk Alert" in "📋 API Planning & Design"
Add description:
"⚠️ Delivery Risk Identified

Current velocity: {current-velocity} cards/week
Remaining work: {remaining-cards} cards
Projected completion: {projected-date}
Target completion: {target-date}
Risk level: {risk-level}

Recommended actions:
- Consider scope reduction
- Evaluate resource reallocation
- Review process bottlenecks"
Add member @project-manager
```

---

## Implementation Guide

### Setting Up These Rules

**Step 1: Access Butler**
1. Open your Trello board
2. Click "Show menu" → "Butler"
3. Click "Rules" to create new automation rules

**Step 2: Create Rules Systematically**
1. Start with basic workflow rules
2. Add quality assurance rules
3. Implement communication rules
4. Set up reporting and analytics

**Step 3: Test and Refine**
1. Test each rule with sample cards
2. Monitor rule performance
3. Adjust triggers and actions as needed
4. Gather team feedback and iterate

### Best Practices for Butler Rules

**Rule Design Principles:**
- Keep rules simple and focused
- Use clear, descriptive names
- Test thoroughly before deploying
- Document rule purposes and logic
- Review and update rules regularly

**Performance Considerations:**
- Limit the number of active rules
- Avoid overly complex conditions
- Monitor rule execution frequency
- Use specific triggers rather than broad ones

**Team Adoption:**
- Introduce rules gradually
- Explain the purpose of each rule
- Provide training on rule functionality
- Gather feedback and make adjustments

### Troubleshooting Common Issues

**Rules Not Triggering:**
- Check rule conditions and syntax
- Verify board permissions
- Ensure triggers are properly configured
- Review Butler activity log

**Performance Issues:**
- Reduce rule complexity
- Limit rule frequency
- Optimize trigger conditions
- Archive unused rules

**Team Resistance:**
- Explain benefits clearly
- Start with simple, valuable rules
- Involve team in rule design
- Provide adequate training

---

## Conclusion

These advanced Butler automation rules transform your Trello board from a simple task tracker into an intelligent project management system. They automate routine tasks, enforce quality standards, improve team communication, and provide valuable insights into project health and team performance.

**Key Benefits:**
- **Reduced Manual Work:** Automation handles routine tasks
- **Improved Quality:** Automated checks ensure standards are met
- **Better Communication:** Smart notifications keep everyone informed
- **Data-Driven Decisions:** Automated reporting provides insights
- **Consistent Processes:** Rules enforce standardized workflows

**Implementation Success Factors:**
- Start with essential rules and expand gradually
- Involve the team in rule design and refinement
- Monitor rule performance and adjust as needed
- Provide training and support for team adoption
- Regularly review and update rules based on project evolution

With these automation rules in place, your ServiceBook Pros Invoice Management API project will benefit from intelligent workflow management, improved team collaboration, and data-driven project insights that drive success.

