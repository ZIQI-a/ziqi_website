import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { syncGlobalAssetVariables } from './config/assets'
import './index.css'
import App from './App.tsx'

// 在应用挂载前先注入背景图变量，避免 CSS 层继续散落硬编码图片地址。
syncGlobalAssetVariables(document.documentElement)

createRoot(document.getElementById('root')!).render(
  // BrowserRouter 负责把地址栏变化映射到 React 路由组件。
  <BrowserRouter>
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>,
)
