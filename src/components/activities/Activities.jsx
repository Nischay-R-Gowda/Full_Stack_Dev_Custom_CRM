import { useState, useEffect } from 'react'
import { Plus, Phone, Mail, Calendar, CheckSquare, FileText, MapPin, Check, X, Pencil, Clock, Search } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api } from '../../services/api'
import { formatDateTime, ACTIVITY_TYPES, PRIORITIES } from '../../utils/constants'
import useResource from '../../hooks/useResource'
import Button from '../ui/Button'
import Input, { Select, Textarea } from '../ui/Input'
import { Badge } from '../ui/Badge'
import Modal from '../ui/Modal'

// Lucide icon per activity type — 'tour' is the NRG-specific workspace tour.
const TYPE_ICONS = { call: Phone, email: Mail, meeting: Calendar, tour: MapPin, task: CheckSquare, note: FileText }

const emptyForm = { type: 'call', subject: '', description: '', dueDate: '', priority: 'medium', contactId: '', leadId: '', dealId: '' }

// Convert a <input type="datetime-local"> value (or ISO string) to the
// "YYYY-MM-DDTHH:mm" format that input expects when pre-filling edits.
const toLocalInputValue = (value) => {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Captured once at module load; seeds the first paint of the overdue check
// without calling an impure function inside the component body.
const MODULE_LOAD_TIME = Date.now()

export default function Activities() {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [typeFilter, setTypeFilter] = useState('')
  const [viewTab, setViewTab] = useState('all') // all | overdue | upcoming | completed
  const [search, setSearch] = useState('')

  // Server-side: fetch by type filter only (due/completed views + search are
  // computed client-side over the same list, which is fine at this scale).
  const { data: activities, loading, reload: load } = useResource(
    () => api.getActivities(typeFilter ? { type: typeFilter } : {}),
    [typeFilter]
  )

  // Related-record pickers for the create/edit modal (optional associations).
  const { data: contacts } = useResource(() => api.getContacts({}), [])
  const { data: leads } = useResource(() => api.getLeads({}), [])
  const { data: deals } = useResource(() => api.getDeals({}), [])

  // Overdue is a point-in-time check, and the linter forbids impure calls in
  // render, so the timestamp lives in state. It is seeded from a module-level
  // constant (captured once when this file loads) and refreshed every 60s so
  // items move into the Overdue view while the page stays open.
  const [now, setNow] = useState(MODULE_LOAD_TIME)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000)
    return () => clearInterval(id)
  }, [])

  const isOverdue = (a) => a.dueDate && !a.completed && new Date(a.dueDate).getTime() < now

  // Apply the active view tab + free-text search over the server results.
  const visible = (activities || []).filter(a => {
    if (viewTab === 'overdue' && !isOverdue(a)) return false
    if (viewTab === 'upcoming' && (a.completed || isOverdue(a))) return false
    if (viewTab === 'completed' && !a.completed) return false
    if (search) {
      const hay = `${a.subject} ${a.description || ''} ${a.contact?.firstName || ''} ${a.lead?.type || ''} ${a.deal?.name || ''}`.toLowerCase()
      if (!hay.includes(search.toLowerCase())) return false
    }
    return true
  })

  const openCreate = () => { setEditing(null); setForm(emptyForm); setModalOpen(true) }

  const openEdit = (a) => {
    setEditing(a)
    setForm({
      type: a.type,
      subject: a.subject || '',
      description: a.description || '',
      dueDate: toLocalInputValue(a.dueDate),
      priority: a.priority || 'medium',
      contactId: a.contactId ? String(a.contactId) : '',
      leadId: a.leadId ? String(a.leadId) : '',
      dealId: a.dealId ? String(a.dealId) : '',
    })
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const payload = {
      type: form.type,
      subject: form.subject.trim(),
      description: form.description || null,
      // datetime-local value → ISO, or null when blank.
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      priority: form.priority,
      contactId: form.contactId ? Number(form.contactId) : null,
      leadId: form.leadId ? Number(form.leadId) : null,
      dealId: form.dealId ? Number(form.dealId) : null,
    }
    try {
      if (editing) {
        await api.updateActivity(editing.id, payload)
        toast.success('Activity updated')
      } else {
        await api.createActivity(payload)
        toast.success('Activity created')
      }
      setModalOpen(false)
      load()
    } catch (err) {
      toast.error(err.message)
    }
  }

  const handleToggle = async (activity) => {
    try {
      await api.updateActivity(activity.id, { completed: !activity.completed })
      toast.success(activity.completed ? 'Activity reopened' : 'Activity completed')
      load()
    } catch (err) { toast.error(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this activity? This cannot be undone.')) return
    try { await api.deleteActivity(id); toast.success('Activity deleted'); load() } catch (err) { toast.error(err.message) }
  }

  // Show "Email logged" (not "sent") for email records — no real mail
  // integration exists in this demo.
  const typeLabel = (type) => (type === 'email' ? 'Email logged' : ACTIVITY_TYPES[type]?.label || type)

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'completed', label: 'Completed' },
  ]

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-semibold text-surface-800 dark:text-surface-100">Activities & Follow-ups</h1>
          <div className="flex items-center gap-2">
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-1.5 bg-white dark:bg-surface-800 dark:border-surface-700 border border-surface-300 rounded-lg text-sm text-surface-800 dark:text-surface-100">
              <option value="">All Types</option>
              {Object.entries(ACTIVITY_TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search activities..." className="pl-9 pr-4 py-1.5 bg-white dark:bg-surface-800 dark:border-surface-700 border border-surface-300 rounded-lg text-sm w-48" />
            </div>
          </div>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" />Add Activity</Button>
      </div>

      <div role="note" className="border-l-4 border-amber-400 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-900 dark:text-amber-200">
        <strong>Demo note:</strong> This page shows the follow-up flow. A few activity controls are still on a coffee break and may not work as expected.
      </div>
      {/* View tabs */}
      <div className="flex items-center gap-1 bg-surface-100 dark:bg-surface-800 rounded-lg p-1 w-fit">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setViewTab(t.key)}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${viewTab === t.key ? 'bg-white dark:bg-surface-700 text-surface-800 dark:text-surface-100 shadow-sm' : 'text-surface-500 hover:text-surface-700 dark:hover:text-surface-300'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-surface-900 dark:border-surface-700 rounded-xl border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider w-8"></th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Activity</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Linked To</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Due</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Priority</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
              {loading ? Array(4).fill(0).map((_, i) => <tr key={i}><td colSpan={7} className="px-4 py-4"><div className="animate-pulse h-4 bg-surface-100 dark:bg-surface-800 rounded w-full" /></td></tr>) :
                visible.length === 0 ? <tr><td colSpan={7} className="px-4 py-12 text-center text-surface-400">No activities{viewTab !== 'all' ? ` in "${tabs.find(t => t.key === viewTab)?.label}"` : ' yet'}</td></tr> :
                visible.map(activity => {
                  const Icon = TYPE_ICONS[activity.type] || FileText
                  const linked = [
                    activity.contact && `Contact: ${activity.contact.firstName} ${activity.contact.lastName}`,
                    activity.lead && `Lead: ${activity.lead.type?.toUpperCase()} (${activity.lead.status || 'new'})`,
                    activity.deal && `Deal: ${activity.deal.name}`,
                  ].filter(Boolean).join(' · ')
                  return (
                    <tr key={activity.id} className={`hover:bg-surface-50/50 dark:hover:bg-surface-800/40 transition-colors ${activity.completed ? 'opacity-60' : ''}`}>
                      <td className="px-4 py-3">
                        <button onClick={() => handleToggle(activity)} title={activity.completed ? 'Reopen' : 'Mark complete'} className={`p-1 rounded-lg transition-colors ${activity.completed ? 'bg-emerald-100 text-emerald-600' : 'hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-400'}`}>
                          <Check className="w-4 h-4" />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className={`text-sm font-medium ${activity.completed ? 'line-through text-surface-400' : 'text-surface-800 dark:text-surface-100'}`}>{activity.subject}</p>
                          {activity.description && <p className="text-xs text-surface-500 mt-0.5">{activity.description}</p>}
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm border border-current/10 text-xs font-medium ${ACTIVITY_TYPES[activity.type]?.color || 'bg-gray-100 text-gray-600'}`}><Icon className="w-3 h-3" />{typeLabel(activity.type)}</span></td>
                      <td className="px-4 py-3 text-xs text-surface-500">{linked || <span className="text-surface-300">—</span>}</td>
                      <td className="px-4 py-3 text-sm">
                        {activity.dueDate ? (
                          <span className={isOverdue(activity) ? 'text-red-600 font-medium flex items-center gap-1' : 'text-surface-500'}>
                            {isOverdue(activity) && <Clock className="w-3.5 h-3.5" />}
                            {formatDateTime(activity.dueDate)}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3"><Badge color={activity.priority === 'high' ? 'red' : activity.priority === 'medium' ? 'yellow' : 'gray'}>{activity.priority}</Badge></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(activity)} className="p-1.5 hover:bg-surface-100 dark:hover:bg-surface-800 rounded-lg" title="Edit"><Pencil className="w-4 h-4 text-surface-500" /></button>
                          <button onClick={() => handleDelete(activity.id)} className="p-1.5 hover:bg-red-50 rounded-lg" title="Delete"><X className="w-4 h-4 text-red-400" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Activity' : 'New Activity'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" value={form.type} onChange={v => setForm({ ...form, type: v })} options={Object.entries(ACTIVITY_TYPES).map(([k, v]) => ({ value: k, label: v.label }))} />
            <Select label="Priority" value={form.priority} onChange={v => setForm({ ...form, priority: v })} options={Object.entries(PRIORITIES).map(([k, v]) => ({ value: k, label: v.label }))} />
          </div>
          <Input label="Subject" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
          <Textarea label="Description" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <Input label="Due datetime" type="datetime-local" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} />

          {/* Optional associations — link to a contact, lead, and/or deal. */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select label="Contact" value={form.contactId} onChange={v => setForm({ ...form, contactId: v })} options={[(contacts || []).map(c => ({ value: String(c.id), label: `${c.firstName} ${c.lastName}` }))]} placeholder="No contact" />
            <Select label="Lead" value={form.leadId} onChange={v => setForm({ ...form, leadId: v })} options={[(leads || []).map(l => ({ value: String(l.id), label: `${(l.contact ? `${l.contact.firstName} ${l.contact.lastName}` : `Lead #${l.id}`)} · ${l.type?.toUpperCase()}` }))]} placeholder="No lead" />
            <Select label="Deal" value={form.dealId} onChange={v => setForm({ ...form, dealId: v })} options={[(deals || []).map(d => ({ value: String(d.id), label: d.name }))]} placeholder="No deal" />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Update Activity' : 'Create Activity'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
