# UnitVault 🛡️
 
> *"Couldn't download. Ask the original sender to resend..."*
> The line that blocks you whether you're trying to start an assignment on a Tuesday night, verify lecture notes right after class, or review a past paper before a test.
 
---
 
## The Reality
 
If you've spent more than a week in a university, you know the drill:
 
1. Semester starts with zero organized materials
2. A random PDF drops into a group chat in Week 3
3. Exam week arrives you scroll up 20 minutes, tap download, get *File no longer exists on local storage*
4. You text five people: *"Anyone with SMA 3104 notes?"*
5. Someone sends a blurry photo of a photocopy of a printout
**UnitVault** was built because we shouldn't have to hunt down basic past papers like we're solving a crime every single continuous assessment test.
 
It's a zero-fluff, highly organized vault where notes and past papers are indexed by **Programme → Year → Unit Code**. Find your unit, preview the PDF directly in your browser, and download it instantly.
 
---
 
## For Users
 
Create a free account to save resources to your personal vault so that when the need hits, everything you need is already waiting for you. No more starting from scratch every semester.
 
> More resources and programmes are being added continuously. If your unit isn't listed yet, check back soon.
 
---
 
## Repo Architecture
 
Built with Next.js (App Router), TypeScript, and Supabase:
 
```text
unitvault-app/
├── src/
│   ├── app/
│   │   ├── admin/              # Password-protected admin suite (login & dashboard)
│   │   ├── api/admin/          # API routes for units, resources, and auth
│   │   ├── auth/               # Student authentication & callback handling
│   │   ├── dashboard/          # Student portal for saved resources
│   │   ├── vault/[courseCode]/ # Dynamic course view (notes & past papers)
│   │   ├── HomeClient.tsx      # Programme → Year grouped directory
│   │   ├── layout.tsx          # Root app layout & global providers
│   │   └── page.tsx            # Homepage entry route
│   ├── components/
│   │   ├── layout/             # Navigation bar & header elements
│   │   └── vault/              # Course Cards, Resource Cards & Search Filter
│   └── lib/
│       ├── supabase/           # Client, Server, and Database TypeScript types
│       ├── adminAuth.ts        # Admin session security helper
│       └── utils.ts            # Shared UI helpers
├── supabase/
│   └── schema.sql              # Database tables, policies, and storage setup
└── public/                     # Static brand assets and icons
```
 
---
 
## Back the Build ⭐️
---
 
*UnitVault · Kwani me hudoo.*
