import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { nodeResolve } from '@rollup/plugin-node-resolve'

export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
    'process.env': {},
    'process.browser': true,
  },
  resolve: {
    alias: {
      stream: 'stream-browserify',
    },
  },
  optimizeDeps: {
    include: ['xlsx-js-style', 'xlsx'],
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
    },
  },
  build: {
    rollupOptions: {
      external: ['express', 'cors', 'dotenv', 'cloudinary', 'http-proxy-middleware'],
    },
    commonjsOptions: {
      include: [/xlsx-js-style/, /xlsx/, /node_modules/],
      transformMixedEsModules: true,
    },
  },
})