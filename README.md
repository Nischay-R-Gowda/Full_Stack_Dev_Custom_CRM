# NRG Co-working CRM

A full-stack CRM course project for managing coworking enquiries, contacts, follow-ups, and deals for NRG Co-working in Bengaluru.

## Features

- **Dashboard** — CRM totals, lead activity over time, lead-source pie chart, recent deals, and seat demand by neighbourhood.
- **Contacts** — Create, edit, search, and filter contact records; view email, company, source, and creation date.
- **Leads** — Track MQL and SQL enquiries, record coworking locality, seats, budget, and duration, and sort or filter the lead list.
- **Deals & Pipeline** — Track deal amounts, stages, expected close dates, and actual close dates when marked Closed Won or Closed Lost.
- **Pipelines** — Manage pipelines and their stages.
- **Lead Sources** — Demo buttons simulate enquiries from Google Ads, Meta Ads, a website form, and inbound calls. They do not connect to those services.
- **Activities & Follow-ups** — A demo page for calls, meetings, tasks, notes, and follow-up dates. Some activity controls may not behave as expected; email entries are logs and do not send email. The page displays a lighthearted demo notice.
- **Workflow and automation** — Placeholder page reserved for further development.
- **Settings** — Choose a default CRM page, turn on compact table rows, download a JSON backup, and set theme, display name, currency, and date format.
- **Reports** — Review CRM summaries and export report data.

## Demo limitations

This is a single-user university project and has no login or authentication. Lead-source actions are simulations. Email activities are not sent. Activity actions may be incomplete. The backup downloads JSON data, but the app does not currently restore from that file. Do not expose this demo server publicly.

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 8, Tailwind CSS 4 |
| Charts and icons | Recharts, Lucide React |
| Backend | Node.js, Express |
| Database | SQLite with Prisma |
| Routing | React Router DOM |

The HTML entry point is the root index.html. React routes and page components are in src.

## Quick start

From the project root:

1. Install dependencies with npm install.
2. Make sure the root .env file contains this database setting:

   DATABASE_URL="file:./server/prisma/dev.db"

3. Create or update the local database with npm run db:push.
4. Load the sample CRM records with npm run db:seed.
5. Start the backend and frontend together with npm run dev:all.
6. Open http://localhost:5173 in your browser.

The backend API runs on port 5000 and the Vite development server runs on port 5173.

## Demo walkthrough

1. Open the CRM dashboard to review the current lead, deal, and source summaries.
2. Use Lead Sources to simulate an enquiry.
3. Open Leads to qualify an enquiry and add coworking requirements such as locality, seats, budget, and duration.
4. Create or review a deal in Deals & Pipeline and move it through the available stages.
5. Open Activities & Follow-ups to see the demo follow-up layout and its current limitations.
6. Open Workflow and automation to see the placeholder for planned development.

## Project structure

- index.html — Vite HTML entry point.
- public — Static assets, including the NRG mark and workspace illustration.
- src/App.jsx and src/main.jsx — React application routes and entry point.
- src/components — Dashboard, contacts, leads, deals, pipelines, workflow, sources, activities, reports, settings, shared UI, and layout components.
- src/services — Frontend API client.
- src/utils — Shared constants, formatting, and browser-stored preferences.
- server/server.js — Express API server.
- server/routes and server/controllers — API routes and application logic.
- server/prisma/schema.prisma — Database schema.
- server/prisma/seed.js — Sample data for the demo.
- docs — Project documentation and learning materials.

## Useful commands

| Command | Purpose |
| --- | --- |
| npm run dev | Start the Vite frontend |
| npm run server | Start the Express backend |
| npm run dev:all | Start both services together |
| npm run build | Build the frontend for production |
| npm run lint | Run ESLint |
| npm run check:routes | Check frontend API calls against server routes |
| npm run db:push | Apply the Prisma schema to the SQLite database |
| npm run db:seed | Load sample data |
| npm run db:studio | Open Prisma Studio |

## License

University semester project — NRG Co-working CRM.