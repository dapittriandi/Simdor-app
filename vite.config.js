import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill global untuk library CommonJS yang butuh Node.js globals
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    // Paksa Vite pre-bundle xlsx-js-style agar diproses sebagai browser module
    include: ['xlsx-js-style'],
    esbuildOptions: {
      // Abaikan Node.js built-in modules saat bundling untuk browser
      plugins: [],
    },
  },
  build: {
    commonjsOptions: {
      // Abaikan Node.js built-ins saat transform CommonJS → ESM
      ignore: (id) => ['stream', 'events', 'buffer', 'util', 'path', 'fs', 'os'].includes(id),
      transformMixedEsModules: true,
    },
  },
})