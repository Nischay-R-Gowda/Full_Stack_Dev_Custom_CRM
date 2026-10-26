import { prisma, getSystemUserId } from '../utils/db.js'
import { generateLeadNumber, LOCALITIES, DURATIONS } from './leads.js'

// Lifecycle stages a Contact can occupy, mirrored from the frontend so the
// API can reject nonsense values instead of silently storing them.
const LIFECYCLE_STAGES = ['lead', 'mql', 'sql', 'customer']

// Only these columns may be written to a Contact row. Anything else the client
// sends (id, createdAt, nested relations...) is dropped so Prisma never throws
// "Unknown argument".
function pickContactFields(data) {
  const fields = {}
  if (data.firstName !== undefined) fields.firstName = String(data.firstName).trim()
  if (data.lastName !== undefined) fields.lastName = String(data.lastName).trim()
  if (data.email !== undefined) fields.email = String(data.email).trim().toLowerCase()
  if (data.phone !== undefined) fields.phone = data.phone ? String(data.phone).trim() : null
  if (data.company !== undefined) fields.company = data.company ? String(data.company).trim() : null
  if (data.jobTitle !== undefined) fields.jobTitle = data.jobTitle ? String(data.jobTitle).trim() : null
  if (data.location !== undefined) fields.location = data.location ? String(data.location).trim() : null
  if (data.leadSource !== undefined) fields.leadSource = data.leadSource
  if (data.lifecycleStage !== undefined) fields.lifecycleStage = data.lifecycleStage
  if (data.notes !== undefined) fields.notes = data.notes ? String(data.notes).trim() : null
  return fields
}

function validateContact(fields, { partial = false } = {}) {
  if (!partial) {
    if (!fields.firstName) throw new Error('First name is required.')
    if (!fields.lastName) throw new Error('Last name is required.')
  }
  if (fields.email !== undefined) {
    if (!fields.email) throw new Error('Email address is required.')
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) throw new Error('Please enter a valid email address.')
  }
  if (fields.lifecycleStage !== undefined && !LIFECYCLE_STAGES.includes(fields.lifecycleStage)) {
    throw new Error(`Lifecycle stage must be one of: ${LIFECYCLE_STAGES.join(', ')}.`)
  }
}

const contactInclude = {
  leads: { orderBy: { createdAt: 'desc' } },
  deals: { include: { stage: true, pipeline: true }, orderBy: { createdAt: 'desc' } },
  activities: { orderBy: { createdAt: 'desc' }, take: 10 },
}

export async function getContacts({ search = '', sortBy = 'createdAt', sortOrder = 'desc', lifecycleStage = '' } = {}) {
  const where = {
    ...(search ? {
      OR: [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { company: { contains: search } },
      ],
    } : {}),
    ...(lifecycleStage ? { lifecycleStage } : {}),
  }

  // Whitelist the sort column so a bad query param cannot crash the query.
  const sortable = ['firstName', 'lastName', 'email', 'company', 'createdAt', 'lifecycleStage', 'leadSource']
  const safeSortBy = sortable.includes(sortBy) ? sortBy : 'createdAt'
  const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc'

  return prisma.contact.findMany({
    where,
    orderBy: { [safeSortBy]: safeSortOrder },
    include: contactInclude,
  })
}

export async function getContact(id) {
  return prisma.contact.findUnique({ where: { id }, include: contactInclude })
}

export async function createContact(data) {
  const { createLead: createLeadPayload, ...contactData } = data
  const fields = pickContactFields(contactData)
  validateContact(fields)

  const existing = await prisma.contact.findUnique({ where: { email: fields.email } })
  if (existing) throw new Error('A contact with this email already exists.')

  const contact = await prisma.contact.create({ data: fields, include: contactInclude })

  // "Also create a lead" — when the checkbox was ticked, create exactly one
  // Lead linked to this contact. MQL (default) leaves the lead at status 'new';
  // SQL (chosen manually) sets it to 'qualified' and creates a deal in the
  // default pipeline's first stage.
  if (createLeadPayload && createLeadPayload.enabled) {
    const leadPayload = createLeadPayload
    const leadType = leadPayload.type === 'sql' ? 'sql' : 'mql'
    const leadStatus = leadType === 'sql' ? 'qualified' : 'new'

    const leadFields = {
      leadNumber: generateLeadNumber(),
      status: leadStatus,
      type: leadType,
      source: leadPayload.source || 'manual',
      company: leadPayload.company ? String(leadPayload.company).trim() : (fields.company || null),
      companySize: leadPayload.companySize || null,
      industry: leadPayload.industry || null,
      website: leadPayload.website || null,
      notes: leadPayload.notes ? String(leadPayload.notes).trim() : null,
      qualificationNotes: leadPayload.qualificationNotes ? String(leadPayload.qualificationNotes).trim() : null,
      nextFollowUp: leadPayload.nextFollowUp ? new Date(leadPayload.nextFollowUp) : null,
      expectedValue: leadPayload.expectedValue ? Number(leadPayload.expectedValue) : null,
      seatsRequired: leadPayload.seatsRequired ? Number(leadPayload.seatsRequired) : null,
      locality: leadPayload.locality ? String(leadPayload.locality).trim() : null,
      duration: leadPayload.duration ? String(leadPayload.duration).trim() : null,
      contactId: contact.id,
      createdById: await getSystemUserId(),
    }

    // Whitespace/empty strings should be stored as null, not '' — Prisma's
    // String? accepts empty strings, which would render as blank rows later.
    if (!leadFields.company) leadFields.company = null
    if (!leadFields.locality) leadFields.locality = null
    if (!leadFields.duration) leadFields.duration = null

    if (LOCALITIES.length && leadFields.locality && !LOCALITIES.includes(leadFields.locality)) {
      throw new Error(`Locality must be one of: ${LOCALITIES.join(', ')}.`)
    }
    if (DURATIONS.length && leadFields.duration && !DURATIONS.includes(leadFields.duration)) {
      throw new Error(`Duration must be one of: ${DURATIONS.join(', ')}.`)
    }
    if (leadFields.seatsRequired !== null && (leadFields.seatsRequired < 1 || !Number.isInteger(leadFields.seatsRequired))) {
      throw new Error('Seats required must be a positive whole number.')
    }

    const lead = await prisma.lead.create({ data: leadFields, include: { contact: true } })

    // SQL chosen manually → create one deal (dedup-guarded: contact+lead is
    // brand new here, so there can be no existing deal for this lead).
    let deal = null
    if (leadType === 'sql') {
      const { stage, pipelineId } = await resolveDefaultStage()
      deal = await prisma.deal.create({
        data: {
          dealName: leadPayload.dealName && String(leadPayload.dealName).trim()
            || `${leadFields.company || contact.firstName + ' ' + contact.lastName} Opportunity`,
          amount: leadPayload.amount ? Number(leadPayload.amount) : (leadFields.expectedValue ?? 0),
          probability: 50,
          expectedCloseDate: leadPayload.expectedCloseDate ? new Date(leadPayload.expectedCloseDate) : null,
          notes: null,
          contactId: contact.id,
          stageId: stage.id,
          pipelineId,
          leadId: lead.id,
          createdById: await getSystemUserId(),
        },
        include: { contact: true, stage: true, pipeline: true },
      })
    }

    return { contact, lead, deal }
  }

  return contact
}

async function resolveDefaultStage() {
  const pipeline = await prisma.pipeline.findFirst({ where: { isDefault: true }, orderBy: { id: 'asc' } })
    || await prisma.pipeline.findFirst({ orderBy: { id: 'asc' } })
  if (!pipeline) throw new Error('No pipeline exists. Create a pipeline before adding an SQL lead.')
  const stage = await prisma.stage.findFirst({ where: { pipelineId: pipeline.id }, orderBy: { position: 'asc' } })
  if (!stage) throw new Error('The target pipeline has no stages. Add a stage first.')
  return { stage, pipelineId: pipeline.id }
}

export async function updateContact(id, data) {
  const existingContact = await prisma.contact.findUnique({ where: { id } })
  if (!existingContact) throw new Error('Contact not found.')

  const fields = pickContactFields(data)
  validateContact(fields, { partial: true })

  // Duplicate check only runs when an email is actually being changed.
  if (fields.email && fields.email !== existingContact.email) {
    const clash = await prisma.contact.findUnique({ where: { email: fields.email } })
    if (clash) throw new Error('Another contact with this email already exists.')
  }

  return prisma.contact.update({ where: { id }, data: fields, include: contactInclude })
}

export async function deleteContact(id) {
  const deals = await prisma.deal.count({ where: { contactId: id } })
  if (deals > 0) {
    throw new Error(`Cannot delete: ${deals} deal(s) are still linked to this contact.`)
  }
  return prisma.contact.delete({ where: { id } })
}
