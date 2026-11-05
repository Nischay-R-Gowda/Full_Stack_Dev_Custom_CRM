import { useState, useEffect, useMemo, useRef } from 'react'
import { Plus, Search, X, UserCheck, ArrowRight, ArrowDownUp } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api } from '../../services/api'
import { formatDateTime, formatCurrency, LEAD_STATUSES, LEAD_SOURCES, LEAD_TYPES, LOCALITIES, DURATIONS } from '../../utils/constants'
import useResource from '../../hooks/useResource'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/SearchableSelect'
import { Badge } from '../ui/Badge'
import Modal from '../ui/Modal'

const emptyLeadForm = { company: '', companySize: '', industry: '', website: '', notes: '', expectedValue: '', source: 'manual', contactId: '', seatsRequired: '', locality: '', duration: '' }
const emptyQualifyForm = { type: 'sql', qualificationNotes: '', company: '', companySize: '', industry: '', website: '', expectedValue: '', seatsRequired: '', locality: '', duration: '', contactEmail: '', contactFirstName: '', contactLastName: '', contactPhone: '', contactCompany: '' }
const isGeneratedLeadContact = contact => contact?.firstName === 'NRG' && /^Lead \d+$/.test(contact?.lastName || '')

function SortHeader({ label, column, active, direction, onSort }) {
  return (
    <button type="button" onClick={() => onSort(column)} className={`inline-flex items-center gap-1 ${active ? 'text-primary-700' : 'text-surface-500'} hover:text-primary-700`}>
      {label}<ArrowDownUp size={12} className={active ? 'opacity-100' : 'opacity-50'} />{active && <span>{direction === 'asc' ? '↑' : '↓'}</span>}
    </button>
  )
}

function InlineLeadField({ label, value, displayValue, type = 'text', options, onSave, align = 'left' }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const inputRef = useRef(null)
  const skipBlurSave = useRef(false)

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])
  const cancel = () => { skipBlurSave.current = true; setDraft(value ?? ''); setEditing(false) }
  const save = async () => {
    if (skipBlurSave.current) { skipBlurSave.current = false; return }
    if (String(draft ?? '') === String(value ?? '')) { setEditing(false); return }
    const saved = await onSave(draft)
    if (saved) setEditing(false)
  }

  if (editing && options) {
    return (
      <select
        ref={inputRef}
        aria-label={`Set ${label}`}
        value={draft}
        onChange={event => setDraft(event.target.value)}
        onBlur={save}
        onKeyDown={event => { if (event.key === 'Escape') cancel() }}
        className="max-w-full rounded border border-primary-300 bg-white px-2 py-1 text-xs text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
      >
        <option value="">Not set</option>
        {options.map(option => <option key={option} value={option}>{option}</option>)}
      </select>
    )
  }

  if (editing) {
    return (
      <input
        ref={inputRef}
        aria-label={`Set ${label}`}
        type={type}
        min={type === 'number' ? (label === 'seats' ? 1 : 0) : undefined}
        step={type === 'number' && label === 'budget' ? 'any' : undefined}
        list={label === 'location' ? 'lead-locality-options' : undefined}
        value={draft}
        onChange={event => setDraft(event.target.value)}
        onBlur={save}
        onKeyDown={event => {
          if (event.key === 'Enter') { event.preventDefault(); event.currentTarget.blur() }
          if (event.key === 'Escape') cancel()
        }}
        className="w-28 max-w-full rounded border border-primary-300 bg-white px-2 py-1 text-xs text-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-400"
      />
    )
  }

  return (
    <button
      type="button"
      title={`Click to edit ${label}`}
      aria-label={`Edit ${label}`}
      onClick={() => { skipBlurSave.current = false; setDraft(value ?? ''); setEditing(true) }}
      className={`inline-flex items-center gap-1 rounded px-1.5 py-1 text-sm transition-colors hover:bg-primary-50 hover:text-primary-700 ${align === 'right' ? 'justify-end' : ''} ${displayValue ? 'text-surface-600 dark:text-surface-300' : 'text-primary-700'}`}
    >
      {displayValue || <span className="text-xs">+ Add</span>}
    </button>
  )
}

export default function Leads() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [sourceFilter, setSourceFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [localityFilter, setLocalityFilter] = useState('')
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDirection, setSortDirection] = useState('desc')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailLead, setDetailLead] = useState(null)
  const [qualifyModal, setQualifyModal] = useState(null)
  const [form, setForm] = useState(emptyLeadForm)
  const [qualifyForm, setQualifyForm] = useState(emptyQualifyForm)
  const [error, setError] = useState('')
  // Contact picker for "create a lead linked to an existing contact".
  const [contacts, setContacts] = useState([])

  const { data: leads, loading, reload: loadLeads } = useResource(
    () => api.getLeads({ search, status: statusFilter, source: sourceFilter, type: typeFilter }),
    [search, statusFilter, sourceFilter, typeFilter]
  )

  const visibleLeads = useMemo(() => (leads || [])
    .filter(lead => !localityFilter || lead.locality === localityFilter)
    .slice()
    .sort((a, b) => {
      const left = a[sortBy]
      const right = b[sortBy]
      const direction = sortDirection === 'asc' ? 1 : -1
      if (typeof left === 'number' || typeof right === 'number') return ((Number(left) || 0) - (Number(right) || 0)) * direction
      return String(left || '').localeCompare(String(right || ''), undefined, { sensitivity: 'base' }) * direction
    }), [leads, localityFilter, sortBy, sortDirection])
  const localityOptions = useMemo(() => [...new Set([
    ...LOCALITIES.filter(locality => locality !== 'Other'),
    ...(leads || []).map(lead => lead.locality).filter(Boolean),
  ])].sort((a, b) => a.localeCompare(b)), [leads])

  // Load contacts once for the picker.
  useEffect(() => { api.getContacts({}).then(setContacts).catch(() => {}) }, [])

  const openCreate = () => { setForm(emptyLeadForm); setError(''); setModalOpen(true) }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.createLead({
        ...form,
        company: form.company.trim(),
        expectedValue: form.expectedValue ? parseFloat(form.expectedValue) : null,
        seatsRequired: form.seatsRequired ? parseInt(form.seatsRequired, 10) : null,
        locality: form.locality || null,
        duration: form.duration || null,
        contactId: form.contactId ? parseInt(form.contactId, 10) : null,
      })
      setModalOpen(false); loadLeads()
    } catch (err) { setError(err.message) }
  }

  const openQualify = async (lead) => {
    const generatedContact = isGeneratedLeadContact(lead.contact)
    setQualifyForm({
      ...emptyQualifyForm,
      company: lead.company || '',
      companySize: lead.companySize || '',
      industry: lead.industry || '',
      website: lead.website || '',
      expectedValue: lead.expectedValue ?? '',
      seatsRequired: lead.seatsRequired ?? '',
      locality: lead.locality || '',
      duration: lead.duration || '',
      contactEmail: generatedContact ? '' : lead.contact?.email || '',
      contactFirstName: generatedContact ? '' : lead.contact?.firstName || '',
      contactLastName: generatedContact ? '' : lead.contact?.lastName || '',
      contactPhone: lead.contact?.phone || '',
      contactCompany: lead.contact?.company || lead.company || '',
    })
    setError('')
    setQualifyModal(lead)
  }

  const handleQualify = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.qualifyLead(qualifyModal.id, {
        ...qualifyForm,
        expectedValue: qualifyForm.expectedValue === '' ? null : Number(qualifyForm.expectedValue),
        seatsRequired: qualifyForm.seatsRequired === '' ? null : Number(qualifyForm.seatsRequired),
        companySize: qualifyForm.companySize || null,
        industry: qualifyForm.industry || null,
        website: qualifyForm.website || null,
        locality: qualifyForm.locality || null,
        duration: qualifyForm.duration || null,
      })
      setQualifyModal(null); loadLeads()
    } catch (err) { setError(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this lead?')) return
    try { await api.deleteLead(id); loadLeads() } catch (err) { alert(err.message) }
  }

  const saveInlineField = async (lead, field, rawValue) => {
    const numericValue = Number(rawValue)
    if (field === 'seatsRequired' && rawValue !== '' && (!Number.isInteger(numericValue) || numericValue < 1)) {
      toast.error('Seats must be a whole number of at least 1')
      return false
    }
    if (field === 'expectedValue' && rawValue !== '' && (!Number.isFinite(numericValue) || numericValue < 0)) {
      toast.error('Budget must be zero or more')
      return false
    }
    const value = ['expectedValue', 'seatsRequired'].includes(field)
      ? (rawValue === '' ? null : numericValue)
      : (rawValue.trim() || null)
    try {
      await api.updateLead(lead.id, { [field]: value })
      if (detailLead?.id === lead.id) setDetailLead({ ...detailLead, [field]: value })
      loadLeads()
      toast.success('Lead updated')
      return true
    } catch (err) {
      toast.error(err.message || 'Could not update this lead')
      return false
    }
  }

  // The Qualify button only renders when the lead is not yet converted/disqualified.
  // The readiness gate (spec §5): already-qualified leads show no Qualify button;
  // incomplete leads show "Qualify (N fields missing)" instead of a blind button.
  const showQualifyFor = (lead) =>
    lead.status !== 'converted' && lead.status !== 'disqualified' && lead.status !== 'qualified'

  const toggleSort = column => {
    if (sortBy === column) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    else { setSortBy(column); setSortDirection('asc') }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3 flex-1 flex-wrap">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..." className="w-full pl-9 pr-4 py-2 bg-white dark:bg-surface-800 dark:text-surface-100 border border-surface-300 dark:border-surface-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 bg-white dark:bg-surface-800 dark:text-surface-100 border border-surface-300 dark:border-surface-700 rounded-lg text-sm"><option value="">All Statuses</option>{Object.entries(LEAD_STATUSES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="px-3 py-2 bg-white dark:bg-surface-800 dark:text-surface-100 border border-surface-300 dark:border-surface-700 rounded-lg text-sm"><option value="">All Sources</option>{Object.entries(LEAD_SOURCES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="px-3 py-2 bg-white dark:bg-surface-800 dark:text-surface-100 border border-surface-300 dark:border-surface-700 rounded-lg text-sm"><option value="">All Types</option>{Object.entries(LEAD_TYPES).filter(([k]) => k !== 'deal').map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}</select>
          <select value={localityFilter} onChange={e => setLocalityFilter(e.target.value)} className="px-3 py-2 bg-white dark:bg-surface-800 dark:text-surface-100 border border-surface-300 dark:border-surface-700 rounded-lg text-sm"><option value="">All Locations</option>{localityOptions.map(locality => <option key={locality} value={locality}>{locality}</option>)}</select>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" />New Lead</Button>
      </div>

      <div className="flex gap-4 text-xs">
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-purple-400" /> MQL — Marketing Qualified</div>
        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> SQL — Sales Qualified</div>
      </div>

      <div className="bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 overflow-hidden">
        <datalist id="lead-locality-options">{localityOptions.map(locality => <option key={locality} value={locality} />)}</datalist>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-900/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider"><SortHeader label="Lead / Company" column="company" active={sortBy === 'company'} direction={sortDirection} onSort={toggleSort} /></th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider"><SortHeader label="Location" column="locality" active={sortBy === 'locality'} direction={sortDirection} onSort={toggleSort} /></th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider"><SortHeader label="Seats" column="seatsRequired" active={sortBy === 'seatsRequired'} direction={sortDirection} onSort={toggleSort} /></th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider"><SortHeader label="Budget" column="expectedValue" active={sortBy === 'expectedValue'} direction={sortDirection} onSort={toggleSort} /></th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider"><SortHeader label="Duration" column="duration" active={sortBy === 'duration'} direction={sortDirection} onSort={toggleSort} /></th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Source</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Type</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider"><SortHeader label="Created" column="createdAt" active={sortBy === 'createdAt'} direction={sortDirection} onSort={toggleSort} /></th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-surface-100 dark:divide-surface-700">
              {loading ? Array(4).fill(0).map((_, i) => <tr key={i}><td colSpan={10} className="px-4 py-4"><div className="animate-pulse h-4 bg-surface-100 rounded w-full" /></td></tr>) :
                visibleLeads.length === 0 ? <tr><td colSpan={10} className="px-4 py-12 text-center text-surface-400">No leads match these filters.</td></tr> :
                visibleLeads.map((lead, index) => {
                  const hasRealContact = lead.contact && !isGeneratedLeadContact(lead.contact)
                  const displayName = hasRealContact ? `${lead.contact.firstName} ${lead.contact.lastName}` : lead.company || `Lead ${lead.leadNumber}`
                  const avatarColors = ['bg-[#eeecff] text-[#5849ae]', 'bg-[#fff0eb] text-[#a45142]', 'bg-[#eaf1ff] text-[#4567ae]', 'bg-[#fff5da] text-[#927024]']
                  const initials = hasRealContact
                    ? `${lead.contact.firstName?.[0] || ''}${lead.contact.lastName?.[0] || ''}`
                    : (lead.company || 'Lead').split(/\s+/).slice(0, 2).map(word => word[0]).join('')
                  return (
                  <tr key={lead.id} className="hover:bg-surface-50/50 dark:hover:bg-surface-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${avatarColors[index % avatarColors.length]}`}>
                          <span className="text-xs font-semibold">{initials.toUpperCase()}</span>
                        </div>
                        <button onClick={() => setDetailLead(lead)} className="text-left min-w-0">
                          <p className="text-sm font-medium text-surface-800 dark:text-surface-100 truncate">{displayName}</p>
                          <p className="text-xs text-surface-500 truncate">{hasRealContact ? `${lead.company || 'No company'} · ${lead.leadNumber}` : lead.leadNumber}</p>
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3"><InlineLeadField label="location" value={lead.locality} displayValue={lead.locality} onSave={value => saveInlineField(lead, 'locality', value)} /></td>
                    <td className="px-4 py-3 text-right"><InlineLeadField label="seats" value={lead.seatsRequired} displayValue={lead.seatsRequired ?? ''} type="number" align="right" onSave={value => saveInlineField(lead, 'seatsRequired', value)} /></td>
                    <td className="px-4 py-3 text-right"><InlineLeadField label="budget" value={lead.expectedValue} displayValue={lead.expectedValue != null ? formatCurrency(lead.expectedValue) : ''} type="number" align="right" onSave={value => saveInlineField(lead, 'expectedValue', value)} /></td>
                    <td className="px-4 py-3"><InlineLeadField label="duration" value={lead.duration} displayValue={lead.duration} options={DURATIONS} onSave={value => saveInlineField(lead, 'duration', value)} /></td>
                    <td className="px-4 py-3"><Badge color={lead.source === 'google_ads' ? 'blue' : lead.source === 'meta_ads' ? 'purple' : lead.source === 'website' ? 'green' : lead.source === 'inbound_call' ? 'amber' : 'gray'}>{LEAD_SOURCES[lead.source]?.label || lead.source || '—'}</Badge></td>
                    <td className="px-4 py-3"><Badge color={lead.type === 'mql' ? 'purple' : lead.type === 'sql' ? 'blue' : 'emerald'} dot>{lead.type.toUpperCase()}</Badge></td>
                    <td className="px-4 py-3"><Badge color={LEAD_STATUSES[lead.status]?.color || 'gray'}>{LEAD_STATUSES[lead.status]?.label || lead.status}</Badge></td>
                    <td className="px-4 py-3 text-sm text-surface-500">{formatDateTime(lead.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {showQualifyFor(lead) && (
                          <button onClick={() => openQualify(lead)} className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-primary-700 hover:bg-primary-50 rounded-lg transition-colors" title="Qualify this lead">
                            <UserCheck className="w-4 h-4" />Qualify
                          </button>
                        )}
                        <button onClick={() => handleDelete(lead.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete lead"><X className="w-4 h-4 text-red-400" /></button>
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

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Lead">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <Input label="Company" required value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Company Size" value={form.companySize} onChange={e => setForm({ ...form, companySize: e.target.value })} />
            <Input label="Industry" value={form.industry} onChange={e => setForm({ ...form, industry: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Website" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} />
            <Input label="Expected Value (₹)" type="number" value={form.expectedValue} onChange={e => setForm({ ...form, expectedValue: e.target.value })} />
          </div>

          {/* NRG coworking fields */}
          <div className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg space-y-3">
            <p className="text-xs font-medium text-surface-500 dark:text-surface-400">Coworking Requirements</p>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Seats Required" type="number" min="1" placeholder="e.g. 4" value={form.seatsRequired} onChange={e => setForm({ ...form, seatsRequired: e.target.value })} />
              <Select label="Preferred Locality" value={form.locality} onChange={v => setForm({ ...form, locality: v })} options={LOCALITIES.map(l => ({ value: l, label: l }))} />
            </div>
            <Select label="Booking Duration" value={form.duration} onChange={v => setForm({ ...form, duration: v })} options={DURATIONS.map(d => ({ value: d, label: d }))} />
          </div>

          <Select label="Link to Existing Contact" value={form.contactId} onChange={v => setForm({ ...form, contactId: v })} placeholder="None (create standalone lead)" options={contacts.map(c => ({ value: String(c.id), label: `${c.firstName} ${c.lastName}${c.company ? ` — ${c.company}` : ''}` }))} />

          <Select label="Source" value={form.source} onChange={v => setForm({ ...form, source: v })} options={Object.entries(LEAD_SOURCES).map(([k, v]) => ({ value: k, label: v.label }))} />
          <Input label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Lead</Button>
          </div>
        </form>
      </Modal>

      {/* Qualify Modal */}
      <Modal isOpen={!!qualifyModal} onClose={() => setQualifyModal(null)} title="Qualify Lead" size="xl">
        <form onSubmit={handleQualify} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <p className="text-sm text-surface-600 dark:text-surface-300">Qualify <strong>{qualifyModal?.leadNumber}</strong> ({qualifyModal?.company})</p>

          <Select label="Type" value={qualifyForm.type} onChange={v => setQualifyForm({ ...qualifyForm, type: v })} options={Object.entries(LEAD_TYPES).map(([k, v]) => ({ value: k, label: `${v.label} — ${v.description}` }))} />
          <Input label="Qualification Notes" value={qualifyForm.qualificationNotes} onChange={e => setQualifyForm({ ...qualifyForm, qualificationNotes: e.target.value })} />
          <div className="rounded-xl border border-surface-200 bg-surface-50 p-4 space-y-4">
            <div>
              <p className="text-sm font-medium text-surface-700">Workspace requirements</p>
              <p className="text-xs text-surface-500 mt-1">These details are saved with the lead and carried into its deal.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Estimated budget (₹)" type="number" min="0" value={qualifyForm.expectedValue} onChange={e => setQualifyForm({ ...qualifyForm, expectedValue: e.target.value })} />
              <Input label="Seats required" type="number" min="1" value={qualifyForm.seatsRequired} onChange={e => setQualifyForm({ ...qualifyForm, seatsRequired: e.target.value })} />
              <Select label="Preferred locality" value={qualifyForm.locality} onChange={v => setQualifyForm({ ...qualifyForm, locality: v })} options={LOCALITIES.map(locality => ({ value: locality, label: locality }))} />
              <Select label="Booking duration" value={qualifyForm.duration} onChange={v => setQualifyForm({ ...qualifyForm, duration: v })} options={DURATIONS.map(duration => ({ value: duration, label: duration }))} />
              <Input label="Company" value={qualifyForm.company} onChange={e => setQualifyForm({ ...qualifyForm, company: e.target.value })} />
              <Input label="Company size" value={qualifyForm.companySize} onChange={e => setQualifyForm({ ...qualifyForm, companySize: e.target.value })} />
              <Input label="Industry" value={qualifyForm.industry} onChange={e => setQualifyForm({ ...qualifyForm, industry: e.target.value })} />
              <div className="sm:col-span-2"><Input label="Company website" value={qualifyForm.website} onChange={e => setQualifyForm({ ...qualifyForm, website: e.target.value })} /></div>
            </div>
            {qualifyForm.type !== 'mql' && (
              <p className={`text-xs rounded-lg px-3 py-2 ${qualifyForm.seatsRequired && qualifyForm.locality && qualifyForm.duration ? 'bg-[#e8eee3] text-[#4c694e]' : 'bg-[#f4efdf] text-[#806c41]'}`}>
                {qualifyForm.seatsRequired && qualifyForm.locality && qualifyForm.duration
                  ? 'Workspace details are ready for the sales handoff.'
                  : 'Add seats, locality and duration for a complete deal handoff.'}
              </p>
            )}
          </div>
          {qualifyForm.type !== 'mql' && (
            <div className="p-4 bg-[#f3eee7] rounded-xl space-y-3">
              <div>
                <p className="text-sm font-medium text-[#785f4a]">Contact details</p>
                <p className="text-xs text-surface-500 mt-1">Used for the lead contact and the deal handoff.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="First name" required value={qualifyForm.contactFirstName} onChange={e => setQualifyForm({ ...qualifyForm, contactFirstName: e.target.value })} />
                <Input label="Last name" required value={qualifyForm.contactLastName} onChange={e => setQualifyForm({ ...qualifyForm, contactLastName: e.target.value })} />
                <Input label="Email" type="email" value={qualifyForm.contactEmail} onChange={e => setQualifyForm({ ...qualifyForm, contactEmail: e.target.value })} />
                <Input label="Phone" value={qualifyForm.contactPhone} onChange={e => setQualifyForm({ ...qualifyForm, contactPhone: e.target.value })} />
                <div className="sm:col-span-2"><Input label="Contact company" value={qualifyForm.contactCompany} onChange={e => setQualifyForm({ ...qualifyForm, contactCompany: e.target.value })} /></div>
              </div>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setQualifyModal(null)}>Cancel</Button>
            <Button type="submit"><ArrowRight className="w-4 h-4" />Qualify</Button>
          </div>
        </form>
      </Modal>

      {/* Lead Detail Modal */}
      <Modal isOpen={!!detailLead} onClose={() => setDetailLead(null)} title="Lead Details" size="lg">
        {detailLead && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge color="blue">{LEAD_TYPES[detailLead.type]?.label || detailLead.type}</Badge>
              <Badge color={LEAD_STATUSES[detailLead.status]?.color || 'gray'}>{LEAD_STATUSES[detailLead.status]?.label || detailLead.status}</Badge>
              <span className="text-xs text-surface-400">{detailLead.leadNumber}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                <p className="text-xs text-surface-500">Company</p>
                <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 mt-0.5">{detailLead.company || '—'}</p>
              </div>
              <div className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                <p className="text-xs text-surface-500">Expected Value</p>
                <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 mt-0.5">{detailLead.expectedValue != null ? formatCurrency(detailLead.expectedValue) : '—'}</p>
              </div>
              <div className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                <p className="text-xs text-surface-500">Seats Required</p>
                <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 mt-0.5">{detailLead.seatsRequired ?? '—'}</p>
              </div>
              <div className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                <p className="text-xs text-surface-500">Company Size</p>
                <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 mt-0.5">{detailLead.companySize || '—'}</p>
              </div>
              <div className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                <p className="text-xs text-surface-500">Industry</p>
                <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 mt-0.5">{detailLead.industry || '—'}</p>
              </div>
              <div className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                <p className="text-xs text-surface-500">Preferred Locality</p>
                <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 mt-0.5">{detailLead.locality || '—'}</p>
              </div>
              <div className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                <p className="text-xs text-surface-500">Booking Duration</p>
                <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 mt-0.5">{detailLead.duration || '—'}</p>
              </div>
              <div className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                <p className="text-xs text-surface-500">Created</p>
                <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 mt-0.5">{formatDateTime(detailLead.createdAt)}</p>
              </div>
              <div className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                <p className="text-xs text-surface-500">Contact</p>
                <p className="text-sm font-semibold text-surface-800 dark:text-surface-100 mt-0.5">
                  {detailLead.contact ? `${detailLead.contact.firstName} ${detailLead.contact.lastName}` : 'Not associated'}
                </p>
              </div>
            </div>

            {detailLead.contact && (
              <div className="p-3 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg space-y-1.5">
                <p className="text-xs font-medium text-surface-500">Contact Details</p>
                <p className="text-sm text-surface-700 dark:text-surface-300">{detailLead.contact.email}</p>
                {detailLead.contact.phone && <p className="text-sm text-surface-700 dark:text-surface-300">{detailLead.contact.phone}</p>}
                {detailLead.contact.company && <p className="text-sm text-surface-700 dark:text-surface-300">{detailLead.contact.company}</p>}
              </div>
            )}

            {detailLead.qualificationNotes && (
              <div className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                <p className="text-xs text-surface-500 mb-1">Qualification Notes</p>
                <p className="text-sm text-surface-700 dark:text-surface-300">{detailLead.qualificationNotes}</p>
              </div>
            )}

            {detailLead.notes && (
              <div className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                <p className="text-xs text-surface-500 mb-1">Notes</p>
                <p className="text-sm text-surface-700 dark:text-surface-300">{detailLead.notes}</p>
              </div>
            )}

            {detailLead.website && (
              <div className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                <p className="text-xs text-surface-500 mb-1">Website</p>
                <a href={detailLead.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline break-all">{detailLead.website}</a>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              {showQualifyFor(detailLead) && (
                <Button variant="secondary" onClick={() => openQualify(detailLead)}><UserCheck className="w-4 h-4" />Qualify</Button>
              )}
              <Button variant="secondary" onClick={() => setDetailLead(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
