// vite.config.electron.ts
import { defineConfig } from 'vite'

export default defineConfig({
  publicDir: false,
  build: {
    ssr: true, // true means, use rollupOptions.input
    rollupOptions: {
      // the magic, we can build two separate files in one go!
      input: ['src-electron/main.ts', 'src-electron/preload.ts']
    }
  },
  define: {
    // once again
    'import.meta.env.ELECTRON_APP_URL': JSON.stringify('index.html')
  }
})
