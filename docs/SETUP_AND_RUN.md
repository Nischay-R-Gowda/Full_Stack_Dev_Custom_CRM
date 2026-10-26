# Setup and Run Guide — NRG CO-WORKING CRM

## Prerequisites
- Node.js 18+ (tested with v24.14.0)
- npm 9+ (tested with v11.21.0)

## Step-by-Step Setup

### 1. Clone/Open the Project
```bash
cd C:/Users/Nischay\ r\ gowda/MY_PROJECTS/crm-platform
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
# Create .env file at project root
echo DATABASE_URL="file:./server/prisma/dev.db" > .env
```

### 4. Push Database Schema
```bash
npx prisma db push --schema server/prisma/schema.prisma
```

### 5. Seed Sample Data
```bash
node server/prisma/seed.js
```
Expected output: `Database seeded successfully!`

### 6. Start the Application

**Option A: Run both servers together**
```bash
npm run dev:all
```

**Option B: Run separately (two terminals)**

Terminal 1 — Backend:
```bash
npm run server
# Output: Server running on port 5000
```

Terminal 2 — Frontend:
```bash
npm run dev
# Output: Local: http://localhost:5173/
```

### 7. Open in Browser
Navigate to `http://localhost:5173`

## Troubleshooting

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill //PID <PID> //F

netstat -ano | findstr :5173
taskkill //PID <PID> //F
```

### Prisma Client Not Generated
```bash
npx prisma generate --schema server/prisma/schema.prisma
```

### Database Issues (Reset)
```bash
# Delete database
del server\prisma\dev.db

# Re-push schema
npx prisma db push --schema server/prisma/schema.prisma

# Re-seed
node server/prisma/seed.js
```

### Build Errors
```bash
# Clear Vite cache
rm -rf node_modules/.vite
npx vite build
```

## Production Build

```bash
npm run build
npm run preview
```

The built files will be in `dist/`.

## Database Studio (Optional)
```bash
npx prisma studio --schema server/prisma/schema.prisma
# Opens at http://localhost:5555
```

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| dev | `npm run dev` | Vite dev server (port 5173) |
| server | `npm run server` | Express backend (port 5000) |
| dev:all | `npm run dev:all` | Both servers concurrently |
| build | `npm run build` | Production build |
| preview | `npm run preview` | Preview production build |
| lint | `npm run lint` | ESLint check |
| db:push | `npm run db:push` | Push schema to SQLite |
| db:seed | `npm run db:seed` | Seed sample data |
| db:studio | `npm run db:studio` | Open Prisma Studio |
