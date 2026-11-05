import { Routes, Route, Navigate } from 'react-router-dom'
import { getSetting } from './utils/constants'
import AppShell from './components/layout/AppShell'
import Landing from './components/landing/Landing'
import Dashboard from './components/dashboard/Dashboard'
import Contacts from './components/contacts/Contacts'
import Leads from './components/leads/Leads'
import Deals from './components/deals/Deals'
import Pipelines from './components/pipelines/Pipelines'
import Sources from './components/sources/Sources'
import Activities from './components/activities/Activities'
import Reports from './components/reports/Reports'
import Settings from './components/settings/Settings'
import Workflows from './components/workflows/Workflows'
import NotFound from './components/common/NotFound'

function AppHomeRedirect() {
  const pages = ['dashboard', 'leads', 'contacts', 'deals']
  const preferredPage = getSetting('defaultPage', 'dashboard')
  const page = pages.includes(preferredPage) ? preferredPage : 'dashboard'
  return <Navigate to={'/app/' + page} replace />
}

export default function App() {
  return (
    <Routes>
      {/* Public landing page — no AppShell, no sidebar. */}
      <Route path="/" element={<Landing />} />

      {/* CRM workspace — all internal pages live under /app. */}
      <Route path="/app" element={<AppHomeRedirect />} />
      <Route path="/app/dashboard" element={<AppShell breadcrumbs={['Dashboard']}><Dashboard /></AppShell>} />
      <Route path="/app/contacts" element={<AppShell breadcrumbs={['Contacts']}><Contacts /></AppShell>} />
      <Route path="/app/leads" element={<AppShell breadcrumbs={['Leads']}><Leads /></AppShell>} />
      <Route path="/app/deals" element={<AppShell breadcrumbs={['Deals & Pipeline']}><Deals /></AppShell>} />
      <Route path="/app/pipelines" element={<AppShell breadcrumbs={['Pipelines']}><Pipelines /></AppShell>} />
      <Route path="/app/workflows" element={<AppShell breadcrumbs={['Workflows']}><Workflows /></AppShell>} />
      <Route path="/app/sources" element={<AppShell breadcrumbs={['Lead Sources']}><Sources /></AppShell>} />
      <Route path="/app/activities" element={<AppShell breadcrumbs={['Activities']}><Activities /></AppShell>} />
      <Route path="/app/reports" element={<AppShell breadcrumbs={['Reports']}><Reports /></AppShell>} />
      <Route path="/app/settings" element={<AppShell breadcrumbs={['Settings']}><Settings /></AppShell>} />

      <Route path="*" element={<AppShell breadcrumbs={['404']}><NotFound /></AppShell>} />
    </Routes>
  )
}
