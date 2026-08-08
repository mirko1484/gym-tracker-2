-- =======================================
-- GYM TRACKER — SCHEMA 3 LIVELLI
-- Admin > Trainer > Cliente
-- Da eseguire in Supabase: SQL Editor > New query
-- =======================================


-- =======================================
-- 1. PROFILI (estende auth.users di Supabase)
-- =======================================

create table public.profiles (

    id uuid primary key references auth.users(id) on delete cascade,

    role text not null check (role in ('admin', 'trainer', 'customer')),

    full_name text not null,

    -- Per admin e trainer: approvato da un amministratore
    -- prima di poter accedere ai dati della palestra.
    -- I clienti non necessitano di approvazione.
    is_approved boolean not null default false,

    created_at timestamptz not null default now()

);


-- =======================================
-- 2. SCHEDE (una riga per giornata per cliente)
-- =======================================

create table public.schedules (

    id uuid primary key default gen_random_uuid(),

    customer_id uuid not null references public.profiles(id) on delete cascade,

    day_letter text not null,

    exercises jsonb not null default '[]',

    updated_at timestamptz not null default now(),

    updated_by uuid references public.profiles(id),

    unique (customer_id, day_letter)

);


-- =======================================
-- 3. IMPOSTAZIONI CLIENTE
-- =======================================

create table public.customer_settings (

    customer_id uuid primary key references public.profiles(id) on delete cascade,

    weight numeric,

    height numeric,

    goal text,

    day_count int not null default 3,

    updated_at timestamptz not null default now()

);


-- =======================================
-- 4. STORICO ALLENAMENTI
-- =======================================

create table public.history (

    id uuid primary key default gen_random_uuid(),

    customer_id uuid not null references public.profiles(id) on delete cascade,

    day_letter text not null,

    workout_date date not null default current_date,

    duration_seconds int,

    exercises jsonb not null default '[]',

    created_at timestamptz not null default now()

);


-- =======================================
-- FUNZIONI DI SUPPORTO
-- (evitano di ripetere le stesse sotto-query in ogni policy)
-- =======================================

-- L'utente corrente è un amministratore approvato?
create function public.is_admin()
returns boolean
language sql
security definer
stable
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid()
        and role = 'admin'
        and is_approved = true
    );
$$;


-- L'utente corrente è un membro dello staff approvato
-- (trainer O amministratore) — entrambi lavorano sui clienti
create function public.is_staff()
returns boolean
language sql
security definer
stable
as $$
    select exists (
        select 1 from public.profiles
        where id = auth.uid()
        and role in ('trainer', 'admin')
        and is_approved = true
    );
$$;


-- =======================================
-- 5. SICUREZZA A LIVELLO DI RIGA (RLS)
-- =======================================

alter table public.profiles enable row level security;
alter table public.schedules enable row level security;
alter table public.customer_settings enable row level security;
alter table public.history enable row level security;


-- --- PROFILES ---

-- Chiunque autenticato legge il proprio profilo
create policy "profilo_proprio_lettura"
on public.profiles for select
using (auth.uid() = id);

-- Staff (trainer + admin) vede i profili di tutti i clienti
create policy "staff_legge_i_clienti"
on public.profiles for select
using (
    role = 'customer'
    and public.is_staff()
);

-- Ognuno crea solo il proprio profilo, in fase di registrazione
create policy "profilo_proprio_creazione"
on public.profiles for insert
with check (auth.uid() = id);

-- Ognuno aggiorna il proprio profilo (es. cambio nome)
create policy "profilo_proprio_modifica"
on public.profiles for update
using (auth.uid() = id);

-- Solo gli amministratori gestiscono TUTTI i profili:
-- approvare/revocare trainer e altri admin, vedere l'elenco completo
create policy "admin_gestisce_tutti_i_profili"
on public.profiles for all
using (public.is_admin())
with check (public.is_admin());


-- --- SCHEDULES ---

-- Il cliente vede/modifica le proprie schede
create policy "cliente_gestisce_proprie_schede"
on public.schedules for all
using (customer_id = auth.uid())
with check (customer_id = auth.uid());

-- Lo staff (trainer + admin) vede/modifica le schede di tutti i clienti
create policy "staff_gestisce_tutte_le_schede"
on public.schedules for all
using (public.is_staff())
with check (public.is_staff());


-- --- CUSTOMER_SETTINGS ---

create policy "cliente_gestisce_proprie_impostazioni"
on public.customer_settings for all
using (customer_id = auth.uid())
with check (customer_id = auth.uid());

create policy "staff_legge_tutte_le_impostazioni"
on public.customer_settings for select
using (public.is_staff());


-- --- HISTORY ---

-- Il cliente gestisce il proprio storico
create policy "cliente_gestisce_proprio_storico"
on public.history for all
using (customer_id = auth.uid())
with check (customer_id = auth.uid());

-- Lo staff può SOLO leggere lo storico di tutti i clienti
-- (non modificarlo — quello resta al cliente)
create policy "staff_legge_tutto_lo_storico"
on public.history for select
using (public.is_staff());
