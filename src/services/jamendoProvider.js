// Jamendo API v3: pesquisa de faixas com streaming oficial.
// O client_id é público, mas deve ser criado no portal de desenvolvedores.
// Não reutilize o client_id de demonstração em produção.
const CLIENT_ID = process.env.EXPO_PUBLIC_JAMENDO_CLIENT_ID;
const API_URL = 'https://api.jamendo.com/v3.0/tracks/';

function httpsUrl(value) {
  if (typeof value !== 'string' || !value) return null;
  try {
    const url = new URL(value);
    if (url.protocol === 'http:' && url.hostname.endsWith('creativecommons.org')) {
      url.protocol = 'https:';
    }
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

function parseQuery(input) {
  const match = String(input || '').trim().match(/^(track|artist|album|genre):\s*(.+)$/i);
  if (!match) return { search: String(input || '').trim() };
  const field = match[1].toLowerCase();
  const value = match[2].trim();
  if (field === 'artist') return { artist_name: value };
  if (field === 'album') return { album_name: value };
  if (field === 'track') return { namesearch: value };
  return { fuzzytags: value };
}

function licenseLabel(url) {
  if (!url) return 'Licença não informada pela API';
  const match = url.match(/licenses\/([^/]+)\/(\d+(?:\.\d+)?)/i);
  return match ? `CC ${match[1].toUpperCase()} ${match[2]}` : url;
}

export const jamendoProvider = {
  id: 'jamendo',
  name: 'Jamendo',
  isConfigured: () => Boolean(CLIENT_ID),
  async search(query, { signal, genre } = {}) {
    if (!CLIENT_ID) return [];
    const term = String(query || '').trim();
    if (!term && !genre) return [];

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      format: 'json',
      limit: '30',
      type: 'single albumtrack',
      audioformat: 'mp32',
      imagesize: '300',
      include: 'licenses,musicinfo',
    });

    if (term) {
      const parsed = parseQuery(term);
      Object.entries(parsed).forEach(([key, value]) => params.set(key, value));
    }
    if (genre && genre !== 'Todos') {
      params.set('fuzzytags', genre.toLowerCase());
    }

    const response = await fetch(`${API_URL}?${params.toString()}`, {
      signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error(`Jamendo indisponível (${response.status}).`);
    const payload = await response.json();
    if (payload?.headers?.status !== 'success') {
      throw new Error(payload?.headers?.error_message || 'A pesquisa Jamendo falhou.');
    }

    return (Array.isArray(payload.results) ? payload.results : []).flatMap((item) => {
      const streamUrl = httpsUrl(item.audio);
      const sourceUrl = httpsUrl(item.shareurl || item.shorturl);
      if (!item.id || !item.name || !streamUrl || !sourceUrl) return [];
      const licenseUrl = httpsUrl(item.license_ccurl);
      const canDownload = item.audiodownload_allowed === true;
      const tags = item.musicinfo?.tags?.genres || [];

      return [{
        id: `jamendo:${item.id}`,
        title: String(item.name).trim(),
        artist: String(item.artist_name || 'Artista não informado'),
        album: String(item.album_name || ''),
        artworkUrl: httpsUrl(item.album_image || item.image),
        streamUrl,
        downloadUrl,
        duration: Math.max(0, Number(item.duration) || 0),
        source: 'Jamendo',
        sourceUrl,
        downloadable: canDownload && Boolean(downloadUrl),
        license: licenseLabel(item.license_ccurl),
        licenseUrl,
        genres: Array.isArray(tags) ? tags : [],
      }];
    });
  },
};
