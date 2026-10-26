import { Router } from 'express'
import { prisma } from '../utils/db.js'
import { getConversionMetrics, getConversionBySource, getMonthlyRevenue } from '../services/metrics.js'

const router = Router()

/**
 * Reports endpoint.
 *
 * Previously this returned the raw Prisma `groupBy` rows, whose `_count` is
 * itself an object (`{ _count: { _all: N } }`). The frontend was reading
 * `row._count` directly and rendering it as `[object Object]` — that is the
 * "KPIs show [object Object]" bug this fix targets. Each groupBy result is now
 * mapped to a plain `{ name, count, value }` shape before it is sent, and
 * stage groupings resolve the human-readable stage name via a join instead of
 * `Stage ${stageId}`.
 */
router.get('/', async (req, res) => {
  try {
    const [leadsBySource, leadsByStatus, dealsByStage, wonLost, monthlyRevenue, conversionRate, conversionBySource] =
      await Promise.all([
        prisma.lead.groupBy({ by: ['source'], _count: { _all: true } }),
        prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
        prisma.deal.groupBy({ by: ['stageId'], _count: { _all: true }, _sum: { amount: true } }),
        prisma.deal.groupBy({ by: ['status'], _count: { _all: true }, _sum: { amount: true } }),
        getMonthlyRevenue(),
        getConversionMetrics(),
        getConversionBySource(),
      ])

    // Resolve stage names for the deals-by-stage breakdown in one query.
    const stageRows = dealsByStage
      .filter(r => r.stageId !== null)
      .map(r => ({ stageId: r.stageId, count: r._count._all, value: r._sum.amount || 0 }))

    const stageNames = new Map(
      (await prisma.stage.findMany({ select: { id: true, name: true } })).map(s => [s.id, s.name])
    )

    res.json({
      // Plain-number shapes the frontend can render without any `.all` indirection.
      leadsBySource: leadsBySource.map(r => ({ source: r.source, count: r._count._all })),
      leadsByStatus: leadsByStatus.map(r => ({ status: r.status, count: r._count._all })),
      dealsByStage: stageRows.map(r => ({
        stageId: r.stageId,
        stageName: stageNames.get(r.stageId) || `Stage ${r.stageId}`,
        count: r.count,
        value: r.value,
      })),
      wonLost: wonLost.map(r => ({ status: r.status, count: r._count._all, value: r._sum.amount || 0 })),
      monthlyRevenue,
      conversionRate,
      conversionBySource,
    })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

export default router
