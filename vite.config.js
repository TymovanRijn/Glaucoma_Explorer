import { defineConfig } from 'vite';

// `base: './'` makes every asset path relative, so the built site works both at
// https://<user>.github.io/<repo>/ (GitHub Pages) and when opened from any sub-folder.
export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1500,
  },
});
