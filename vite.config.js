import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'src/',
  publicDir: "../public/",
  base: './',
  server:
  {
      host: true,
      open: true // Open if it's not a CodeSandbox
  },
  build:
  {
      outDir: '../dist',
      emptyOutDir: true,
      sourcemap: true,
      lib: {
        entry: path.resolve(__dirname, 'src/lib/index.jsx'),
        name: 'r3f-character-controller',
        fileName: (format) => `r3f-character-controller.${format}.js`
      },
      rollupOptions: {
        external: ['react', 'react-dom'],
        output: {
          globals: {
            react: 'React'
          }
        }
      }
  }
})
