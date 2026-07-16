import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { authClient, AuthApiError } from '../api/authClient'
import {
  AuthContext,
  type AuthContextValue,
  type AuthSession,
} from './authStore'
import { ADMIN_SESSION_EXPIRED_EVENT } from './sessionEvents'

/**
 * AuthProvider 只保存管理端会话状态，不在公开站首屏主动请求 /auth/me。
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isInitializing, setIsInitializing] = useState(false)
  const [hasCheckedSession, setHasCheckedSession] = useState(false)

  useEffect(() => {
    function handleSessionExpired() {
      // 后端已经判定会话无效，本地立即清空状态，由路由守卫跳回登录页。
      setSession(null)
      setHasCheckedSession(true)
      setIsInitializing(false)
    }

    window.addEventListener(ADMIN_SESSION_EXPIRED_EVENT, handleSessionExpired)
    return () => window.removeEventListener(ADMIN_SESSION_EXPIRED_EVENT, handleSessionExpired)
  }, [])

  async function refreshSession() {
    setIsInitializing(true)

    try {
      const currentUser = await authClient.getCurrentUser()
      setSession(currentUser)
    } catch (error) {
      // 首次进入页面时未登录属于正常状态，只需要把会话清空即可。
      if (!(error instanceof AuthApiError) || error.message !== '当前未登录后台账号') {
        setSession(null)
      } else {
        setSession(null)
      }
    } finally {
      setHasCheckedSession(true)
      setIsInitializing(false)
    }
  }

  async function login(payload: { username: string; password: string }) {
    const currentUser = await authClient.login(payload)
    setSession(currentUser)
    setHasCheckedSession(true)
    setIsInitializing(false)
  }

  async function logout() {
    try {
      await authClient.logout()
    } finally {
      setSession(null)
      setHasCheckedSession(true)
      setIsInitializing(false)
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      isInitializing,
      hasCheckedSession,
      login,
      logout,
      refreshSession,
    }),
    [hasCheckedSession, isInitializing, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
