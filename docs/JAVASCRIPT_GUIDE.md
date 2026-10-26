# JavaScript Guide — NRG CO-WORKING CRM

## ES6+ Features Used

### Arrow Functions
```jsx
// Component definition
export default function Dashboard() { ... }

// Callback
const handleClick = () => { ... }

// Array methods
items.map(item => <div key={item.id}>{item.name}</div>)
```

### Destructuring
```jsx
// Props destructuring
function Card({ title, value, icon: Icon, color = 'indigo' }) { ... }

// Array destructuring
const [firstName, lastName] = names[idx].split(' ')

// Object destructuring
const { totalContacts, openDeals } = dashboardData
```

### Template Literals
```jsx
const url = `${API_BASE}${endpoint}`
<p className={`text-sm ${active ? 'font-bold' : ''}`}>Label</p>
```

### Spread Operator
```jsx
// Merge objects
const where = { ...(search ? { OR: [...] } : {}) }

// Pass props
<button {...props} />
```

### Array Methods
```jsx
// map - transform arrays to JSX
contacts.map(c => <tr key={c.id}>...</tr>)

// filter - select subset
const stageDeals = deals.filter(d => d.stageId === stage.id)

// reduce - aggregate
const stageValue = stageDeals.reduce((sum, d) => sum + d.amount, 0)

// find - locate element
const selectedPipeline = pipelines.find(p => p.id === Number(pipelineFilter))

// forEach - iterate
activitySubjects.forEach((a, i) => { ... })
```

### Async/Await
```jsx
const loadContacts = async () => {
  setLoading(true)
  try {
    const data = await api.getContacts(params)
    setContacts(data)
  } catch (e) {
    console.error('Failed to load:', e)
  }
  setLoading(false)
}
```

### Modules
```jsx
// Named exports
export default function Dashboard() { ... }
export function CardSkeleton() { ... }

// Named imports
import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { formatCurrency } from '../utils/constants'

// Default imports
import Button from '../ui/Button'
```

### Optional Chaining & Nullish Coalescing
```jsx
const value = data?._sum?.amount || 0
const name = lead?.contact?.firstName || 'Unknown'
```

## Promises and Error Handling

```jsx
// Promise chains (used in route handlers)
router.get('/', (req, res) => {
  getContacts(req.query)
    .then(data => res.json(data))
    .catch(err => res.status(500).json({ error: err.message }))
})

// Async/await with try/catch (used in components)
try {
  await api.createContact(form)
  toast.success('Created!')
} catch (err) {
  setError(err.message)
}
```

## Event Handling

```jsx
// Click handlers
<button onClick={() => setModalOpen(true)}>Open</button>
<button onClick={handleSubmit}>Submit</button>

// Form submission
<form onSubmit={handleSubmit}>
  <input onChange={e => setForm({ ...form, name: e.target.value })} />
</form>

// Event delegation (table row click with button stopPropagation)
<tr onClick={() => viewContact(c)}>
  <button onClick={e => { e.stopPropagation(); editContact(c) }}>Edit</button>
</tr>
```

## Conditional Rendering

```jsx
// Ternary
{loading ? <Skeleton /> : <DataTable />}

// Short-circuit
{error && <div className="text-red-600">{error}</div>}

// Map with conditional
{items.map(item => (
  <div key={item.id} className={item.active ? 'bg-green-50' : 'bg-gray-50'}>
    {item.active ? <ActiveBadge /> : <InactiveBadge />}
  </div>
))}
```
