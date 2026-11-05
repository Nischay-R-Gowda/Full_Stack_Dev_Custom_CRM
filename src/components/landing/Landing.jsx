import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, BarChart3, Building2, Check, ChevronRight, CircleDollarSign,
  ClipboardList, GitBranch, Layers3, PhoneCall, Users,
} from 'lucide-react'
import './Landing.css'

const FEATURES = [
  { icon: Users, title: 'Know every relationship', description: 'Keep contact details, company context and recent conversations together in one clear record.' },
  { icon: GitBranch, title: 'Move leads with purpose', description: 'Track workspace enquiries from first touch through qualification and into the sales pipeline.' },
  { icon: ClipboardList, title: 'Keep follow-ups on track', description: 'Log calls, meetings, notes and next steps so every promising conversation has an owner.' },
  { icon: BarChart3, title: 'See what is working', description: 'Review pipeline value, lead sources and activity from a single reporting workspace.' },
]

const PIPELINE = [
  { stage: 'New enquiry', count: 12, color: 'sage' },
  { stage: 'Qualified', count: 8, color: 'blue' },
  { stage: 'Tour booked', count: 5, color: 'amber' },
]

export default function Landing() {
  const navigate = useNavigate()
  return (
    <main className="crm-home">
      <header className="crm-topbar">
        <a className="crm-brand" href="#home" aria-label="NRG CRM home"><span className="crm-brand-mark">N</span><span>NRG <b>CRM</b></span></a>
        <nav className="crm-nav" aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#workflow">How it works</a>
          <button className="crm-nav-login" onClick={() => navigate('/app')}>Open CRM <ArrowRight size={15} /></button>
        </nav>
      </header>

      <section className="crm-hero" id="home">
        <div className="crm-hero-copy">
          <p className="crm-eyebrow"><span /> NRG WORKSPACE CRM <i>·</i> BENGALURU</p>
          <h1>Good spaces start<br />with <em>good follow-through.</em></h1>
          <p className="crm-hero-intro">A practical CRM for the people behind NRG Co-working. Keep workspace enquiries, relationships, tours and deals moving in one place.</p>
          <div className="crm-hero-actions">
            <button className="crm-primary" onClick={() => navigate('/app')}>Open your CRM <ArrowRight size={16} /></button>
            <a className="crm-secondary" href="#features">See what you can do <ChevronRight size={16} /></a>
          </div>
          <p className="crm-hero-caption"><Check size={14} /> Built around the everyday work of managing coworking enquiries.</p>
        </div>
        <div className="crm-preview-wrap" id="workflow" aria-label="CRM dashboard preview">
          <div className="crm-preview">
            <div className="preview-sidebar"><span className="preview-logo">N</span><span className="preview-side-active"><Layers3 size={14} /></span><span><Users size={14} /></span><span><GitBranch size={14} /></span><span><BarChart3 size={14} /></span></div>
            <div className="preview-main">
              <div className="preview-header"><div><span className="preview-overline">MONDAY, 9:41 AM</span><h2>Good morning, team</h2></div><span className="preview-avatar">NR</span></div>
              <div className="preview-stats"><div><span>Open leads</span><b>25</b><small>Across your pipeline</small></div><div><span>Pipeline value</span><b>₹8.4L</b><small>Active opportunities</small></div></div>
              <div className="preview-pipeline-title"><strong>Lead pipeline</strong><span>This month <ChevronRight size={12} /></span></div>
              <div className="preview-stages">{PIPELINE.map(item => <div className="preview-stage" key={item.stage}><div><i className={item.color} />{item.stage}</div><b>{item.count}</b></div>)}</div>
              <div className="preview-activity"><span className="activity-avatar">AS</span><div><b>Workspace tour follow-up</b><small>Activity · Koramangala enquiry</small></div><span className="activity-time"><PhoneCall size={12} /> 10:30</span></div>
            </div>
          </div>
          <div className="preview-note"><CircleDollarSign size={17} /><span><b>From first enquiry to signed desk</b><small>One clear view of the journey</small></span></div>
        </div>
      </section>

      <section className="crm-value-row"><span>MADE FOR THE FULL ENQUIRY JOURNEY</span><div><i>01</i>Capture</div><b>—</b><div><i>02</i>Qualify</div><b>—</b><div><i>03</i>Follow through</div><b>—</b><div><i>04</i>Close</div></section>

      <section className="crm-features" id="features">
        <div className="crm-section-head"><div><p className="crm-eyebrow">ONE WORKSPACE, LESS GUESSWORK</p><h2>Everything your team needs<br />to keep work <em>moving.</em></h2></div><p>From the first enquiry to the next conversation, the important details stay connected and easy to find.</p></div>
        <div className="crm-feature-grid">{FEATURES.map((feature, i) => <article className="crm-feature" key={feature.title}><div className="feature-meta"><span className="feature-icon"><feature.icon size={19} strokeWidth={1.7} /></span><span>0{i + 1}</span></div><h3>{feature.title}</h3><p>{feature.description}</p><a href="#workflow">Explore workflow <ArrowRight size={13} /></a></article>)}</div>
      </section>

      <section className="crm-bottom-cta"><div><p className="crm-eyebrow">NRG CO-WORKING · BENGALURU</p><h2>Every conversation<br />has a <em>next step.</em></h2></div><button className="crm-primary crm-primary-light" onClick={() => navigate('/app')}>Go to the CRM <ArrowRight size={16} /></button></section>
      <footer className="crm-footer"><a className="crm-brand" href="#home"><span className="crm-brand-mark">N</span><span>NRG <b>CRM</b></span></a><span>Internal workspace for the NRG Co-working team</span><button onClick={() => navigate('/app')}>Open CRM <ArrowRight size={13} /></button></footer>
    </main>
  )
}
