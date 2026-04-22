import { createContext, useContext } from 'react'

export interface AuthSession {
  username: string
  nickname: string
  loginAt: string
}

export interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  login: (payload: { username: string; nickname?: string }) => void
  logout: () => void
}

export const AUTH_STORAGE_KEY = 'ziqihome-admin-session'

export const AuthContext = createContext<AuthContextValue | null>(null)

export function readStoredSession() {
  const stored = window.localStorage.getItem(AUTH_STORAGE_KEY)

  if (!stored) {
    return null
  }

  try {
    return JSON.parse(stored) as AuthSession
  } catch {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    return null
  }
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === null) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用')
  }

  return context
}
