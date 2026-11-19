import { assertNativeCryptoAvailable } from '../services/encryptionService';

let cryptoAdapter = null;

export function setDownloadCryptoAdapter(adapter) {
  cryptoAdapter = adapter;
}

export async function saveOfflineTrack(track, destination) {
  if (!track?.downloadable || !track?.license) {
    throw new Error('Esta música não possui autorização de download offline.');
  }
  if (!track?.downloadUrl) {
    throw new Error('A fonte não forneceu uma URL oficial para download.');
  }
  const adapter = assertNativeCryptoAvailable(cryptoAdapter);
  return adapter.encryptFile({
    url: track.downloadUrl,
    destination,
    trackId: String(track.id),
    format: 'novastream-aes-gcm-chunked-v1',
  });
}

export async function playOfflineTrack(trackId) {
  const adapter = assertNativeCryptoAvailable(cryptoAdapter);
  return adapter.decryptToCache({ trackId: String(trackId) });
}
