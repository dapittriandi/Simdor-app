import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
  },
  optimizeDeps: {
    include: ['xlsx-js-style'],
    exclude: ['express', 'cors', 'dotenv', 'axios', 'cloudinary', 'http-proxy-middleware'],
  },
  build: {
    rollupOptions: {
      external: ['express', 'cors', 'dotenv', 'cloudinary', 'http-proxy-middleware'],
    },
    commonjsOptions: {
      ignore: (id) => ['stream', 'events', 'buffer', 'util', 'path', 'fs', 'os'].includes(id),
      transformMixedEsModules: true,
    },
  },
})