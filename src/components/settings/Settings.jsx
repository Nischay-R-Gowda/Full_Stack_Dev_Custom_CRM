import { useState } from 'react'
import {
  Moon, Sun, User, IndianRupee, Calendar, RefreshCw, Info,
  Check, Shield, X
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { api } from '../../services/api'
import { getSetting, setSetting, CURRENCIES, DATE_FORMATS } from '../../utils/constants'
import Button from '../ui/Button'
import Input from '../ui/Input'
import Modal from '../ui/Modal'
import { cn } from '../../utils/constants'

// NRG CO-WORKING — Settings.
// Display preferences (theme, display name, currency, date format) live in
// localStorage under `nrg.*` keys — presentation-only, never touch stored
// server data. Reset All Data is the single destructive server call,
// guarded by a case-sensitive password (Nischay).

const APP_VERSION = '1.0.0'

export default function Settings() {
  const [theme, setTheme] = useState(() => getSetting('theme', 'light'))
  const [displayName, setDisplayName] = useState(() => getSetting('displayName', 'Admin'))
  const [currency, setCurrency] = useState(() => getSetting('currency', 'INR'))
  const [dateFormat, setDateFormat] = useState(() => getSetting('dateFormat', 'DD Mon YYYY'))

  const [resetOpen, setResetOpen] = useState(false)
  const [resetPassword, setResetPassword] = useState('')
  const [resetting, setResetting] = useState(false)
  const [resetError, setResetError] = useState('')

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    setTheme(next)
    setSetting('theme', next)
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  const saveDisplayName = () => {
    const v = displayName.trim() || 'Admin'
    setDisplayName(v)
    setSetting('displayName', v)
    toast.success('Display name saved')
  }

  const saveCurrency = (v) => {
    setCurrency(v)
    setSetting('currency', v)
    toast.success(`Currency set to ${CURRENCIES[v]?.symbol || v}`)
  }

  const saveDateFormat = (v) => {
    setDateFormat(v)
    setSetting('dateFormat', v)
    toast.success(`Date format set to ${v}`)
  }

  const handleReset = async () => {
    setResetting(true)
    setResetError('')
    try {
      const res = await api.resetAllData(resetPassword)
      setResetOpen(false)
      setResetPassword('')
      toast.success(res.message || 'All CRM data has been reset.')
    } catch (err) {
      setResetError(err.message || 'Reset failed. Data was not changed.')
    } finally {
      setResetting(false)
    }
  }

  const row = 'flex items-center justify-between gap-4 py-4 border-b border-surface-100 dark:border-surface-700 last:border-0'
  const iconWrap = 'w-9 h-9 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center flex-shrink-0'

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-surface-800 dark:text-surface-100">Settings</h1>
        <p className="text-sm text-surface-500 mt-1">Display preferences and workspace administration.</p>
      </div>

      <section className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">Appearance</h2>
        <div className={row}>
          <div className="flex items-center gap-3">
            <div className={iconWrap}>{theme === 'dark' ? <Moon className="w-4 h-4 text-surface-600 dark:text-surface-300" /> : <Sun className="w-4 h-4 text-surface-600 dark:text-surface-300" />}</div>
            <div>
              <p className="text-sm font-medium text-surface-800 dark:text-surface-100">Theme</p>
              <p className="text-xs text-surface-400">Currently {theme}</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={cn('w-12 h-6 rounded-full relative transition-colors flex-shrink-0', theme === 'dark' ? 'bg-primary-600' : 'bg-surface-300')}
            aria-label="Toggle dark mode"
          >
            <span className={cn('w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all', theme === 'dark' ? 'left-6' : 'left-0.5')} />
          </button>
        </div>
      </section>

      <section className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">Profile</h2>
        <div className={row}>
          <div className="flex items-center gap-3">
            <div className={iconWrap}><User className="w-4 h-4 text-surface-600 dark:text-surface-300" /></div>
            <div>
              <p className="text-sm font-medium text-surface-800 dark:text-surface-100">Display name</p>
              <p className="text-xs text-surface-400">Shown in the header next to your avatar</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={displayName}
              onChange={e => setDisplayName(e.target.value)}
              className="px-3 py-1.5 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg text-sm text-surface-800 dark:text-surface-100 w-32 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Button variant="secondary" onClick={saveDisplayName}><Check className="w-4 h-4" /></Button>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">Display Preferences</h2>
        <div className={row}>
          <div className="flex items-center gap-3">
            <div className={iconWrap}><IndianRupee className="w-4 h-4 text-surface-600 dark:text-surface-300" /></div>
            <div>
              <p className="text-sm font-medium text-surface-800 dark:text-surface-100">Currency</p>
              <p className="text-xs text-surface-400">Display only — stored amounts are not changed</p>
            </div>
          </div>
          <div className="w-28">
            <select
              value={currency}
              onChange={e => saveCurrency(e.target.value)}
              className="w-full px-3 py-1.5 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg text-sm text-surface-800 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {Object.entries(CURRENCIES).map(([code, c]) => <option key={code} value={code}>{code} ({c.symbol})</option>)}
            </select>
          </div>
        </div>
        <div className={row}>
          <div className="flex items-center gap-3">
            <div className={iconWrap}><Calendar className="w-4 h-4 text-surface-600 dark:text-surface-300" /></div>
            <div>
              <p className="text-sm font-medium text-surface-800 dark:text-surface-100">Date format</p>
              <p className="text-xs text-surface-400">How timestamps are rendered across the app</p>
            </div>
          </div>
          <div className="w-36">
            <select
              value={dateFormat}
              onChange={e => saveDateFormat(e.target.value)}
              className="w-full px-3 py-1.5 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-700 rounded-lg text-sm text-surface-800 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {DATE_FORMATS.map(f => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        </div>
      </section>

      <section className="bg-white dark:bg-surface-900 border border-red-200 dark:border-red-900/50 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center gap-2"><RefreshCw className="w-4 h-4" />Danger Zone</h2>
        <div className={row}>
          <div className="flex items-start gap-3">
            <div className={cn(iconWrap, 'bg-red-50 dark:bg-red-900/30')}><Shield className="w-4 h-4 text-red-600" /></div>
            <div>
              <p className="text-sm font-medium text-surface-800 dark:text-surface-100">Reset All Data</p>
              <p className="text-xs text-surface-400 mt-0.5">Permanently delete all contacts, leads, deals, activities and notifications. Pipelines, stages and the system user are preserved. Cannot be undone.</p>
            </div>
          </div>
          <Button variant="danger" onClick={() => { setResetOpen(true); setResetPassword(''); setResetError('') }}>Reset</Button>
        </div>
      </section>

      <section className="bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3 flex items-center gap-2"><Info className="w-4 h-4" />About</h2>
        <div className="text-sm text-surface-500 dark:text-surface-400 space-y-1">
          <p><span className="font-medium text-surface-700 dark:text-surface-300">NRG CO-WORKING CRM</span> — version {APP_VERSION}</p>
          <p>Built as a Full Stack Development course project. React 19 + Vite frontend, Express REST API, Prisma + SQLite. No authentication layer — single-user demo. The reset password is a convenience guard, not a security control, and this destructive endpoint must never be exposed publicly.</p>
        </div>
      </section>

      <Modal isOpen={resetOpen} onClose={() => setResetOpen(false)} title="Reset All Data" size="md">
        <div className="space-y-4">
          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 flex items-start gap-2">
            <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>This will permanently delete all contacts, leads, deals, activities and notifications. Pipelines, stages and the system user are preserved. The demo reset password is <strong>*******</strong> (case-sensitive) and is not a real security boundary.</span>
          </div>
          {resetError && <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 rounded-lg text-sm text-red-700 dark:text-red-300">{resetError}</div>}
          <Input
            label="Reset password *"
            required
            type="text"
            value={resetPassword}
            onChange={e => setResetPassword(e.target.value)}
            placeholder="Enter the reset password"
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setResetOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleReset} disabled={resetting || !resetPassword}>
              {resetting ? 'Resetting...' : 'Confirm Reset'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
