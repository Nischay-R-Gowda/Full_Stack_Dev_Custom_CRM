import { Router } from 'express'
import { resetAllData } from '../controllers/settings.js'

const router = Router()

// POST /api/settings/reset — body: { password: string }
// Returns 400 (and leaves all data untouched) on a wrong password; 200 with a
// cleared-counts summary on success. See server/controllers/settings.js for
// the security caveat on this demo-only destructive endpoint.
router.post('/reset', (req, res) => {
  resetAllData(req.body.password).then(data => res.json(data))
    .catch(err => res.status(400).json({ error: err.message }))
})

export default router
