import { prisma, getSystemUserId } from '../utils/db.js'

// 'tour' is an NRG-specific activity type: a workspace tour shown to a lead or
// a prospective member. The UI labels it "Workspace tour".
const ACTIVITY_TYPES = ['call', 'email', 'meeting', 'tour', 'note', 'task']
const ACTIVITY_PRIORITIES = ['low', 'medium', 'high']

function toDateOrNull(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

const activityInclude = {
  contact: true,
  lead: true,
  deal: true,
  createdBy: true,
}

function pickActivityFields(data) {
  const fields = {}
  if (data.type !== undefined) fields.type = data.type
  if (data.subject !== undefined) fields.subject = String(data.subject).trim()
  if (data.description !== undefined) fields.description = data.description ? String(data.description).trim() : null
  if (data.dueDate !== undefined) fields.dueDate = toDateOrNull(data.dueDate)
  if (data.completed !== undefined) fields.completed = Boolean(data.completed)
  if (data.priority !== undefined) fields.priority = data.priority
  if (data.contactId !== undefined) fields.contactId = data.contactId ? Number(data.contactId) : null
  if (data.leadId !== undefined) fields.leadId = data.leadId ? Number(data.leadId) : null
  if (data.dealId !== undefined) fields.dealId = data.dealId ? Number(data.dealId) : null
  return fields
}

function validateActivity(fields, { partial = false } = {}) {
  if (!partial) {
    if (!fields.subject) throw new Error('Activity subject is required.')
    if (!fields.type) throw new Error('Activity type is required.')
  }
  if (fields.type !== undefined && !ACTIVITY_TYPES.includes(fields.type)) {
    throw new Error(`Activity type must be one of: ${ACTIVITY_TYPES.join(', ')}.`)
  }
  if (fields.priority !== undefined && !ACTIVITY_PRIORITIES.includes(fields.priority)) {
    throw new Error(`Priority must be one of: ${ACTIVITY_PRIORITIES.join(', ')}.`)
  }
}

export async function getActivities({ contactId, leadId, dealId, type, completed } = {}) {
  const where = {
    ...(contactId ? { contactId: Number(contactId) } : {}),
    ...(leadId ? { leadId: Number(leadId) } : {}),
    ...(dealId ? { dealId: Number(dealId) } : {}),
    ...(type ? { type } : {}),
    ...(completed !== undefined && completed !== '' ? { completed: String(completed) === 'true' } : {}),
  }
  // Incomplete first, then soonest due date — that is how a sales rep works.
  return prisma.activity.findMany({
    where,
    orderBy: [{ completed: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    include: activityInclude,
  })
}

export async function getActivity(id) {
  return prisma.activity.findUnique({ where: { id }, include: activityInclude })
}

export async function createActivity(data) {
  const fields = pickActivityFields(data)
  validateActivity(fields)
  fields.createdById = await getSystemUserId()

  return prisma.activity.create({ data: fields, include: activityInclude })
}

export async function updateActivity(id, data) {
  const activity = await prisma.activity.findUnique({ where: { id } })
  if (!activity) throw new Error('Activity not found.')

  const fields = pickActivityFields(data)
  validateActivity(fields, { partial: true })

  const updated = await prisma.activity.update({ where: { id }, data: fields, include: activityInclude })

  // Keep the parent contact's last-activity timestamp meaningful.
  if (updated.contactId) {
    await prisma.contact.update({ where: { id: updated.contactId }, data: { lastActivityAt: new Date() } })
  }

  return updated
}

export async function deleteActivity(id) {
  const activity = await prisma.activity.findUnique({ where: { id } })
  if (!activity) throw new Error('Activity not found.')
  return prisma.activity.delete({ where: { id } })
}
