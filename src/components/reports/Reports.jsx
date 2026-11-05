import { Download } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { api } from '../../services/api'
import useResource from '../../hooks/useResource'
import Button from '../ui/Button'
import { formatCurrency } from '../../utils/constants'

// Declared at module level — a component defined inside the render function is
// recreated on every render and would reset its own state.
function ChartEmpty() {
  return <div className="flex items-center justify-center h-[280px] text-sm text-surface-400">No data available</div>
}

const COLORS = ['#765fdc', '#d36d55', '#c08b2d', '#5379c7', '#be628e', '#3d9a90', '#8a758b']

export default function Reports() {
  const { data, loading, error } = useResource(() => api.getReports(), [])

  const exportCSV = () => {
    if (!data) return
    // Fields come pre-mapped from the backend as plain { source, count } /
    // { status, count } / { stageName, count, value } — no `_count` objects.
    const rows = [['Section', 'Name', 'Leads', 'Converted', 'Rate %', 'Value']]
    ;(data.leadsBySource || []).forEach(s => rows.push(['Leads by Source', s.source, s.count, '', '', '']))
    ;(data.leadsByStatus || []).forEach(s => rows.push(['Leads by Status', s.status, s.count, '', '', '']))
    ;(data.dealsByStage || []).forEach(s => rows.push(['Deals by Stage', s.stageName, s.count, '', '', s.value || 0]))
    ;(data.wonLost || []).forEach(s => rows.push(['Won/Lost', s.status, s.count, '', '', s.value || 0]))
    ;(data.monthlyRevenue || []).forEach(m => rows.push(['Monthly Revenue', m.month, '', '', '', m.revenue]))
    if (data.conversionRate) rows.push(['Conversion', 'All leads', data.conversionRate.total, data.conversionRate.converted, data.conversionRate.rate, ''])
    ;(data.conversionBySource || []).forEach(c => rows.push(['Conversion by Source', c.source, c.total, c.converted, c.rate, '']))

    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'nrg-coworking-report.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="text-center py-12 text-surface-400">Loading reports...</div>
  if (error) return <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">Failed to load reports: {error}</div>
  if (!data) return null

  const sourceData = (data.leadsBySource || []).map(s => ({ name: s.source.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), count: s.count }))
  const statusData = (data.leadsByStatus || []).map(s => ({ name: s.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()), count: s.count }))
  const stageData = (data.dealsByStage || []).map(s => ({ name: s.stageName, value: s.value || 0, count: s.count }))
  const wonLostData = (data.wonLost || []).map(s => ({ name: s.status, value: s.value || 0, count: s.count }))
  const monthlyData = (data.monthlyRevenue || []).map(m => ({ name: m.month, revenue: m.revenue }))

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-xl font-semibold text-surface-800">Reports & Analytics</h1>
          <p className="text-sm text-surface-500 mt-1">Generated from live application data</p>
        </div>
        <Button variant="secondary" onClick={exportCSV}><Download className="w-4 h-4" />Export CSV</Button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface-900 dark:border-surface-700 rounded-xl border border-surface-200 p-4">
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400">Total Leads</p>
          <p className="text-2xl font-bold text-surface-800 dark:text-surface-100 mt-1">{(data.leadsBySource || []).reduce((a, b) => a + b.count, 0)}</p>
        </div>
        <div className="bg-white dark:bg-surface-900 dark:border-surface-700 rounded-xl border border-surface-200 p-4">
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400">Total Deals</p>
          <p className="text-2xl font-bold text-surface-800 dark:text-surface-100 mt-1">{(data.dealsByStage || []).reduce((a, b) => a + b.count, 0)}</p>
        </div>
        <div className="bg-white dark:bg-surface-900 dark:border-surface-700 rounded-xl border border-surface-200 p-4">
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400">Won Deals</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{(data.wonLost || []).find(w => w.status === 'won')?.count || 0}</p>
        </div>
        <div className="bg-white dark:bg-surface-900 dark:border-surface-700 rounded-xl border border-surface-200 p-4">
          <p className="text-xs font-medium text-surface-500 dark:text-surface-400">Won Revenue</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{formatCurrency((data.wonLost || []).find(w => w.status === 'won')?.value || 0)}</p>
        </div>
      </div>

      {/* Conversion metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-surface-900 dark:border-surface-700 rounded-xl border border-surface-200 p-5">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Lead Conversion</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-surface-500">Total leads</span>
              <span className="text-sm font-semibold text-surface-800">{data.conversionRate?.total ?? 0}</span>
            </div>
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-surface-500">Converted to deals</span>
              <span className="text-sm font-semibold text-surface-800">{data.conversionRate?.converted ?? 0}</span>
            </div>
            <div className="pt-3 border-t border-surface-200 flex justify-between items-baseline">
              <span className="text-sm text-surface-500">Conversion rate</span>
              <span className="text-xl font-bold text-primary-600">{data.conversionRate?.rate ?? 0}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-surface-900 dark:border-surface-700 rounded-xl border border-surface-200 p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Conversion by Lead Source</h3>
          {(data.conversionBySource || []).length === 0 ? (
            <p className="text-sm text-surface-400 py-8 text-center">No source data available</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="text-left pb-2 text-xs font-semibold text-surface-500 uppercase tracking-wider">Source</th>
                  <th className="text-right pb-2 text-xs font-semibold text-surface-500 uppercase tracking-wider">Leads</th>
                  <th className="text-right pb-2 text-xs font-semibold text-surface-500 uppercase tracking-wider">Converted</th>
                  <th className="text-right pb-2 text-xs font-semibold text-surface-500 uppercase tracking-wider">Rate</th>
                </tr>
              </thead>
              <tbody>
                {(data.conversionBySource || []).map(row => (
                  <tr key={row.source} className="border-b border-surface-100">
                    <td className="py-2.5 text-surface-800 capitalize">{row.source.replace(/_/g, ' ')}</td>
                    <td className="py-2.5 text-right text-surface-600">{row.total}</td>
                    <td className="py-2.5 text-right text-surface-600">{row.converted}</td>
                    <td className="py-2.5 text-right font-semibold text-primary-600">{row.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-surface-900 dark:border-surface-700 rounded-xl border border-surface-200 p-5">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Leads by Source</h3>
          {sourceData.length === 0 ? <ChartEmpty /> : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={sourceData}><CartesianGrid strokeDasharray="3 3" stroke="#e8e2da" /><XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7c716b' }} /><YAxis tick={{ fontSize: 11, fill: '#7c716b' }} allowDecimals={false} /><Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #e8e2da' }} /><Bar dataKey="count" fill="#624cc8" radius={[2, 2, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white dark:bg-surface-900 dark:border-surface-700 rounded-xl border border-surface-200 p-5">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Leads by Status</h3>
          {statusData.length === 0 ? <ChartEmpty /> : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart><Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="count" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}>{statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Pie><Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} /></PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white dark:bg-surface-900 dark:border-surface-700 rounded-xl border border-surface-200 p-5">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Pipeline Value by Stage</h3>
          {stageData.length === 0 ? <ChartEmpty /> : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stageData}><CartesianGrid strokeDasharray="3 3" stroke="#e8e2da" /><XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7c716b' }} /><YAxis tick={{ fontSize: 11, fill: '#7c716b' }} tickFormatter={v => formatCurrency(v)} /><Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #e8e2da' }} formatter={(v) => [formatCurrency(v), 'Value']} /><Bar dataKey="value" fill="#d36d55" radius={[2, 2, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="bg-white dark:bg-surface-900 dark:border-surface-700 rounded-xl border border-surface-200 p-5">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Won vs Lost Distribution</h3>
          {wonLostData.length === 0 ? <ChartEmpty /> : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart><Pie data={wonLostData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, value }) => `${name}: ${formatCurrency(value)}`}>{wonLostData.map((_, i) => <Cell key={i} fill={i === 0 ? '#4f8a72' : '#bf704c'} />)}</Pie><Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e4e3db' }} /></PieChart>
            </ResponsiveContainer>
          )}
        </div>
        {monthlyData.length > 0 && (
          <div className="bg-white dark:bg-surface-900 dark:border-surface-700 rounded-xl border border-surface-200 p-5 lg:col-span-2">
            <h3 className="text-sm font-semibold text-surface-700 mb-4">Won Revenue Over Time</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={monthlyData}><CartesianGrid strokeDasharray="3 3" stroke="#e8e2da" /><XAxis dataKey="name" tick={{ fontSize: 11, fill: '#7c716b' }} /><YAxis tick={{ fontSize: 11, fill: '#7c716b' }} tickFormatter={v => formatCurrency(v)} /><Tooltip contentStyle={{ borderRadius: '4px', border: '1px solid #e8e2da' }} formatter={(v) => [formatCurrency(v), 'Revenue']} /><Line type="monotone" dataKey="revenue" stroke="#5379c7" strokeWidth={2} dot={{ fill: '#5379c7', r: 3 }} /></LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
