import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'novastream:favorites:v1';

export async function getFavorites() {
  return JSON.parse((await AsyncStorage.getItem(KEY)) || '[]');
}

export async function toggleFavorite(track) {
  const current = await getFavorites();
  const exists = current.some((item) => item.id === track.id);
  const next = exists ? current.filter((item) => item.id !== track.id) : [...current, track];
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}
