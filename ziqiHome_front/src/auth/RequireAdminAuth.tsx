import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './authStore'

/**
 * 管理路由统一经过守卫，避免每个后台页面重复判断登录态。
 */
export function RequireAdminAuth() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/admin/login?redirect=${redirect}`} replace />
  }

  return <Outlet />
}
