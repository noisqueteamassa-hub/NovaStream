import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json; charset=utf-8' },
  });
}

Deno.serve(async (request: Request) => {
  if (request.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (request.method !== 'GET') return json({ error: 'Método não permitido.' }, 405);

  const term = new URL(request.url).searchParams.get('q')?.trim() || '';
  if (!term) return json({ results: [] });
  if (term.length > 100) return json({ error: 'A pesquisa deve ter até 100 caracteres.' }, 400);

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const publicKey = Deno.env.get('SUPABASE_ANON_KEY') || Deno.env.get('SUPABASE_PUBLISHABLE_KEY');
  if (!supabaseUrl || !publicKey) {
    return json({ error: 'O servidor do catálogo ainda não foi configurado.' }, 503);
  }

  const supabase = createClient(supabaseUrl, publicKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase.rpc('search_catalog', {
    search_query: term,
    result_limit: 30,
  });

  if (error) {
    console.error('catalog-search failed:', error.message);
    return json({ error: 'Não foi possível consultar o catálogo.' }, 500);
  }

  const results = (data || []).map((track: Record<string, unknown>) => ({
    id: track.id,
    title: track.title,
    artist: track.artist,
    album: track.album,
    artworkUrl: track.artwork_url,
    streamUrl: track.stream_url,
    downloadUrl: track.download_url,
    duration: track.duration_seconds,
    source: track.source || 'NovaStream',
    downloadable: track.downloadable === true,
    license: track.license_label,
  }));

  return json({ results });
});
