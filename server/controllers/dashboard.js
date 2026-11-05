import { prisma } from '../utils/db.js'
import { getConversionMetrics } from '../services/metrics.js'

/**
 * Dashboard aggregation.
 *
 * Every `groupBy` row in Prisma carries `_count` as an *object*
 * (`{ _all: N }`), not a number. The original version returned those rows
 * verbatim and the frontend charts/KPIs rendered `_count` straight into JSX,
 * producing the `[object Object]` KPI bug. All grouped data below is mapped to
 * plain `{ name, value }` / `{ name, count }` shapes before it is sent, and
 * `dealsByStage` resolves the human-readable stage name instead of the raw
 * stage id.
 */
export async function getDashboardData() {
  const [
    totalContacts,
    totalLeads,
    mqlCount,
    sqlCount,
    openDeals,
    openPipelineValue,
    closedWonRevenue,
    closedLostValue,
    recentDeals,
    leadsBySource,
    leadsByStatus,
    dealsByStageRaw,
    seatDemandByLocalityRaw,
    recentLeads,
    recentActivities,
    leadsOverTime,
    conversionRate,
  ] = await Promise.all([
    prisma.contact.count(),
    prisma.lead.count(),
    prisma.lead.count({ where: { type: 'mql' } }),
    prisma.lead.count({ where: { type: 'sql' } }),
    prisma.deal.count({ where: { status: 'open' } }),
    prisma.deal.aggregate({ where: { status: 'open' }, _sum: { amount: true } }),
    prisma.deal.aggregate({ where: { status: 'won' }, _sum: { amount: true } }),
    prisma.deal.aggregate({ where: { status: 'lost' }, _sum: { amount: true } }),
    prisma.deal.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { contact: true, stage: true } }),
    prisma.lead.groupBy({ by: ['source'], _count: { _all: true } }),
    prisma.lead.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.deal.groupBy({ by: ['stageId'], where: { status: 'open' }, _sum: { amount: true }, _count: { _all: true } }),
    prisma.lead.groupBy({ by: ['locality'], where: { locality: { not: null } }, _sum: { seatsRequired: true }, _count: { _all: true } }),
    prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { contact: true } }),
    prisma.activity.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { contact: true, lead: true, deal: true } }),
    getLeadsOverTime(prisma),
    getConversionMetrics(),
  ])

  // Resolve stage names once for the deals-by-stage chart.
  const stageNameMap = new Map(
    (await prisma.stage.findMany({ select: { id: true, name: true } })).map(s => [s.id, s.name])
  )

  const dealsByStage = dealsByStageRaw.map(r => ({
    name: stageNameMap.get(r.stageId) || `Stage ${r.stageId}`,
    value: r._sum.amount || 0,
    count: r._count._all,
  }))

  const seatDemandByLocality = seatDemandByLocalityRaw.map(r => ({
    name: r.locality,
    seats: r._sum.seatsRequired || 0,
    leads: r._count._all,
  }))

  return {
    totalContacts, totalLeads, mqlCount, sqlCount, openDeals,
    openPipelineValue: openPipelineValue._sum.amount || 0,
    closedWonRevenue: closedWonRevenue._sum.amount || 0,
    closedLostValue: closedLostValue._sum.amount || 0,
    // Chart data — plain { name, value } shapes Recharts can bind to directly.
    leadsBySource: leadsBySource.map(r => ({ name: r.source, value: r._count._all })),
    leadsByStatus: leadsByStatus.map(r => ({ name: r.status, value: r._count._all })),
    dealsByStage,
    seatDemandByLocality,
    recentLeads, recentDeals, recentActivities, leadsOverTime, conversionRate,
  }
}

async function getLeadsOverTime(prisma) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const leads = await prisma.lead.findMany({
    where: { createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
    orderBy: { createdAt: 'asc' },
  })
  const grouped = {}
  leads.forEach(l => {
    const key = l.createdAt.toISOString().split('T')[0]
    grouped[key] = (grouped[key] || 0) + 1
  })
  return Object.entries(grouped).map(([date, count]) => ({ date, count }))
}
