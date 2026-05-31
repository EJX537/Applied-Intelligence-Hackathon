import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    babel({ presets: [reactCompilerPreset()] }),
<<<<<<< HEAD
    tailwindcss()
=======
>>>>>>> 65651fa49214530880aa95dbe2be01f6d6585cfa
  ],

  server: {
    port: 5173,
    host: true,
    allowedHosts: ['.tail02637.ts.net', '.local'],
  },
});
