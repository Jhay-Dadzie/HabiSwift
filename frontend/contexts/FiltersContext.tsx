import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { DEFAULT_FILTERS, Filters } from '@/types/listing'
import { loadJSON, saveJSON, StorageKeys } from '@/utils/storage'

/**
 * Search + filter state lives above the screens so a filter picked on Home
 * carries into Search (and back) instead of each screen keeping its own copy.
 */

const MAX_RECENT_SEARCHES = 8

interface FiltersContextValue {
  filters: Filters
  /** Merge a partial update into the current filters. */
  setFilters: (patch: Partial<Filters>) => void
  /** Replace everything — used by the filter sheet's "Apply". */
  replaceFilters: (next: Filters) => void
  resetFilters: () => void
  recentSearches: string[]
  addRecentSearch: (term: string) => void
  removeRecentSearch: (term: string) => void
  clearRecentSearches: () => void
}

const FiltersContext = createContext<FiltersContextValue | undefined>(undefined)

export function FiltersProvider({ children }: { children: ReactNode }) {
  const [filters, setFiltersState] = useState<Filters>(DEFAULT_FILTERS)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadJSON<string[]>(StorageKeys.recentSearches, []).then((saved) => {
      if (cancelled) return
      setRecentSearches(saved)
      setHydrated(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveJSON(StorageKeys.recentSearches, recentSearches)
  }, [recentSearches, hydrated])

  const setFilters = useCallback((patch: Partial<Filters>) => {
    setFiltersState((prev) => ({ ...prev, ...patch }))
  }, [])

  const replaceFilters = useCallback((next: Filters) => setFiltersState(next), [])

  const resetFilters = useCallback(
    // Keep whatever is typed in the search box; "Reset" clears filters, not the query.
    () => setFiltersState((prev) => ({ ...DEFAULT_FILTERS, query: prev.query })),
    []
  )

  const addRecentSearch = useCallback((term: string) => {
    const trimmed = term.trim()
    if (!trimmed) return
    setRecentSearches((prev) =>
      [trimmed, ...prev.filter((t) => t.toLowerCase() !== trimmed.toLowerCase())].slice(
        0,
        MAX_RECENT_SEARCHES
      )
    )
  }, [])

  const removeRecentSearch = useCallback(
    (term: string) => setRecentSearches((prev) => prev.filter((t) => t !== term)),
    []
  )

  const clearRecentSearches = useCallback(() => setRecentSearches([]), [])

  const value = useMemo<FiltersContextValue>(
    () => ({
      filters,
      setFilters,
      replaceFilters,
      resetFilters,
      recentSearches,
      addRecentSearch,
      removeRecentSearch,
      clearRecentSearches,
    }),
    [
      filters,
      setFilters,
      replaceFilters,
      resetFilters,
      recentSearches,
      addRecentSearch,
      removeRecentSearch,
      clearRecentSearches,
    ]
  )

  return <FiltersContext.Provider value={value}>{children}</FiltersContext.Provider>
}

export function useFilters() {
  const context = useContext(FiltersContext)
  if (!context) throw new Error('useFilters must be used within a FiltersProvider')
  return context
}
