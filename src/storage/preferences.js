import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'novastream:preferences:v1';
export const DEFAULT_PREFERENCES = {
  quality: 'high',
  cacheLimitMB: 512,
  storageLocation: 'internal',
  autoplay: false,
  crossfadeSeconds: 0,
};

export async function getPreferences() {
  try {
    const saved = JSON.parse((await AsyncStorage.getItem(KEY)) || '{}');
    return { ...DEFAULT_PREFERENCES, ...saved };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export async function savePreferences(changes) {
  const current = await getPreferences();
  const next = { ...current, ...changes };
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
