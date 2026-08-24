<<<<<<< HEAD
# UnitVault — Your unit notes, vaulted.

## Quick Setup

### 1. Supabase
- Create project at supabase.com
- Run `supabase/schema.sql` in the SQL editor
- Create a public storage bucket named `unit-vault-materials`
- Get URL + keys from Settings → API

### 2. Environment
```bash
cp .env.local.example .env.local
# Fill in your Supabase URL, anon key, service role key, and an admin password
```

### 3. Run
```bash
npm install
npm run dev
```

## Pages
| Route | Who |
|-------|-----|
| `/` | Course directory (public) |
| `/vault/[courseCode]` | Resources for a course (public, download free) |
| `/auth` | Student sign-in/sign-up |
| `/dashboard` | Saved resources (logged-in students) |
| `/admin` | Admin panel (password protected) |

## Admin Panel
Go to `/admin` and enter your `ADMIN_PASSWORD`.
- Upload PDFs and link them to courses
- Add/delete courses (code, name, dept, year, semester)
- Delete resources (removes from storage too)

## Deploy
```bash
npx vercel
# Add env vars in Vercel dashboard
```

See full docs in the project files.
=======
# UnitVault
 
Find, preview, and download university notes and past papers organised by unit code.
>>>>>>> 5113864fdf36cbd64828095af63ba032c22376f8
