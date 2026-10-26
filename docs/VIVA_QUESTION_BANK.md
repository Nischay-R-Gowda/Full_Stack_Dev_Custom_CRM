# Viva Question Bank - NRG CO-WORKING CRM

## 100+ Questions with Answers

### General / Introduction

**Q1. What is NRG CO-WORKING CRM?**
A: NRG CO-WORKING CRM is a full-stack Customer Relationship Management web application. It helps businesses manage contacts, leads, deals, and sales pipelines. It's built with React (frontend), Express.js (backend), and SQLite with Prisma ORM (database).

**Q2. What problem does this CRM solve?**
A: It helps small and medium businesses track leads, manage contacts, and visualize their sales pipeline. Instead of using spreadsheets or multiple disconnected tools, everything is in one place.

**Q3. What technologies did you use and why?**
A:
- React — For building a dynamic, component-based UI with efficient re-rendering
- Vite — Fast build tool with hot module replacement during development
- Tailwind CSS — Utility-first CSS framework for rapid, consistent styling
- Recharts — React charting library for dashboard visualizations
- Lucide React — Clean, consistent icon library
- Express.js — Minimal, flexible Node.js backend framework
- Prisma ORM — Type-safe database access with auto-generated queries
- SQLite — Zero-configuration file-based database, perfect for development

### HTML/CSS/Tailwind

**Q4. What is JSX?**
A: JSX is a syntax extension for JavaScript that lets you write HTML-like code inside JavaScript files. For example: `<div className="card"><h2>{title}</h2></div>`. It gets compiled to `React.createElement()` calls.

**Q5. Why use className instead of class in JSX?**
A: Because `class` is a reserved keyword in JavaScript. JSX uses `className` which maps to the HTML `class` attribute.

**Q6. What is Tailwind CSS?**
A: Tailwind CSS is a utility-first CSS framework. Instead of writing custom CSS classes, you compose designs using pre-built utility classes like `flex`, `p-4`, `text-lg`, `bg-blue-500`. This ensures consistency and speeds up development.

**Q7. How does the CSS work in this project?**
A: We use Tailwind CSS v4 with the Vite plugin. Custom design tokens (colors like `primary-500`, `surface-800`) are defined in `index.css` using CSS custom properties. Tailwind generates utility classes from these tokens.

**Q8. What is the difference between px, py, gap, and space?**
A:
- `px-4` = padding-left + padding-right = 16px
- `py-4` = padding-top + padding-bottom = 16px
- `gap-4` = space between flex/grid items = 16px
- `space-y-4` = vertical space between direct children

**Q9. How does the responsive design work?**
A: Using Tailwind's responsive prefixes:
- `sm:` applies at 640px+
- `md:` applies at 768px+
- `lg:` applies at 1024px+
Example: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4` means 1 column on mobile, 2 on tablet, 4 on desktop.

### JavaScript

**Q10. What are arrow functions?**
A: Arrow functions are a shorter syntax for writing functions in ES6: `const add = (a, b) => a + b`. They also inherit `this` from the enclosing scope. Used throughout the project for callbacks and component definitions.

**Q11. What is destructuring?**
A: Destructuring extracts values from arrays or objects into variables. Example: `const [contacts, setContacts] = useState([])` extracts the state value and setter. `const { name, email } = contact` extracts properties from an object.

**Q12. What is the spread operator?**
A: The spread operator (`...`) expands an array or object. Used to merge objects: `{ ...form, firstName: 'New' }` creates a new object with all of form's properties plus a changed firstName.

**Q13. What are template literals?**
A: Template literals use backticks (`` ` ``) and allow embedded expressions with `${}`. Example: `` `Hello, ${name}!` ``. Also supports multi-line strings.

**Q14. What are promises and async/await?**
A: Promises represent async operations. `async/await` is syntactic sugar for working with promises. Example:
```js
async function load() {
  const data = await api.getDashboard() // waits for response
  setData(data)
}
```

**Q15. What is the fetch API?**
A: The `fetch()` API makes HTTP requests. It returns a Promise that resolves to a Response object. We use it in `src/services/api.js` to communicate with the backend:
```js
const response = await fetch('/api/contacts')
const data = await response.json()
```

**Q16. How does error handling work in this app?**
A: We use try/catch blocks around all async operations. API errors are caught and displayed to users via error messages or toast notifications. Backend errors return `{ error: "message" }` with appropriate HTTP status codes.

### React

**Q17. What is React?**
A: React is a JavaScript library for building user interfaces using components. It uses a virtual DOM for efficient updates and follows a declarative programming model.

**Q18. What are React components?**
A: Components are reusable pieces of UI. In this project, we use functional components — JavaScript functions that return JSX. Examples: `Dashboard`, `Contacts`, `Button`, `Card`.

**Q19. What are props?**
A: Props (properties) are how data flows from parent to child components. Example: `<Card title="Total Leads" value={42} icon={Users} />` passes title, value, and icon to the Card component.

**Q20. What is JSX?** (See Q4)
A: JSX is a syntax extension that allows writing HTML-like code in JavaScript. It's compiled to React.createElement() calls.

**Q21. What is state in React?**
A: State is a component's internal memory. When state changes, React re-renders the component. We use `useState` hook: `const [contacts, setContacts] = useState([])`.

**Q22. What is the useState hook?**
A: `useState` is a React hook that adds state to functional components. It returns an array: `[currentValue, setterFunction]`. Calling the setter triggers a re-render.

**Q23. What is the useEffect hook?**
A: `useEffect` lets you perform side effects in components (data fetching, subscriptions, DOM manipulation). It runs after every render by default. With a dependency array, it runs only when those dependencies change.

**Q24. What is the dependency array in useEffect?**
A: The second argument to useEffect. `useEffect(() => {...}, [dep1, dep2])` means the effect runs only when dep1 or dep2 changes. Empty array `[]` means run once (on mount).

**Q25. What is conditional rendering?**
A: Showing different UI based on conditions. Examples:
- Ternary: `{loading ? <Spinner /> : <Content />}`
- Short-circuit: `{error && <Error />}`
- If/else inside JSX

**Q26. What is the key prop in lists?**
A: The `key` prop helps React identify which items changed, were added, or removed. It should be a unique, stable identifier (like an ID). Example: `{items.map(item => <li key={item.id}>...</li>)}`.

**Q27. What are controlled components?**
A: Form inputs whose values are controlled by React state. The value comes from state, and changes are handled by an onChange handler. Example: `<input value={form.name} onChange={e => setForm({...form, name: e.target.value})} />`.

**Q28. What is React Router?**
A: React Router is a library for handling navigation in React apps. It maps URL paths to components. In this app, it maps `/`, `/contacts`, `/leads`, etc. to their respective page components.

**Q29. What is the difference between BrowserRouter and HashRouter?**
A: BrowserRouter uses the HTML5 History API (clean URLs like `/contacts`). HashRouter uses URL hashes (`/#/contacts`). We use BrowserRouter because the server is configured to serve the app for all routes.

### Project-Specific

**Q30. What is the application structure?**
A:
- `src/components/` — Reusable UI and page components
- `src/services/api.js` — Centralized API client
- `src/utils/constants.js` — Constants, formatters, helper functions
- `server/` — Express.js backend with routes and controllers
- `server/prisma/` — Prisma schema and seed data
- `docs/` — Documentation

**Q31. How does data flow from the database to the Dashboard?**
A: 1. Dashboard component mounts, calls `api.getDashboard()`
2. api.js makes `fetch('/api/dashboard')`
3. Express route handler receives the request
4. Dashboard controller runs multiple Prisma queries (counts, aggregates, groupBys)
5. Controller returns compiled metrics
6. Route sends JSON response
7. Dashboard component receives data, updates state
8. React re-renders with new KPI values and chart data

**Q32. How many API endpoints are there?**
A: Approximately 25+ endpoints across 8 route groups (contacts, leads, deals, pipelines, dashboard, activities, sources, reports) plus health check.

**Q33. What is Prisma and why use it?**
A: Prisma is an ORM (Object-Relational Mapping) tool. It converts TypeScript/JavaScript code into database queries. Benefits: type-safe queries, auto-completion, migrations, and a clean data model definition language.

**Q34. How does the lead qualification workflow work?**
A: A lead starts as MQL (Marketing Qualified Lead). When the sales team qualifies it, they use the qualify endpoint:
1. Set type to 'sql' (Sales Qualified Lead)
2. Optionally provide contact details (creates contact if not exists)
3. The lead's status updates to 'qualified'
4. When ready to become a deal, type changes to 'deal' and status to 'converted'

**Q35. How are duplicate contacts prevented?**
A: The Contact model has a unique constraint on the email field. When creating or updating, the controller checks for existing emails and returns an error if a duplicate is found.

**Q36. How does the Kanban pipeline work?**
A: The Deals page groups deals by pipeline stage. Each stage is a column showing stage name, deal count, and total value. Users move deals by clicking "Next" or "Back" buttons, which calls the stage movement API.

**Q37. What are lead sources and why are they simulated?**
A: Lead sources represent where leads come from (Google Ads, Meta Ads, Website, Calls). They're simulated because real integrations require API keys, accounts, webhooks, and complex authentication — beyond a semester project scope. The simulation creates realistic-looking data.

**Q38. How does the sidebar know which page is active?**
A: Using React Router's `useLocation()` hook. Each NavLink checks if the current pathname matches its path and applies an `active` class (primary background color).

**Q39. What is the design system?**
A: A consistent set of colors (primary indigo, neutral surfaces), spacing scale, border radii, shadows, and typography defined in Tailwind config. All components use these tokens for visual consistency.

**Q40. How does the search work in Contacts/Leads?**
A: The search input's value is stored in React state. It's passed as a query parameter to the API (`?search=...`). The backend uses Prisma's `contains` filter to match against relevant fields (name, email, company, lead number).

### Backend

**Q41. What is Express.js?**
A: Express.js is a minimalist web framework for Node.js. It provides routing, middleware, and request/response handling. In this project, it serves REST API endpoints that the frontend consumes.

**Q42. What is REST API?**
A: REST (Representational State Transfer) is an architectural style for APIs. It uses HTTP methods (GET, POST, PUT, DELETE) on resource URLs. Our API follows REST: `GET /api/contacts`, `POST /api/contacts`, etc.

**Q43. What is middleware in Express?**
A: Middleware functions that run before route handlers. In our server:
- `cors()` — Allows cross-origin requests from frontend
- `express.json()` — Parses JSON request bodies

**Q44. How does the server handle errors?**
A: Each route handler wraps controller calls in try/catch. Errors are caught and sent as JSON with appropriate HTTP status codes (400 for bad requests, 404 for not found, 500 for server errors).

**Q45. What is Prisma Client?**
A: The auto-generated query builder from the Prisma schema. It provides type-safe methods like `prisma.contact.findMany()`, `prisma.lead.create()`, etc.

**Q46. What are Prisma relations?**
A: Defined in the schema with `@relation` attributes. Examples:
- Contact has many Leads (`contactId` foreign key)
- Deal belongs to Contact, Stage, Pipeline (three foreign keys)
- Activity optionally belongs to Contact, Lead, or Deal

**Q47. What is Prisma seeding?**
A: The `seed.js` file populates the database with sample data. It creates users, contacts, leads, deals, pipeline stages, and activities. Run with `node server/prisma/seed.js`.

**Q48. How does the database persist data?**
A: SQLite stores all data in a single file (`server/prisma/dev.db`). This file persists between server restarts. All CRUD operations through Prisma are written to this file.

**Q49. What HTTP status codes does the API use?**
A:
- 200: Successful GET/PUT/DELETE
- 201: Successful POST (resource created)
- 400: Bad request (validation errors)
- 404: Resource not found
- 500: Server error

**Q50. What is CORS and why is it needed?**
A: CORS (Cross-Origin Resource Sharing) allows the frontend (port 5173) to make requests to the backend (port 5000). Browsers block cross-origin requests by default. The `cors()` middleware adds appropriate headers.

### Database

**Q51. What is SQLite?**
A: SQLite is a file-based relational database. It doesn't require a server — the database is a single file. Perfect for development and small applications.

**Q52. What is an ERD (Entity Relationship Diagram)?**
A: A diagram showing database tables and their relationships. In NRG CO-WORKING CRM: User→Lead, Contact→Lead/Deal/Activity, Pipeline→Stage→Deal, etc.

**Q53. What are foreign keys?**
A: A foreign key is a column that references a primary key in another table. Example: `deal.contactId` references `contact.id`. This creates relationships between tables.

**Q54. What is a unique constraint?**
A: A database constraint ensuring a field's value is unique across all rows. Example: `email` on Contact has `@unique`, preventing duplicate emails.

**Q55. What is ON DELETE CASCADE?**
A: A foreign key behavior where deleting a parent record also deletes child records. Example: Deleting a Pipeline cascades to delete its Stages.

**Q56. What is ON DELETE SET NULL?**
A: A foreign key behavior where deleting a parent record sets the child's foreign key to NULL. Example: Deleting a Contact sets `lead.contactId` to NULL (lead still exists but loses its contact).

**Q57. What is Prisma's db push?**
A: A development command that creates/updates the database schema to match the Prisma schema definition. Unlike migrations, it doesn't create migration history files.

### CRM Concepts

**Q58. What is MQL?**
A: MQL stands for Marketing Qualified Lead. A lead that has shown interest through marketing efforts (ads, website visits, downloads) but hasn't been verified by sales.

**Q59. What is SQL?**
A: SQL stands for Sales Qualified Lead. A lead that the sales team has verified as having genuine interest, budget, and authority to purchase.

**Q60. What is a sales pipeline?**
A: A visual representation of where deals are in the sales process. Stages typically progress from "New Opportunity" through "Negotiation" to "Closed Won/Lost".

**Q61. What is lead scoring?**
A: A methodology to rank leads based on their likelihood to convert. Not fully implemented in this MVP, but the qualification system is the foundation.

**Q62. What is conversion rate?**
A: The percentage of leads that become customers. In NRG CO-WORKING CRM: `(converted leads / total leads) * 100`.

**Q63. What is pipeline value?**
A: The total monetary value of all open (not yet won or lost) deals in the pipeline. Used for sales forecasting.

**Q64. What is the difference between a contact and a lead?**
A: A contact is a person/company record (email, phone, etc.). A lead is a potential customer that goes through a qualification process. One contact can have multiple leads over time.

### Code Quality

**Q65. What coding conventions does the project follow?**
A:
- camelCase for variables and functions
- PascalCase for components
- Descriptive variable names
- Consistent file structure
- Component reusability
- Separation of concerns (routes, controllers, UI)

**Q66. Why use functional components instead of class components?**
A: Functional components are simpler, support hooks, and are the modern React standard. They require less boilerplate code and are easier to test.

**Q67. What is component composition?**
A: Building complex UIs by combining smaller components. Example: `AppShell` wraps every page with `Sidebar` + `Header` + content area.

**Q68. Why keep API logic separate from UI?**
A: Separation of concerns makes the codebase maintainable. If the API endpoint changes, only `src/services/api.js` needs updating — not every component that uses it.

### Challenges

**Q69. What challenges did you face?**
A:
1. Prisma v8 RC configuration complexity — resolved by using stable Prisma v6
2. Import path consistency across component directories
3. Designing a scalable but simple state management approach
4. Making the UI look professional without a design system library

**Q70. How did you handle the Prisma version issues?**
A: Initially installed Prisma v8 RC which requires a new config format. Downgraded to Prisma v6.8.0 which uses the familiar `schema.prisma` with `url` in datasource.

**Q71. What was the hardest feature to implement?**
A: The qualification workflow — it needed to handle contact creation/linking, status changes, and type transitions while maintaining data consistency.

**Q72. How would you scale this application?**
A: 1. Add authentication and authorization
2. Migrate from SQLite to PostgreSQL
3. Add pagination for large datasets
4. Implement proper state management (Redux/Zustand)
5. Add comprehensive testing (Jest, React Testing Library)
6. Containerize with Docker

### Extras

**Q73. What is the purpose of the `key` prop in React lists?**
A: The `key` prop helps React identify which list items changed, were added, or removed. Without keys, React may re-render the entire list, causing performance issues and bugs.

**Q74. What is the virtual DOM?**
A: React maintains a lightweight copy of the actual DOM in memory. When state changes, React updates the virtual DOM first, compares it with the previous version (diffing), and only updates the actual DOM where changes occurred.

**Q75. What is hot module replacement (HMR)?**
A: A Vite feature that updates modules in the running application without a full page reload. When you edit a component, the change appears instantly while preserving the current application state.

**Q76. What is the difference between npm and npx?**
A: `npm` installs packages from npm registry. `npx` executes packages without installing them globally. We use `npx prisma` to run the Prisma CLI without globally installing it.

**Q77. What is a package.json file?**
A: A manifest file for Node.js projects. It lists project metadata, dependencies, and scripts. Our `package.json` defines 8 scripts (dev, server, build, etc.) and all package dependencies.

**Q78. What is Vite?**
A: A modern build tool for web projects. It provides instant server start, lightning-fast hot module replacement, and optimized production builds. Uses Rollup under the hood for production bundling.

**Q79. What is a hook in React?**
A: Hooks are functions that let you use React features (state, lifecycle, context) in functional components. Examples: `useState` (adds state), `useEffect` (adds side effects).

**Q80. What is the difference between controlled and uncontrolled components?**
A: Controlled: React state controls the input value (`<input value={x} onChange={...} />`). Uncontrolled: DOM controls the value (using refs). We use controlled components for form validation.

**Q81. What is a promise in JavaScript?**
A: A Promise represents a value that may be available now, later, or never. It has three states: pending, fulfilled, or rejected. Used for async operations like API calls.

**Q82. What is the event loop?**
A: JavaScript's mechanism for handling async operations. It monitors the call stack and callback queue, executing queued callbacks when the stack is empty.

**Q83. What is JSON?**
A: JavaScript Object Notation — a lightweight data interchange format. All API requests and responses use JSON: `{ "firstName": "Rajesh", "email": "rajesh@example.com" }`.

**Q84. What is CORS?** (See Q50)

**Q85. What is REST?** (See Q42)

**Q86. What is a singleton pattern in Prisma?**
A: Prisma Client is designed to be a singleton — one instance per application. Creating multiple instances can cause connection pool exhaustion. Our server creates one `new PrismaClient()` at the top level.

**Q87. What is the difference between PUT and PATCH?**
A: PUT replaces an entire resource. PATCH partially updates a resource. We use PUT for full updates (edit contact form) and PATCH for partial updates (just changing deal stage).

**Q88. What is a foreign key constraint violation?**
A: An error that occurs when you try to create a record with a foreign key that doesn't exist in the referenced table. For example, creating a deal with a `stageId` that doesn't exist.

**Q89. What is Prisma's upsert?**
A: An operation that updates a record if it exists, or creates it if it doesn't. Used in simulated lead sources: `prisma.contact.upsert({ where: { email }, update: {}, create: {...} })`.

**Q90. What is SQLite good for?**
A: Development environments, testing, embedded applications, small projects. It requires zero configuration — just a file. Not ideal for high-concurrency production workloads.

**Q91. What is the purpose of the seed file?**
A: To populate the database with realistic sample data so the application can be demonstrated immediately without manual data entry.

**Q92. How many contacts, leads, and deals are seeded?**
A: 8 contacts, 8 leads, 7 deals, 1 pipeline with 7 stages, and 7 activities.

**Q93. What is a KPI?**
A: Key Performance Indicator — a measurable value that demonstrates how effectively objectives are being achieved. In our dashboard: total contacts, leads, MQLs, SQLs, pipeline value, conversion rate.

**Q94. What is Recharts?**
A: A composable charting library built on D3. Used for our dashboard charts: LineChart (lead acquisition), PieChart (source distribution), BarChart (status distribution).

**Q95. What is the purpose of react-hot-toast?**
A: Provides toast notifications for user feedback. Used for success/error messages when creating leads, simulating sources, etc.

**Q96. What is responsive design?**
A: Designing web pages that adapt to different screen sizes. In our app: sidebar collapses, grids reflow from 4 columns to 1, tables become scrollable.

**Q97. What are webhooks?**
A: HTTP callbacks triggered by events. Not implemented, but would be used for real lead source integrations (e.g., Google Ads webhook fires when someone submits a form).

**Q98. What is the difference between SQL and NoSQL?**
A: SQL databases (like SQLite) use structured tables with predefined schemas and relationships. NoSQL databases (like MongoDB) use flexible, document-based storage. We chose SQL for its relational nature (contacts → leads → deals).

**Q99. What is an API client?**
A: A centralized module (`src/services/api.js`) that wraps all API calls. It handles base URL, JSON serialization, and error formatting. Components import from this file rather than making raw fetch calls.

**Q100. What would you improve if you had more time?**
A: Authentication, drag-and-drop pipeline, email integration, pagination, testing suite, better error boundaries, mobile optimization, dark mode, real-time updates with WebSockets.

**Q101. Is NRG CO-WORKING CRM production-ready?**
A: No. It lacks authentication, proper error boundaries, comprehensive testing, pagination, and production-grade infrastructure. It's a solid semester MVP that demonstrates full-stack development skills.

**Q102. What did you learn from this project?**
A: Full React component architecture, state management with hooks, REST API design, database modeling with Prisma, responsive CSS with Tailwind, data visualization with Recharts, and end-to-end debugging.


---

## NRG CO-WORKING Specific Questions (Q103-Q124)

**Q103. What is NRG CO-WORKING CRM and who is it for?**
A: It is a HubSpot-style sales CRM purpose-built for NRG, a Bengaluru coworking chain. Sales reps track prospective members from the first enquiry (lead) through MQL/SQL qualification to a booked deal (desks or offices). The app is organised around a public landing page, an "Enter CRM" workspace, contacts, leads, deals, pipelines, activities, reports and settings.

**Q104. Why build a CRM for a coworking business instead of using a generic one?**
A: Coworking sales has domain-specific data - how many seats a prospect wants, which Bengaluru locality they prefer and for how long. A generic CRM forces these into free-text notes; NRG CRM makes them structured, filterable fields (seatsRequired, locality, duration), which powers seat-demand analytics by locality on the dashboard.

**Q105. What are the three new coworking lead fields and how are they stored?**
A: `seatsRequired` (Int?), `locality` (String?) and `duration` (String?) were added to the `Lead` Prisma model as nullable columns and pushed to SQLite with `prisma db push` (additive, no data loss). Nullable so the existing 20+ leads stay valid. Locality is whitelisted against a `LOCALITIES` array (Whitefield, Outer Ring Road, Koramangala, Indiranagar, HSR Layout, Electronic City, Hebbal, MG Road, Jayanagar, Marathahalli, Other) and duration against `DURATIONS` (1 day ... 12 months, Custom) - the server validates both so invalid values never reach the DB.

**Q106. Walk through the "also create a lead" checkbox on the contact form.**
A: When checked on *create* only (not on edit), the contact form exposes lead type (MQL default / SQL), source, seats, locality and duration. On submit the frontend attaches a `createLead` payload. The backend `createContact` inserts the contact, then - only if `createLead.enabled` - creates exactly one `Lead` linked by `contactId`, with status `new` for MQL or `qualified` for SQL. For SQL it also resolves the pipeline first open stage and creates exactly one deal via a dedup guard.

**Q107. What happens if the lead type is SQL in that sub-form?**
A: The lead is created with `type: 'sql'`, `status: 'qualified'`, and a deal is automatically created in the pipeline first non-closed stage so the pipeline immediately shows the open opportunity. A toast confirms "deal added to pipeline".

**Q108. How does the SQL-to-deal rule stay safe when called repeatedly?**
A: `Deal.leadId` is a `@unique` column. `qualifyLead` first runs `prisma.deal.findFirst({ where: { leadId } })` and returns that existing deal if found; only when none exists does it create one. So re-qualifying the same lead any number of times creates exactly one deal - the constraint is enforced both in code and by the database.

**Q109. What is the readiness gate before qualifying a lead?**
A: `GET /api/leads/:id/readiness` returns `{ ready, missing[] }` where missing lists any of seatsRequired/locality/duration that are still null, and ready is true when the status is qualified/converted or all three fields are present. The UI shows "Qualify (N fields missing)" when incomplete and hides the Qualify button entirely once a lead is qualified, converted or disqualified - so a lead can never be re-qualified blindly.

**Q110. What is the lead lifecycle in this app?**
A: New - Attempting - Connected - Qualified (MQL/SQL) - Converted (Deal) - Closed Won / Closed Lost, with a Disqualified terminal state. Each transition is a deliberate action (status update or qualification), not a side-effect, and the lead id and contactId are preserved throughout so history never forks into a duplicate record.

**Q111. What is the "tour" activity type and why does it exist?**
A: A workspace tour - a sales rep showing a prospect the NRG facility. It was added to the backend `ACTIVITY_TYPES` list (call, email, meeting, tour, note, task) and the frontend `ACTIVITY_TYPES` map with its own MapPin icon and "Workspace tour" label.

**Q112. Why do email activities say "Email logged" instead of "Email sent"?**
A: The app has no mail integration - logging an email is a CRM record, not an outbound send. The label deliberately says "Email logged" so a reviewer cannot mistake the feature for real email delivery. The same rule applies to every simulated action in the demo.

**Q113. What does the Activities page support end to end?**
A: Create, edit, complete/reopen (toggle), and delete; association pickers for contact/lead/deal; a due datetime (`<input type="datetime-local">`, stored as ISO); priority low/medium/high; type filter; free-text search; and Overdue / Upcoming / Completed tabs. Overdue is computed against the current time and refreshed by a 60-second interval.

**Q114. How do display preferences (currency, date format, theme, display name) work without corrupting data?**
A: They are stored under `nrg.*` keys in **localStorage** - presentation only. `formatCurrency`/`formatDateTime` read the setting at render time; the database always stores plain numbers and ISO timestamps. Switching INR to USD changes the symbol, not the amount; switching date format re-renders existing rows without rewriting them.

**Q115. How does dark mode work in Tailwind CSS 4?**
A: `index.css` declares `@custom-variant dark (&:where(.dark, .dark *));` - the class strategy. A `dark` class on `<html>` activates it. `initTheme()` in `main.jsx` reads `nrg.theme` from localStorage *before* React renders (so there is no flash of the wrong theme), and the Settings page toggles the class and persists the value.

**Q116. Explain the Reset All Data feature and its security caveat.**
A: `POST /api/settings/reset` takes a password; the backend validates the exact case-sensitive string `Nischay` *server-side*. On a match it runs one `prisma.$transaction` deleting in FK-safe order (activities, notifications, deals, leads, contacts) while preserving users, pipelines, stages and schema. Wrong password gives HTTP 400 and zero rows touched. This is a demo convenience, **not** security: the endpoint is unauthenticated, so it must never be exposed publicly.

**Q117. Why did the dashboard KPIs show [object Object] before the fix, and how was it fixed?**
A: Prisma `groupBy` with `_count: { _all: true }` returns `{ _count: { _all: n } }`, and the old code rendered `row._count` directly (an object, not the number). The backend metrics layer now maps every groupBy result to plain `{ name, value }`, `{ source, count }` or `{ stageName, count, value }` shapes and a lookup table resolves stage names (no more "Stage 14"). KPI cards and charts consume the plain numbers, and every chart has an empty-state fallback.

**Q118. What does "seat demand by locality" show and how is it computed?**
A: A new dashboard panel: `groupBy` locality over leads, summing `seatsRequired`, so NRG can see which localities want the most desks. Returned as `{ name, seats, leads }` and rendered as a bar chart.

**Q119. How is pipeline value computed and what is excluded?**
A: Open pipeline value is the sum of `amount` over deals whose status is `open`, i.e. not in a Closed Won / Closed Lost stage. Won revenue counts only closed-won deals; **lost value is never treated as revenue** anywhere on the dashboard or in reports.

**Q120. Why are all CRM pages nested under /app with the landing page at / ?**
A: The public landing page (hero, workspace types, "Enter CRM" CTA) is unauthenticated marketing surface; the app itself lives under `/app/*` with Sidebar and Header in a shared `AppShell`. "Enter CRM" navigates to `/app`; "Exit to Landing" navigates back to `/`.

**Q121. What does "Explore Workspaces" on the landing page do?**
A: It smooth-scrolls to the `#workspaces` section on the same page - a real, working anchor, not a dead link. The four cards are Hot Desks, Dedicated Desks, Private Offices and Meeting Rooms.

**Q122. How are dates stored versus displayed throughout the app?**
A: Stored as ISO-8601 timestamps (Prisma `DateTime`); rendered in the browser local timezone. `formatDateTime` produces "19 Oct 2026, 10:35 PM" and honours the user's `nrg.dateFormat` choice (DD/MM/YYYY or DD Mon YYYY). Every list row, detail modal and "Recent Activity" block shows date + time, not date-only.

**Q123. What changed in the Kanban board for deals?**
A: The pipeline filter is coerced with `Number()` so `pipelineFilter=3` matches stage `pipelineId: 3`; stage columns now derive their deal lists from the *actual* `stageId` (no hard-coded counts); columns with zero deals show an empty state; and the backend `moveDealStage` sets `status` (open/won/lost) plus `actualCloseDate` when a deal lands in a closed stage, so a refresh shows the deal in the correct column with the right close date.

**Q124. How was the app tested before you declared it done?**
A: Three layers: (1) a Node E2E harness hitting the live API on port 5000 - 19 checks covering contact+lead+deal creation, idempotent qualification, the readiness endpoint, reset with wrong/correct password, and the tour activity type; (2) a data-integrity harness proving stage moves persist and the stage-deletion guard blocks deletion while deals exist; (3) `npm run build` and `npm run lint` both pass clean, and every route under `/` and `/app/*` was verified to serve. Any test not run is reported as such - nothing is claimed without being executed.

---

## Live Demo Script

A suggested order for walking a reviewer through the app in about 5-7 minutes.

1. **Landing page (`/`)** - open the app; point out the hero, the four workspace types, and the two CTAs. "Enter CRM" takes you to `/app` (the workspace); "Explore Workspaces" scrolls to the sections on the same page.
2. **Dashboard** - real KPI numbers (no `[object Object]`), the seat-demand-by-locality bar chart, and open-deals-by-stage.
3. **Contacts** - create a contact with "Also create a lead" checked as MQL: one lead appears. Repeat with SQL: a lead *and* exactly one deal in the pipeline. Toggle the checkbox off: contact only, no lead.
4. **Leads** - open a lead's detail modal: seats / locality / duration + a full date-and-time timestamp. Use the readiness gate: a lead missing fields shows "Qualify (N missing)"; an already-qualified lead has no Qualify button at all.
5. **Deals & Pipeline** - drag a deal into a Closed Won stage; refresh the page: it stayed, with a close date set. Try deleting a stage that still holds deals: the server refuses.
6. **Activities** - log a "Workspace tour" with a due datetime, complete it, filter by Overdue/Upcoming/Completed. Note that email activities are labelled "Email logged".
7. **Reports** - KPIs are real numbers; export the CSV; notice closed deals are excluded from open pipeline value and lost value is never shown as revenue.
8. **Settings** - flip dark mode (survives a page reload), switch currency INR/USD (only the symbol changes), and demonstrate Reset All Data: wrong password is rejected with data intact, and the correct password is documented as a demo convenience, not real security.
