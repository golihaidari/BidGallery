import { defineConfig, type UserConfig as ViteUserConfig  } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'url';

export default defineConfig({
  plugins: [react()],
  base: '/', // works for root deployment
  resolve: {
    alias: {
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@interfaces': fileURLToPath(new URL('./src/interfaces', import.meta.url)),
      '@context': fileURLToPath(new URL('./src/context', import.meta.url)),
      '@hook': fileURLToPath(new URL('./src/hook', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url))
    }
  },
  test: { //this allows to use describe, it, and expect without imports and simulates a browser.
    globals: true,            // allows describe, it, expect globally
    environment: 'jsdom',     // simulate a browser
    setupFiles: './tests/setup.tsx', // optional setup file
  }
}as ViteUserConfig)
