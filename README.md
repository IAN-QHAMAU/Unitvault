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
│   │   ├── admin/              
│   │   ├── api/admin/ 
│   │   ├── auth/               
│   │   ├── dashboard/          
│   │   ├── vault/[courseCode]/
│   │   ├── HomeClient.tsx    
│   │   ├── layout.tsx          
│   │   └── page.tsx     
│   ├── components/
│   │   ├── layout/            
│   │   └── vault/              
│   └── lib/
│       ├── supabase/           
│       ├── adminAuth.ts  
│       └── utils.ts 
├── supabase/
│   └── schema.sql             
└── public/           
```
 
---
 
## Back the Build ⭐️
---
 
*UnitVault · Kwani me hudoo.*
