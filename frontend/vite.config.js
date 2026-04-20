import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import sitemap from 'vite-plugin-sitemap'

export default defineConfig({
  plugins: [
    react(),
    sitemap({
      hostname: 'https://www.hire-flow.online',
      dynamicRoutes: [
        '/',
        '/candidate/jobs',
        '/post-job',
        '/companies',
        '/candidate/jobs/?category=remote',
        '/candidate/jobs/?category=fresher',
        '/candidate/jobs/?category=bangalore',
        '/candidate/jobs/?category=kerala',
        '/candidate/jobs/?category=software-engineer',
        '/candidate/jobs/?category=data-science',
      ],
      exclude: ['/hr/dashboard', '/hr/register', '/register', '/login'],
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
  },
})