import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './authStore'

/**
 * 管理路由统一经过守卫，避免每个后台页面重复判断登录态。
 */
export function RequireAdminAuth() {
  const { isAuthenticated, isInitializing } = useAuth()
  const location = useLocation()

  // 首次进入页面时先等待 /me 返回，避免登录态恢复完成前就被错误重定向到登录页。
  if (isInitializing) {
    return null
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/admin/login?redirect=${redirect}`} replace />
  }

  return <Outlet />
}
