-- ============================================================
-- UNITVAULT DATABASE
-- ============================================================
-- Structure:
--
-- universities
--      ↓
--    units
--      ↓
--   resources
--      ↓
-- saved_resources
--
-- Authentication:
-- auth.users
--      ↓
--   profiles
--      ↓
-- role: student | admin
--
-- Storage:
-- unit-vault-materials
--
-- IMPORTANT:
-- This schema is intended for a fresh Supabase project.
-- ============================================================


-- ============================================================
-- 1. EXTENSIONS
-- ============================================================

create extension if not exists pgcrypto;


-- ============================================================
-- 2. UNIVERSITIES
-- ============================================================

create table if not exists public.universities (
    id uuid default gen_random_uuid() primary key,

    name text not null,

    short_name text not null,

    created_at timestamptz not null default now(),

    constraint universities_name_unique unique (name),
    constraint universities_short_name_unique unique (short_name)
);


-- ============================================================
-- 3. UNITS
-- ============================================================
-- Example:
--
-- SMA 3104
-- Calculus II
-- Year 2
-- Semester 1
-- ============================================================

create table if not exists public.units (
    id uuid default gen_random_uuid() primary key,

    university_id uuid not null
        references public.universities(id)
        on delete cascade,

    code text not null,

    name text not null,

    year integer
        check (year between 1 and 6),

    semester integer
        check (semester between 1 and 3),

    department text,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint units_university_code_unique
        unique (university_id, code)
);


-- ============================================================
-- 4. PROFILES
-- ============================================================
-- Extends Supabase auth.users.
--
-- Roles:
-- student
-- admin
-- ============================================================

create table if not exists public.profiles (
    id uuid primary key
        references auth.users(id)
        on delete cascade,

    display_name text,

    role text not null default 'student'
        check (role in ('student', 'admin')),

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);


-- ============================================================
-- 5. RESOURCES
-- ============================================================
-- Notes, past papers, etc.
-- ============================================================

create table if not exists public.resources (
    id uuid default gen_random_uuid() primary key,

    unit_id uuid not null
        references public.units(id)
        on delete cascade,

    title text not null,

    description text,

    file_url text not null,

    file_path text not null,

    resource_type text not null
        check (
            resource_type in (
                'Notes',
                'Past Paper'
            )
        ),

    year integer
        check (year between 1900 and 2100),

    semester integer
        check (semester between 1 and 3),

    uploaded_by uuid
        references public.profiles(id)
        on delete set null,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);


-- ============================================================
-- 6. SAVED RESOURCES
-- ============================================================

create table if not exists public.saved_resources (
    id uuid default gen_random_uuid() primary key,

    user_id uuid not null
        references auth.users(id)
        on delete cascade,

    resource_id uuid not null
        references public.resources(id)
        on delete cascade,

    saved_at timestamptz not null default now(),

    constraint saved_resources_unique
        unique (user_id, resource_id)
);


-- ============================================================
-- 7. INDEXES
-- ============================================================

create index if not exists idx_units_university
    on public.units(university_id);

create index if not exists idx_units_code
    on public.units(code);

create index if not exists idx_units_name
    on public.units(name);

create index if not exists idx_resources_unit
    on public.resources(unit_id);

create index if not exists idx_resources_type
    on public.resources(resource_type);

create index if not exists idx_resources_year
    on public.resources(year);

create index if not exists idx_resources_created_at
    on public.resources(created_at desc);

create index if not exists idx_saved_resources_user
    on public.saved_resources(user_id);

create index if not exists idx_saved_resources_resource
    on public.saved_resources(resource_id);


-- ============================================================
-- 8. UPDATED_AT FUNCTION
-- ============================================================

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;


-- ============================================================
-- 9. UPDATED_AT TRIGGERS
-- ============================================================

drop trigger if exists units_updated_at
on public.units;

create trigger units_updated_at
before update on public.units
for each row
execute function public.update_updated_at();


drop trigger if exists profiles_updated_at
on public.profiles;

create trigger profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at();


drop trigger if exists resources_updated_at
on public.resources;

create trigger resources_updated_at
before update on public.resources
for each row
execute function public.update_updated_at();


-- ============================================================
-- 10. AUTOMATIC PROFILE CREATION
-- ============================================================
-- Whenever someone creates an account in Supabase Auth,
-- automatically create a student profile.
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin

    insert into public.profiles (
        id,
        display_name,
        role
    )
    values (
        new.id,
        coalesce(
            new.raw_user_meta_data ->> 'full_name',
            new.raw_user_meta_data ->> 'name',
            new.email
        ),
        'student'
    );

    return new;

end;
$$;


drop trigger if exists on_auth_user_created
on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();


-- ============================================================
-- 11. ADMIN CHECK FUNCTION
-- ============================================================
-- SECURITY DEFINER prevents RLS recursion when checking
-- whether the current user is an admin.
-- ============================================================

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles
        where id = auth.uid()
        and role = 'admin'
    );
$$;


-- Prevent normal users from executing this function directly
revoke all on function public.is_admin()
from public;

grant execute on function public.is_admin()
to authenticated;


-- ============================================================
-- 12. ENABLE ROW LEVEL SECURITY
-- ============================================================

alter table public.universities
enable row level security;

alter table public.units
enable row level security;

alter table public.profiles
enable row level security;

alter table public.resources
enable row level security;

alter table public.saved_resources
enable row level security;


-- ============================================================
-- 13. UNIVERSITIES POLICIES
-- ============================================================

drop policy if exists "Anyone can view universities"
on public.universities;

create policy "Anyone can view universities"
on public.universities
for select
using (true);


drop policy if exists "Admins can create universities"
on public.universities;

create policy "Admins can create universities"
on public.universities
for insert
to authenticated
with check (public.is_admin());


drop policy if exists "Admins can update universities"
on public.universities;

create policy "Admins can update universities"
on public.universities
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


drop policy if exists "Admins can delete universities"
on public.universities;

create policy "Admins can delete universities"
on public.universities
for delete
to authenticated
using (public.is_admin());


-- ============================================================
-- 14. UNITS POLICIES
-- ============================================================

drop policy if exists "Anyone can view units"
on public.units;

create policy "Anyone can view units"
on public.units
for select
using (true);


drop policy if exists "Admins can create units"
on public.units;

create policy "Admins can create units"
on public.units
for insert
to authenticated
with check (public.is_admin());


drop policy if exists "Admins can update units"
on public.units;

create policy "Admins can update units"
on public.units
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


drop policy if exists "Admins can delete units"
on public.units;

create policy "Admins can delete units"
on public.units
for delete
to authenticated
using (public.is_admin());


-- ============================================================
-- 15. PROFILES POLICIES
-- ============================================================
-- Users can read their own profile.
-- Users cannot change their own role.
--
-- Admin role changes should be done through a trusted
-- admin workflow / SQL editor, not from the public client.
-- ============================================================

drop policy if exists "Users can view their own profile"
on public.profiles;

create policy "Users can view their own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);


drop policy if exists "Users can update their own profile"
on public.profiles;

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (
    auth.uid() = id
    and role = (
        select role
        from public.profiles
        where id = auth.uid()
    )
);


-- ============================================================
-- 16. RESOURCES POLICIES
-- ============================================================

drop policy if exists "Anyone can view resources"
on public.resources;

create policy "Anyone can view resources"
on public.resources
for select
using (true);


drop policy if exists "Admins can create resources"
on public.resources;

create policy "Admins can create resources"
on public.resources
for insert
to authenticated
with check (
    public.is_admin()
);


drop policy if exists "Admins can update resources"
on public.resources;

create policy "Admins can update resources"
on public.resources
for update
to authenticated
using (public.is_admin())
with check (public.is_admin());


drop policy if exists "Admins can delete resources"
on public.resources;

create policy "Admins can delete resources"
on public.resources
for delete
to authenticated
using (public.is_admin());


-- ============================================================
-- 17. SAVED RESOURCES POLICIES
-- ============================================================

drop policy if exists "Users can view their saved resources"
on public.saved_resources;

create policy "Users can view their saved resources"
on public.saved_resources
for select
to authenticated
using (
    auth.uid() = user_id
);


drop policy if exists "Users can save resources"
on public.saved_resources;

create policy "Users can save resources"
on public.saved_resources
for insert
to authenticated
with check (
    auth.uid() = user_id
);


drop policy if exists "Users can remove saved resources"
on public.saved_resources;

create policy "Users can remove saved resources"
on public.saved_resources
for delete
to authenticated
using (
    auth.uid() = user_id
);


-- ============================================================
-- 18. STORAGE BUCKET
-- ============================================================
-- Public bucket because UnitVault resources are intended
-- to be downloadable by students.
-- ============================================================

insert into storage.buckets (
    id,
    name,
    public
)
values (
    'unit-vault-materials',
    'unit-vault-materials',
    true
)
on conflict (id)
do update set public = true;


-- ============================================================
-- 19. STORAGE POLICIES
-- ============================================================

-- Public users can read UnitVault files.

drop policy if exists "Anyone can read UnitVault materials"
on storage.objects;

create policy "Anyone can read UnitVault materials"
on storage.objects
for select
using (
    bucket_id = 'unit-vault-materials'
);


-- Admins can upload files.

drop policy if exists "Admins can upload UnitVault materials"
on storage.objects;

create policy "Admins can upload UnitVault materials"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'unit-vault-materials'
    and public.is_admin()
);


-- Admins can update files.

drop policy if exists "Admins can update UnitVault materials"
on storage.objects;

create policy "Admins can update UnitVault materials"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'unit-vault-materials'
    and public.is_admin()
)
with check (
    bucket_id = 'unit-vault-materials'
    and public.is_admin()
);


-- Admins can delete files.

drop policy if exists "Admins can delete UnitVault materials"
on storage.objects;

create policy "Admins can delete UnitVault materials"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'unit-vault-materials'
    and public.is_admin()
);


-- ============================================================
-- 20. OPTIONAL SEARCH FUNCTION
-- ============================================================
-- Useful later for UnitVault's search bar.
-- Searches unit code, unit name and resource title.
-- ============================================================

create or replace function public.search_resources(search_term text)
returns table (
    resource_id uuid,
    resource_title text,
    resource_type text,
    resource_year integer,
    unit_id uuid,
    unit_code text,
    unit_name text,
    university_name text
)
language sql
stable
as $$
    select
        r.id,
        r.title,
        r.resource_type,
        r.year,
        u.id,
        u.code,
        u.name,
        un.name
    from public.resources r
    join public.units u
        on r.unit_id = u.id
    join public.universities un
        on u.university_id = un.id
    where
        r.title ilike '%' || search_term || '%'
        or u.code ilike '%' || search_term || '%'
        or u.name ilike '%' || search_term || '%'
        or un.name ilike '%' || search_term || '%'
    order by r.created_at desc;
$$;
