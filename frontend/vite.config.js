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
        '/resume-builder',
        '/about',
        '/contact',
        '/blog',
        '/jobs/remote',
        '/jobs/fresher',
        '/jobs/bangalore',
        '/jobs/kerala',
        '/jobs/software-engineer',
        '/jobs/data-science',
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