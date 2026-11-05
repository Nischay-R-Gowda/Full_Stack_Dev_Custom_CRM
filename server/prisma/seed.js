import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function seed() {
  await prisma.activity.deleteMany()
  await prisma.deal.deleteMany()
  await prisma.lead.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.stage.deleteMany()
  await prisma.pipeline.deleteMany()

  const admin = await prisma.user.create({ data: { email: 'admin@nrgcoworking.com', name: 'Admin User', role: 'admin' } })

  // Create default pipeline with stages
  const pipeline = await prisma.pipeline.create({
    data: {
      name: 'Default Sales Pipeline',
      description: 'Standard sales process from lead to close',
      isDefault: true,
      stages: {
        create: [
          { name: 'New Opportunity', position: 0, color: '#624cc8' },
          { name: 'Qualified', position: 1, color: '#5379c7' },
          { name: 'Demo Scheduled', position: 2, color: '#d36d55' },
          { name: 'Proposal', position: 3, color: '#be628e' },
          { name: 'Negotiation', position: 4, color: '#c08b2d' },
          { name: 'Closed Won', position: 5, color: '#3d9a90', isClosedWon: true },
          { name: 'Closed Lost', position: 6, color: '#8a758b', isClosedLost: true },
        ],
      },
    },
    include: { stages: true },
  })

  // Create contacts
  const contacts = [
    { firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh.kumar@techvista.com', phone: '+91 9876543210', company: 'TechVista Solutions', jobTitle: 'CTO', location: 'Bangalore', leadSource: 'google_ads', lifecycleStage: 'sql' },
    { firstName: 'Priya', lastName: 'Sharma', email: 'priya.sharma@cloudbridge.com', phone: '+91 9876543211', company: 'CloudBridge Systems', jobTitle: 'VP Engineering', location: 'Mumbai', leadSource: 'meta_ads', lifecycleStage: 'mql' },
    { firstName: 'Arjun', lastName: 'Reddy', email: 'arjun.reddy@datapulse.com', phone: '+91 9876543212', company: 'DataPulse Analytics', jobTitle: 'CEO', location: 'Hyderabad', leadSource: 'website', lifecycleStage: 'sql' },
    { firstName: 'Sneha', lastName: 'Kapoor', email: 'sneha.kapoor@nextgen.com', phone: '+91 9876543213', company: 'NextGen Retail', jobTitle: 'Director', location: 'Delhi', leadSource: 'referral', lifecycleStage: 'customer' },
    { firstName: 'Vikram', lastName: 'Singh', email: 'vikram.singh@finedge.com', phone: '+91 9876543214', company: 'FinEdge Capital', jobTitle: 'CFO', location: 'Pune', leadSource: 'inbound_call', lifecycleStage: 'mql' },
    { firstName: 'Meera', lastName: 'Krishnan', email: 'meera.kr@softcraft.com', phone: '+91 9876543215', company: 'SoftCraft Technologies', jobTitle: 'Product Manager', location: 'Chennai', leadSource: 'manual', lifecycleStage: 'lead' },
    { firstName: 'Karthik', lastName: 'Nair', email: 'karthik.nair@innovex.com', phone: '+91 9876543216', company: 'InnoVex Labs', jobTitle: 'Founder', location: 'Kochi', leadSource: 'google_ads', lifecycleStage: 'mql' },
    { firstName: 'Ananya', lastName: 'Iyer', email: 'ananya.iyer@quantumleap.com', phone: '+91 9876543217', company: 'QuantumLeap AI', jobTitle: 'Head of Sales', location: 'Bangalore', leadSource: 'meta_ads', lifecycleStage: 'lead' },
  ]

  const createdContacts = []
  for (const c of contacts) {
    const contact = await prisma.contact.create({ data: c })
    createdContacts.push(contact)
  }

  // Create leads
    const leads = [
    { contactId: createdContacts[0].id, createdById: admin.id, source: 'google_ads', type: 'sql', status: 'qualified', company: createdContacts[0].company, notes: 'High value prospect, actively looking for CRM solution.', nextFollowUp: new Date(Date.now() + 86400000 * 3), expectedValue: 150000 },
    { contactId: createdContacts[1].id, createdById: admin.id, source: 'meta_ads', type: 'mql', status: 'connected', company: createdContacts[1].company, notes: 'Downloaded whitepaper, responded to email campaign.', nextFollowUp: new Date(Date.now() + 86400000 * 5), expectedValue: 80000 },
    { contactId: createdContacts[2].id, createdById: admin.id, source: 'website', type: 'sql', status: 'qualified', company: createdContacts[2].company, notes: 'Requested demo, strong buying signals.', nextFollowUp: new Date(Date.now() + 86400000 * 2), expectedValue: 200000 },
    { contactId: createdContacts[3].id, createdById: admin.id, source: 'referral', type: 'deal', status: 'converted', company: createdContacts[3].company, notes: 'Referred by existing customer, very high priority.', expectedValue: 300000 },
    { contactId: createdContacts[4].id, createdById: admin.id, source: 'inbound_call', type: 'mql', status: 'attempting', company: createdContacts[4].company, notes: 'Called to inquire about pricing. Voicemail left.', nextFollowUp: new Date(Date.now() + 86400000 * 1), expectedValue: 50000 },
    { contactId: createdContacts[5].id, createdById: admin.id, source: 'manual', type: 'mql', status: 'new', company: createdContacts[5].company, notes: 'Manually entered from conference.', nextFollowUp: new Date(Date.now() + 86400000 * 7), expectedValue: 75000 },
    { contactId: createdContacts[6].id, createdById: admin.id, source: 'google_ads', type: 'mql', status: 'connected', company: createdContacts[6].company, notes: 'Clicked on ad, filled contact form.', nextFollowUp: new Date(Date.now() + 86400000 * 4), expectedValue: 60000 },
    { contactId: createdContacts[7].id, createdById: admin.id, source: 'meta_ads', type: 'mql', status: 'new', company: createdContacts[7].company, notes: 'Engaged with social media content.', expectedValue: 45000 },
  ]

  const createdLeads = []
  for (const l of leads) {
    const lead = await prisma.lead.create({ data: { ...l, leadNumber: `LEAD-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 5).toUpperCase()}` } })
    createdLeads.push(lead)
  }

  // Create deals
  const stages = pipeline.stages
  const deals = [
    { contactId: createdContacts[0].id, stageId: stages[4].id, pipelineId: pipeline.id, createdById: admin.id, dealName: 'TechVista CRM Implementation', amount: 150000, probability: 80, expectedCloseDate: new Date(Date.now() + 86400000 * 30), status: 'open' },
    { contactId: createdContacts[2].id, stageId: stages[2].id, pipelineId: pipeline.id, createdById: admin.id, dealName: 'DataPulse Analytics Platform', amount: 200000, probability: 60, expectedCloseDate: new Date(Date.now() + 86400000 * 45), status: 'open' },
    { contactId: createdContacts[3].id, stageId: stages[5].id, pipelineId: pipeline.id, createdById: admin.id, dealName: 'NextGen Retail Transformation', amount: 300000, probability: 100, expectedCloseDate: new Date(Date.now() - 86400000 * 5), actualCloseDate: new Date(Date.now() - 86400000 * 5), status: 'won' },
    { contactId: createdContacts[4].id, stageId: stages[0].id, pipelineId: pipeline.id, createdById: admin.id, dealName: 'FinEdge Capital Solution', amount: 50000, probability: 30, expectedCloseDate: new Date(Date.now() + 86400000 * 60), status: 'open' },
    { contactId: createdContacts[1].id, stageId: stages[3].id, pipelineId: pipeline.id, createdById: admin.id, dealName: 'CloudBridge Migration', amount: 80000, probability: 50, expectedCloseDate: new Date(Date.now() + 86400000 * 20), status: 'open' },
    { contactId: createdContacts[5].id, stageId: stages[0].id, pipelineId: pipeline.id, createdById: admin.id, dealName: 'SoftCraft Internal Tools', amount: 75000, probability: 20, expectedCloseDate: new Date(Date.now() + 86400000 * 90), status: 'open' },
    { contactId: createdContacts[6].id, stageId: stages[6].id, pipelineId: pipeline.id, createdById: admin.id, dealName: 'InnoVex Platform License', amount: 60000, probability: 0, expectedCloseDate: new Date(Date.now() + 86400000 * 30), actualCloseDate: new Date(Date.now() - 86400000 * 10), status: 'lost', lostReason: 'Budget constraints' },
  ]

  for (const d of deals) {
    await prisma.deal.create({ data: d })
  }

  // Create activities
  const activitySubjects = [
    { type: 'call', subject: 'Initial discovery call with Rajesh', description: 'Discussed CRM requirements and timeline.', completed: true },
    { type: 'email', subject: 'Sent product brochure to Priya', description: 'Shared our CRM platform overview PDF.', completed: true },
    { type: 'meeting', subject: 'Demo scheduled for Arjun', description: 'Scheduled full product demo for next Tuesday.', completed: false },
    { type: 'task', subject: 'Follow up with Sneha on contract', description: 'Contract review in progress, need legal sign-off.', completed: false },
    { type: 'note', subject: 'Notes from Vikram call', description: 'Interested in integration capabilities. High budget available.', completed: true },
    { type: 'call', subject: 'Qualification call with Karthik', description: 'Confirmed decision maker status and budget.', completed: false },
    { type: 'email', subject: 'Welcome email to Ananya', description: 'Sent welcome sequence with case studies.', completed: true },
  ]

  for (const a of activitySubjects) {
    await prisma.activity.create({
      data: {
        ...a,
        contactId: createdContacts[activitySubjects.indexOf(a)]?.id,
        leadId: createdLeads[activitySubjects.indexOf(a)]?.id,
        dueDate: new Date(Date.now() + 86400000 * (activitySubjects.indexOf(a) + 1) * 3),
        createdById: admin.id,
        priority: a.completed ? 'medium' : 'high',
      },
    })
  }

  console.log('Database seeded successfully!')
}

seed().catch(console.error).finally(() => prisma.$disconnect())
