import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'e2e'],
    environmentOptions: {
      jsdom: {
        // Allow crypto.randomUUID in jsdom
        url: 'http://localhost:3000',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Prevent 'server-only' from throwing in the Node/Vitest environment.
      'server-only': path.resolve(__dirname, './src/test/server-only-mock.ts'),
    },
  },
})
