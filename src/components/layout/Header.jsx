import { getSetting, getInitials } from '../../utils/constants'

// The search box and notification bell in the original header were decorative
// (no handler, no data source). They are removed per the spec: no
// non-functional controls. The avatar and name are driven by the display
// name configured in Settings (localStorage `nrg.displayName`).
export default function Header({ breadcrumbs = [] }) {
  const displayName = getSetting('displayName', 'Admin')

  return (
    <header className="h-14 bg-white dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 text-sm min-w-0">
        {breadcrumbs.map((crumb, i) => (
          <span key={i} className="flex items-center gap-2 min-w-0">
            {i > 0 && <span className="text-surface-400">/</span>}
            <span className={i === breadcrumbs.length - 1 ? 'text-surface-800 dark:text-surface-100 font-medium truncate' : 'text-surface-400'}>{crumb}</span>
          </span>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-semibold text-primary-700 dark:text-primary-300">{getInitials(displayName)}</span>
        </div>
        <span className="text-sm font-medium text-surface-700 dark:text-surface-300 hidden md:block">{displayName}</span>
      </div>
    </header>
  )
}
