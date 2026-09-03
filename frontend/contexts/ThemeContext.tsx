import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useColorScheme as useSystemColorScheme } from 'react-native'
import { loadJSON, saveJSON, StorageKeys } from '@/utils/storage'

type ThemeType = 'light' | 'dark'
type ThemePreference = ThemeType | 'system'

interface ThemeContextType {
  /** Resolved theme actually in use. */
  theme: ThemeType
  /** What the user picked — 'system' follows the OS. */
  preference: ThemePreference
  toggleTheme: () => void
  setTheme: (theme: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useSystemColorScheme()
  const [preference, setPreference] = useState<ThemePreference>('system')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadJSON<ThemePreference>(StorageKeys.theme, 'system').then((saved) => {
      if (cancelled) return
      setPreference(saved)
      setHydrated(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveJSON(StorageKeys.theme, preference)
  }, [preference, hydrated])

  const theme: ThemeType =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference

  // Toggling resolves 'system' to its concrete opposite rather than cycling
  // through a third state the switch in Settings cannot represent.
  const toggleTheme = useCallback(
    () => setPreference(theme === 'light' ? 'dark' : 'light'),
    [theme]
  )

  const value = useMemo<ThemeContextType>(
    () => ({ theme, preference, toggleTheme, setTheme: setPreference }),
    [theme, preference, toggleTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
