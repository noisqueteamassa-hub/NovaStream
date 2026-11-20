// Openverse agrega resultados de áudio com licenças abertas.
 // A busca não limita gêneros: consulta por texto em títulos, artistas e tags.
 // Só aceitamos licenças CC0, domínio público, CC BY e CC BY-SA.
 // A licença de cada faixa deve ser conferida na página de origem antes do uso.
const API_URL = 'https://api.openverse.org/v1/audio/';
const ALLOWED_LICENSES = new Set(['cc0', 'pdm', 'by', 'by-sa']);

function safeHttps(value) {
  if (typeof value !== 'string') return null;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' ? value : null;
  } catch {
    return null;
  }
}

export const openverseProvider = {
  id: 'openverse',
  name: 'Openverse (áudio com licenças abertas)',
  async search(query, { signal } = {}) {
    const term = String(query || '').trim();
    if (!term) return [];

    const params = new URLSearchParams({
      q: term,
      page: '1',
      page_size: '20',
      license: 'cc0,pdm,by,by-sa',
      filter_dead: 'true',
      mature: 'false',
    });

    const response = await fetch(`${API_URL}?${params.toString()}`, {
      signal,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) {
      throw new Error(`Openverse indisponível (${response.status}).`);
    }

    const payload = await response.json();
    const items = Array.isArray(payload?.results) ? payload.results : [];

    return items.flatMap((item) => {
      const streamUrl = safeHttps(item.url);
      const sourceUrl = safeHttps(item.foreign_landing_url);
      const license = String(item.license || '').toLowerCase();
      if (!item.id || !item.title || !streamUrl || !sourceUrl || !ALLOWED_LICENSES.has(license)) {
        return [];
      }

      return [{
        id: `openverse:${item.id}`,
        title: String(item.title),
        artist: String(item.creator || 'Artista não informado'),
        album: item.audio_set?.title || '',
        artworkUrl: safeHttps(item.thumbnail),
        streamUrl,
        downloadUrl: null,
        duration: Math.max(0, Math.round(Number(item.duration || 0) / 1000)),
        source: 'Openverse',
        sourceUrl,
        downloadable: false,
        license: `CC ${license.toUpperCase()} ${item.license_version || ''}`.trim(),
        licenseUrl: safeHttps(item.license_url),
        attribution: item.attribution || '',
        genres: Array.isArray(item.genres) ? item.genres : [],
      }];
    });
  },
};
