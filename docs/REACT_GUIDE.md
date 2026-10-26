# React Guide — NRG CO-WORKING CRM

## Core Concepts

### What is React?
React is a JavaScript library for building user interfaces. It lets you compose UI pieces called "components" and efficiently update the DOM when data changes.

### JSX (JavaScript XML)
JSX looks like HTML but runs inside JavaScript:
```jsx
// This JSX:
<div className="card">
  <h2>{title}</h2>
  <p>{description}</p>
</div>

// Gets compiled to:
React.createElement('div', { className: 'card' },
  React.createElement('h2', null, title),
  React.createElement('p', null, description)
)
```

### Components
Components are reusable building blocks. Each component is a function that returns JSX:
```jsx
function Button({ children, onClick, variant }) {
  return <button onClick={onClick} className={variant}>{children}</button>
}
```

### Props (Properties)
Props pass data from parent to child:
```jsx
// Parent passes props
<Card title="Total Leads" value={42} icon={Users} color="indigo" />

// Child receives props
function Card({ title, value, icon: Icon, color }) {
  return (
    <div>
      <p>{title}</p>
      <p>{value}</p>
      {Icon && <Icon className="w-5 h-5" />}
    </div>
  )
}
```

### State (useState)
State is a component's internal memory. When state changes, React re-renders:
```jsx
const [contacts, setContacts] = useState([])    // Array state
const [loading, setLoading] = useState(true)     // Boolean state
const [modalOpen, setModalOpen] = useState(false) // Toggle state
const [form, setForm] = useState({ name: '' })   // Object state
```

### useEffect Hook
`useEffect` runs code after a render. Common patterns:

**Data fetching:**
```jsx
useEffect(() => {
  async function load() {
    const data = await api.getDashboard()
    setData(data)
  }
  load()
}, []) // Empty array = run once on mount
```

**Dependency array:**
```jsx
useEffect(() => {
  loadContacts()
}, [search, statusFilter]) // Re-run when these change
```

### Controlled Forms
Form inputs whose values are controlled by React state:
```jsx
<input
  value={form.firstName}
  onChange={e => setForm({ ...form, firstName: e.target.value })}
/>
```

### Conditional Rendering
Show different UI based on conditions:
```jsx
{loading && <Skeleton />}
{error && <Error message={error} />}
{data.length === 0 ? <Empty /> : <List items={data} />}
```

### Lists and Keys
Render arrays with `.map()` and provide unique keys:
```jsx
{contacts.map(contact => (
  <tr key={contact.id}>
    <td>{contact.firstName}</td>
  </tr>
))}
```

## React Router (react-router-dom v7)

### Route Configuration
```jsx
<Routes>
  <Route path="/" element={<AppShell><Dashboard /></AppShell>} />
  <Route path="/contacts" element={<AppShell><Contacts /></AppShell>} />
  <Route path="*" element={<AppShell><NotFound /></AppShell>} />
</Routes>
```

### Navigation Links
```jsx
import { NavLink } from 'react-router-dom'

<NavLink to="/contacts" className={({ isActive }) =>
  isActive ? 'bg-primary-50 text-primary-700' : 'text-surface-600'
}>
  Contacts
</NavLink>
```

### Breadcrumbs
```jsx
import { useLocation } from 'react-router-dom'
const location = useLocation()
// location.pathname gives current route
```

## Component Reuse

### UI Components (src/components/ui/)
| Component | Purpose |
|-----------|---------|
| Button | Consistent button styling with variants |
| Badge | Status indicators with color coding |
| Card | KPI display card with icon |
| Modal | Reusable modal dialog |
| Input | Input, Select, Textarea with labels and error states |
| SearchableSelect | Dropdown with search/filter |

### Pattern: Props + Composition
```jsx
// Generic Modal accepts any children
<Modal isOpen={open} onClose={close} title="Edit Contact">
  <form onSubmit={handleSubmit}>
    <Input label="Name" ... />
    <Button type="submit">Save</Button>
  </form>
</Modal>

// Same Modal for confirmations
<Modal isOpen={showConfirm} onClose={close} title="Confirm">
  <p>Are you sure?</p>
  <Button onClick={onConfirm}>Yes</Button>
</Modal>
```

## State Management in This App

No Redux/Zustand — uses local state only:
- Each page component manages its own data state
- `useState` + `useEffect` for data fetching
- Props for passing callbacks between components
- Simple and sufficient for this application scale

## Key React Concepts Demonstrated

| Concept | Where Used |
|---------|-----------|
| useState | Every page component |
| useEffect | Data loading in Dashboard, Contacts, Leads, Deals, Activities, Reports |
| Props | All component composition |
| JSX | Entire application |
| Component composition | AppShell wrapping page content |
| Conditional rendering | Loading states, empty states, modals |
| List rendering | Table rows, cards, dropdown options |
| Event handlers | onClick, onChange, onSubmit |
| Controlled components | All form inputs |
| useRef | SearchableSelect dropdown |
| React Router | App.jsx route definitions |
