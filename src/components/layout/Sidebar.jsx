import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Users, UserPlus, Kanban, GitBranch, Workflow,
  Phone, MessageSquare, BarChart3, Settings, ChevronLeft,
  ChevronRight, LogOut
} from 'lucide-react'

// All CRM routes are nested under /app; the public landing page lives at /.
const navItems = [
  { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/app/contacts', icon: Users, label: 'Contacts' },
  { path: '/app/leads', icon: UserPlus, label: 'Leads' },
  { path: '/app/deals', icon: Kanban, label: 'Deals & Pipeline' },
  { path: '/app/pipelines', icon: GitBranch, label: 'Pipelines' },
  { path: '/app/workflows', icon: Workflow, label: 'Workflows' },
  { path: '/app/sources', icon: Phone, label: 'Lead Sources' },
  { path: '/app/activities', icon: MessageSquare, label: 'Activities' },
  { path: '/app/reports', icon: BarChart3, label: 'Reports' },
  { path: '/app/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ collapsed, setCollapsed }) {
  const location = useLocation()
  const navigate = useNavigate()

  return (
    <aside className={`${collapsed ? 'w-16' : 'w-64'} bg-white dark:bg-surface-900 dark:border-surface-700 border-r border-surface-200 flex flex-col transition-all duration-200 h-screen sticky top-0 z-40`}>
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-surface-200 dark:border-surface-700">
        <img src="/nrg-mark.svg" alt="" className="w-11 h-11 object-contain flex-shrink-0" />
        {!collapsed && (
          <div className="min-w-0">
            <span className="text-surface-800 dark:text-surface-100 text-sm block truncate font-semibold">NRG Co-working</span>
            <span className="text-[10px] text-surface-400 tracking-wide">Bengaluru · Workspace CRM</span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map(item => {
          const isActive = item.path === '/app'
            ? location.pathname === '/app'
            : location.pathname.startsWith(item.path)
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/app'}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300' : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Exit to public landing */}
      <div className="border-t border-surface-200 dark:border-surface-700 p-2">
        <button
          onClick={() => navigate('/')}
          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-surface-500 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!collapsed && <span>Exit to Landing</span>}
        </button>
      </div>

      {/* Collapse toggle */}
      <button onClick={() => setCollapsed(!collapsed)} className="absolute -right-3 top-16 w-6 h-6 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-full flex items-center justify-center shadow-sm hover:bg-surface-50 z-50">
        {collapsed ? <ChevronRight className="w-3 h-3 text-surface-500" /> : <ChevronLeft className="w-3 h-3 text-surface-500" />}
      </button>
    </aside>
  )
}
