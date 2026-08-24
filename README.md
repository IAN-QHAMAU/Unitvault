# UnitVault 🛡️

> *"Couldn't download.Ask the sender to resend."* The exact moment you realize your CAT/EXAM is in two hours, the WhatsApp group is buried under 400 unread messages and the person who sent the paper you have to dm them to get the paper.

---

### The Reality

If you’ve spent more than a week in a university, you know the drill:
1. Every semester starts with zero organized materials.
2. A random PDF gets dropped into a chaotic WhatsApp group in Week 3.
3. Fast forward to exam week: you scroll up for 20 minutes, tap download, and hit the dreaded *File no longer exists on local storage* error.
4. You text five different people asking *"Anyone with BUS 201 notes?"* while hoping someone replies before midnight.

**UnitVault** was built because *kwani me hudoo?* We shouldn't have to hunt down basic past papers like we're solving a crime every single continuous assessment test.

It’s a zero-fluff, highly organized repository where notes and past papers are indexed by **Programme → Year → Unit Code**. You find your unit, preview the PDF directly in your browser, and download it instantly. Everything you save stays on your profile so you never start from scratch again.

---

### Repo Architecture & Anatomy

Built with Next.js (App Router), TypeScript, and Supabase:

```text
unitvault-app/
├── src/
│   ├── app/
│   │   ├── admin/             # Password-protected admin suite (login & dashboard)
│   │   ├── api/admin/         # API routes for units, resources, and auth
│   │   ├── auth/              # Student authentication & callback handling
│   │   ├── dashboard/         # Student portal for saved resources
│   │   ├── vault/[courseCode]/# Dynamic course view (notes & past papers)
│   │   ├── HomeClient.tsx     # Department-to-Year grouped directory
│   │   ├── layout.tsx         # Root app layout & global providers
│   │   └── page.tsx           # Homepage entry route
│   ├── components/
│   │   ├── layout/            # Navigation bar & header elements
│   │   └── vault/             # Course Cards, Resource Cards & Search Filter
│   └── lib/
│       ├── supabase/          # Client, Server, and Database TypeScript types
│       ├── adminAuth.ts       # Admin session security helper
│       └── utils.ts           # Shared UI helpers
├── supabase/
│   └── schema.sql             # Database tables, policies, and storage setup
└── public/                    # Static brand assets and icons

### Back the Build ⭐️

If you like the architecture , tap the **Star** button at the top right. 

Got ideas for OCR search, upvoting notes, or auto-generating revision decks? PRs and issues are welcome let's keep building.

*UnitVault · Kwani me hudoo.*
