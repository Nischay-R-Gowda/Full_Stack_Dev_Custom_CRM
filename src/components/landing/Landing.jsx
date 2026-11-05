import { useNavigate } from 'react-router-dom'
import {
  ArrowRight, BarChart3, Check, ChevronRight, ClipboardList, GitBranch,
  MapPin, Users,
} from 'lucide-react'
import './Landing.css'

const FEATURES = [
  { icon: Users, title: 'Contact records', description: 'Keep contact details, company information and recent conversations together.' },
  { icon: GitBranch, title: 'Lead qualification', description: 'Record seats, locality, budget and booking duration before moving a lead into the pipeline.' },
  { icon: ClipboardList, title: 'Follow-up history', description: 'Log calls, tours, emails, meetings and the next action for each enquiry.' },
  { icon: BarChart3, title: 'Pipeline reports', description: 'Review lead sources, deal stages, conversion and revenue from CRM records.' },
]

export default function Landing() {
  const navigate = useNavigate()
  return (
    <main className="crm-home">
      <header className="crm-topbar">
        <a className="crm-brand" href="#home" aria-label="NRG CRM home"><img className="crm-brand-mark" src="/nrg-mark.svg" alt="" /><span className="crm-brand-copy"><strong>NRG Co-working</strong><small>WORKSPACE CRM · BENGALURU</small></span></a>
        <nav className="crm-nav" aria-label="Main navigation">
          <a href="#features">Features</a>
          <a href="#workflow">How it works</a>
          <button className="crm-nav-login" onClick={() => navigate('/app')}>Open CRM <ArrowRight size={15} /></button>
        </nav>
      </header>

      <section className="crm-hero" id="home">
        <div className="crm-hero-copy">
          <p className="crm-eyebrow"><span /> NRG CO-WORKING <i>·</i> BENGALURU CRM</p>
          <h1>Workspace enquiries,<br />kept <em>on track.</em></h1>
          <p className="crm-hero-intro">Keep company details, seat requirements, preferred locations and next steps on the same lead record.</p>
          <div className="crm-hero-actions">
            <button className="crm-primary" onClick={() => navigate('/app')}>Open your CRM <ArrowRight size={16} /></button>
            <a className="crm-secondary" href="#features">Browse CRM features <ChevronRight size={16} /></a>
          </div>
          <p className="crm-hero-caption"><Check size={14} /> Company details, workspace needs and next steps stay together.</p>
        </div>
        <div className="crm-workspace-illustration" id="workflow">
          <img src="/workspace-sketch.svg" alt="Hand-drawn illustration of a Bengaluru coworking room with shared desks, a laptop, a bright window and plants" />
          <span className="sketch-location"><MapPin size={13} /> BENGALURU · WORKSPACE CRM</span>
          <div className="sketch-note"><span className="sketch-note-kicker">ENQUIRY WORKFLOW</span><strong>See the next step for each workspace request.</strong><span className="sketch-note-flow">Lead <i>→</i> Tour <i>→</i> Follow-up <i>→</i> Deal</span></div>
        </div>
      </section>

      <section className="crm-value-row"><span>ENQUIRY WORKFLOW</span><div><i>01</i>Capture</div><b>—</b><div><i>02</i>Qualify</div><b>—</b><div><i>03</i>Follow up</div><b>—</b><div><i>04</i>Close</div></section>

      <section className="crm-features" id="features">
        <div className="crm-section-head"><div><p className="crm-eyebrow">NRG WORKSPACE CRM</p><h2>One record for<br />every workspace <em>enquiry.</em></h2></div><p>Track who enquired, what space they need and what your team should do next.</p></div>
        <div className="crm-feature-grid">{FEATURES.map((feature, i) => <article className="crm-feature" key={feature.title}><div className="feature-meta"><span className="feature-icon"><feature.icon size={19} strokeWidth={1.7} /></span><span>0{i + 1}</span></div><h3>{feature.title}</h3><p>{feature.description}</p><a href="#workflow">See the workflow <ArrowRight size={13} /></a></article>)}</div>
      </section>

      <section className="crm-bottom-cta"><div><p className="crm-eyebrow">NRG CO-WORKING · BENGALURU</p><h2>Start with the<br /><em>next enquiry.</em></h2></div><button className="crm-primary crm-primary-light" onClick={() => navigate('/app')}>Open the CRM <ArrowRight size={16} /></button></section>
      <footer className="crm-footer"><a className="crm-brand" href="#home"><img className="crm-brand-mark" src="/nrg-mark.svg" alt="" /><span className="crm-brand-copy"><strong>NRG Co-working</strong><small>WORKSPACE CRM · BENGALURU</small></span></a><span>Internal workspace for the NRG Co-working team</span><button onClick={() => navigate('/app')}>Open CRM <ArrowRight size={13} /></button></footer>
    </main>
  )
}
