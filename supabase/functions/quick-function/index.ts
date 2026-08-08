// =======================================
// EDGE FUNCTION: invite-user
// Permette a un amministratore di creare un account
// (trainer o cliente) e invitarlo via email.
//
// Questo codice gira SUL SERVER di Supabase, mai nel browser:
// solo qui è al sicuro usare la chiave service_role.
// =======================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {

    const { email, full_name, role } = await req.json()

    if (
      !email ||
      !full_name ||
      !role ||
      !['trainer', 'customer'].includes(role)
    ) {
      return new Response(
        JSON.stringify({ error: 'Dati mancanti o ruolo non valido' }),
        { status: 400, headers: corsHeaders }
      )
    }

    // --- 1. Verifica che chi chiama sia davvero un admin approvato ---
    // Usa la chiave "anon" + il token dell'utente che ha fatto la richiesta,
    // così le regole di sicurezza (RLS) del database si applicano normalmente.

    const authHeader = req.headers.get('Authorization')

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader ?? '' } } }
    )

    const { data: { user } } = await userClient.auth.getUser()

    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Non autenticato' }),
        { status: 401, headers: corsHeaders }
      )
    }

    const { data: callerProfile } = await userClient
      .from('profiles')
      .select('role, is_approved')
      .eq('id', user.id)
      .single()

    if (
      !callerProfile ||
      callerProfile.role !== 'admin' ||
      !callerProfile.is_approved
    ) {
      return new Response(
        JSON.stringify({ error: 'Solo un amministratore può invitare utenti' }),
        { status: 403, headers: corsHeaders }
      )
    }

    // --- 2. Solo ORA, dopo aver verificato che è un admin, si usa
    // la chiave con pieni poteri per creare l'account ---

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: invited, error: inviteError } =
      await adminClient.auth.admin.inviteUserByEmail(email, {
        redirectTo: 'https://mirko1484.github.io/gym-tracker-2/set-password.html'
      })

    if (inviteError) {
      return new Response(
        JSON.stringify({ error: inviteError.message }),
        { status: 400, headers: corsHeaders }
      )
    }

    // --- 3. Crea subito il profilo (già approvato, l'admin lo ha
    // creato lui stesso) ---

    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        id: invited.user.id,
        role: role,
        full_name: full_name,
        email: email,
        is_approved: true
      })

    if (profileError) {
      return new Response(
        JSON.stringify({ error: profileError.message }),
        { status: 400, headers: corsHeaders }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: corsHeaders }
    )

  } catch (err) {

    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    )

  }

})
