# Known Limitations — NRG CO-WORKING CRM

## Authentication
- **No authentication or authorization** — All APIs are open. This is documented as a known limitation. Adding auth would require session management (JWT or sessions), protected routes, and user-specific data isolation.

## Lead Source Simulations
- All 4 lead source integrations are **simulated demonstrations**. They do not connect to Google Ads, Meta Ads, website forms, or telephony systems. Real integrations would require OAuth, webhooks, API keys, and third-party SDKs.

## Email/Notifications
- No real email sending. Activities of type "email" are logged records only.
- Notifications table exists in the database but has no frontend display component.

## Data Scale
- No pagination — all records loaded at once. Acceptable for semester demo but not production scale.
- No lazy loading or infinite scroll.
- SQLite is suitable for development but not recommended for production multi-user deployment.

## Deal Movement
- Kanban board uses button-based stage movement (Back/Next). Drag-and-drop was considered but excluded for reliability within the deadline.

## Reporting
- Basic charts only. No date range filtering, no comparison views, no scheduled reports.
- CSV export is minimal — raw data only.

## Search
- Simple substring matching. No full-text search, no fuzzy matching, no search suggestions.

## Import/Export
- No data import (CSV, Excel). Only CSV export for reports.
- No backup/restore functionality.

## Multi-tenancy
- Single-tenant only. No organization/workspace isolation.

## Mobile
- Layout is responsive but not fully optimized for mobile use. CRM workflows are primarily desktop-oriented.

## Audit Logging
- No audit trail of who changed what and when (beyond Prisma's updatedAt timestamps).

## Integrations
- No calendar integration, no email sync, no document storage, no third-party CRM sync.
