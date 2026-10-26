import { prisma } from '../utils/db.js'

/**
 * Conversion metrics shared by the dashboard and the reports page.
 *
 * Both surfaces answer the same question — "how many leads actually became
 * revenue?" — so the calculation lives here once. If the definition changed in
 * two places the two pages would eventually disagree, which is exactly the kind
 * of inconsistency this project is trying to avoid.
 *
 * The rate is rounded to a whole percent. Dividing by zero (an empty database)
 * yields 0 rather than NaN, because `NaN%` rendered in the UI is a bug report
 * waiting to happen.
 */
export async function getConversionMetrics() {
  const [total, converted] = await Promise.all([
    prisma.lead.count(),
    prisma.lead.count({ where: { status: 'converted' } }),
  ])

  return {
    total,
    converted,
    rate: total > 0 ? Math.round((converted / total) * 100) : 0,
  }
}

/**
 * Lead conversion broken out by source, so the reports page can show whether
 * Google Ads leads close better than referrals, for example.
 */
export async function getConversionBySource() {
  const grouped = await prisma.lead.groupBy({
    by: ['source'],
    _count: { _all: true },
  })

  const convertedBySource = await prisma.lead.groupBy({
    by: ['source'],
    where: { status: 'converted' },
    _count: { _all: true },
  })

  // groupBy returns rows only for sources that have at least one match, so a
  // source with zero conversions is absent rather than present-with-zero.
  const convertedMap = Object.fromEntries(
    convertedBySource.map(r => [r.source, r._count._all])
  )

  return grouped.map(row => {
    const total = row._count._all
    const converted = convertedMap[row.source] || 0
    return {
      source: row.source,
      total,
      converted,
      rate: total > 0 ? Math.round((converted / total) * 100) : 0,
    }
  })
}

/**
 * Won deals grouped by calendar month over the last six months.
 * Used by the reports page's revenue trend chart.
 */
export async function getMonthlyRevenue() {
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  const deals = await prisma.deal.findMany({
    where: { actualCloseDate: { gte: sixMonthsAgo }, status: 'won' },
    select: { actualCloseDate: true, amount: true },
  })

  const grouped = {}
  deals.forEach(d => {
    const key = d.actualCloseDate.toISOString().substring(0, 7)
    grouped[key] = (grouped[key] || 0) + d.amount
  })

  return Object.entries(grouped).map(([month, revenue]) => ({ month, revenue }))
}

export default prisma
