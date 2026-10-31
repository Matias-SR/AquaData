import { supabase } from '../lib/supabaseClient.js'

// El navegador nunca recibe credenciales de Google. La Edge Function validará
// la sesión y consultará Drive usando secretos almacenados en Supabase.
export async function obtenerEnlaceSeguroDrive(fileId) {
  if (!fileId) throw new Error('Este documento todavía no tiene un identificador de Google Drive.')
  const { data, error } = await supabase.functions.invoke('google-drive', {
    body: { action: 'obtener-enlace', fileId },
  })
  if (error) throw new Error(error.message || 'No fue posible consultar Google Drive.')
  if (!data?.url) throw new Error(data?.message || 'La integración con Google Drive aún no está configurada.')
  return data.url
}

export async function abrirDocumentoDrive(fileId) {
  const url = await obtenerEnlaceSeguroDrive(fileId)
  window.open(url, '_blank', 'noopener,noreferrer')
}
