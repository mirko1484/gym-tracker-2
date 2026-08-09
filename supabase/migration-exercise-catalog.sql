-- =======================================
-- CATALOGO ESERCIZI (importato da WorkoutX)
-- Da eseguire in Supabase: SQL Editor > New query
-- =======================================


create table public.exercise_catalog (

    id text primary key,

    name text not null,

    body_part text,

    target_muscle text,

    equipment text,

    gif_url text,

    instructions jsonb,

    imported_at timestamptz not null default now()

);


-- =======================================
-- SICUREZZA
-- Chiunque loggato può leggere il catalogo.
-- Solo l'importazione (via Edge Function, chiave service_role)
-- può scriverci — nessun utente lo modifica direttamente.
-- =======================================

alter table public.exercise_catalog enable row level security;

create policy "chiunque_loggato_legge_il_catalogo"
on public.exercise_catalog for select
using (auth.role() = 'authenticated');
