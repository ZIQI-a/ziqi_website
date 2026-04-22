import { createContext, useContext } from 'react'
import type { UserRole } from '../types/admin'

/**
 * 管理端前端只保留当前会话展示和守卫所需字段，避免直接耦合后端完整用户 DTO。
 */
export interface AuthSession {
  id: number
  username: string
  nickname: string
  role: UserRole
  enabled: boolean
  lastLoginAt: string | null
}

export interface AuthContextValue {
  session: AuthSession | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (payload: { username: string; password: string }) => Promise<void>
  logout: () => Promise<void>
  refreshSession: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)

/**
 * 统一在 hook 里兜住空上下文，避免页面直接依赖底层 Context 对象。
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === null) {
    throw new Error('useAuth 必须在 AuthProvider 内部使用')
  }

  return context
}
