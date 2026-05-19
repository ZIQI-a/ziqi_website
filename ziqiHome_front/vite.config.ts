import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 固定前端开发端口，方便和后端默认联调配置保持一致。
    port: 5174,
    proxy: {
      // 本地开发时统一把接口请求转发到后端 8081 端口。
      '/api': 'http://localhost:8081',
    },
  },
})
