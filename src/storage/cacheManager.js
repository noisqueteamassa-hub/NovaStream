// Política central do cache: conteúdo temporário de streaming deve ter
// limite configurável e ser removível sem apagar favoritos ou playlists.
export const DEFAULT_CACHE_LIMIT_MB = 512;

export function shouldEvictCache({ currentBytes, incomingBytes, limitBytes }) {
  return currentBytes + incomingBytes > limitBytes;
}

export function getCachePolicy(limitMB = DEFAULT_CACHE_LIMIT_MB) {
  return {
    limitBytes: Math.max(64, Number(limitMB) || DEFAULT_CACHE_LIMIT_MB) * 1024 * 1024,
    removeOnLowStorage: true,
    neverDeleteLibraryMetadata: true,
  };
}
