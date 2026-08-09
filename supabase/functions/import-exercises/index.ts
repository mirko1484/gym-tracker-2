// =======================================
// EDGE FUNCTION: import-exercises
// Importa l'intero catalogo esercizi di WorkoutX
// nella tabella exercise_catalog, una volta sola
// (o quando la si vuole aggiornare manualmente).
//
// La chiave WORKOUTX_API_KEY va salvata come "secret"
// della funzione su Supabase — mai nel codice del sito.
// =======================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const WORKOUTX_BASE_URL = 'https://api.workoutxapp.com/v1/exercises'
const PAGE_SIZE = 50

Deno.serve(async (req) => {

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {

    // --- 1. Verifica che chi chiama sia un admin approvato ---

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
        JSON.stringify({ error: 'Solo un amministratore può avviare l\'importazione' }),
        { status: 403, headers: corsHeaders }
      )
    }

    const workoutxKey = Deno.env.get('WORKOUTX_API_KEY')

    if (!workoutxKey) {
      return new Response(
        JSON.stringify({ error: 'Chiave WORKOUTX_API_KEY non configurata su Supabase' }),
        { status: 500, headers: corsHeaders }
      )
    }

    // --- 2. Scarica tutte le pagine dal catalogo WorkoutX ---

    let offset = 0
    let total = null
    let allExercises: any[] = []

    while (total === null || offset < total) {

      const response = await fetch(
        `${WORKOUTX_BASE_URL}?limit=${PAGE_SIZE}&offset=${offset}`,
        { headers: { 'X-WorkoutX-Key': workoutxKey } }
      )

      if (!response.ok) {

        const errorBody = await response.text()

        return new Response(
          JSON.stringify({
            error: `Errore da WorkoutX (${response.status}): ${errorBody}`,
            imported_so_far: allExercises.length
          }),
          { status: 502, headers: corsHeaders }
        )

      }

      const page = await response.json()

      const items = page.data || page.results || []

      total = page.total ?? items.length

      allExercises = allExercises.concat(items)

      offset += PAGE_SIZE

      if (items.length === 0) {
        break
      }

    }

    // --- 3. Mappa e salva nel nostro database (service_role, bypassa RLS) ---

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const rows = allExercises.map((ex: any) => ({

      id: String(ex.id ?? ex.exerciseId ?? ex.name),

      name: ex.name ?? ex.exerciseName ?? 'Esercizio',

      body_part: ex.bodyPart ?? ex.body_part ?? null,

      target_muscle: ex.target ?? ex.targetMuscle ?? ex.target_muscle ?? null,

      equipment: ex.equipment ?? null,

      gif_url: ex.gifUrl ?? ex.gif_url ?? ex.gif ?? null,

      instructions: ex.instructions ?? null

    }))

    const { error: insertError } = await adminClient
      .from('exercise_catalog')
      .upsert(rows, { onConflict: 'id' })

    if (insertError) {
      return new Response(
        JSON.stringify({ error: insertError.message, fetched: rows.length }),
        { status: 500, headers: corsHeaders }
      )
    }

    return new Response(
      JSON.stringify({ success: true, imported: rows.length }),
      { status: 200, headers: corsHeaders }
    )

  } catch (err) {

    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    )

  }

})
