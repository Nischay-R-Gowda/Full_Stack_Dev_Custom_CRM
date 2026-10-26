import { useNavigate } from 'react-router-dom'
import {
  Zap, Building2, Armchair, Users, CalendarClock,
  MapPin, IndianRupee, ArrowRight, CheckCircle2, Briefcase
} from 'lucide-react'

// NRG CO-WORKING public landing page.
// Public, unauthenticated route. CTAs:
//   "Explore Workspaces" -> smooth-scroll to #workspaces on this page
//   "Enter CRM"          -> navigate to /app

const WORKSPACES = [
  { icon: Armchair, name: 'Hot Desks', price: '₹1,500',
    desc: 'Open-concept, first-come seating. Ideal for freelancers, students, and digital nomads who need a productive desk without a long commitment.' },
  { icon: Briefcase, name: 'Dedicated Desks', price: '₹4,500',
    desc: 'A reserved desk with your name on it, storage lockers, and priority meeting-room access. Best for solo founders and remote professionals.' },
  { icon: Building2, name: 'Private Offices', price: '₹12,000',
    desc: 'Lockable, customizable spaces for teams of 2–20. Fully furnished with dedicated phone lines, AC, and 24/7 keycard access.' },
  { icon: CalendarClock, name: 'Meeting Rooms', price: '₹800/hr',
    desc: 'Bookable rooms with whiteboards, AV equipment, and high-speed Wi-Fi. Available by the hour or as part of a membership.' },
]

const HIGHLIGHTS = [
  { label: 'Whitefield', desc: 'Near ITPL and the ORR — our flagship 3-location hub' },
  { label: 'Koramangala', desc: 'The startup heart of Bengaluru; strong café and transit access' },
  { label: 'HSR Layout', desc: 'Residential + commercial blend; popular with design and SaaS teams' },
  { label: 'Electronic City', desc: 'Manufacturing and engineering corridor; large private-office demand' },
]

export default function Landing() {
  const navigate = useNavigate()
  const scrollToWorkspaces = () => document.getElementById('workspaces')?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div className="min-h-screen bg-white dark:bg-surface-900 text-surface-800 dark:text-surface-100">
      {/* Navbar */}
      <nav className="h-16 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between px-6 sticky top-0 bg-white/80 dark:bg-surface-900/80 backdrop-blur z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-sm tracking-tight">NRG CO-WORKING</p>
            <p className="text-[10px] text-surface-400 uppercase tracking-widest">Bengaluru</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={scrollToWorkspaces} className="text-sm font-medium text-surface-600 dark:text-surface-300 hover:text-primary-600 transition-colors">Workspaces</button>
          <button onClick={() => navigate('/app')} className="text-sm font-medium text-surface-600 dark:text-surface-300 hover:text-primary-600 transition-colors">CRM</button>
          <button onClick={() => navigate('/app')} className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors shadow-sm">Enter CRM</button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-full text-xs font-medium mb-6">
          <MapPin className="w-3.5 h-3.5" /> Bengaluru &middot; 4 locations
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-surface-900 dark:text-white tracking-tight leading-tight">
          The workspace where<br />Bengaluru&apos;s best teams<span className="text-primary-600"> work</span>
        </h1>
        <p className="mt-5 text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto leading-relaxed">
          Hot desks, dedicated desks, private offices, and meeting rooms &mdash; designed for
          founders, freelancers, and distributed teams. Flexible memberships, high-speed
          internet, 24/7 access, and a community that moves at Bengaluru speed.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={scrollToWorkspaces} className="px-8 py-3.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 flex items-center justify-center gap-2">
            Explore Workspaces <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => navigate('/app')} className="px-8 py-3.5 border-2 border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 font-semibold rounded-xl hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors">
            Enter CRM
          </button>
        </div>
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: MapPin, stat: '4', label: 'Bengaluru Locations' },
            { icon: Users, stat: '500+', label: 'Active Members' },
            { icon: IndianRupee, stat: '₹1,500+', label: 'Hot Desk / Day' },
            { icon: CheckCircle2, stat: '24/7', label: 'Keycard Access' },
          ].map((f, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <f.icon className="w-6 h-6 text-primary-600" />
              <span className="text-2xl font-bold text-surface-900 dark:text-white">{f.stat}</span>
              <span className="text-xs text-surface-500">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Workspaces */}
      <section id="workspaces" className="bg-surface-50 dark:bg-surface-900 border-y border-surface-200 dark:border-surface-700 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-surface-900 dark:text-white">Workspaces</h2>
            <p className="text-surface-500 mt-2">Pick the setup that matches how your team works.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {WORKSPACES.map(ws => (
              <div key={ws.name} className="bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all">
                <div className="w-10 h-10 bg-primary-50 dark:bg-primary-900/40 rounded-lg flex items-center justify-center mb-4">
                  <ws.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="font-semibold text-surface-900 dark:text-white mb-1">{ws.name}</h3>
                <p className="text-sm text-surface-500 leading-relaxed mb-4">{ws.desc}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-primary-600 dark:text-primary-400">{ws.price}</span>
                  <span className="text-xs text-surface-400">starting from</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bengaluru highlights */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-surface-900 dark:text-white">Where we are</h2>
          <p className="text-surface-500 mt-2">Four locations across Bengaluru&apos;s most connected corridors.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {HIGHLIGHTS.map(h => (
            <div key={h.label} className="border border-surface-200 dark:border-surface-700 rounded-xl p-4 flex items-start gap-3">
              <MapPin className="w-4 h-4 text-primary-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-surface-900 dark:text-white">{h.label}</p>
                <p className="text-xs text-surface-500 mt-0.5">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA band */}
      <section className="bg-primary-600 py-16 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to find your desk?</h2>
          <p className="text-primary-200 mb-6">Book a tour, or start selling memberships with the NRG CRM.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={scrollToWorkspaces} className="px-6 py-3 bg-white text-primary-700 font-semibold rounded-lg hover:bg-primary-50 transition-colors">Explore Workspaces</button>
            <button onClick={() => navigate('/app')} className="px-6 py-3 bg-primary-700 text-white font-semibold rounded-lg hover:bg-primary-800 transition-colors">Enter CRM</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-900 text-surface-400 py-8 text-center text-xs">
        <p>NRG CO-WORKING &middot; Bengaluru &middot; {new Date().getFullYear()}</p>
        <p className="mt-1">Internal CRM tool &mdash; not a public booking platform. Prices shown are illustrative.</p>
      </footer>
    </div>
  )
}
