import { useMemo, useState, type ReactNode } from 'react'
import {
  AUTH_STORAGE_KEY,
  AuthContext,
  readStoredSession,
  type AuthContextValue,
  type AuthSession,
} from './authStore'

/**
 * 当前只提供前端会话壳子，等后端登录接口落地后再把 login 切换为真实鉴权请求。
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(() => readStoredSession())

  function login(payload: { username: string; nickname?: string }) {
    const nextSession: AuthSession = {
      username: payload.username.trim(),
      nickname: payload.nickname?.trim() || payload.username.trim(),
      loginAt: new Date().toISOString(),
    }

    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextSession))
    setSession(nextSession)
  }

  function logout() {
    window.localStorage.removeItem(AUTH_STORAGE_KEY)
    setSession(null)
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      login,
      logout,
    }),
    [session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
