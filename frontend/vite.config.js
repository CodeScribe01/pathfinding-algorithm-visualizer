import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import process from 'node:process'

// https://vitejs.dev/config/
export default defineConfig({
  // GitHub Pages serves a project site from /<repo>/, so every asset URL needs
  // that prefix. Left as '/' for local dev and any root-hosted deployment.
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    open: false,
  },
  build: {
    // Recharts alone is ~500 kB; it is lazy-loaded by /compare and /analytics only.
    chunkSizeWarningLimit: 600,
    // Split the heavy libraries so the visualizer route stays light.
    rollupOptions: {
      output: {
        manualChunks: {
          charts: ['recharts'],
          motion: ['framer-motion'],
        },
      },
    },
  },
})
