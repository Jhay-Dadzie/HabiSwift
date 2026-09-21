import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { loadJSON, saveJSON, StorageKeys } from '@/utils/storage'
import { normalisePhone } from '@/utils/validation'

/**
 * Session state for both roles.
 *
 * There is no backend yet (`backend/` is a bare Express scaffold), so the
 * credential calls resolve locally against persisted state. Everything an API
 * would own — latency, failure, the shape of the returned user — is modelled
 * here so swapping in real endpoints means editing this file and nothing else.
 */

export type UserRole = 'tenant' | 'landlord'

/** Where a landlord is in the verification pipeline. */
export type VerificationStatus = 'unverified' | 'pending' | 'verified' | 'rejected'

export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  role: UserRole
  avatarUri?: string
  /** Landlord only. */
  verification?: VerificationStatus
  ghanaCardNumber?: string
  createdAt: string
}

export interface SignUpInput {
  fullName: string
  email: string
  phone: string
  password: string
  role: UserRole
}

interface AuthContextValue {
  user: User | null
  /** False until the persisted session has been read — gate redirects on this. */
  hydrated: boolean
  isAuthenticated: boolean
  pending: boolean
  signIn: (identifier: string, password: string) => Promise<User>
  signUp: (input: SignUpInput) => Promise<User>
  signOut: () => Promise<void>
  updateUser: (patch: Partial<User>) => void
  /** Advances a landlord through the verification pipeline. */
  setVerification: (status: VerificationStatus) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

/** Stands in for network latency so loading states are exercised in dev. */
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [pending, setPending] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadJSON<User | null>(StorageKeys.session, null).then((saved) => {
      if (cancelled) return
      setUser(saved)
      setHydrated(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveJSON(StorageKeys.session, user)
  }, [user, hydrated])

  const signUp = useCallback(async (input: SignUpInput): Promise<User> => {
    setPending(true)
    try {
      await delay(700)

      const account: User = {
        id: `${input.role}-${Date.now()}`,
        fullName: input.fullName.trim(),
        email: input.email.trim().toLowerCase(),
        phone: normalisePhone(input.phone),
        role: input.role,
        // Landlords must clear identity + ownership checks before they can list.
        verification: input.role === 'landlord' ? 'unverified' : undefined,
        createdAt: new Date().toISOString(),
      }

      // Credentials live beside the session so `signIn` can match them back.
      const accounts = await loadJSON<Record<string, { password: string; user: User }>>(
        StorageKeys.accounts,
        {}
      )
      if (accounts[account.email] || accounts[account.phone]) {
        throw new AuthError('An account already exists for those details')
      }
      accounts[account.email] = { password: input.password, user: account }
      accounts[account.phone] = { password: input.password, user: account }
      await saveJSON(StorageKeys.accounts, accounts)

      setUser(account)
      return account
    } finally {
      setPending(false)
    }
  }, [])

  const signIn = useCallback(
    async (identifier: string, password: string): Promise<User> => {
      setPending(true)
      try {
        await delay(700)

        const key = identifier.includes('@')
          ? identifier.trim().toLowerCase()
          : normalisePhone(identifier)

        const accounts = await loadJSON<
          Record<string, { password: string; user: User }>
        >(StorageKeys.accounts, {})
        const record = accounts[key]

        if (!record) {
          throw new AuthError('No account found for those details')
        }
        if (record.password !== password) {
          throw new AuthError('Incorrect password')
        }

        setUser(record.user)
        return record.user
      } finally {
        setPending(false)
      }
    },
    []
  )

  const signOut = useCallback(async () => {
    setUser(null)
    await saveJSON(StorageKeys.session, null)
  }, [])

  const updateUser = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev
      const next = { ...prev, ...patch }
      // Keep the local credential record in sync with session-only changes
      // such as landlord verification status.
      loadJSON<Record<string, { password: string; user: User }>>(StorageKeys.accounts, {}).then((accounts) => {
        Object.keys(accounts).forEach((key) => {
          if (accounts[key].user.id === next.id) accounts[key] = { ...accounts[key], user: next }
        })
        saveJSON(StorageKeys.accounts, accounts)
      })
      return next
    })
  }, [])

  const setVerification = useCallback(
    (status: VerificationStatus) => updateUser({ verification: status }),
    [updateUser]
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      hydrated,
      isAuthenticated: user !== null,
      pending,
      signIn,
      signUp,
      signOut,
      updateUser,
      setVerification,
    }),
    [user, hydrated, pending, signIn, signUp, signOut, updateUser, setVerification]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}

/** Home route for a signed-in user of the given role. */
export const homeRouteFor = (role: UserRole) =>
  role === 'landlord' ? '/(landlordScreens)' : '/(tenantScreens)'
