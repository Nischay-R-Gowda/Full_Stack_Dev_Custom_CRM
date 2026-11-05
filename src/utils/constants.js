// ── NRG CO-WORKING CRM — shared constants and helpers ──────────

export const LEAD_SOURCES = {
  google_ads: { label: 'Google Ads', icon: 'Globe', color: 'bg-blue-100 text-blue-700' },
  meta_ads: { label: 'Meta Ads', icon: 'Facebook', color: 'bg-purple-100 text-purple-700' },
  website: { label: 'Website Form', icon: 'LayoutTemplate', color: 'bg-green-100 text-green-700' },
  inbound_call: { label: 'Inbound Call', icon: 'Phone', color: 'bg-orange-100 text-orange-700' },
  referral: { label: 'Referral', icon: 'Users', color: 'bg-teal-100 text-teal-700' },
  manual: { label: 'Manual Entry', icon: 'Plus', color: 'bg-gray-100 text-gray-700' },
}

export const LEAD_STATUSES = {
  new: { label: 'New', color: 'bg-gray-100 text-gray-700' },
  attempting: { label: 'Attempting Contact', color: 'bg-yellow-100 text-yellow-700' },
  connected: { label: 'Connected', color: 'bg-sky-100 text-sky-700' },
  qualified: { label: 'Qualified', color: 'bg-indigo-100 text-indigo-700' },
  disqualified: { label: 'Disqualified', color: 'bg-red-100 text-red-700' },
  converted: { label: 'Converted', color: 'bg-emerald-100 text-emerald-700' },
}

export const LEAD_TYPES = {
  mql: { label: 'MQL', description: 'Marketing Qualified Lead' },
  sql: { label: 'SQL', description: 'Sales Qualified Lead' },
  deal: { label: 'Deal', description: 'Sales Opportunity' },
}

export const ACTIVITY_TYPES = {
  call: { label: 'Call', icon: 'Phone', color: 'text-green-600 bg-green-50' },
  email: { label: 'Email logged', icon: 'Mail', color: 'text-blue-600 bg-blue-50' },
  meeting: { label: 'Meeting', icon: 'Calendar', color: 'text-purple-600 bg-purple-50' },
  // 'tour' is an NRG-specific activity: a workspace tour shown to a lead or
  // prospective member. It is NOT a real meeting or event record.
  tour: { label: 'Workspace tour', icon: 'MapPin', color: 'text-teal-600 bg-teal-50' },
  note: { label: 'Note', icon: 'FileText', color: 'text-yellow-600 bg-yellow-50' },
  task: { label: 'Task', icon: 'CheckSquare', color: 'text-orange-600 bg-orange-50' },
}

export const LIFECYCLE_STAGES = {
  lead: { label: 'Lead', badge: 'gray' },
  mql: { label: 'MQL', badge: 'purple' },
  sql: { label: 'SQL', badge: 'indigo' },
  customer: { label: 'Customer', badge: 'green' },
}

export const PRIORITIES = {
  low: { label: 'Low', color: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' },
  high: { label: 'High', color: 'bg-red-100 text-red-700' },
}

// Kept as an alias so existing imports keep working (Activities.jsx still
// imports the old name).
export const PIPRIORITIES = PRIORITIES

// Bengaluru localities offered for coworking leads. Mirrors LOCALITIES in
// server/controllers/leads.js — keep the two in sync.
export const LOCALITIES = ['Whitefield', 'Outer Ring Road', 'Koramangala', 'Indiranagar', 'HSR Layout', 'Electronic City', 'Hebbal', 'MG Road', 'Jayanagar', 'Marathahalli', 'Other']

// Booking durations a coworking customer might ask for.
export const DURATIONS = ['1 day', '1 week', '1 month', '3 months', '6 months', '12 months', 'Custom']

// ── Display preferences (persisted locally, never stored server-side) ───────
//
// `formatCurrency` and `formatDateTime` read these values so a currency or
// date-format change in Settings is reflected immediately in every view,
// WITHOUT rewriting any stored numeric or timestamp. The localStorage keys
// are also read by index.css / AppShell on load to set the initial theme.

const SETTINGS_KEYS = { theme: 'nrg.theme', displayName: 'nrg.displayName', currency: 'nrg.currency', dateFormat: 'nrg.dateFormat', defaultPage: 'nrg.defaultPage', compactTables: 'nrg.compactTables' }

export function getSetting(key, fallback) {
  try { return localStorage.getItem(SETTINGS_KEYS[key]) ?? fallback } catch { return fallback }
}
export function setSetting(key, value) {
  try { localStorage.setItem(SETTINGS_KEYS[key], value) } catch { /* storage unavailable — fall back to in-memory */ }
}

export const DEFAULT_CURRENCY = 'INR'
export const DEFAULT_DATE_FORMAT = 'DD Mon YYYY'
export const CURRENCIES = { INR: { symbol: '₹', locale: 'en-IN' }, USD: { symbol: '$', locale: 'en-US' } }
export const DATE_FORMATS = ['DD/MM/YYYY', 'DD Mon YYYY']

// Compact currency for chart axes: ₹1.2L / ₹50K (INR) or $1.2K / $50K (USD).
export function formatCurrency(amount) {
  const currency = getSetting('currency', DEFAULT_CURRENCY)
  const { symbol, locale } = CURRENCIES[currency] || CURRENCIES.INR
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) return symbol + '0'
  const n = Number(amount)
  if (Math.abs(n) >= 10000000) return `${symbol}${(n / 10000000).toFixed(1)}Cr`
  if (Math.abs(n) >= 100000) return `${symbol}${(n / 100000).toFixed(1)}L`
  if (Math.abs(n) >= 1000) return `${symbol}${(n / 1000).toFixed(1)}K`
  return `${symbol}${n.toLocaleString(locale)}`
}

// Full-precision currency for detail views: ₹1,23,456.00 (INR) / $1,234.56 (USD).
export function formatCurrencyFull(amount) {
  const currency = getSetting('currency', DEFAULT_CURRENCY)
  const { locale } = CURRENCIES[currency] || CURRENCIES.INR
  if (amount === null || amount === undefined) return '—'
  return Number(amount).toLocaleString(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// "19 Oct 2026" or "19/10/2026" depending on the configured dateFormat.
// Always renders LOCAL time — stored values are ISO strings from Prisma.
export function formatDate(date) {
  if (!date) return '—'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  const format = getSetting('dateFormat', DEFAULT_DATE_FORMAT)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  if (format === 'DD/MM/YYYY') return `${day}/${month}/${year}`
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${d.getDate()} ${months[d.getMonth()]} ${year}`
}

// "19 Oct 2026, 10:35 PM" — date + local time, used everywhere a record's
// created/updated timestamp is shown.
export function formatDateTime(date) {
  if (!date) return '—'
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return '—'
  let hours = d.getHours()
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12 || 12
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${formatDate(d)}, ${hours}:${minutes} ${ampm}`
}

export function formatRelativeTime(date) {
  if (!date) return '—'
  const diff = Date.now() - new Date(date).getTime()
  if (diff < 0) return formatDate(date)
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
}

export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}
