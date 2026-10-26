import { Router } from 'express'
import { getLeads, getLead, createLead, updateLead, deleteLead, qualifyLead, convertLeadToDeal, getLeadReadiness } from '../controllers/leads.js'

const router = Router()

router.get('/', (req, res) => {
  getLeads(req.query).then(data => res.json(data)).catch(err => res.status(500).json({ error: err.message }))
})
router.get('/:id', (req, res) => {
  getLead(Number(req.params.id)).then(data => data ? res.json(data) : res.status(404).json({ error: 'Lead not found' })).catch(err => res.status(500).json({ error: err.message }))
})
router.post('/', (req, res) => {
  createLead(req.body).then(data => res.status(201).json(data)).catch(err => res.status(400).json({ error: err.message }))
})
router.put('/:id', (req, res) => {
  updateLead(Number(req.params.id), req.body).then(data => res.json(data)).catch(err => res.status(400).json({ error: err.message }))
})
router.delete('/:id', (req, res) => {
  deleteLead(Number(req.params.id)).then(() => res.json({ success: true })).catch(err => res.status(500).json({ error: err.message }))
})
router.post('/:id/qualify', (req, res) => {
  qualifyLead(Number(req.params.id), req.body).then(data => res.json(data)).catch(err => res.status(400).json({ error: err.message }))
})
// 201 because this route creates a Deal row, not just mutates the Lead.
router.post('/:id/convert', (req, res) => {
  convertLeadToDeal(Number(req.params.id), req.body).then(data => res.status(201).json(data)).catch(err => res.status(400).json({ error: err.message }))
})
// Qualification gate — the UI calls this to decide whether to show the
// "Qualify" button or a "missing fields" hint instead.
router.get('/:id/readiness', (req, res) => {
  getLeadReadiness(Number(req.params.id)).then(data => res.json(data)).catch(err => res.status(404).json({ error: err.message }))
})

export default router
