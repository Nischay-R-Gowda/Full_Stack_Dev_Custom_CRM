import { ArrowRight, ArrowUpRight, MapPin, Users, UserPlus, GitBranch, Handshake, TrendingUp, Target } from 'lucide-react'
import { Link } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { api } from '../../services/api'
import { formatCurrency, formatDateTime, formatRelativeTime, getSetting, LEAD_SOURCES } from '../../utils/constants'
import useResource from '../../hooks/useResource'
import './Dashboard.css'

const pretty = value => value.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
const STATUS_COLORS = ['#765fdc', '#d36d55', '#c08b2d', '#5379c7', '#be628e', '#3d9a90']

export default function Dashboard() {
  const { data, loading, error } = useResource(() => api.getDashboard(), [])

  if (loading) return <div className="dashboard-loading"><div /><div /><div /><div /></div>
  if (error) return <div className="dashboard-error"><strong>Could not load your dashboard</strong><span>{error}</span><small>Check that the CRM server is running, then refresh.</small></div>
  if (!data) return null

  const sourceChart = data.leadsBySource || []
  const recentDeals = data.recentDeals || []
  const seatChart = data.seatDemandByLocality || []
  const sourceTotal = sourceChart.reduce((sum, source) => sum + source.value, 0)
  const name = getSetting('displayName', 'there')

  return (
    <div className="dashboard-page">
      <div className="dashboard-welcome">
        <div>
          <p className="dashboard-date">NRG WORKSPACE CRM</p>
          <h1>{name === 'there' ? 'Workspace overview' : `${name} · workspace overview`}</h1>
          <p className="welcome-subtitle">Lead, deal and activity records from your CRM.</p>
        </div>
        <Link className="dashboard-link" to="/app/leads">View leads <ArrowRight size={15} /></Link>
      </div>

      <section className="dashboard-metrics" aria-label="Key metrics">
        <Metric label="Open pipeline" value={formatCurrency(data.openPipelineValue || 0)} note="Potential revenue" icon={GitBranch} featured />
        <Metric label="New leads" value={data.totalLeads || 0} note="All lead records" icon={UserPlus} />
        <Metric label="Open deals" value={data.openDeals || 0} note="In progress" icon={Handshake} />
        <Metric label="Closed won" value={formatCurrency(data.closedWonRevenue || 0)} note="Revenue secured" icon={TrendingUp} />
      </section>

      <div className="dashboard-quick-stats" aria-label="Additional metrics">
        <span><Users size={15} /><b>{data.totalContacts || 0}</b> contacts</span>
        <span><Target size={15} /><b>{data.mqlCount || 0}</b> marketing qualified</span>
        <span><ArrowUpRight size={15} /><b>{data.sqlCount || 0}</b> sales qualified</span>
        <span><span className="conversion-dot" /><b>{data.conversionRate?.rate || 0}%</b> conversion</span>
      </div>

      <section className="dashboard-main-grid">
        <article className="dashboard-panel acquisition-panel">
          <PanelHeading eyebrow="LEAD ACTIVITY" title="New enquiries over time" />
          <div className="chart-wrap">
            <ResponsiveContainer width="100%" height={235}>
              <LineChart data={data.leadsOverTime || []} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#e8e5ec" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#858b98' }} tickFormatter={date => new Date(date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#858b98' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 4, border: '1px solid #e5e1ea', fontSize: 12, boxShadow: '0 8px 25px #27324a1a' }} />
                <Line type="monotone" dataKey="count" name="New leads" stroke="#624cc8" strokeWidth={2.5} dot={{ r: 3, fill: '#624cc8', strokeWidth: 0 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="dashboard-panel source-panel">
          <PanelHeading eyebrow="WHERE THEY COME FROM" title="Lead sources" />
          {sourceChart.length ? <div className="source-chart-layout">
            <div className="source-donut">
              <ResponsiveContainer width="100%" height={190}>
                <PieChart>
                  <Pie data={sourceChart} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={48} outerRadius={70} paddingAngle={2} stroke="none">
                    {sourceChart.map((source, index) => <Cell key={source.name} fill={STATUS_COLORS[index % STATUS_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ border: '1px solid #e5e1ea', borderRadius: 4, fontSize: 11 }} formatter={(value, name) => [value, LEAD_SOURCES[name]?.label || pretty(name)]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="source-donut-total"><strong>{sourceTotal}</strong><span>leads</span></div>
            </div>
            <div className="source-legend">
              {sourceChart.map((source, index) => {
                const share = sourceTotal ? Math.round(source.value / sourceTotal * 100) : 0
                return <div className="source-legend-row" key={source.name}>
                  <span><i style={{ background: STATUS_COLORS[index % STATUS_COLORS.length] }} />{LEAD_SOURCES[source.name]?.label || pretty(source.name)}</span>
                  <strong>{share}%</strong>
                </div>
              })}
            </div>
          </div> : <EmptyState>No lead source data yet.</EmptyState>}
        </article>
      </section>

      <section className="dashboard-lower-grid">
        <article className="dashboard-panel status-panel">
          <PanelHeading eyebrow="RECENT ACTIVITY" title="Recent deals" />
          {recentDeals.length ? <div className="dashboard-deals-table-wrap">
            <table className="dashboard-deals-table" aria-label="Recent deals">
              <thead><tr><th>Deal</th><th>Contact</th><th>Stage</th><th>Amount</th></tr></thead>
              <tbody>{recentDeals.map(deal => (
                <tr key={deal.id}>
                  <td><Link className="dashboard-deal-link" to="/app/deals">{deal.dealName}</Link><small className="dashboard-deal-meta">{formatDateTime(deal.createdAt)}</small></td>
                  <td>{deal.contact ? deal.contact.firstName + ' ' + deal.contact.lastName : '—'}<small className="dashboard-deal-meta">{deal.contact?.company || '—'}</small></td>
                  <td><span className={'dashboard-deal-status deal-' + deal.status}>{deal.stage?.name || pretty(deal.status)}</span></td>
                  <td>{formatCurrency(deal.amount || 0)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div> : <EmptyState>No deals yet. Create a deal to see it here.</EmptyState>}
        </article>

        <article className="dashboard-panel locality-panel">
          <PanelHeading eyebrow="COWORKING DEMAND" title="Seats by neighbourhood" icon={MapPin} />
          {seatChart.length ? <div className="seat-list">{seatChart.slice(0, 5).map((locality, index) => {
            const max = Math.max(...seatChart.map(item => item.seats), 1)
            return <div className="seat-row" key={locality.name}><span className="seat-index">0{index + 1}</span><span className="seat-name">{locality.name}</span><div className="seat-track"><span style={{ width: `${locality.seats / max * 100}%` }} /></div><strong>{locality.seats}<small> seats</small></strong></div>
          })}</div> : <EmptyState>No locality details yet. Add a preferred locality to a lead.</EmptyState>}
        </article>
      </section>

      <section className="dashboard-recent-grid">
        <article className="dashboard-panel recent-panel">
          <PanelHeading eyebrow="JUST ADDED" title="Recent leads" />
          {(data.recentLeads || []).length ? <div className="recent-list">{data.recentLeads.slice(0, 5).map((lead, index) => <div className="recent-item" key={lead.id}>
            <span className={`recent-avatar avatar-${index % 4}`}>{(lead.contact?.firstName || lead.company || 'L').slice(0, 1).toUpperCase()}</span>
            <div className="recent-detail"><strong>{lead.contact ? `${lead.contact.firstName} ${lead.contact.lastName}` : lead.company || 'New lead'}</strong><span>{lead.company || LEAD_SOURCES[lead.source]?.label || pretty(lead.source)}</span></div>
            <time>{formatRelativeTime(lead.createdAt)}</time>
          </div>)}</div> : <EmptyState>No leads yet.</EmptyState>}
        </article>

        <article className="dashboard-panel recent-panel">
          <PanelHeading eyebrow="KEEP THINGS MOVING" title="Recent activity" />
          {(data.recentActivities || []).length ? <div className="recent-list">{data.recentActivities.slice(0, 5).map((activity, index) => <div className="recent-item" key={activity.id}>
            <span className={`activity-mark activity-${index % 4}`}><span /></span>
            <div className="recent-detail"><strong>{activity.subject}</strong><span>{pretty(activity.type)} · {activity.contact ? `${activity.contact.firstName} ${activity.contact.lastName}` : 'No contact linked'}</span></div>
            <time>{formatRelativeTime(activity.createdAt)}</time>
          </div>)}</div> : <EmptyState>No activity recorded yet.</EmptyState>}
        </article>
      </section>
    </div>
  )
}

function Metric({ label, value, note, icon: Icon, featured = false }) {
  return <article className={`dashboard-metric${featured ? ' metric-featured' : ''}`}>
    <div className="metric-top"><span>{label}</span><Icon size={16} strokeWidth={1.7} /></div>
    <strong>{value}</strong><small>{note}</small>
  </article>
}

function PanelHeading({ eyebrow, title, icon: Icon }) {
  return <div className="panel-heading"><div><span>{eyebrow}</span><h2>{title}</h2></div>{Icon && <Icon className="panel-heading-icon" size={17} />}</div>
}

function EmptyState({ children }) {
  return <p className="dashboard-empty">{children}</p>
}
