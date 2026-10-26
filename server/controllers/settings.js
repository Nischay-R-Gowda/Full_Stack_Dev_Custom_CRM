import { prisma } from '../utils/db.js'

/**
 * Reset All Data — destructive, demo-only convenience.
 *
 * SECURITY CAVEAT (documented in the About section of the Settings UI and in
 * the learning guide PDF):
 *
 *   This endpoint is intentionally unauthenticated and guards a destructive
 *   "wipe all CRM records" operation with a single hard-coded, case-sensitive
 *   password string (`RESET_PASSWORD`). This is a demonstration project for a
 *   university course, not a production security boundary.
 *
 *   - The password is visible to anyone who can read the source code.
 *   - There is no rate-limiting, lockout, or audit log on wrong attempts.
 *   - A correct password wipes every business record (contacts, leads, deals,
 *     activities, notifications) in a single transaction. Pipelines, stages,
 *     and the system user are preserved so the app schema remains fully
 *     functional after the reset.
 *
 *   DO NOT expose this endpoint on a public network in a real deployment. A
 *   production version would require authentication, admin-role authorization,
 *   and an audited, confirmation-gated deletion flow.
 */
const RESET_PASSWORD = 'Nischay'

export async function resetAllData(password) {
  // Exact case-sensitive comparison — 'nischay', 'Nischay ', 'NISCHAY' all
  // fail. Wrong password → 400, data untouched.
  if (password !== RESET_PASSWORD) {
    throw new Error('Incorrect reset password. Data was not changed.')
  }

  // FK-safe delete order: children before parents. Activities reference
  // contacts/leads/deals; deals reference leads/contacts/stages; leads
  // reference contacts. Delete in reverse-dependency order so no
  // ON DELETE RESTRICT (or similar) constraint blocks the transaction.
  await prisma.$transaction(async tx => {
    await tx.activity.deleteMany({})
    await tx.notification.deleteMany({})
    await tx.deal.deleteMany({})
    await tx.lead.deleteMany({})
    await tx.contact.deleteMany({})
    // Preserved on purpose:
    //   tx.user / tx.pipeline / tx.stage — schema rows, not business data.
  })

  // Confirm counts so the client can report exactly what was cleared.
  const [contacts, leads, deals, activities] = await Promise.all([
    prisma.contact.count(),
    prisma.lead.count(),
    prisma.deal.count(),
    prisma.activity.count(),
  ])

  return {
    success: true,
    cleared: { contacts: contacts, leads: leads, deals: deals, activities: activities },
    message: 'All CRM data has been reset. Pipelines, stages, and the system user were preserved.',
  }
}
