import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],

  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'ejxm4mmbp.tail02637.ts.net',
      '.tail02637.ts.net',
      '.local',
    ],
  },
})
