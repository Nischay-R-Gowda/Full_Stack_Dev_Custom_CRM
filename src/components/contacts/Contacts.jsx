import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { Plus, Search, Phone, Mail, MapPin, Briefcase, Calendar, Edit, Trash2, UserPlus } from 'lucide-react'
import { api } from '../../services/api'
import { formatDateTime, getInitials, LEAD_SOURCES, LIFECYCLE_STAGES, LOCALITIES, DURATIONS } from '../../utils/constants'
import useResource from '../../hooks/useResource'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/Input'
import { Badge } from '../ui/Badge'
import Modal from '../ui/Modal'

const emptyContact = { firstName: '', lastName: '', email: '', phone: '', company: '', jobTitle: '', location: '', leadSource: 'manual', lifecycleStage: 'lead', notes: '' }
// NRG: "Also create a lead" sub-form. Type defaults to MQL; choosing SQL
// manually triggers the one-deal-per-lead rule server-side.
const emptyLeadSub = { enabled: false, type: 'mql', source: 'manual', seatsRequired: '', locality: '', duration: '' }

// Declared at module level so React keeps the same component identity across
// renders — a header defined inside the page body would be recreated each time.
function SortHeader({ column, sortBy, sortOrder, onSort, className = '', children }) {
  return (
    <th className={`${className} cursor-pointer select-none hover:text-surface-700 transition-colors`} onClick={() => onSort(column)}>
      <span className="inline-flex items-center gap-1">
        {children}
        {sortBy === column && <span className="text-primary-600">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
      </span>
    </th>
  )
}

export default function Contacts() {
  const [search, setSearch] = useState('')
  const [stageFilter, setStageFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [detailContact, setDetailContact] = useState(null)
  const [form, setForm] = useState(emptyContact)
  const [leadSub, setLeadSub] = useState(emptyLeadSub)
  const [error, setError] = useState('')

  // Re-fetches automatically whenever a search term or filter changes.
  const { data: contacts, loading, reload: loadContacts } = useResource(
    () => api.getContacts({ search, sortBy, sortOrder, lifecycleStage: stageFilter }),
    [search, stageFilter, sortBy, sortOrder]
  )

  const openCreate = () => { setEditing(null); setForm(emptyContact); setLeadSub(emptyLeadSub); setError(''); setModalOpen(true) }
  const openEdit = (c) => { setEditing(c); setForm(c); setLeadSub(emptyLeadSub); setError(''); setModalOpen(true) }

  // Clicking a column header toggles that column's sort direction.
  const toggleSort = (column) => {
    if (sortBy === column) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    else { setSortBy(column); setSortOrder('asc') }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editing) {
        await api.updateContact(editing.id, form)
        toast.success('Contact updated')
      } else {
        // Attach the optional "Also create a lead" payload only on create.
        const payload = { ...form }
        if (leadSub.enabled) {
          payload.createLead = {
            enabled: true,
            type: leadSub.type,          // 'mql' | 'sql'
            source: leadSub.source,
            seatsRequired: leadSub.seatsRequired ? parseInt(leadSub.seatsRequired, 10) : null,
            locality: leadSub.locality || null,
            duration: leadSub.duration || null,
          }
        }
        const res = await api.createContact(payload)
        if (res?.deal) {
          toast.success(`Contact created. SQL lead + deal added to pipeline (${res.deal.stage?.name}).`)
        } else if (res?.lead) {
          toast.success(`Contact created. ${res.lead.type === 'sql' ? 'SQL' : 'MQL'} lead linked.`)
        } else {
          toast.success('Contact created')
        }
      }
      setModalOpen(false); loadContacts()
    } catch (err) { setError(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this contact?')) return
    await api.deleteContact(id); loadContacts()
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts..." className="w-full pl-9 pr-4 py-2 bg-white border border-surface-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm">
            <option value="">All Stages</option>
            {Object.entries(LIFECYCLE_STAGES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" />Add Contact</Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-200 bg-surface-50/50">
                <SortHeader column="firstName" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Contact</SortHeader>
                <SortHeader column="company" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Company</SortHeader>
                <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Source</th>
                <SortHeader column="lifecycleStage" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Stage</SortHeader>
                <SortHeader column="createdAt" sortBy={sortBy} sortOrder={sortOrder} onSort={toggleSort} className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Created</SortHeader>
                <th className="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {loading ? Array(4).fill(0).map((_, i) => <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="animate-pulse h-4 bg-surface-100 rounded w-full" /></td></tr>) :
                contacts.length === 0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-surface-400">No contacts found. Add one to get started.</td></tr> :
                contacts.map(c => (
                  <tr key={c.id} className="hover:bg-surface-50/50 transition-colors cursor-pointer" onClick={() => setDetailContact(c)}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0"><span className="text-sm font-medium text-primary-700">{getInitials(c.firstName, c.lastName)}</span></div>
                        <div>
                          <p className="text-sm font-medium text-surface-800">{c.firstName} {c.lastName}</p>
                          <p className="text-xs text-surface-500">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-surface-600">{c.company || '—'}</td>
                    <td className="px-4 py-3"><Badge color={c.leadSource === 'google_ads' ? 'blue' : c.leadSource === 'meta_ads' ? 'purple' : c.leadSource === 'website' ? 'green' : c.leadSource === 'inbound_call' ? 'amber' : 'gray'}>{LEAD_SOURCES[c.leadSource]?.label || c.leadSource}</Badge></td>
                    <td className="px-4 py-3"><Badge color={LIFECYCLE_STAGES[c.lifecycleStage]?.badge || 'gray'}>{LIFECYCLE_STAGES[c.lifecycleStage]?.label || c.lifecycleStage}</Badge></td>
                    <td className="px-4 py-3 text-sm text-surface-500">{formatDateTime(c.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1" onClick={e => e.stopPropagation()}>
                        <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors"><Edit className="w-4 h-4 text-surface-500" /></button>
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4 text-red-500" /></button>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Contact' : 'New Contact'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="First Name *" required value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
            <Input label="Last Name *" required value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
            <Input label="Email *" type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
            <Input label="Phone" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
            <Input label="Company" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
            <Input label="Job Title" value={form.jobTitle} onChange={e => setForm({ ...form, jobTitle: e.target.value })} />
            <Input label="Location" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
            <Select label="Lead Source" value={form.leadSource} onChange={v => setForm({ ...form, leadSource: v })} options={Object.entries(LEAD_SOURCES).map(([k, v]) => ({ value: k, label: v.label }))} />
            <Select label="Lifecycle Stage" value={form.lifecycleStage} onChange={v => setForm({ ...form, lifecycleStage: v })} options={Object.entries(LIFECYCLE_STAGES).map(([k, v]) => ({ value: k, label: v.label }))} />
            <div className="sm:col-span-2"><Input label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          </div>

          {/* NRG: "Also create a lead" — optional, create-only (not edits). */}
          {!editing && (
            <div className="border border-surface-200 rounded-xl p-4 space-y-4">
              <label className="flex items-center gap-2 text-sm font-medium text-surface-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={leadSub.enabled}
                  onChange={e => setLeadSub({ ...leadSub, enabled: e.target.checked })}
                  className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
                />
                Also create a lead
              </label>
              {leadSub.enabled && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Select label="Lead Type *" value={leadSub.type} onChange={v => setLeadSub({ ...leadSub, type: v })} options={[{ value: 'mql', label: 'MQL — Marketing Qualified' }, { value: 'sql', label: 'SQL — Sales Qualified' }]} />
                    <Select label="Lead Source" value={leadSub.source} onChange={v => setLeadSub({ ...leadSub, source: v })} options={Object.entries(LEAD_SOURCES).map(([k, v]) => ({ value: k, label: v.label }))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Seats Required" type="number" min="1" placeholder="e.g. 4" value={leadSub.seatsRequired} onChange={e => setLeadSub({ ...leadSub, seatsRequired: e.target.value })} />
                    <Select label="Preferred Locality" value={leadSub.locality} onChange={v => setLeadSub({ ...leadSub, locality: v })} options={LOCALITIES.map(l => ({ value: l, label: l }))} />
                  </div>
                  <Select label="Booking Duration" value={leadSub.duration} onChange={v => setLeadSub({ ...leadSub, duration: v })} options={DURATIONS.map(d => ({ value: d, label: d }))} />
                  {leadSub.type === 'sql' && (
                    <p className="text-xs text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-lg p-2">
                      Choosing SQL manually creates a deal in the default pipeline automatically. No duplicate deal will be created.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Update' : 'Create'} Contact</Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!detailContact} onClose={() => setDetailContact(null)} title="Contact Details" size="lg">
        {detailContact && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center"><span className="text-xl font-bold text-primary-700">{getInitials(detailContact.firstName, detailContact.lastName)}</span></div>
              <div>
                <h3 className="text-lg font-semibold text-surface-800">{detailContact.firstName} {detailContact.lastName}</h3>
                <p className="text-sm text-surface-500">{detailContact.jobTitle} {detailContact.company ? `· ${detailContact.company}` : ''}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InfoRow icon={Mail} label="Email" value={detailContact.email} />
              <InfoRow icon={Phone} label="Phone" value={detailContact.phone || '—'} />
              <InfoRow icon={Briefcase} label="Company" value={detailContact.company || '—'} />
              <InfoRow icon={MapPin} label="Location" value={detailContact.location || '—'} />
              <InfoRow icon={UserPlus} label="Source" value={LEAD_SOURCES[detailContact.leadSource]?.label || detailContact.leadSource} />
              <InfoRow icon={Calendar} label="Created" value={formatDateTime(detailContact.createdAt)} />
            </div>
            {detailContact.notes && <div className="p-3 bg-surface-50 rounded-lg text-sm text-surface-600">{detailContact.notes}</div>}

            {/* Recent activity history for this contact */}
            {detailContact.activities && detailContact.activities.length > 0 && (
              <div>
                <p className="text-xs font-medium text-surface-500 mb-2">Recent Activity</p>
                <div className="space-y-2">
                  {detailContact.activities.slice(0, 5).map(a => (
                    <div key={a.id} className="flex items-center justify-between p-2 bg-surface-50 rounded-lg text-sm">
                      <span className="text-surface-700 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-primary-400" />
                        {a.type?.[0]?.toUpperCase() + a.type?.slice(1)}: {a.subject}
                      </span>
                      <span className="text-xs text-surface-400">{formatDateTime(a.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button onClick={() => { setDetailContact(null); openEdit(detailContact) }}><Edit className="w-4 h-4" />Edit</Button>
              <Button variant="secondary" onClick={() => setDetailContact(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return <div className="flex items-center gap-2 text-sm"><Icon className="w-4 h-4 text-surface-400" /><span className="text-surface-500 w-16">{label}</span><span className="text-surface-800 font-medium">{value}</span></div>
}
