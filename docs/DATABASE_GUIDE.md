# Database Guide — NRG CO-WORKING CRM

## Schema Overview

The database uses SQLite with Prisma ORM. All tables and relationships are defined in `server/prisma/schema.prisma`.

## Entity Relationship Diagram

```
┌────────────┐       ┌────────────┐       ┌─────────────┐
│    User    │       │  Contact   │       │  Pipeline   │
├────────────┤       ├────────────┤       ├─────────────┤
│ id         │──┐    │ id         │──┐    │ id          │
│ email      │  │    │ firstName  │  │    │ name        │
│ name       │  │    │ lastName   │  │    │ description │
│ role       │  │    │ email      │  │    │ isDefault   │
│ avatar     │  │    │ phone      │  │    └──────┬──────┘
│ createdAt  │  │    │ company    │  │           │
└────────────┘  │    │ jobTitle   │  │     ┌─────┴──────┐
       │        │    │ location   │  │     │   Stage    │
       │        │    │ leadSource │  │     ├────────────┤
       │        │    │ lifeStage  │  │     │ id         │
       │        │    │ notes      │  │     │ name       │
       │        │    │ createdAt  │  │     │ position   │
       │        │    │ updatedAt  │  │     │ color      │
       │        │    └─────┬──────┘  │     │ isClosedWon│
       │        │           │          │     │ isClosedLost│
       │        │    ┌──────┴──────┐  │     └─────┬──────┘
       │        │    │    Lead     │  │           │
       │        │    ├────────────┤  │     ┌─────┴──────┐
       │        │    │ id         │  │     │   Deal     │
       │        ├───▶│ leadNumber │  │     ├────────────┤
       │        │    │ status     │  │     │ id         │
       │        │    │ type       │  │     │ dealName   │
       │        │    │ source     │  │     │ amount     │
       │        │    │ company    │  │     │ probability│
       │        │    │ notes      │  │     │ status     │
       │        │    │ contactId  │──┘     │ contactId  │
       │        │    │ createdById│───────▶│ stageId    │────┐
       │        │    └────────────┘       │ pipelineId │    │
       │        │                         │ createdById│    │
       │        │                         └─────┬──────┘    │
       │        │                               │           │
       │        │    ┌────────────┐       ┌─────┴──────┐    │
       │        │    │  Activity  │       │ Notification│   │
       │        └───▶├────────────┤       ├─────────────┤    │
       │             │ id        │       │ id          │    │
       │             │ type      │       │ message     │    │
       │             │ subject   │       │ type        │    │
       │             │ dueDate   │       │ read        │    │
       │             │ completed │       │ createdAt   │    │
       │             │ contactId │────┐  │ userId      │    │
       │             │ leadId    │──┐ │  └─────────────┘    │
       │             │ dealId    │──┘ │                      │
       │             │ createdById│────┘                      │
       │             └────────────┘                          │
       └──────────────────────────────────────────────────────┘
```

## Table Descriptions

### User
Stores application users. Currently minimal (admin user for seeding).

| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| email | String | Unique |
| name | String | Full name |
| role | String | "user" or "admin" |
| avatar | String? | Profile image URL |
| createdAt | DateTime | Auto-set |

### Contact
Central entity for people/organizations. Connected to leads, deals, and activities.

| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| firstName, lastName | String | Required |
| email | String | Unique, duplicate prevention |
| phone | String? | Optional |
| company | String? | Organization name |
| jobTitle | String? | Role in organization |
| location | String? | City/region |
| leadSource | String | Source of lead |
| lifecycleStage | String | lead/mql/sql/customer |
| notes | String? | Free text |
| createdAt | DateTime | Auto-set |
| updatedAt | DateTime | Auto-updated |
| lastActivityAt | DateTime | Updated on activity |

### Lead
Tracks potential customers through qualification stages.

| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| leadNumber | String | Unique, e.g., "LEAD-ABC123" |
| status | String | new/attempting/connected/qualified/disqualified/converted |
| type | String | mql/sql/deal |
| source | String | google_ads/meta_ads/website/inbound_call/referral/manual |
| company | String? | Company name |
| companySize | String? | e.g., "1-10", "11-50" |
| industry | String? | Industry vertical |
| website | String? | Company website |
| notes | String? | Lead notes |
| qualificationNotes | String? | Sales qualification notes |
| nextFollowUp | DateTime? | Scheduled follow-up |
| expectedValue | Float? | Potential deal value |
| contactId | Int? | FK → Contact |
| createdById | Int | FK → User |

### Pipeline
Represents a sales pipeline (e.g., "Default Sales Pipeline").

| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| name | String | Pipeline name |
| description | String? | Optional description |
| isDefault | Boolean | Default pipeline flag |
| createdAt | DateTime | Auto-set |

### Stage
Individual stages within a pipeline.

| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| name | String | Stage name |
| position | Int | Order in pipeline |
| color | String | Hex color for display |
| isClosedWon | Boolean | Marks won stage |
| isClosedLost | Boolean | Marks lost stage |
| pipelineId | Int | FK → Pipeline |

### Deal
Sales opportunities tied to contacts and pipeline stages.

| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| dealName | String | Deal name |
| amount | Float | Deal value |
| probability | Int | 0-100 win probability |
| expectedCloseDate | DateTime? | Target close |
| actualCloseDate | DateTime? | When actually closed |
| status | String | open/won/lost |
| lostReason | String? | If status=lost |
| notes | String? | Deal notes |
| contactId | Int | FK → Contact |
| stageId | Int | FK → Stage |
| pipelineId | Int | FK → Pipeline |
| createdById | Int | FK → User |

### Activity
Tracks all interactions and tasks.

| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| type | String | call/email/meeting/note/task |
| subject | String | Activity title |
| description | String? | Details |
| dueDate | DateTime? | Scheduled time |
| completed | Boolean | Completion flag |
| priority | String | low/medium/high |
| contactId | Int? | Optional FK → Contact |
| leadId | Int? | Optional FK → Lead |
| dealId | Int? | Optional FK → Deal |
| createdById | Int | FK → User |

### Notification
User notifications (stored, not actively rendered in frontend).

| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| message | String | Notification text |
| type | String | info/success/warning/error |
| read | Boolean | Read status |
| createdAt | DateTime | Timestamp |
| userId | Int | FK → User |

## Migrations

Schema changes are applied via:
```bash
npx prisma db push --schema server/prisma/schema.prisma
```

This is development-mode migration (no migration files). For production, use:
```bash
npx prisma migrate dev --name description
```

## Seeding

```bash
npm run db:seed
# or
node server/prisma/seed.js
```

Creates: 1 admin user, 8 contacts, 8 leads, 7 deals, 1 pipeline with 7 stages, 7 activities.
