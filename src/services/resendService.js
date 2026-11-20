import { Resend } from 'resend'
import { plantillaInformeEnviado } from '../templates/index.js'

// El SDK apunta al proxy de Vite (/api/resend) en vez de a api.resend.com. El proxy agrega la
// API key real del lado del servidor (ver vite.config.js), por eso aquí va una clave de relleno:
// el SDK exige una, pero el navegador nunca conoce la verdadera.
const resend = new Resend('re_proxy', { baseUrl: '/api/resend' })

export async function enviarCorreo({ to, subject, html, attachments }) {
  // Se leen al enviar (no al cargar el módulo) para que las pruebas puedan simular el .env.
  // Con el remitente de pruebas de Resend solo se puede enviar a la casilla dueña de la cuenta.
  const REMITENTE = import.meta.env.VITE_RESEND_FROM || 'AquaData <onboarding@resend.dev>'
  const destino = import.meta.env.VITE_RESEND_DESTINO_PRUEBA || to
  if (!destino) throw new Error('No hay un correo de destino para enviar el aviso.')

  // El SDK no lanza excepciones: devuelve { data, error }.
  const { data, error } = await resend.emails.send({ from: REMITENTE, to: [destino], subject, html, attachments })
  if (error) throw new Error(error.message || 'Resend no pudo enviar el correo.')
  return data // { id: '...' }
}

// `adjunto` es el PDF del informe: { filename, content, contentType } (ver utils/informePdf.js).
export function notificarInformeEnviado({ adjunto, ...datos }) {
  const { subject, html } = plantillaInformeEnviado(datos)
  return enviarCorreo({ to: datos.correoAnalista, subject, html, attachments: adjunto ? [adjunto] : undefined })
}
