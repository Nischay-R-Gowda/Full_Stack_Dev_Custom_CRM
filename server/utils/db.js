import { PrismaClient } from '@prisma/client'
import path from 'path'
import { fileURLToPath } from 'url'

// ── Shared database access ─────────────────────────────────────
// Every controller imports this single PrismaClient instance instead of
// creating its own. Prisma opens a connection pool per client, so multiple
// instances would exhaust SQLite's file locks under load.
//
// The SQLite datasource URL is built from an absolute path resolved at
// module load time, so it works regardless of which directory node is
// started from (previously a relative `file:./...` URL would resolve
// differently when `node server/server.js` was run from the project root
// vs. when `server/` was the CWD).
// db.js lives in server/utils/ → dev.db is at server/prisma/dev.db, i.e.
// one directory up from __dirname, then into prisma/.
// The `file:` URI prefix (no `//`) is what Prisma's SQLite engine accepts on
// Windows; a bare path or `file://` both fail with "Unable to open the
// database file" when the CWD is not server/ itself.
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(__dirname, '..', 'prisma', 'dev.db')

export const prisma = new PrismaClient({
  datasources: { db: { url: `file:${dbPath}` } },
})

// NRG CO-WORKING CRM has no authentication layer (documented limitation of a
// single-user demo), so every record is attributed to the first user in the
// database — the seeded admin. Resolving it here means controllers never
// trust a client-supplied id.
export async function getSystemUserId() {
  const user = await prisma.user.findFirst({ orderBy: { id: 'asc' } })
  if (!user) {
    throw new Error('No user found in the database. Run `npm run db:seed` to create the admin user.')
  }
  return user.id
}
