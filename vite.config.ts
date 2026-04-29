import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/bff': {
        target: 'http://localhost:3100',
        changeOrigin: true,
      },
      '/auth': {
        target: 'http://localhost:6969',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth/, '')
      },
      '/chat': {
        target: 'http://localhost:1729',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/chat/, '')
      },
      '/affiliate': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/affiliate/, '')
      },
      '/notify': {
        target: 'http://localhost:1984',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/notify/, '')
      }
    }
  }
});
