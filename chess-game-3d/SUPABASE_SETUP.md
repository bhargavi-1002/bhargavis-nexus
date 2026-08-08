# 🔐 Supabase Setup & Configuration Guide

## 📋 Quick Setup (5 minutes)

### Step 1: Create Supabase Project
1. Go to https://supabase.com
2. Sign up or login
3. Click "New Project"
4. Choose organization and database password
5. Wait for project to initialize (2-3 minutes)

### Step 2: Get Your Credentials
After project is created, go to **Settings → API**:

| Credential | Location | Used For |
|-----------|----------|----------|
| `project_ref` | URL slug or Project Settings | MCP configuration |
| `SUPABASE_URL` | Anon Public Key section | Frontend & Backend |
| `SUPABASE_ANON_KEY` | Anon Public Key section | Frontend (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | Service Role Keys section | Backend (private) |
| `DATABASE_URL` | Settings → Database | Backend connection |

### Step 3: Update .vscode/mcp.json
```json
{
  "servers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF_HERE"
    }
  }
}
```

Replace `YOUR_PROJECT_REF_HERE` with your actual project ref (e.g., `gvtprmroohxedtuwslwv`)

### Step 4: Update Environment Files

**Root .env:**
```env
DATABASE_URL=postgresql://postgres:[password]@[host]:[port]/postgres
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**backend/.env.local:**
```env
DATABASE_URL=postgresql://postgres:[password]@localhost:54322/postgres
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**frontend/.env.local:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Step 5: Install Supabase Dependencies

**Backend:**
```bash
cd backend
npm install @supabase/supabase-js
npm install pg  # For direct PostgreSQL access
```

**Frontend:**
```bash
cd frontend
npm install @supabase/supabase-js @supabase/ssr
```

---

## 🗄️ Database Schema Setup

### Option A: Manual Setup via Supabase Dashboard

1. Go to SQL Editor in Supabase Dashboard
2. Create tables matching your MongoDB schema
3. Set up RLS (Row Level Security) policies

### Option B: Use Supabase CLI (Recommended)

```bash
# Install CLI
npm install -g supabase

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Create migrations
supabase migration new create_chess_tables

# Apply migrations
supabase db push
```

### Sample Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rating INT DEFAULT 1600,
  wins INT DEFAULT 0,
  losses INT DEFAULT 0,
  draws INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Games table
CREATE TABLE games (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  white_id UUID REFERENCES users(id),
  black_id UUID REFERENCES users(id),
  pgn TEXT,
  status TEXT DEFAULT 'active',
  winner_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now(),
  updated_at TIMESTAMP DEFAULT now()
);

-- Puzzles table
CREATE TABLE puzzles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fen TEXT NOT NULL,
  solution TEXT NOT NULL,
  difficulty INT DEFAULT 1,
  rating INT DEFAULT 1600,
  created_at TIMESTAMP DEFAULT now()
);
```

---

## 🔐 Git Security - What's Protected

✅ **Already in .gitignore:**
```
.env                          # Main environment file
.env.local                    # Local overrides
.env.development.local        # Development secrets
.env.production.local         # Production secrets
.env.test.local              # Test secrets
```

### Verify Git Configuration

```bash
# Check that .env files are ignored
git status

# Should NOT show any .env files
# Only show tracked files like .env.example

# If .env was committed before, remove it:
git rm --cached .env
git commit -m "Remove .env from tracking"
git push
```

---

## 🚀 Development Workflow

### Start Development

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev  # Requires DATABASE_URL set in backend/.env.local

# Terminal 2: Frontend
cd frontend
npm install
npm run dev  # Uses http://localhost:5000
```

### Test Supabase Connection

**Backend:**
```javascript
// test-supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

supabase.from('users').select('*').then(console.log);
```

**Frontend:**
```typescript
// utils/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

---

## 📊 Environment Variables by Environment

### Development (Local)
| Variable | Value | Secret? |
|----------|-------|---------|
| `NODE_ENV` | `development` | No |
| `DATABASE_URL` | Local/dev instance | Yes |
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000` | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Dev key | **Yes** |

### Production (Vercel)
| Variable | Value | Secret? |
|----------|-------|---------|
| `NODE_ENV` | `production` | No |
| `DATABASE_URL` | Production URL | Yes |
| `NEXT_PUBLIC_API_URL` | `https://api.domain.com` | No |
| `SUPABASE_SERVICE_ROLE_KEY` | Production key | **Yes** |

---

## ✅ Configuration Checklist

### MCP Setup
- [ ] Created `.vscode/mcp.json`
- [ ] Added Supabase `project_ref`
- [ ] Restarted VS Code

### Environment Files
- [ ] Created `.env` (root)
- [ ] Created `backend/.env.local`
- [ ] Created `frontend/.env.local`
- [ ] All files in `.gitignore`
- [ ] No secrets in version control

### Supabase Project
- [ ] Created Supabase account
- [ ] Created new project
- [ ] Got all credentials
- [ ] Updated .env files with credentials
- [ ] Created database tables/schema

### Dependencies
- [ ] Backend: `npm install @supabase/supabase-js pg`
- [ ] Frontend: `npm install @supabase/supabase-js @supabase/ssr`

### Testing
- [ ] Backend can connect to database
- [ ] Frontend can access API
- [ ] No console errors
- [ ] Git doesn't track .env files

---

## 🆘 Troubleshooting

### Error: "Cannot read property 'supabase' of undefined"
**Fix**: Ensure `.vscode/mcp.json` has correct `project_ref`

### Error: "SUPABASE_URL not found"
**Fix**: Check `.env.local` files exist in both backend and frontend

### Error: "Connection refused"
**Fix**: Verify DATABASE_URL points to correct host and port

### Error: ".env is staged in git"
**Fix**:
```bash
git rm --cached .env
git commit -m "Stop tracking .env"
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Ensure .env is ignored"
```

---

## 📚 Resources

- [Supabase Docs](https://supabase.com/docs)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)
- [PostgreSQL Guide](https://www.postgresql.org/docs/)
- [Next.js & Supabase](https://supabase.com/docs/guides/getting-started/frameworks/nextjs)

---

## 🔒 Security Best Practices

1. **Never commit .env files** ✅ Already in .gitignore
2. **Use different keys per environment** (dev/staging/prod)
3. **Rotate keys regularly** in production
4. **Use RLS policies** to restrict database access
5. **Enable 2FA** on Supabase account
6. **Use SERVICE_ROLE_KEY only in backend** (never expose publicly)
7. **Use ANON_KEY in frontend** (can be public, restricted by RLS)

---

## 📝 Next Steps

1. Create Supabase project at https://supabase.com
2. Get credentials from Settings → API
3. Update `.vscode/mcp.json` with `project_ref`
4. Fill in `.env`, `backend/.env.local`, `frontend/.env.local`
5. Install dependencies: `npm install @supabase/supabase-js`
6. Create database schema using SQL Editor
7. Start development: `npm run dev`
8. Verify no `.env` files in git: `git status`

**You're ready to use Supabase! 🚀**
