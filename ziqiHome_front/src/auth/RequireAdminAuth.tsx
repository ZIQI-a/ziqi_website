import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './authStore'

/**
 * 管理路由统一经过守卫，避免每个后台页面重复判断登录态。
 */
export function RequireAdminAuth() {
  const { hasCheckedSession, isAuthenticated, isInitializing, refreshSession } = useAuth()
  const location = useLocation()

  useEffect(() => {
    if (!hasCheckedSession) {
      void refreshSession()
    }
  }, [hasCheckedSession, refreshSession])

  // 只有进入后台守卫后才恢复 /me，避免公开站首屏产生不必要的鉴权请求。
  if (!hasCheckedSession || isInitializing) {
    return null
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/admin/login?redirect=${redirect}`} replace />
  }

  return <Outlet />
}
