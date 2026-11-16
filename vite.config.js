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
      },
    },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/setupTests.js',
    },
  }
})
