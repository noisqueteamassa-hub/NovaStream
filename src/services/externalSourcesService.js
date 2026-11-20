import { searchCatalog } from './catalogService';
import { openverseProvider } from './openverseProvider';

// Fontes externas só entram aqui quando oferecem API oficial e autorizam
// descoberta de conteúdo com licença aberta. Não extraímos áudio de plataformas.
const providers = [openverseProvider];

export function registerAuthorizedProvider(provider) {
  if (!provider || typeof provider.search !== 'function' || !provider.id) {
    throw new Error('Provedor inválido.');
  }
  if (providers.some((item) => item.id === provider.id)) return;
  providers.push(provider);
}

export async function searchAllSources(query, options = {}) {
  const tasks = [searchCatalog(query, options)];
  providers.forEach((provider) => {
    tasks.push(Promise.resolve(provider.search(query, options)));
  });
  const results = await Promise.allSettled(tasks);
  return results.flatMap((result) => result.status === 'fulfilled' && Array.isArray(result.value) ? result.value : []);
}

export function getAuthorizedProviders() {
  return providers.map(({ id, name }) => ({ id, name }));
}
