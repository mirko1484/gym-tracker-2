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
  'Content-Type': 'application/json',
}

const WORKOUTX_BASE_URL = 'https://api.workoutxapp.com/v1/exercises'
const PAGE_SIZE = 10 // il piano gratuito di WorkoutX restituisce sempre 10 elementi per richiesta, qualunque "limit" si chieda

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

    // --- 2. Scarica il catalogo completo, in blocco ---
    // (esiste un endpoint unico /v1/exercises con paginazione,
    // molto più efficiente dello scorrimento per categoria)

    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Riparti da dove eravamo arrivati: contiamo quanti esercizi
    // abbiamo già salvato, e usiamo quel numero come punto di partenza
    // invece di ricominciare sempre da zero

    const { count: alreadyImportedCount } = await adminClient
      .from('exercise_catalog')
      .select('*', { count: 'exact', head: true })

    let allExercises: any[] = []
    let offset = alreadyImportedCount ?? 0
    const resumedFromOffset = offset
    let total: number | null = null
    let lastQuotaRemaining: string | null = null
    const attempts: any[] = []
    const pageLog: any[] = []
    let firstRawSample: any = null

    const sleep = (ms: number) =>
      new Promise(resolve => setTimeout(resolve, ms))

    const startTime = Date.now()
    const MAX_RUNTIME_MS = 100000 // 100 secondi, con margine di sicurezza
    let stoppedForTimeBudget = false

    while (total === null || offset < total) {

      if (Date.now() - startTime > MAX_RUNTIME_MS) {

        stoppedForTimeBudget = true
        break

      }

      // Il piano gratuito di WorkoutX permette 30 richieste al minuto:
      // aspettiamo tra una richiesta e l'altra per restare sotto quel limite
      // (saltiamo la pausa solo sulla primissima richiesta)

      if (offset > 0) {
        await sleep(2200)
      }

      const url =
        `${WORKOUTX_BASE_URL}?limit=${PAGE_SIZE}&offset=${offset}`

      const response = await fetch(
        url,
        { headers: { 'X-WorkoutX-Key': workoutxKey } }
      )

      lastQuotaRemaining =
        response.headers.get('X-Quota-Remaining')

      const rawText = await response.text()

      if (!response.ok) {

        attempts.push({
          url, status: response.status, body: rawText.slice(0, 300)
        })

        break

      }

      let page: any

      try {
        page = JSON.parse(rawText)
      }
      catch {
        attempts.push({
          url, status: response.status, note: 'risposta non JSON', body: rawText.slice(0, 300)
        })
        break
      }

      const items = page.data || page.results || page.exercises || []

      if (firstRawSample === null) {

        // Prima pagina valida: teniamo una copia grezza
        // (senza gli esercizi, solo la "busta") per capire
        // esattamente come è fatta la risposta

        firstRawSample = { ...page }
        delete firstRawSample.data
        delete firstRawSample.results
        delete firstRawSample.exercises
        firstRawSample.items_in_this_page = items.length
        firstRawSample.first_item_id = items[0]?.id ?? null

      }

      const previousTotal = total

      total = page.total ?? page.count ?? items.length

      pageLog.push({
        offset,
        items_received: items.length,
        total_reported_by_api: total,
        total_changed_from_previous_page: previousTotal !== null && previousTotal !== total
      })

      allExercises = allExercises.concat(items)

      offset += items.length

      if (items.length === 0) {
        break
      }

    }

    // --- 3. Mappa e salva nel nostro database (service_role, bypassa RLS) ---

    const rows = allExercises.map((ex: any) => ({

      id: String(ex.id ?? ex.exerciseId ?? ex.name),

      name: ex.name ?? ex.exerciseName ?? 'Esercizio',

      body_part: ex.bodyPart ?? ex.body_part ?? null,

      target_muscle: ex.target ?? ex.targetMuscle ?? ex.target_muscle ?? null,

      equipment: ex.equipment ?? null,

      gif_url: ex.gifUrl ?? ex.gif_url ?? ex.gif ?? null,

      instructions: ex.instructions ?? null

    }))

    if (rows.length === 0) {

      return new Response(
        JSON.stringify({
          error: 'Nessun esercizio ricevuto da WorkoutX',
          quota_remaining: lastQuotaRemaining,
          attempts,
          page_log: pageLog,
          first_page_envelope: firstRawSample
        }),
        { status: 200, headers: corsHeaders }
      )

    }

    const { error: insertError } = await adminClient
      .from('exercise_catalog')
      .upsert(rows, { onConflict: 'id' })

    if (insertError) {
      return new Response(
        JSON.stringify({
          error: insertError.message,
          fetched: rows.length,
          quota_remaining: lastQuotaRemaining,
          page_log: pageLog
        }),
        { status: 500, headers: corsHeaders }
      )
    }

    const { count: totalNowInDb } = await adminClient
      .from('exercise_catalog')
      .select('*', { count: 'exact', head: true })

    return new Response(
      JSON.stringify({
        success: true,
        imported: rows.length,
        resumed_from_offset: resumedFromOffset,
        total_now_in_database: totalNowInDb,
        total_available: total,
        quota_remaining: lastQuotaRemaining,
        stopped_for_time_budget: stoppedForTimeBudget,
        stopped_for_api_error: attempts.length > 0 ? attempts : null
      }),
      { status: 200, headers: corsHeaders }
    )

  } catch (err) {

    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    )

  }

})
