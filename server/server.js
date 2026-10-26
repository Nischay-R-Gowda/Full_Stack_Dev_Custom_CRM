import express from 'express'
import cors from 'cors'
import { prisma } from './utils/db.js'
import contactRoutes from './routes/contacts.js'
import leadRoutes from './routes/leads.js'
import dealRoutes from './routes/deals.js'
import pipelineRoutes from './routes/pipelines.js'
import dashboardRoutes from './routes/dashboard.js'
import activitiesRoutes from './routes/activities.js'
import sourcesRoutes from './routes/sources.js'
import reportsRoutes from './routes/reports.js'
import settingsRoutes from './routes/settings.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/contacts', contactRoutes)
app.use('/api/leads', leadRoutes)
app.use('/api/deals', dealRoutes)
app.use('/api/pipelines', pipelineRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/activities', activitiesRoutes)
app.use('/api/sources', sourcesRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/settings', settingsRoutes)

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 5000

async function start() {
  try {
    await prisma.$connect()
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  } catch (err) {
    console.error('Failed to start server:', err)
    process.exit(1)
  }
}

start()
