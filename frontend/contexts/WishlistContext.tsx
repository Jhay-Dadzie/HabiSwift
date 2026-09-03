import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { loadJSON, saveJSON, StorageKeys } from '@/utils/storage'

/**
 * Wishlist state is deliberately split in two contexts:
 *
 *  - `WishlistStateContext` changes on every toggle, so only components that
 *    actually render a saved/unsaved state subscribe to it.
 *  - `WishlistActionsContext` holds callbacks that never change identity, so
 *    buttons that only *write* never re-render when the list changes.
 */

interface WishlistState {
  ids: string[]
  hydrated: boolean
}

interface WishlistActions {
  toggle: (id: string) => boolean
  add: (id: string) => void
  remove: (id: string) => void
  clear: () => void
}

const WishlistStateContext = createContext<WishlistState | undefined>(undefined)
const WishlistActionsContext = createContext<WishlistActions | undefined>(undefined)

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([])
  const [hydrated, setHydrated] = useState(false)

  // Mirror of `ids` so the action callbacks can stay referentially stable.
  const idsRef = useRef<string[]>(ids)
  idsRef.current = ids

  useEffect(() => {
    let cancelled = false
    loadJSON<string[]>(StorageKeys.wishlist, []).then((saved) => {
      if (cancelled) return
      setIds(saved)
      setHydrated(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  // Persist after hydration only, so the initial empty state never clobbers
  // what is already on disk.
  useEffect(() => {
    if (!hydrated) return
    saveJSON(StorageKeys.wishlist, ids)
  }, [ids, hydrated])

  const actions = useMemo<WishlistActions>(
    () => ({
      toggle: (id) => {
        const willAdd = !idsRef.current.includes(id)
        setIds((prev) => (willAdd ? [id, ...prev] : prev.filter((x) => x !== id)))
        return willAdd
      },
      add: (id) =>
        setIds((prev) => (prev.includes(id) ? prev : [id, ...prev])),
      remove: (id) => setIds((prev) => prev.filter((x) => x !== id)),
      clear: () => setIds([]),
    }),
    []
  )

  const state = useMemo<WishlistState>(() => ({ ids, hydrated }), [ids, hydrated])

  return (
    <WishlistActionsContext.Provider value={actions}>
      <WishlistStateContext.Provider value={state}>
        {children}
      </WishlistStateContext.Provider>
    </WishlistActionsContext.Provider>
  )
}

export function useWishlist() {
  const state = useContext(WishlistStateContext)
  if (!state) throw new Error('useWishlist must be used within a WishlistProvider')
  return state
}

export function useWishlistActions() {
  const actions = useContext(WishlistActionsContext)
  if (!actions) {
    throw new Error('useWishlistActions must be used within a WishlistProvider')
  }
  return actions
}

/** Convenience hook for a single card: `[saved, toggle]`. */
export function useIsWishlisted(id: string): [boolean, () => boolean] {
  const { ids } = useWishlist()
  const { toggle } = useWishlistActions()
  const saved = ids.includes(id)
  const onToggle = useCallback(() => toggle(id), [toggle, id])
  return [saved, onToggle]
}
