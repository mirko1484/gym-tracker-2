// =======================================
// CONFIGURAZIONE SUPABASE
// =======================================
//
// Project URL e anon key: non sono dati segreti,
// sono fatti apposta per stare nel codice pubblico del sito.
// La sicurezza vera è garantita dalle regole RLS nel database.


const SUPABASE_URL =
    "https://urtkeoqcmxoizjveffkv.supabase.co";

const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVydGtlb3FjbXhvaXpqdmVmZmt2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMzY1MDYsImV4cCI6MjEwMTcxMjUwNn0.iIT-5d2hknTsFDBMdanhQslUeGthGNpsppSna0KDD84";


const supabaseClient =
    supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    );
