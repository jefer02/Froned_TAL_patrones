import { useCallback, useEffect, useMemo, useState } from 'react'
import { authApi } from '../api/authApi'
import { usageApi } from '../api/usageApi'
import { storage } from '../utils/storage'
import { encryptPassword } from '../utils/crypto'
import type { User, UserCredentials } from '../types/api'
import { AuthContext, type AuthContextValue } from './authContext'

interface LoginPayload {
  userId: string
  password: string
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [credentials, setCredentials] = useState<UserCredentials | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const bootstrap = async () => {
      const persistedSession = storage.getAuthSession()
      if (!persistedSession) {
        setIsLoading(false)
        return
      }

      try {
        const status = await usageApi.getStatus(persistedSession)
        setCredentials(persistedSession)
        setUser({
          userId: status.userId,
          plan: status.currentPlan
        })
      } catch {
        storage.clearAuthSession()
        setCredentials(null)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    void bootstrap()
  }, [])

  const createSession = async ({ userId, password }: LoginPayload): Promise<UserCredentials> => {
    const passwordEncrypted = await encryptPassword(password)
    return {
      userId,
      encryptedPassword: passwordEncrypted
    }
  }

  const register = useCallback(async ({ userId, password }: LoginPayload): Promise<void> => {
    const session = await createSession({ userId, password })

    const response = await authApi.register(session)

    storage.setAuthSession(session)
    setCredentials(session)
    setUser({
      userId: response.userId,
      plan: response.plan
    })
  }, [])

  const login = useCallback(async ({ userId, password }: LoginPayload): Promise<void> => {
    const session = await createSession({ userId, password })

    const status = await usageApi.getStatus(session)

    storage.setAuthSession(session)
    setCredentials(session)
    setUser({
      userId: status.userId,
      plan: status.currentPlan
    })
  }, [])

  const logout = useCallback((): void => {
    storage.clearAuthSession()
    setCredentials(null)
    setUser(null)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      credentials,
      isLoading,
      isAuthenticated: Boolean(user),
      register,
      login,
      logout
    }),
    [user, credentials, isLoading, register, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
