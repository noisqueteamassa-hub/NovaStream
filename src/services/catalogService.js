const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const CUSTOM_API_URL = process.env.EXPO_PUBLIC_CATALOG_API_URL;

const API_URL = CUSTOM_API_URL ||
  (SUPABASE_URL ? `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/catalog-search` : '');

function normalizeTrack(item, source = 'NovaStream') {
  if (!item || !item.id || !item.title) return null;
  return {
    id: String(item.id),
    title: String(item.title),
    artist: String(item.artist || 'Artista desconhecido'),
    album: String(item.album || ''),
    artworkUrl: item.artworkUrl || item.artwork_url || null,
    streamUrl: item.streamUrl || item.stream_url || null,
    downloadUrl: item.downloadUrl || item.download_url || null,
    duration: Number(item.duration ?? item.duration_seconds ?? 0),
    source: item.source || source,
    downloadable: item.downloadable === true,
    license: item.license || item.license_label || null,
  };
}

export async function searchCatalog(query, { signal } = {}) {
  const term = query.trim();
  if (!term || !API_URL || !SUPABASE_KEY) return [];

  const response = await fetch(`${API_URL.replace(/\/$/, '')}?q=${encodeURIComponent(term)}`, {
    signal,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Accept: 'application/json',
    },
  });
  if (!response.ok) throw new Error(`Falha na busca do catálogo (${response.status}).`);
  const payload = await response.json();
  const items = Array.isArray(payload) ? payload : payload.results || [];
  return items.map((item) => normalizeTrack(item)).filter(Boolean);
}

export function isCatalogConfigured() {
  return Boolean(API_URL && SUPABASE_KEY);
}
