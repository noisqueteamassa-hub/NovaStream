// Expo managed não oferece seleção portátil de cartão SD em todos os Android.
// A escolha de SAF/URI de árvore será conectada ao módulo nativo na etapa de downloads.
export const STORAGE_LOCATIONS = {
  INTERNAL: 'internal',
  SD_CARD: 'sd-card',
  AUTO: 'auto',
};

export function resolveStoragePreference(preference = STORAGE_LOCATIONS.AUTO, sdCardAvailable = false) {
  if (preference === STORAGE_LOCATIONS.SD_CARD && sdCardAvailable) return STORAGE_LOCATIONS.SD_CARD;
  if (preference === STORAGE_LOCATIONS.AUTO && sdCardAvailable) return STORAGE_LOCATIONS.SD_CARD;
  return STORAGE_LOCATIONS.INTERNAL;
}
