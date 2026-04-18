import { createContext } from 'react'
import type { User, UserCredentials } from '../types/api'

interface LoginPayload {
  userId: string
  password: string
}

export interface AuthContextValue {
  user: User | null
  credentials: UserCredentials | null
  isLoading: boolean
  isAuthenticated: boolean
  register: (payload: LoginPayload) => Promise<void>
  login: (payload: LoginPayload) => Promise<void>
  logout: () => void
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
