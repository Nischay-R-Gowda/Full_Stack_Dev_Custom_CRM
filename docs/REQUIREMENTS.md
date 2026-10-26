# Requirements — NRG CO-WORKING CRM

## Functional Requirements

### FR-1: Dashboard
- Display 8 KPI cards with live data
- Lead acquisition over time chart
- Leads by source pie chart
- Lead status distribution bar chart
- Revenue overview (pipeline/won/lost)
- Recent leads and activities lists

### FR-2: Contacts Management
- Create, read, update, delete contacts
- Search by name, email, company
- Filter by lifecycle stage
- Sort by any field
- Duplicate email prevention
- Contact detail view
- Associated leads, deals, and activities

### FR-3: Leads Management
- Create, read, update, delete leads
- Search by lead number, company, notes
- Filter by status, source, type
- Lead types: MQL, SQL, Deal
- Lead statuses: New, Attempting, Connected, Qualified, Disqualified, Converted
- Contact association (existing or new)
- Qualification workflow
- Notes and follow-up dates

### FR-4: Deals & Pipeline
- Create, read, update, delete deals
- Kanban board by pipeline stages
- Move deals between stages
- Deal name, amount, probability, close date
- Filter by pipeline
- Stage totals and counts

### FR-5: Pipeline Customization
- Create/rename pipelines
- Add/rename/reorder stages
- Configure stage color
- Mark stage as Closed Won/Closed Lost
- Safe stage deletion

### FR-6: Lead Sources
- Simulate 4 lead source types
- Create contact + lead automatically
- Preserve source and timestamp
- Success feedback

### FR-7: Activities
- Create activities (call, email, meeting, note, task)
- Due dates, priority, completion status
- Associate with contact/lead/deal
- Filter by type
- Mark complete

### FR-8: Reports
- Leads by source, status, over time
- Deals by stage
- Pipeline value
- Won/lost distribution
- CSV export

### FR-9: Navigation
- Responsive sidebar
- Active page indication
- Breadcrumbs
- Header with search

## Non-Functional Requirements

### NFR-1: Performance
- Dashboard loads in under 2 seconds
- List pages support pagination-ready structure
- API responses under 500ms

### NFR-2: Persistence
- All data survives page reloads
- SQLite database with Prisma ORM
- Seed data for demonstration

### NFR-3: Design
- Professional SaaS appearance
- Consistent design system
- Responsive (desktop, tablet, mobile)
- Proper loading/error/empty states

### NFR-4: Code Quality
- Readable JavaScript ES6+
- Component reusability
- Separation of concerns
- Consistent naming conventions

## Out of Scope (Semester)
- Real ad/telephony integrations
- Authentication and authorization
- Email sending
- Real-time notifications
- File uploads
- Multi-tenant support
