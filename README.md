# NRG CO-WORKING CRM

A full-stack Customer Relationship Management web application built for a university semester project and designed to evolve into a production-grade CRM product.

## Features

- **Dashboard** — KPI cards, charts (Recharts), lead acquisition trends, revenue overview
- **Contacts** — Full CRUD, search, filter, lifecycle stages, duplicate email prevention
- **Leads** — Lead management with MQL/SQL/Deal status, qualification workflow, contact association
- **Deals & Pipeline** — Kanban-style pipeline view, stage management, deal creation and tracking
- **Pipelines** — Create/edit pipelines, add/rename/reorder stages, safe deletion
- **Lead Sources** — Simulated Google Ads, Meta Ads, Website Form, and Inbound Call integrations
- **Activities** — Call, email, meeting, note, and task tracking with due dates
- **Reports** — Analytics charts with CSV export, live data from application database

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS 4, Recharts, Lucide React |
| Backend | Node.js, Express.js |
| Database | SQLite, Prisma ORM |
| State | React Hooks (useState, useEffect) |
| Routing | React Router DOM 7 |

## Quick Start

```bash
# Install dependencies
npm install

# Set up database
echo "DATABASE_URL=\"file:./server/prisma/dev.db\"" > .env
npx prisma db push --schema server/prisma/schema.prisma
node server/prisma/seed.js

# Start backend (port 5000)
npm run server

# Start frontend (port 5173) — in another terminal
npm run dev
```

Visit `http://localhost:5173` to use the application.

## Project Structure

```
crm-platform/
  src/
    components/
      common/       — NotFound page
      dashboard/    — Dashboard with KPI cards and charts
      contacts/     — Contacts CRUD with search/filter
      leads/        — Leads management with qualification
      deals/        — Kanban pipeline and deal CRUD
      pipelines/    — Pipeline and stage management
      sources/      — Simulated lead source integrations
      activities/   — Activity and follow-up tracking
      reports/      — Analytics and CSV export
      ui/           — Reusable UI components (Button, Card, Badge, Modal, Input)
      layout/       — AppShell, Sidebar, Header
    services/       — API client (api.js)
    utils/          — Constants and helpers
    pages/          — (routed via AppShell)
    App.jsx         — Route configuration
    main.jsx        — Entry point with Router
  server/
    server.js       — Express app entry
    routes/         — REST API route handlers
    controllers/    — Business logic and Prisma operations
    prisma/
      schema.prisma — Database schema
      seed.js       — Sample data
    .env            — DATABASE_URL
  docs/             — Documentation and learning guides
```

## Demo Walkthrough

1. Open the Dashboard → see seeded KPIs and charts
2. Go to **Lead Sources** → click **Simulate Google Ads Lead** → see success toast
3. Go to **Leads** → find the new lead with MQL badge
4. Click the **Qualify** button → select SQL/Deal type, enter contact details
5. Go to **Deals** → create a deal for the lead → move through pipeline stages
6. Go to **Dashboard** → see updated metrics and charts

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run server` | Start Express backend |
| `npm run dev:all` | Start both concurrently |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed with sample data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run lint` | Run ESLint |

## Documentation

See `docs/` for:
- Architecture, database schema, and API reference
- Frontend and JavaScript learning guides
- Testing report and known limitations
- Viva question bank (100+ questions)
- Complete learning guide with code explanations

## License

University semester project — NRG CO-WORKING CRM.
