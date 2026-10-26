# Architecture Guide — NRG CO-WORKING CRM

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser (Client)                  │
│  ┌───────────────────────────────────────────────┐  │
│  │  React 19 + Vite 8 + Tailwind CSS 4           │  │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────────────┐ │  │
│  │  │ Pages   │ │ UI      │ │ Services        │ │  │
│  │  │ (Router)│ │ Components│ │ (API Client)    │ │  │
│  │  └────┬────┘ └─────────┘ └───────┬─────────┘ │  │
│  │       └──────────┬───────────────┘            │  │
│  │                  │ fetch()                     │  │
│  └──────────────────┼────────────────────────────┘  │
└────────────────────┼────────────────────────────────┘
                     │ HTTP/REST (localhost:5000)
┌────────────────────┼────────────────────────────────┐
│                    ▼                                 │
│  ┌───────────────────────────────────────────────┐  │
│  │  Express.js Server (server/server.js)         │  │
│  │  ┌─────────────────────────────────────────┐  │  │
│  │  │  Route Handlers (routes/*.js)           │  │  │
│  │  │  → Controllers (controllers/*.js)       │  │  │
│  │  │  → Prisma Client                        │  │  │
│  │  └─────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────┘  │
│                    │                                 │
│  ┌───────────────────────────────────────────────┐  │
│  │  SQLite Database (server/prisma/dev.db)       │  │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │  │
│  │  │User  │ │Contact│ │ Lead │ │ Deal │ ...   │  │
│  │  └──────┘ └──────┘ └──────┘ └──────┘       │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Hierarchy
```
App
├── BrowserRouter
│   └── Routes
│       ├── / → AppShell + Dashboard
│       ├── /contacts → AppShell + Contacts
│       ├── /leads → AppShell + Leads
│       ├── /deals → AppShell + Deals
│       ├── /pipelines → AppShell + Pipelines
│       ├── /sources → AppShell + Sources
│       ├── /activities → AppShell + Activities
│       ├── /reports → AppShell + Reports
│       └── * → AppShell + NotFound

AppShell
├── Sidebar (navigation)
├── Header (breadcrumbs, search, profile)
└── <main> (page content)
```

### Data Flow
1. User interacts with a component → triggers state update
2. Component calls API function from `src/services/api.js`
3. API function makes `fetch()` request to Express backend
4. Backend route handler calls controller
5. Controller uses Prisma Client to query/update database
6. Response flows back through the same chain
7. Component updates its state → re-renders with new data

### State Management
- Local component state with `useState`
- `useEffect` for data loading
- No global state management (Redux/Zustand) for simplicity
- Prop drilling for component communication

## Backend Architecture

### Express Route Pattern
```
routes/*.js → Express Router
  ├── GET / → List all (with query params for filtering)
  ├── GET /:id → Get one
  ├── POST / → Create
  ├── PUT /:id → Update
  └── DELETE /:id → Delete
```

### Error Handling
- Try/catch in every async route handler
- HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 404 (Not Found), 500 (Server Error)
- Consistent error response format: `{ error: "message" }`

## Database Architecture

### Prisma Workflow
1. Define schema in `server/prisma/schema.prisma`
2. Run `npx prisma db push` to create/update SQLite database
3. Prisma auto-generates `@prisma/client`
4. Controllers use Prisma Client for type-safe queries

### Relationships
- Contact 1→N Lead, Deal, Activity
- User 1→N Lead, Deal, Activity
- Pipeline 1→N Stage, Deal
- Stage 1→N Deal
- Deal 1→N Activity
