import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@api': '/src/api',
      '@components': '/src/components',
      '@routes': '/src/routes',
      '@store': '/src/store',
      '@utils': '/src/utils',
      '@layout': '/src/layout',
      '@types': '/src/types',
      '@constants': '/src/constants',
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8081',
        changeOrigin: true,
      },
    },
  },
})
