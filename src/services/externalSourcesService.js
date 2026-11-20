import { searchCatalog } from './catalogService';
import { openverseProvider } from './openverseProvider';
import { jamendoProvider } from './jamendoProvider';

// Só registramos fontes com API oficial de busca e regras de uso identificáveis.
const providers = [jamendoProvider, openverseProvider];

export async function searchAllSources(query, options = {}) {
  const tasks = [
    searchCatalog(query, options),
    ...providers.map((provider) => Promise.resolve().then(() => provider.search(query, options))),
  ];
  const settled = await Promise.allSettled(tasks);
  const combined = settled.flatMap((result) =>
    result.status === 'fulfilled' && Array.isArray(result.value) ? result.value : []
  );

  // Evita duplicatas quando a mesma faixa aparece em mais de uma fonte.
  const seen = new Set();
  return combined.filter((track) => {
    const key = `${String(track.title || '').trim().toLowerCase()}::${String(track.artist || '').trim().toLowerCase()}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function getAuthorizedProviders() {
  return providers
    .filter((provider) => typeof provider.isConfigured !== 'function' || provider.isConfigured())
    .map(({ id, name }) => ({ id, name }));
}
