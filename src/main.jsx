import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import './index.css'

// Apply the persisted theme before the first paint so there is no flash of
// the wrong color scheme on every page load.
;(function initTheme() {
  const theme = localStorage.getItem('nrg.theme') || 'light'
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.classList.toggle('compact-tables', localStorage.getItem('nrg.compactTables') === 'true')
})()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#1e293b', color: '#f8fafc', borderRadius: '8px', padding: '12px 16px', fontSize: '14px' },
          success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </StrictMode>,
)
