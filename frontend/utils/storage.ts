import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Thin JSON wrapper over AsyncStorage. Persistence is a nice-to-have here —
 * a read failure should degrade to "no saved state", never crash a screen —
 * so both helpers swallow errors and report them to the console instead.
 */

export async function loadJSON<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn(`[storage] failed to read "${key}"`, error)
    return fallback
  }
}

export async function saveJSON(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.warn(`[storage] failed to write "${key}"`, error)
  }
}

export const StorageKeys = {
  wishlist: 'habiswift.wishlist.v1',
  theme: 'habiswift.theme.v1',
  recentSearches: 'habiswift.recentSearches.v1',
} as const
