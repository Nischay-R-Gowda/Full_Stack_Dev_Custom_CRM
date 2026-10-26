import { Users, UserPlus, GitBranch, Handshake, TrendingUp, Target, MapPin } from 'lucide-react'
import { Card, CardSkeleton } from '../ui/Card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'
import { api } from '../../services/api'
import { formatCurrency, formatRelativeTime } from '../../utils/constants'
import useResource from '../../hooks/useResource'

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#22c55e', '#3b82f6', '#ef4444']

// Capitalise a raw key like "google_ads" → "Google Ads".
const pretty = s => s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())

export default function Dashboard() {
  // Every dashboard figure is derived from this single request — nothing on
  // this page is hard-coded, so the cards and charts can never disagree.
  const { data, loading, error } = useResource(() => api.getDashboard(), [])

  if (loading) return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">{Array(8).fill(0).map((_, i) => <CardSkeleton key={i} />)}</div>

  if (error) return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
      <p className="text-sm font-medium text-red-800">Could not load the dashboard</p>
      <p className="text-xs text-red-600 mt-1">{error}</p>
      <p className="text-xs text-red-600 mt-2">Make sure the backend server is running on port 5000.</p>
    </div>
  )

  if (!data) return null

  // The backend now returns pre-mapped { name, value } chart data — no more
  // raw Prisma groupBy objects, so the KPIs and charts always render real
  // numbers instead of `[object Object]`.
  const sourceChart = (data?.leadsBySource || []).map(s => ({ name: pretty(s.name), value: s.value }))
  const statusChart = (data?.leadsByStatus || []).map(s => ({ name: pretty(s.name), value: s.value }))
  const seatChart = (data?.seatDemandByLocality || []).map(s => ({ name: s.name, value: s.seats }))
  const conversionRate = data?.conversionRate?.rate || 0

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card title="Total Contacts" value={data?.totalContacts || 0} icon={Users} color="indigo" />
        <Card title="Total Leads" value={data?.totalLeads || 0} icon={UserPlus} color="blue" />
        <Card title="MQLs" value={data?.mqlCount || 0} icon={Target} color="violet" />
        <Card title="SQLs" value={data?.sqlCount || 0} icon={TrendingUp} color="emerald" />
        <Card title="Open Deals" value={data?.openDeals || 0} icon={Handshake} color="amber" />
        <Card title="Open Pipeline" value={formatCurrency(data?.openPipelineValue || 0)} icon={GitBranch} color="sky" />
        <Card title="Closed Won" value={formatCurrency(data?.closedWonRevenue || 0)} icon={TrendingUp} color="emerald" />
        <Card title="Conversion Rate" value={`${conversionRate}%`} icon={Target} color="rose" />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Lead Acquisition Over Time</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={data?.leadsOverTime || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={d => new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
              <Line type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 3 }} name="New Leads" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Leads by Source</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={sourceChart} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`} labelLine={false}>
                {sourceChart.map((entry, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Lead Status Distribution</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={statusChart}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Revenue Overview</h3>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div className="text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-xs text-emerald-600 font-medium">Pipeline Value</p>
              <p className="text-xl font-bold text-emerald-800 mt-1">{formatCurrency(data?.openPipelineValue || 0)}</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-600 font-medium">Closed Won</p>
              <p className="text-xl font-bold text-blue-800 mt-1">{formatCurrency(data?.closedWonRevenue || 0)}</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-xs text-red-600 font-medium">Closed Lost</p>
              <p className="text-xl font-bold text-red-800 mt-1">{formatCurrency(data?.closedLostValue || 0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* NRG: Seat Demand by Locality */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <h3 className="text-sm font-semibold text-surface-700 mb-4 flex items-center gap-2"><MapPin className="w-4 h-4 text-primary-600" />Seat Demand by Locality</h3>
          {seatChart.length === 0 ? (
            <p className="text-sm text-surface-400 py-10 text-center">No leads with locality data yet. Add a lead with a preferred Bengaluru locality.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={seatChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Seats Requested" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Deals by stage (open pipeline) */}
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Open Deals by Stage</h3>
          {(data?.dealsByStage || []).length === 0 ? (
            <p className="text-sm text-surface-400 py-10 text-center">No open deals in the pipeline.</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={(data?.dealsByStage || []).map(s => ({ name: s.name, value: s.value }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} name="Pipeline Value" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Recent Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Recent Leads</h3>
          <div className="space-y-3">
            {(data?.recentLeads || []).map(lead => (
              <div key={lead.id} className="flex items-center justify-between p-3 hover:bg-surface-50 rounded-lg transition-colors">
                <div>
                  <p className="text-sm font-medium text-surface-800">{lead.contact?.firstName} {lead.contact?.lastName}</p>
                  <p className="text-xs text-surface-500">{lead.company} · {pretty(lead.source)}</p>
                </div>
                <span className="text-xs text-surface-400">{formatRelativeTime(lead.createdAt)}</span>
              </div>
            ))}
            {(!data?.recentLeads || data.recentLeads.length === 0) && <p className="text-sm text-surface-400 text-center py-6">No leads yet</p>}
          </div>
        </div>
        <div className="bg-white rounded-xl border border-surface-200 p-5">
          <h3 className="text-sm font-semibold text-surface-700 mb-4">Recent Activities</h3>
          <div className="space-y-3">
            {(data?.recentActivities || []).map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-surface-50 rounded-lg transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-800">{activity.subject}</p>
                  <p className="text-xs text-surface-500">{activity.type} · {activity.contact ? `${activity.contact.firstName} ${activity.contact.lastName}` : 'No contact'}</p>
                </div>
                <span className="text-xs text-surface-400 flex-shrink-0">{formatRelativeTime(activity.createdAt)}</span>
              </div>
            ))}
            {(!data?.recentActivities || data.recentActivities.length === 0) && <p className="text-sm text-surface-400 text-center py-6">No activities yet</p>}
          </div>
        </div>
      </div>
    </div>
  )
}
