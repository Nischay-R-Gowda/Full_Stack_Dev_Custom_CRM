# API Reference — NRG CO-WORKING CRM

Base URL: `http://localhost:5000/api`

All endpoints return JSON. Error responses follow the format: `{ "error": "description" }`

## Health
- `GET /health` → `{ "status": "ok" }`

## Contacts

### List Contacts
`GET /contacts?search=&sortBy=createdAt&sortOrder=desc&lifecycleStage=`

Query params:
- `search` (string) — Search in name, email, company
- `sortBy` (string) — Field to sort by
- `sortOrder` (string) — "asc" or "desc"
- `lifecycleStage` (string) — Filter by stage

Response: `Contact[]` (includes leads, deals, activities)

### Get Contact
`GET /contacts/:id`

Response: `Contact | null` (404 if not found)

### Create Contact
`POST /contacts`

Body:
```json
{
  "firstName": "Rajesh",
  "lastName": "Kumar",
  "email": "rajesh@example.com",
  "phone": "+91 9876543210",
  "company": "TechVista",
  "jobTitle": "CTO",
  "location": "Bangalore",
  "leadSource": "google_ads",
  "lifecycleStage": "lead",
  "notes": "Notes here"
}
```

### Update Contact
`PUT /contacts/:id`

Body: Same as create (partial update supported)

### Delete Contact
`DELETE /contacts/:id`

## Leads

### List Leads
`GET /leads?search=&status=&source=&type=`

Query params:
- `search` — Search in leadNumber, company, notes
- `status` — new/attempting/connected/qualified/disqualified/converted
- `source` — google_ads/meta_ads/website/inbound_call/referral/manual
- `type` — mql/sql/deal

### Get Lead
`GET /leads/:id`

### Create Lead
`POST /leads`

Body:
```json
{
  "contactId": 1,
  "createdById": 1,
  "source": "google_ads",
  "type": "mql",
  "company": "TechVista",
  "notes": "Notes",
  "expectedValue": 150000,
  "nextFollowUp": "2026-10-20T00:00:00.000Z"
}
```

### Update Lead
`PUT /leads/:id`

Body: Partial update

### Delete Lead
`DELETE /leads/:id`

### Qualify Lead
`POST /leads/:id/qualify`

Body:
```json
{
  "type": "sql",
  "qualificationNotes": "High budget, decision maker confirmed",
  "contactEmail": "new@example.com",
  "contactFirstName": "John",
  "contactLastName": "Doe"
}
```
If type is sql/deal and contact doesn't exist, creates a new contact.

### Convert Lead
`POST /leads/:id/convert`

Body:
```json
{
  "notes": "Deal notes"
}
```

## Deals

### List Deals
`GET /deals?search=&status=&stageId=&pipelineId=`

### Get Deal
`GET /deals/:id`

### Create Deal
`POST /deals`

Body:
```json
{
  "dealName": "TechVista CRM",
  "amount": 150000,
  "contactId": 1,
  "stageId": 1,
  "pipelineId": 1,
  "createdById": 1,
  "probability": 80,
  "expectedCloseDate": "2026-11-01",
  "notes": "Notes"
}
```

### Update Deal
`PUT /deals/:id`

### Delete Deal
`DELETE /deals/:id`

### Move Deal Stage
`PATCH /deals/:id/stage`

Body:
```json
{ "stageId": 2 }
```
Automatically updates deal status based on stage (won/lost).

## Pipelines

### List Pipelines
`GET /pipelines`

### Get Pipeline
`GET /pipelines/:id`

### Create Pipeline
`POST /pipelines`

Body:
```json
{
  "name": "New Pipeline",
  "description": "Description",
  "isDefault": false,
  "stages": [
    { "name": "Stage 1", "position": 0, "color": "#6366f1" }
  ]
}
```

### Update Pipeline
`PUT /pipelines/:id`

### Delete Pipeline
`DELETE /pipelines/:id` — Fails if deals exist

### Add Stage
`POST /pipelines/:pipelineId/stages`

Body:
```json
{ "name": "New Stage", "color": "#6366f1", "position": 0, "isClosedWon": false, "isClosedLost": false }
```

### Update Stage
`PUT /pipelines/stages/:id`

### Delete Stage
`DELETE /pipelines/stages/:id` — Fails if deals exist

## Dashboard
`GET /dashboard`

Returns aggregated metrics:
```json
{
  "totalContacts": 8,
  "totalLeads": 8,
  "mqlCount": 5,
  "sqlCount": 2,
  "openDeals": 5,
  "openPipelineValue": 555000,
  "closedWonRevenue": 300000,
  "closedLostValue": 60000,
  "leadsBySource": [...],
  "leadsByStatus": [...],
  "dealsByStage": [...],
  "recentLeads": [...],
  "recentActivities": [...],
  "leadsOverTime": [...],
  "conversionRate": { "total": 8, "converted": 1, "rate": 13 }
}
```

## Activities

### List
`GET /activities?contactId=&leadId=&dealId=&type=&completed=`

### Get
`GET /activities/:id`

### Create
`POST /activities`

Body:
```json
{
  "type": "call",
  "subject": "Discovery call",
  "description": "Discussed requirements",
  "dueDate": "2026-10-20",
  "priority": "high",
  "contactId": 1,
  "leadId": null,
  "dealId": null,
  "createdById": 1
}
```

### Update
`PUT /activities/:id`

### Delete
`DELETE /activities/:id`

## Simulated Sources

All return the created Lead with associated Contact.

- `POST /sources/google-ads` — Simulated Google Ads lead
- `POST /sources/meta-ads` — Simulated Meta Ads lead
- `POST /sources/website-form` — Simulated website form lead
- `POST /sources/inbound-call` — Simulated inbound call lead

## Reports
`GET /reports`

Returns:
```json
{
  "leadsBySource": [{"source": "google_ads", "_count": 2}],
  "leadsByStatus": [{"status": "new", "_count": 2}],
  "dealsByStage": [{"stageId": 1, "_count": 3, "_sum": {"amount": 150000}}],
  "wonLost": [{"status": "won", "_count": 1, "_sum": {"amount": 300000}}],
  "monthlyRevenue": [{"month": "2026-10", "revenue": 300000}]
}
```
