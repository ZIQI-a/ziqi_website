import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { authClient, AuthApiError } from '../api/authClient'
import {
  AuthContext,
  type AuthContextValue,
  type AuthSession,
} from './authStore'

/**
 * 认证状态统一从后端会话接口恢复，避免前端和真实登录态出现双轨状态。
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    void refreshSession()
  }, [])

  async function refreshSession() {
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
      setIsInitializing(false)
    }
  }

  async function login(payload: { username: string; password: string }) {
    const currentUser = await authClient.login(payload)
    setSession(currentUser)
    setIsInitializing(false)
  }

  async function logout() {
    try {
      await authClient.logout()
    } finally {
      setSession(null)
      setIsInitializing(false)
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isAuthenticated: session !== null,
      isInitializing,
      login,
      logout,
      refreshSession,
    }),
    [isInitializing, session],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
