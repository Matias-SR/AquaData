import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  // Sin prefijo VITE_ para que la clave NO llegue al navegador: solo la lee este proceso de Node.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      proxy: {
        // El navegador llama a /api/resend/emails y Vite reenvía a https://api.resend.com/emails
        // agregando la API key en el servidor (evita CORS y no expone la clave).
        '/api/resend': {
          target: 'https://api.resend.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/resend/, ''),
          headers: { Authorization: `Bearer ${env.RESEND_API_KEY ?? ''}` },
        },
        // Google Calendar API v3: /api/google-calendar/calendars/primary/events -> /calendar/v3/calendars/<id>/events
        // El Access Token y el ID del calendario salen del .env (sin prefijo VITE_, solo los lee este proceso).
        '/api/google-calendar': {
          target: 'https://www.googleapis.com',
          changeOrigin: true,
          rewrite: (path) => path
            .replace(/^\/api\/google-calendar/, '/calendar/v3')
            .replace('/calendars/primary/', `/calendars/${encodeURIComponent(env.GOOGLE_CALENDAR_ID || 'primary')}/`),
          headers: { Authorization: `Bearer ${env.GOOGLE_ACCESS_TOKEN ?? ''}` },
        },
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/setupTests.js',
    },
  }
})
