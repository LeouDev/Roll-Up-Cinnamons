import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// BASE_PATH lets the site be served from a sub-folder (e.g. GitHub Pages:
// BASE_PATH=/Roll-Up-Cinnamons/ npm run build). Defaults to the domain root.
export default defineConfig({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    // Keep the font files as separate, cacheable assets.
    assetsInlineLimit: 2048,
  },
})
