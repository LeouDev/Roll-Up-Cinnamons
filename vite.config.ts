import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

const page = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// BASE_PATH lets the site be served from a sub-folder (e.g. GitHub Pages:
// BASE_PATH=/Roll-Up-Cinnamons/ npm run build). Defaults to the domain root.
export default defineConfig(({ isSsrBuild }) => ({
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    // Keep the font files as separate, cacheable assets.
    assetsInlineLimit: 2048,
    // Two pages: the site, and the menu admin at /admin/ (the prerender build brings its own entry).
    rollupOptions: isSsrBuild ? undefined : { input: { main: page('./index.html'), admin: page('./admin/index.html') } },
  },
}))
