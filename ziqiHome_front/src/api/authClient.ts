import type { AuthSession } from '../auth/authStore'

interface ApiErrorShape {
  message?: string
  fieldErrors?: Record<string, string>
}

export class AuthApiError extends Error {
  fieldErrors?: Record<string, string>

  constructor(message: string, fieldErrors?: Record<string, string>) {
    super(message)
    this.name = 'AuthApiError'
    this.fieldErrors = fieldErrors
  }
}

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({}))) as ApiErrorShape
    throw new AuthApiError(
      errorBody.message ?? '鉴权请求失败，请稍后重试',
      errorBody.fieldErrors,
    )
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

/**
 * 登录、恢复会话和退出登录都统一从这里走，前端状态层只消费标准化后的请求结果。
 */
export const authClient = {
  login(payload: { username: string; password: string }) {
    return request<AuthSession>('/api/admin/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  getCurrentUser() {
    return request<AuthSession>('/api/admin/auth/me')
  },
  logout() {
    return request<void>('/api/admin/auth/logout', {
      method: 'POST',
    })
  },
}
