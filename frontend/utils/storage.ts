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
  /** Currently signed-in user, or null. */
  session: 'habiswift.session.v1',
  /**
   * Local stand-in for the accounts table until the API exists. Passwords are
   * stored in the clear here, which is only acceptable because these are
   * throwaway local accounts on a device with no real credentials behind them —
   * this key must be deleted, not migrated, when real auth lands.
   */
  accounts: 'habiswift.accounts.v1',
  /** Landlord's own listings, including unpublished drafts. */
  landlordListings: 'habiswift.landlordListings.v1',
} as const
