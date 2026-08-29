import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authService } from '@/services'

const AuthContext = createContext(null)

/**
 * JWT session state.
 *
 * The cached user is shown immediately on boot (so the navbar never flickers)
 * and then revalidated against /auth/me/. A failed revalidation clears the
 * session silently — the API client has already tried to refresh the token.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.cachedUser())
  const [initializing, setInitializing] = useState(() => authService.isAuthenticated)

  useEffect(() => {
    let cancelled = false
    if (!authService.isAuthenticated) {
      setInitializing(false)
      return () => {
        cancelled = true
      }
    }

    authService
      .me()
      .then((profile) => {
        if (!cancelled) setUser(profile)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setInitializing(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (credentials) => {
    const data = await authService.login(credentials)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (payload) => {
    const data = await authService.register(payload)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    await authService.logout()
    setUser(null)
  }, [])

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), initializing, login, register, logout }),
    [user, initializing, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>')
  return context
}
