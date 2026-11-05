import { useState } from 'react'
import { Plus, Trash2, Edit3, ChevronDown, ChevronUp, X, ArrowUp, ArrowDown } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api } from '../../services/api'
import useResource from '../../hooks/useResource'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'

export default function Pipelines() {
  const [expanded, setExpanded] = useState({})
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', description: '', isDefault: false })
  const [stageModal, setStageModal] = useState(null)
  const [editingStage, setEditingStage] = useState(null)
  const [stageForm, setStageForm] = useState({ name: '', color: '#624cc8', position: 0, isClosedWon: false, isClosedLost: false })

  const { data: pipelines, loading, reload: load } = useResource(async () => {
    const data = await api.getPipelines()
    // Expand the first pipeline by default so its stages are visible.
    setExpanded(prev => (Object.keys(prev).length ? prev : { [data[0]?.id]: true }))
    return data
  }, [])

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', isDefault: false }); setError(''); setModalOpen(true) }

  const openEdit = (p) => {
    setEditing(p)
    // Only the columns the API accepts — sending `id`/`stages` caused Prisma errors.
    setForm({ name: p.name, description: p.description || '', isDefault: p.isDefault })
    setError('')
    setModalOpen(true)
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editing) {
        await api.updatePipeline(editing.id, form)
        toast.success('Pipeline updated')
      } else {
        await api.createPipeline(form)
        toast.success('Pipeline created with 7 default stages')
      }
      setModalOpen(false); load()
    } catch (err) { setError(err.message) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this pipeline? Deals must be moved first.')) return
    try { await api.deletePipeline(id); toast.success('Pipeline deleted'); load() } catch (err) { toast.error(err.message) }
  }

  const openStageModal = (pipeline, stage = null) => {
    setStageModal(pipeline)
    setEditingStage(stage)
    if (stage) {
      setStageForm({ name: stage.name, color: stage.color, position: stage.position, isClosedWon: stage.isClosedWon, isClosedLost: stage.isClosedLost })
    } else {
      const lastPosition = pipeline.stages.length ? Math.max(...pipeline.stages.map(s => s.position)) + 1 : 0
      setStageForm({ name: '', color: '#624cc8', position: lastPosition, isClosedWon: false, isClosedLost: false })
    }
    setError('')
  }

  const handleStageSave = async (e) => {
    e.preventDefault()
    setError('')
    try {
      if (editingStage) {
        await api.updateStage(editingStage.id, stageForm)
        toast.success('Stage updated')
      } else {
        await api.createStage(stageModal.id, stageForm)
        toast.success('Stage added')
      }
      setStageModal(null); setEditingStage(null); load()
    } catch (err) { setError(err.message) }
  }

  const handleStageDelete = async (stageId) => {
    if (!confirm('Delete this stage? Deals must be moved first.')) return
    try { await api.deleteStage(stageId); toast.success('Stage deleted'); load() } catch (err) { toast.error(err.message) }
  }

  const handleMoveStage = async (pipeline, stage, direction) => {
    const stages = [...pipeline.stages].sort((a, b) => a.position - b.position)
    const index = stages.findIndex(s => s.id === stage.id)
    const target = stages[index + direction]
    if (!target) return
    try {
      await Promise.all([
        api.updateStage(stage.id, { position: target.position }),
        api.updateStage(target.id, { position: stage.position }),
      ])
      load()
    } catch (err) { toast.error(err.message) }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-surface-800">Sales Pipelines</h1>
          <p className="text-sm text-surface-500 mt-1">Configure pipelines and the stages your deals move through.</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4" />New Pipeline</Button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array(2).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-surface-200 p-4 animate-pulse">
              <div className="h-5 bg-surface-100 rounded w-1/4 mb-3" />
              <div className="h-4 bg-surface-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : pipelines.length === 0 ? (
        <div className="bg-white rounded-xl border border-surface-200 p-12 text-center">
          <p className="text-surface-500">No pipelines yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pipelines.map(pipeline => (
            <div key={pipeline.id} className="bg-white rounded-xl border border-surface-200 overflow-hidden">
              <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-surface-50 transition-colors" onClick={() => setExpanded({ ...expanded, [pipeline.id]: !expanded[pipeline.id] })}>
                <div className="flex items-center gap-3 min-w-0">
                  {expanded[pipeline.id] ? <ChevronUp className="w-5 h-5 text-surface-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-surface-400 flex-shrink-0" />}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-surface-800">
                      {pipeline.name}
                      {pipeline.isDefault && <span className="text-xs text-primary-600 ml-2 font-normal">Default</span>}
                    </h3>
                    {pipeline.description && <p className="text-xs text-surface-500 truncate">{pipeline.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0" onClick={e => e.stopPropagation()}>
                  <span className="text-xs text-surface-500">{pipeline.stages.length} stage{pipeline.stages.length !== 1 ? 's' : ''}</span>
                  <button onClick={() => openEdit(pipeline)} className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors" title="Edit pipeline"><Edit3 className="w-4 h-4 text-surface-500" /></button>
                  <button onClick={() => handleDelete(pipeline.id)} className="p-1.5 hover:bg-red-50 rounded-lg transition-colors" title="Delete pipeline"><Trash2 className="w-4 h-4 text-red-500" /></button>
                </div>
              </div>
              {expanded[pipeline.id] && (
                <div className="px-4 pb-4 border-t border-surface-100 pt-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {[...pipeline.stages].sort((a, b) => a.position - b.position).map((stage, i, arr) => (
                      <div key={stage.id} className="flex items-center">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-50 border border-surface-200 rounded-lg text-sm group">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: stage.color }} />
                          <span className="text-surface-700">{stage.name}</span>
                          {stage._count?.deals > 0 && (
                            <span className="text-xs text-surface-500 bg-white px-1.5 rounded-full">{stage._count.deals}</span>
                          )}
                          {stage.isClosedWon && <span className="text-xs text-emerald-600 font-medium">Won</span>}
                          {stage.isClosedLost && <span className="text-xs text-red-600 font-medium">Lost</span>}
                          <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {i > 0 && <button onClick={() => handleMoveStage(pipeline, stage, -1)} className="p-0.5 hover:bg-surface-200 rounded" title="Move earlier"><ArrowUp className="w-3 h-3 text-surface-500" /></button>}
                            {i < arr.length - 1 && <button onClick={() => handleMoveStage(pipeline, stage, 1)} className="p-0.5 hover:bg-surface-200 rounded" title="Move later"><ArrowDown className="w-3 h-3 text-surface-500" /></button>}
                            <button onClick={() => openStageModal(pipeline, stage)} className="p-0.5 hover:bg-surface-200 rounded" title="Edit stage"><Edit3 className="w-3 h-3 text-surface-500" /></button>
                            <button onClick={() => handleStageDelete(stage.id)} className="p-0.5 hover:bg-red-100 rounded" title="Delete stage"><X className="w-3 h-3 text-red-500" /></button>
                          </div>
                        </div>
                        {i < arr.length - 1 && <svg className="w-3 h-3 text-surface-300 mx-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>}
                      </div>
                    ))}
                    <button onClick={() => openStageModal(pipeline)} className="p-1.5 hover:bg-surface-100 rounded-lg transition-colors" title="Add stage"><Plus className="w-4 h-4 text-surface-500" /></button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pipeline Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Pipeline' : 'New Pipeline'}>
        <form onSubmit={handleSave} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <Input label="Pipeline Name" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
          <Input label="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
          <label className="flex items-center gap-2 text-sm text-surface-700"><input type="checkbox" checked={form.isDefault} onChange={e => setForm({ ...form, isDefault: e.target.checked })} />Set as default pipeline</label>
          {!editing && (
            <p className="text-xs text-surface-500 bg-surface-50 p-3 rounded-lg">
              A new pipeline is created with 7 default stages (New Opportunity through Closed Won / Closed Lost). You can rename, reorder, or delete them afterwards.
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editing ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      {/* Stage Modal */}
      <Modal isOpen={!!stageModal} onClose={() => { setStageModal(null); setEditingStage(null) }} title={editingStage ? 'Edit Stage' : 'Add Stage'}>
        <form onSubmit={handleStageSave} className="space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <Input label="Stage Name" required value={stageForm.name} onChange={e => setStageForm({ ...stageForm, name: e.target.value })} />
          <div className="flex items-center gap-3">
            <label className="text-sm text-surface-700">Colour:</label>
            <input type="color" value={stageForm.color} onChange={e => setStageForm({ ...stageForm, color: e.target.value })} className="w-10 h-8 rounded border border-surface-300 cursor-pointer" />
          </div>
          <label className="flex items-center gap-2 text-sm text-surface-700"><input type="checkbox" checked={stageForm.isClosedWon} onChange={e => setStageForm({ ...stageForm, isClosedWon: e.target.checked, isClosedLost: e.target.checked ? false : stageForm.isClosedLost })} />Closed Won stage (deals here count as revenue)</label>
          <label className="flex items-center gap-2 text-sm text-surface-700"><input type="checkbox" checked={stageForm.isClosedLost} onChange={e => setStageForm({ ...stageForm, isClosedLost: e.target.checked, isClosedWon: e.target.checked ? false : stageForm.isClosedWon })} />Closed Lost stage</label>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => { setStageModal(null); setEditingStage(null) }}>Cancel</Button>
            <Button type="submit">{editingStage ? 'Update Stage' : 'Add Stage'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
