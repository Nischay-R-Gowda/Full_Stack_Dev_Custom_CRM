import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import { Search, Share2, Globe, PhoneCall, ArrowRight, Info } from 'lucide-react'
import { api } from '../../services/api'

export default function Sources() {
  const [loading, setLoading] = useState(false)
  const [lastSim, setLastSim] = useState(null)
  const navigate = useNavigate()

  const sourceConfig = [
    {
      key: 'google_ads', label: 'Google Ads', Icon: Search, color: 'blue',
      description: 'Leads arriving from Google search campaigns',
      simulate: api.simulateGoogleAds,
    },
    {
      key: 'meta_ads', label: 'Meta Ads', Icon: Share2, color: 'purple',
      description: 'Leads arriving from Facebook and Instagram ads',
      simulate: api.simulateMetaAds,
    },
    {
      key: 'website', label: 'Website Form', Icon: Globe, color: 'green',
      description: 'Leads submitted through the website contact form',
      simulate: api.simulateWebsite,
    },
    {
      key: 'inbound_call', label: 'Inbound Call', Icon: PhoneCall, color: 'orange',
      description: 'Leads captured from inbound phone calls',
      simulate: api.simulateInboundCall,
    },
  ]

  const simulate = async (source) => {
    setLoading(source.key)
    try {
      const lead = await source.simulate()
      setLastSim(lead)
      toast.success(`${source.label} lead created — ${lead.leadNumber}`)
    } catch (err) { toast.error(err.message) }
    setLoading(false)
  }

  const colorMap = {
    blue: { bg: 'bg-[#eaf1ff]', text: 'text-[#4567ae]', border: 'border-[#d9e4ff]', icon: 'bg-[#eaf1ff]' },
    purple: { bg: 'bg-[#eeecff]', text: 'text-[#5849ae]', border: 'border-[#dcd7ff]', icon: 'bg-[#eeecff]' },
    green: { bg: 'bg-[#e5f5f1]', text: 'text-[#287667]', border: 'border-[#cfebe3]', icon: 'bg-[#e5f5f1]' },
    orange: { bg: 'bg-[#fff0eb]', text: 'text-[#a45142]', border: 'border-[#f4d9cf]', icon: 'bg-[#fff0eb]' },
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-surface-800">Lead Sources</h1>
        <p className="text-sm text-surface-500 mt-1">
          Review configured lead sources and add demonstration records.
        </p>
      </div>

      {/* Simulation disclaimer */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-900">These integrations are SIMULATED</p>
          <p className="text-xs text-amber-700 mt-0.5">
            These buttons do not connect to Google Ads, Meta Ads or telephony. Each adds a sample lead through the CRM so you can review how a new record appears in Leads and Reports.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {sourceConfig.map(source => {
          const colors = colorMap[source.color]
          return (
            <div key={source.key} className="bg-white rounded-xl border border-surface-200 p-6 hover:shadow-md transition-shadow">
              <div className={`w-11 h-11 rounded-md ${colors.icon} flex items-center justify-center mb-4`}>
                <source.Icon className={`w-5 h-5 ${colors.text}`} />
              </div>
              <h3 className="text-base font-semibold text-surface-800 mb-1">{source.label}</h3>
              <p className="text-xs text-surface-500 mb-4 min-h-[2rem]">{source.description}</p>
              <button
                onClick={() => simulate(source)}
                disabled={loading !== false}
                className="w-full py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading === source.key ? 'Creating...' : `Simulate ${source.label} Lead`}
              </button>
            </div>
          )
        })}
      </div>

      {lastSim && (
        <div className="bg-[#f2efff] border border-[#dcd7ff] rounded-xl p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[#5849ae]">
                Lead created: {lastSim.leadNumber}
              </p>
              <p className="text-xs text-[#665c9c] mt-1">
                Contact: {lastSim.contact.firstName} {lastSim.contact.lastName} ({lastSim.contact.email}) · Company: {lastSim.company} · Source: {lastSim.source.replace(/_/g, ' ')} · Type: {lastSim.type.toUpperCase()}
              </p>
              <p className="text-xs text-[#786fa6] mt-0.5">
                Created at {new Date(lastSim.createdAt).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => navigate('/leads')}
              className="flex items-center gap-1 text-sm font-medium text-[#5849ae] hover:text-[#403487] whitespace-nowrap"
            >
              View in Leads <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
