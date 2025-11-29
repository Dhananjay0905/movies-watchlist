import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy any request starting with /auth or /api to the backend
      '/auth': 'http://localhost:3000',
      '/api': 'http://localhost:3000',
      '/ibm': 'http://localhost:3000', // Needed for the callback
    }
  }
})
