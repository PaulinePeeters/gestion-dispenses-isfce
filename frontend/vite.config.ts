import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Redirige /api/* vers le backend Spring Boot en dev
      // Évite les problèmes CORS pendant le développement
      '/api': {
        target: 'http://localhost:9090',
        changeOrigin: true,
      }
    }
  }
})
