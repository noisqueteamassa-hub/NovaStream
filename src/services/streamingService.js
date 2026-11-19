import { isCatalogConfigured } from './catalogService';

export const DEFAULT_AUDIO_QUALITY = 'high';
export const AUDIO_QUALITIES = ['standard', 'high', 'very_high', 'adaptive'];

export function getStreamSource(track) {
  if (!track?.streamUrl) throw new Error('Esta faixa não possui uma URL de reprodução autorizada.');
  const url = new URL(track.streamUrl);
  if (url.protocol !== 'https:') throw new Error('A reprodução exige uma conexão HTTPS.');
  return { uri: url.toString() };
}

export function getPlaybackPolicy() {
  return {
    defaultQuality: DEFAULT_AUDIO_QUALITY,
    adaptiveFallback: true,
    cachePolicy: 'bounded-temporary-cache',
    backgroundPlayback: true,
  };
}

export function isStreamingBackendReady() {
  return isCatalogConfigured();
}
