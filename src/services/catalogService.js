const API_BASE = process.env.EXPO_PUBLIC_CATALOG_API_URL;

function normalizeTrack(item, source = 'catalog') {
  if (!item || !item.id || !item.title) return null;
  return {
    id: String(item.id),
    title: String(item.title),
    artist: String(item.artist || 'Artista desconhecido'),
    album: String(item.album || ''),
    artworkUrl: item.artworkUrl || item.cover_url || null,
    streamUrl: item.streamUrl || item.stream_url || null,
    downloadUrl: item.downloadUrl || item.download_url || null,
    duration: Number(item.duration || 0),
    source: item.source || source,
    downloadable: item.downloadable === true,
    license: item.license || null,
  };
}

export async function searchCatalog(query, { signal } = {}) {
  const term = query.trim();
  if (!term) return [];
  if (!API_BASE) {
    return [];
  }
  const response = await fetch(`${API_BASE.replace(/\/$/, '')}/search?q=${encodeURIComponent(term)}`, { signal });
  if (!response.ok) throw new Error(`Falha na busca do catálogo (${response.status}).`);
  const payload = await response.json();
  const items = Array.isArray(payload) ? payload : payload.results || [];
  return items.map((item) => normalizeTrack(item)).filter(Boolean);
}

export function isCatalogConfigured() {
  return Boolean(API_BASE);
}
