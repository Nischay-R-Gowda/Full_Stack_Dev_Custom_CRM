# Frontend Guide — NRG CO-WORKING CRM

## File Structure
```
src/
  components/
    layout/
      AppShell.jsx      — Main layout wrapper (sidebar + header + content)
      Sidebar.jsx       — Navigation sidebar with collapse
      Header.jsx        — Top bar with breadcrumbs, search, profile
    ui/
      Button.jsx        — Reusable button (primary/secondary/danger/ghost/success)
      Badge.jsx         — Status badges with colors
      Card.jsx          — KPI card for dashboard + CardSkeleton loader
      Modal.jsx         — Modal dialog + ConfirmDialog
      Input.jsx         — Input, Select, Textarea (named exports + default)
      SearchableSelect.jsx — Searchable dropdown
    common/
      NotFound.jsx      — 404 page
    dashboard/Dashboard.jsx
    contacts/Contacts.jsx
    leads/Leads.jsx
    deals/Deals.jsx
    pipelines/Pipelines.jsx
    sources/Sources.jsx
    activities/Activities.jsx
    reports/Reports.jsx
  services/api.js       — Centralized API client
  utils/constants.js    — Constants, formatters, helpers
  App.jsx               — Route definitions
  main.jsx              — Entry point (BrowserRouter + Toaster)
  index.css             — Tailwind imports + custom theme + scrollbar
```

## Component Patterns

### Data Loading Pattern
```jsx
// Every page component follows this pattern:
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)

const load = async () => {
  setLoading(true)
  try {
    const result = await api.getXxx()
    setData(result)
  } catch (e) {
    console.error(e)
  }
  setLoading(false)
}

useEffect(() => { load() }, [dependencies])
```

### Form Pattern
```jsx
const [form, setForm] = useState(initialValues)
const handleSubmit = async (e) => {
  e.preventDefault()
  try {
    await api.createXxx(form)
    setModalOpen(false)
    loadData()
  } catch (err) {
    setError(err.message)
  }
}
```

### Search/Filter Pattern
```jsx
const [search, setSearch] = useState('')
useEffect(() => { loadData() }, [search, otherFilters])
```

## Styling Conventions

- Use Tailwind utility classes
- Color tokens: `surface-50` to `surface-900`, `primary-50` to `primary-900`
- Spacing: standard Tailwind scale
- Border radius: `rounded-lg` (8px) for cards, `rounded-xl` (12px) for containers
- Shadows: `shadow-sm` for cards, `shadow-md` on hover, `shadow-lg` for modals
- Transitions: `transition-colors` or `transition-shadow`

## Design Tokens (index.css)

```css
--color-primary-500: #6366f1    /* Indigo accent */
--color-primary-600: #4f46e5    /* Primary button/hover */
--color-surface-50:  #f8fafc    /* Page background */
--color-surface-100: #f1f5f9    /* Alternating rows */
--color-surface-200: #e2e8f0    /* Borders */
--color-surface-500: #64748b    /* Secondary text */
--color-surface-700: #334155    /* Headers */
--color-surface-800: #1e293b    /* Primary text */
```

## Recharts Usage

```jsx
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts'

<ResponsiveContainer width="100%" height={260}>
  <LineChart data={chartData}>
    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} />
    <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
    <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
    <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} />
  </LineChart>
</ResponsiveContainer>
```

## Responsive Breakpoints
- `sm:` — 640px (tablet)
- `md:` — 768px (large tablet)
- `lg:` — 1024px (desktop)

Grid examples:
```jsx
// Cards: 1 col mobile → 2 col tablet → 4 col desktop
className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"

// Charts: 1 col mobile → 2 col desktop
className="grid grid-cols-1 lg:grid-cols-2 gap-6"
```

## Icons (Lucide React)

All icons imported from `lucide-react`:
```jsx
import { Users, Plus, Search, Edit, Trash2, Phone, Mail } from 'lucide-react'
// Usage: <Users className="w-5 h-5" />
```

Standard icon sizes:
- Navigation: `w-5 h-5`
- Buttons: `w-4 h-4`
- Cards: `w-5 h-5`

## API Client Pattern

All API calls go through `src/services/api.js`:
```jsx
import { api } from '../services/api'

// Simple get
const data = await api.getDashboard()

// With params
const contacts = await api.getContacts({ search, sortBy })

// POST/PUT with body
const newLead = await api.createLead(formData)

// Delete
await api.deleteContact(id)
```

The client handles:
- Base URL prefix (`/api`)
- JSON serialization
- Error propagation
- Consistent interface
