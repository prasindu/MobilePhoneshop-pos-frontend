import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'] // අන්තර්ජාලය නැතිව Load වීමට අවශ්‍ය ෆයිල්ස් සේව් කිරීම
      },
      manifest: {
        name: 'MobileHub POS',
        short_name: 'POS',
        description: 'Offline Capable Point of Sale System',
        theme_color: '#4f46e5',
        background_color: '#f9fafb',
        display: 'standalone',
        icons: [
          {
            src: 'https://cdn-icons-png.flaticon.com/512/5164/5164023.png', // තාවකාලික Icon එකක් (පසුව ඔබට අවශ්‍ය එකක් දාගත හැක)
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})