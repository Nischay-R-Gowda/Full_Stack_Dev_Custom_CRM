import { useState } from 'react'
import { Plus, ArrowRight, CheckCircle2, XCircle, Trash2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api } from '../../services/api'
import { formatCurrency, formatDate, formatDateTime } from '../../utils/constants'
import useResource from '../../hooks/useResource'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Select from '../ui/SearchableSelect'
import { Badge } from '../ui/Badge'
import Modal from '../ui/Modal'

const emptyForm = { dealName: '', amount: '', contactId: '', stageId: '', pipelineId: '', expectedCloseDate: '', notes: '' }

export default function Deals() {
  const [deals, setDeals] = useState([])
  const [pipelines, setPipelines] = useState([])
  const [contacts, setContacts] = useState([])
  const [pipelineFilter, setPipelineFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [detailDeal, setDetailDeal] = useState(null)
  const [expectedCloseDraft, setExpectedCloseDraft] = useState('')
  const [error, setError] = useState('')
  const [form, setForm] = useState(emptyForm)

  const openDetails = deal => {
    setDetailDeal(deal)
    if (!deal.expectedCloseDate) { setExpectedCloseDraft(''); return }
    const date = new Date(deal.expectedCloseDate)
    setExpectedCloseDraft(Number.isNaN(date.getTime()) ? '' : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10))
  }

  // The hook gives us `loading` and `error` for the page; deals are held in
  // local state because the pipeline selector rewrites them client-side.
  const { loading, reload } = useResource(async () => {
    const [d, p, c] = await Promise.all([
      api.getDeals(pipelineFilter ? { pipelineId: pipelineFilter } : {}),
      api.getPipelines(),
      api.getContacts({}),
    ])
    setDeals(d); setPipelines(p); setContacts(c)
  }, [pipelineFilter])

  // pipelineFilter holds the <select> value, which is always a string, while
  // Pipeline.id is a number. Comparing them with === never matches, which left
  // the board on a pipeline with no stages — hence "12 deals but 0 shown".
  // Coerce once here so every downstream lookup is a number comparison.
  const selectedPipelineId = pipelineFilter === '' ? null : Number(pipelineFilter)
  const activePipeline = pipelines.find(p => p.id === selectedPipelineId)
    || pipelines.find(p => p.isDefault)
    || pipelines[0]
  const stages = activePipeline ? [...activePipeline.stages].sort((a, b) => a.position - b.position) : []

  // One pass over the deals builds each column's contents, its value, and its
  // count, so the board totals can't drift from the cards it renders.
  const dealsByStage = stages.map(stage => {
    const inStage = deals.filter(d => d.stageId === stage.id)
    return { stage, deals: inStage, total: inStage.reduce((sum, d) => sum + (d.amount || 0), 0), count: inStage.length }
  })

  if (loading && pipelines.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-surface-400">Loading pipeline...</p>
        </div>
      </div>
    )
  }

  const openCreate = () => {
    setForm({
      ...emptyForm,
      stageId: String(stages[0]?.id || ''),
      pipelineId: String(activePipeline?.id || ''),
    })
    setError('')
    setModalOpen(true)
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.createDeal({
        dealName: form.dealName.trim(),
        amount: parseFloat(form.amount) || 0,
        contactId: Number(form.contactId),
        stageId: Number(form.stageId),
        pipelineId: Number(form.pipelineId),
        expectedCloseDate: form.expectedCloseDate || null,
        notes: form.notes || null,
      })
      setModalOpen(false); reload()
    } catch (err) { setError(err.message) }
  }

  const handleMoveStage = async (dealId, stageId) => {
    try { await api.moveDealStage(dealId, stageId); reload() } catch (err) { alert(err.message) }
  }

  const saveExpectedClose = async () => {
    try {
      const value = expectedCloseDraft ? new Date(`${expectedCloseDraft}T12:00:00`).toISOString() : null
      const updated = await api.updateDeal(detailDeal.id, { expectedCloseDate: value })
      setDetailDeal(updated)
      setDeals(current => current.map(deal => deal.id === updated.id ? updated : deal))
      toast.success('Expected close date saved')
    } catch (err) { toast.error(err.message || 'Could not save the expected close date') }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this deal?')) return
    try { await api.deleteDeal(id); toast.success('Deal deleted'); reload() } catch (err) { toast.error(err.message) }
  }

  // Kanban view
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <select value={pipelineFilter} onChange={e => setPipelineFilter(e.target.value)} className="px-3 py-2 bg-white border border-surface-300 rounded-lg text-sm">
            <option value="">Default Pipeline</option>
            {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <span className="text-sm text-surface-500">{deals.length} deal{deals.length !== 1 ? 's' : ''}</span>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" />New Deal</Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {dealsByStage.map(({ stage, deals: stageDeals, total: stageValue, count }, stageIndex) => {
          const prevStage = dealsByStage[stageIndex - 1]?.stage
          const nextStage = dealsByStage[stageIndex + 1]?.stage
          return (
            <div key={stage.id} className="flex-shrink-0 w-72 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 border-t-4 rounded-xl p-3 space-y-3" style={{ borderTopColor: stage.color }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
                  <h3 className="text-sm font-semibold text-surface-800 truncate">{stage.name}</h3>
                  <span className="text-xs text-surface-500 bg-white px-1.5 py-0.5 rounded-full flex-shrink-0">{count}</span>
                </div>
                {stage.isClosedWon && <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                {stage.isClosedLost && <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />}
              </div>
              <p className="text-xs text-surface-500 font-medium">{formatCurrency(stageValue)}</p>
              <div className="space-y-2">
                {stageDeals.map(deal => (
                  <div key={deal.id} className="bg-white rounded-lg border border-surface-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => openDetails(deal)}>
                    <p className="text-sm font-medium text-surface-800 truncate">{deal.dealName}</p>
                    <p className="text-xs text-surface-500 mt-1 truncate">{deal.contact?.firstName} {deal.contact?.lastName}{deal.contact?.company ? ` · ${deal.contact.company}` : ''}</p>
                    <p className="text-[10px] text-surface-400 mt-1">Created {formatDateTime(deal.createdAt)}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm font-semibold text-surface-800">{formatCurrency(deal.amount)}</span>
                      {deal.expectedCloseDate && <span className="text-xs text-surface-400">{formatDate(deal.expectedCloseDate)}</span>}
                    </div>
                    <div className="flex gap-1 mt-2">
                      {prevStage && <button onClick={(e) => { e.stopPropagation(); handleMoveStage(deal.id, prevStage.id) }} className="text-xs px-2 py-1 bg-surface-100 hover:bg-surface-200 rounded transition-colors">← {prevStage.name}</button>}
                      {nextStage && <button onClick={(e) => { e.stopPropagation(); handleMoveStage(deal.id, nextStage.id) }} className="text-xs px-2 py-1 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded transition-colors ml-auto flex items-center gap-1">{nextStage.name} <ArrowRight className="w-3 h-3" /></button>}
                    </div>
                  </div>
                ))}
                {stageDeals.length === 0 && <div className="text-center py-6 text-xs text-surface-400 border-2 border-dashed border-surface-200 rounded-lg">No deals</div>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Deal" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <Input label="Deal Name *" required value={form.dealName} onChange={e => setForm({ ...form, dealName: e.target.value })} />
          <Input label="Amount (₹) *" type="number" required min="0" step="any" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} />
          <Input label="Expected Close Date" type="date" value={form.expectedCloseDate} onChange={e => setForm({ ...form, expectedCloseDate: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Pipeline"
              value={form.pipelineId}
              onChange={v => {
                const nextPipeline = pipelines.find(p => String(p.id) === String(v))
                // Reset the stage whenever the pipeline changes — a stage id from
                // the previous pipeline would be rejected by the API.
                setForm({ ...form, pipelineId: v, stageId: String(nextPipeline?.stages?.[0]?.id || '') })
              }}
              options={pipelines.map(p => ({ value: String(p.id), label: p.name }))}
            />
            <Select
              label="Stage"
              value={form.stageId}
              onChange={v => setForm({ ...form, stageId: v })}
              options={(pipelines.find(p => String(p.id) === String(form.pipelineId))?.stages || []).map(s => ({ value: String(s.id), label: s.name }))}
            />
          </div>
          {/* Real contact picker — the previous version asked the user to type a
              numeric contact id by hand, which nobody can know. */}
          <Select
            label="Contact *"
            required
            value={form.contactId ? String(form.contactId) : ''}
            onChange={v => setForm({ ...form, contactId: v })}
            placeholder="Select a contact..."
            options={contacts.map(c => ({
              value: String(c.id),
              label: `${c.firstName} ${c.lastName}${c.company ? ` — ${c.company}` : ''}`,
            }))}
          />
          <Input label="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Deal</Button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={!!detailDeal} onClose={() => setDetailDeal(null)} title="Deal Details" size="lg">
        {detailDeal && (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-lg font-semibold text-surface-800">{detailDeal.dealName}</h3>
                <p className="text-sm text-surface-500 mt-0.5">
                  {detailDeal.contact ? `${detailDeal.contact.firstName} ${detailDeal.contact.lastName}` : 'No contact'}
                  {detailDeal.contact?.company ? ` · ${detailDeal.contact.company}` : ''}
                </p>
                {detailDeal.contact?.email && <p className="text-xs text-surface-500 mt-1">{detailDeal.contact.email}</p>}
              </div>
              <Badge color={detailDeal.status === 'won' ? 'green' : detailDeal.status === 'lost' ? 'red' : 'blue'}>
                {detailDeal.status === 'won' ? 'Closed Won' : detailDeal.status === 'lost' ? 'Closed Lost' : 'Open'}
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-surface-50 rounded-lg"><p className="text-xs text-surface-500">Amount</p><p className="text-sm font-semibold text-surface-800 mt-0.5">{formatCurrency(detailDeal.amount)}</p></div>
              <div className="p-3 bg-surface-50 rounded-lg"><p className="text-xs text-surface-500">Stage</p><p className="text-sm font-semibold text-surface-800 mt-0.5">{detailDeal.stage?.name}</p></div>
              <div className="p-3 bg-surface-50 rounded-lg"><p className="text-xs text-surface-500">Pipeline</p><p className="text-sm font-semibold text-surface-800 mt-0.5">{detailDeal.pipeline?.name}</p></div>
              <div className="p-3 bg-surface-50 rounded-lg"><label htmlFor="expected-close-date" className="block text-xs text-surface-500">Expected Close</label><div className="mt-1 flex flex-wrap items-center gap-2"><input id="expected-close-date" type="date" value={expectedCloseDraft} onChange={event => setExpectedCloseDraft(event.target.value)} className="min-w-0 bg-transparent text-sm font-semibold text-surface-800 focus:outline-none focus:ring-1 focus:ring-primary-500" /><button type="button" onClick={saveExpectedClose} className="text-xs font-semibold text-primary-700 hover:text-primary-900">Save</button></div></div>
              <div className="p-3 bg-surface-50 rounded-lg"><p className="text-xs text-surface-500">Created</p><p className="text-sm font-semibold text-surface-800 mt-0.5">{formatDateTime(detailDeal.createdAt)}</p></div>
              <div className="p-3 bg-surface-50 rounded-lg"><p className="text-xs text-surface-500">Actual Close</p><p className="text-sm font-semibold text-surface-800 mt-0.5">{detailDeal.actualCloseDate ? formatDateTime(detailDeal.actualCloseDate) : detailDeal.status === 'open' ? 'Set when deal closes' : '—'}</p></div>
              {detailDeal.status === 'lost' && detailDeal.lostReason && (
                <div className="p-3 bg-red-50 rounded-lg col-span-2"><p className="text-xs text-red-600">Lost Reason</p><p className="text-sm font-semibold text-red-800 mt-0.5">{detailDeal.lostReason}</p></div>
              )}
            </div>

            {detailDeal.notes && <div className="p-3 bg-surface-50 rounded-lg"><p className="text-xs text-surface-500 mb-1">Notes</p><p className="text-sm text-surface-700">{detailDeal.notes}</p></div>}

            {/* Move between stages without leaving the modal */}
            <div>
              <p className="text-xs font-medium text-surface-500 mb-2">Move to stage</p>
              <div className="flex flex-wrap gap-2">
                {stages.map(s => (
                  <button
                    key={s.id}
                    onClick={() => { handleMoveStage(detailDeal.id, s.id); setDetailDeal(null) }}
                    disabled={s.id === detailDeal.stageId}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${s.id === detailDeal.stageId ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-surface-700 border-surface-300 hover:bg-surface-50'}`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="danger" onClick={() => { handleDelete(detailDeal.id); setDetailDeal(null) }}>
                <Trash2 className="w-4 h-4" />Delete
              </Button>
              <Button variant="secondary" onClick={() => setDetailDeal(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
