import { defineConfig } from 'vite'

export default defineConfig({
  // Relative asset paths make the built site work on GitHub Pages
  // regardless of the repository name (e.g. /respect-cfw/).
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
})
