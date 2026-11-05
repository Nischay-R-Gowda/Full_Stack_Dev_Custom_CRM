import { prisma, getSystemUserId } from '../utils/db.js'

// Lead lifecycle — shared with the frontend's LEAD_STATUSES constant.
const LEAD_STATUSES = ['new', 'attempting', 'connected', 'qualified', 'disqualified', 'converted']
const LEAD_TYPES = ['mql', 'sql', 'deal']
const LEAD_SOURCES = ['google_ads', 'meta_ads', 'website', 'inbound_call', 'referral', 'manual']

export function generateLeadNumber() {
  // Single source of truth for lead numbers (previously three inconsistent
  // generators produced different formats across seed/routes/controllers).
  return `LEAD-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`
}

function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function toDateOrNull(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

// Keep only columns that exist on the Lead model.
function pickLeadFields(data) {
  const fields = {}
  if (data.status !== undefined) fields.status = data.status
  if (data.type !== undefined) fields.type = data.type
  if (data.source !== undefined) fields.source = data.source
  if (data.company !== undefined) fields.company = data.company ? String(data.company).trim() : null
  if (data.companySize !== undefined) fields.companySize = data.companySize || null
  if (data.industry !== undefined) fields.industry = data.industry || null
  if (data.website !== undefined) fields.website = data.website || null
  if (data.notes !== undefined) fields.notes = data.notes ? String(data.notes).trim() : null
  if (data.qualificationNotes !== undefined) fields.qualificationNotes = data.qualificationNotes || null
  if (data.nextFollowUp !== undefined) fields.nextFollowUp = toDateOrNull(data.nextFollowUp)
  if (data.expectedValue !== undefined) fields.expectedValue = toNumberOrNull(data.expectedValue)
  if (data.contactId !== undefined) fields.contactId = toNumberOrNull(data.contactId)
  // NRG coworking fields — nullable, safe for old records (null).
  if (data.seatsRequired !== undefined) fields.seatsRequired = toIntOrNull(data.seatsRequired)
  if (data.locality !== undefined) fields.locality = data.locality ? String(data.locality).trim() : null
  if (data.duration !== undefined) fields.duration = data.duration ? String(data.duration).trim() : null
  return fields
}

function toIntOrNull(value) {
  if (value === '' || value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) && Number.isInteger(n) ? n : null
}

// Bengaluru localities offered in the UI. 'Other' is a free-text escape hatch.
export const LOCALITIES = ['Whitefield', 'Outer Ring Road', 'Koramangala', 'Indiranagar', 'HSR Layout', 'Electronic City', 'Hebbal', 'MG Road', 'Jayanagar', 'Marathahalli', 'Other']

// Booking durations a coworking customer might ask for.
export const DURATIONS = ['1 day', '1 week', '1 month', '3 months', '6 months', '12 months', 'Custom']

function validateLead(fields, { partial = false } = {}) {
  if (!partial && fields.source !== undefined && !LEAD_SOURCES.includes(fields.source)) {
    throw new Error(`Lead source must be one of: ${LEAD_SOURCES.join(', ')}.`)
  }
  if (fields.status !== undefined && !LEAD_STATUSES.includes(fields.status)) {
    throw new Error(`Lead status must be one of: ${LEAD_STATUSES.join(', ')}.`)
  }
  if (fields.type !== undefined && !LEAD_TYPES.includes(fields.type)) {
    throw new Error(`Lead type must be one of: ${LEAD_TYPES.join(', ')}.`)
  }
  if (fields.contactId !== null && fields.contactId !== undefined && !Number.isInteger(fields.contactId)) {
    throw new Error('Contact association must be a valid contact id.')
  }
  // NRG coworking fields — type-check only what was provided; they stay
  // optional so old records without them remain valid.
  if (fields.seatsRequired !== null && fields.seatsRequired !== undefined && !Number.isInteger(fields.seatsRequired)) {
    throw new Error('Seats required must be a whole number.')
  }
  if (fields.seatsRequired !== null && fields.seatsRequired !== undefined && fields.seatsRequired < 1) {
    throw new Error('Seats required must be at least 1.')
  }
  if (fields.locality !== null && fields.locality !== undefined && typeof fields.locality !== 'string') {
    throw new Error('Locality must be text.')
  }
  if (fields.duration !== null && fields.duration !== undefined && !DURATIONS.includes(fields.duration)) {
    throw new Error(`Duration must be one of: ${DURATIONS.join(', ')}.`)
  }
}

const leadInclude = {
  contact: true,
  activities: { orderBy: { createdAt: 'desc' }, take: 10 },
}

export async function getLeads({ search = '', status = '', source = '', type = '' } = {}) {
  const where = {
    ...(search ? {
      OR: [
        { leadNumber: { contains: search } },
        { company: { contains: search } },
        { notes: { contains: search } },
        { contact: { firstName: { contains: search } } },
        { contact: { lastName: { contains: search } } },
      ],
    } : {}),
    ...(status ? { status } : {}),
    ...(source ? { source } : {}),
    ...(type ? { type } : {}),
  }

  // Prisma cannot have two `contact` keys inside a single OR, so build it once.
  if (search) {
    const s = search
    where.OR = [
      { leadNumber: { contains: s } },
      { company: { contains: s } },
      { notes: { contains: s } },
      { contact: { is: { OR: [{ firstName: { contains: s } }, { lastName: { contains: s } }] } } },
    ]
  }

  return prisma.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' }, // newest first, as required
    include: leadInclude,
  })
}

export async function getLead(id) {
  return prisma.lead.findUnique({ where: { id }, include: leadInclude })
}

export async function createLead(data) {
  const fields = pickLeadFields(data)
  validateLead(fields)
  fields.createdById = await getSystemUserId()
  fields.leadNumber = generateLeadNumber()

  return prisma.lead.create({ data: fields, include: leadInclude })
}

export async function updateLead(id, data) {
  const lead = await prisma.lead.findUnique({ where: { id } })
  if (!lead) throw new Error('Lead not found.')

  const fields = pickLeadFields(data)
  validateLead(fields, { partial: true })

  return prisma.lead.update({ where: { id }, data: fields, include: leadInclude })
}

export async function deleteLead(id) {
  const lead = await prisma.lead.findUnique({ where: { id } })
  if (!lead) throw new Error('Lead not found.')

  const deals = await prisma.deal.count({ where: { contactId: lead.contactId || 0 } })
  if (lead.contactId && deals > 0) {
    throw new Error(`Cannot delete: ${deals} deal(s) reference this lead's contact.`)
  }
  return prisma.lead.delete({ where: { id } })
}

/**
 * Qualification: promote a Marketing Qualified Lead to Sales Qualified (SQL),
 * or straight to a Deal.
 *
 * The previous implementation spread the whole request body into
 * prisma.lead.update(), which sent contact-first-name/email keys Prisma does
 * not recognise ("Unknown argument `contactEmail`"). Only recognised columns
 * are written now, and the contact is found-or-created separately.
 */
export async function qualifyLead(id, qualificationData = {}) {
  const lead = await prisma.lead.findUnique({ where: { id } })
  if (!lead) throw new Error('Lead not found.')

  const { type, qualificationNotes, contactEmail, contactFirstName, contactLastName, contactPhone, contactCompany } = qualificationData

  if (type && !LEAD_TYPES.includes(type)) {
    throw new Error(`Lead type must be one of: ${LEAD_TYPES.join(', ')}.`)
  }

  // Only write columns that exist on Lead — never the contact* fields.
  const leadFields = {}
  if (type) leadFields.type = type
  if (qualificationNotes !== undefined) {
    leadFields.qualificationNotes = qualificationNotes ? String(qualificationNotes).trim() : null
  }

  // Qualification is also the handoff point for workspace requirements. Save
  // these Lead columns directly so the table, filters and eventual deal all
  // use the same values.
  const qualificationFields = pickLeadFields(qualificationData)
  for (const field of ['company', 'companySize', 'industry', 'website', 'expectedValue', 'seatsRequired', 'locality', 'duration']) {
    if (qualificationData[field] !== undefined) leadFields[field] = qualificationFields[field]
  }
  validateLead(leadFields, { partial: true })

  let contactId = lead.contactId

  // SQL and Deal stages require a real contact relationship.
  if (type === 'sql' || type === 'deal') {
    // Reuse the lead's existing contact when one is already associated —
    // that is what keeps qualifying an existing lead from forking into a
    // second contact for the same person. When no contact is linked yet,
    // create one deterministically (derived from the lead's own fields) so
    // the qualification flow never blocks on missing contact detail, and
    // repeated calls for the same lead never spawn a second contact row.
    if (!contactId) {
      // When the rep supplies contact fields in the qualify form, honour
      // them; otherwise fall back to a deterministic synthetic identity so
      // the flow never blocks on missing contact detail.
      const [fallbackFirstName, fallbackLastName] = lead.company
        ? ['NRG', `Lead ${lead.id}`]
        : ['Prospect', String(lead.id)]
      const contact = await findOrCreateContact({
        email: contactEmail || `lead-${lead.id}@nrg.local`,
        firstName: contactFirstName || fallbackFirstName,
        lastName: contactLastName || fallbackLastName,
        phone: contactPhone,
        company: contactCompany || leadFields.company || lead.company,
        leadSource: lead.source,
      })
      contactId = contact.id
    }
    else {
      const contactChanges = {}
      if (contactFirstName && String(contactFirstName).trim()) contactChanges.firstName = String(contactFirstName).trim()
      if (contactLastName && String(contactLastName).trim()) contactChanges.lastName = String(contactLastName).trim()
      if (contactEmail && String(contactEmail).trim()) contactChanges.email = String(contactEmail).trim().toLowerCase()
      if (contactPhone !== undefined) contactChanges.phone = contactPhone ? String(contactPhone).trim() : null
      if (contactCompany !== undefined) contactChanges.company = contactCompany ? String(contactCompany).trim() : null
      if (Object.keys(contactChanges).length) await prisma.contact.update({ where: { id: contactId }, data: contactChanges })
    }
    leadFields.contactId = contactId
  }

  // MQL stays a marketing lead; SQL is qualified; Deal is converted.
  if (type === 'sql') leadFields.status = 'qualified'
  if (type === 'deal') leadFields.status = 'converted'
  if (!type || type === 'mql') leadFields.status = 'qualified'

  leadFields.updatedAt = new Date()

  const updatedLead = await prisma.lead.update({
    where: { id },
    data: leadFields,
    include: leadInclude,
  })

  // Both 'deal' and 'sql' should produce exactly one deal row. 'deal' marks the
  // lead converted; 'sql' marks it qualified (the pipeline deal is created so
  // the rep can track it). The find-first guard makes this idempotent —
  // repeated qualification calls never spawn a second deal.
  if (type === 'deal' || type === 'sql') {
    const existingDeal = await prisma.deal.findFirst({
      where: { leadId: lead.id },
      include: { contact: true, stage: true, pipeline: true },
    })
    let deal
    if (existingDeal) {
      deal = existingDeal
    } else {
      const { stage, pipelineId } = await resolveConversionTarget(lead, { stageId: qualificationData.stageId, pipelineId: qualificationData.pipelineId })
      deal = await prisma.deal.create({
        data: {
          dealName: (qualificationData.dealName && String(qualificationData.dealName).trim()) || `${leadFields.company || lead.company || 'New'} Opportunity`,
          amount: toNumberOrNull(qualificationData.amount) ?? leadFields.expectedValue ?? lead.expectedValue ?? 0,
          probability: 50,
          expectedCloseDate: toDateOrNull(qualificationData.expectedCloseDate),
          notes: qualificationData.notes ? String(qualificationData.notes).trim() : lead.notes,
          contactId,
          stageId: stage.id,
          pipelineId,
          leadId: lead.id,
          createdById: await getSystemUserId(),
        },
        include: { contact: true, stage: true, pipeline: true },
      })
    }
    return { lead: updatedLead, deal }
  }

  return updatedLead
}

/**
 * Readiness check: is this lead fully ready to be qualified/converted?
 *
 * Returns { ready, missing } where `missing` lists which NRG fields are
 * still null. The frontend shows a "missing fields" hint instead of a
 * blind Qualify button when ready === false.
 */
export async function getLeadReadiness(id) {
  const lead = await prisma.lead.findUnique({ where: { id } })
  if (!lead) throw new Error('Lead not found.')

  const missing = []
  if (!lead.seatsRequired) missing.push('seatsRequired')
  if (!lead.locality) missing.push('locality')
  if (!lead.duration) missing.push('duration')

  // A lead already at 'converted' is always "ready" — no more to do.
  // Everything else is ready when no NRG fields are missing.
  const ready = lead.status === 'converted' || missing.length === 0

  return { ready, missing, status: lead.status, type: lead.type }
}

/**
 * Resolve the pipeline and stage a converted deal should land in.
 *
 * Shared between `qualifyLead` (which creates the deal when type is 'deal')
 * and `convertLeadToDeal` so the two entry points pick the same default
 * (first stage of the default pipeline) instead of drifting apart.
 */
async function resolveConversionTarget(lead, { stageId, pipelineId }) {
  let resolvedStageId = stageId ? Number(stageId) : null
  let resolvedPipelineId = pipelineId ? Number(pipelineId) : null

  let stage = resolvedStageId ? await prisma.stage.findUnique({ where: { id: resolvedStageId } }) : null
  if (!stage) {
    const pipeline = resolvedPipelineId
      ? await prisma.pipeline.findUnique({ where: { id: resolvedPipelineId } })
      : await prisma.pipeline.findFirst({ where: { isDefault: true }, orderBy: { id: 'asc' } })
        || await prisma.pipeline.findFirst({ orderBy: { id: 'asc' } })

    if (!pipeline) throw new Error('No pipeline exists. Create a pipeline before converting a lead.')

    stage = await prisma.stage.findFirst({ where: { pipelineId: pipeline.id }, orderBy: { position: 'asc' } })
    if (!stage) throw new Error('The target pipeline has no stages. Add a stage first.')
    resolvedPipelineId = pipeline.id
  } else if (!resolvedPipelineId) {
    resolvedPipelineId = stage.pipelineId
  }

  return { stage, pipelineId: resolvedPipelineId }
}

/**
 * Convert a qualified lead into a Deal in the pipeline.
 *
 * The old version had two bugs: it read `where: { id }` (an undefined
 * variable, crashing the request) and it never actually created a Deal row —
 * it only relabelled the Lead. This now does both.
 */
export async function convertLeadToDeal(leadId, dealData = {}) {
  const lead = await prisma.lead.findUnique({ where: { id: leadId }, include: { contact: true } })
  if (!lead) throw new Error('Lead not found.')

  // A deal needs a contact; promote to one if the lead is still anonymous.
  let contactId = lead.contactId
  if (!contactId) {
    const contact = await findOrCreateContact({
      email: dealData.contactEmail,
      firstName: dealData.contactFirstName,
      lastName: dealData.contactLastName,
      phone: dealData.contactPhone,
      company: dealData.contactCompany || lead.company,
      leadSource: lead.source,
    })
    contactId = contact.id
  }

  // Resolve the target stage — first stage of the default pipeline unless the
  // caller names one, or names a stage that belongs to a different pipeline.
  const { stage, pipelineId } = await resolveConversionTarget(lead, { stageId: dealData.stageId, pipelineId: dealData.pipelineId })

  const amount = toNumberOrNull(dealData.amount) ?? lead.expectedValue ?? 0
  const dealName = (dealData.dealName && String(dealData.dealName).trim()) || `${lead.company || 'New'} Opportunity`

  // A lead should back at most one deal. The schema enforces this with
  // `leadId @unique` on Deal: check first for a clean "already converted"
  // message, then create the deal. The database constraint is the final
  // backstop against a race between the check and the create.
  const existingDeal = await prisma.deal.findFirst({
    where: { leadId: lead.id },
    include: { contact: true, stage: true, pipeline: true },
  })
  if (existingDeal) {
    const updatedLead = await prisma.lead.update({
      where: { id: leadId },
      data: { status: 'converted', type: 'deal', contactId },
      include: leadInclude,
    })
    return { lead: updatedLead, deal: existingDeal }
  }

  const deal = await prisma.deal.create({
    data: {
      dealName,
      amount,
      probability: 50,
      expectedCloseDate: toDateOrNull(dealData.expectedCloseDate),
      notes: dealData.notes ? String(dealData.notes).trim() : lead.notes,
      contactId,
      stageId: stage.id,
      pipelineId,
      leadId: lead.id,
      createdById: await getSystemUserId(),
    },
    include: { contact: true, stage: true, pipeline: true },
  })

  const updatedLead = await prisma.lead.update({
    where: { id: leadId },
    data: { status: 'converted', type: 'deal', contactId },
    include: leadInclude,
  })

  return { lead: updatedLead, deal }
}

/**
 * Find a contact by email, or create one. Prevents the duplicate-contact bug
 * where converting a lead spawned a second row for the same person.
 */
export async function findOrCreateContact({ email, firstName, lastName, phone, company, leadSource }) {
  const normalisedEmail = email ? String(email).trim().toLowerCase() : null

  if (normalisedEmail) {
    const existing = await prisma.contact.findUnique({ where: { email: normalisedEmail } })
    if (existing) return existing
  }

  if (!firstName || !lastName) {
    throw new Error('First name and last name are required to create a contact.')
  }

  // No email supplied — build a unique one so the Contact.email unique
  // constraint never fails for otherwise-valid qualification data.
  const fallbackEmail = normalisedEmail
    || `lead.${Date.now().toString(36)}@nrg.local`

  return prisma.contact.create({
    data: {
      firstName: String(firstName).trim(),
      lastName: String(lastName).trim(),
      email: fallbackEmail,
      phone: phone ? String(phone).trim() : null,
      company: company || null,
      leadSource: leadSource || 'manual',
      lifecycleStage: 'sql',
    },
  })
}
