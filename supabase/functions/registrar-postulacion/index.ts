import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Resend } from 'npm:resend@6.38.1'

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json' },
})

const normalizarRut = (rut: string) => {
  const limpio = rut.toUpperCase().replace(/[^0-9K]/g, '')
  if (limpio.length < 2 || limpio.length > 10) return null
  const cuerpo = limpio.slice(0, -1)
  const verificador = limpio.slice(-1)
  let suma = 0
  let factor = 2
  for (let i = cuerpo.length - 1; i >= 0; i -= 1) {
    suma += Number(cuerpo[i]) * factor
    factor = factor === 7 ? 2 : factor + 1
  }
  const resto = 11 - (suma % 11)
  const esperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto)
  if (verificador !== esperado) return null
  return `${cuerpo}-${verificador}`
}

const escapar = (valor: unknown) => String(valor ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')

// Correo que recibe el evaluador cuando entra un postulante nuevo.
const plantillaNuevoPostulante = (p: { nombre: string; cargo: string; familiaCargo: string; ubicacion?: string }, urlApp: string) => ({
  subject: `Nuevo postulante: ${p.nombre} · ${p.cargo}`,
  html: `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;border:1px solid #dde3ea;border-radius:8px;overflow:hidden">
  <div style="background:#0b4f6c;color:#ffffff;padding:16px 24px"><h1 style="margin:0;font-size:20px">AquaData</h1></div>
  <div style="padding:24px;color:#1f2933">
    <h2 style="margin-top:0;font-size:18px">Llegó un nuevo postulante</h2>
    <p>Un postulante completó el formulario de postulación y ya quedó registrado en AquaData.</p>
    <table style="border-collapse:collapse;margin:12px 0">
      <tr><td style="padding:4px 16px 4px 0;color:#6b7785">Postulante</td><td><strong>${escapar(p.nombre)}</strong></td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#6b7785">Cargo</td><td>${escapar(p.cargo)}</td></tr>
      <tr><td style="padding:4px 16px 4px 0;color:#6b7785">Familia de cargo</td><td>${escapar(p.familiaCargo)}</td></tr>
    </table>
    <p>Su currículum y su formulario están disponibles en AquaData.</p>
    ${urlApp ? `<p><a href="${escapar(urlApp)}" style="display:inline-block;background:#0b4f6c;color:#ffffff;padding:10px 18px;border-radius:6px;text-decoration:none">Abrir AquaData</a></p>` : ''}
  </div>
  <div style="background:#f4f6f8;color:#6b7785;padding:12px 24px;font-size:12px">Mensaje automático de AquaData · No respondas a este correo.</div>
</div>`,
})

// Avisa a los evaluadores activos. Nunca lanza: un fallo del correo no debe impedir registrar la postulación.
async function notificarEvaluadores(
  supabase: ReturnType<typeof createClient>,
  postulante: { nombre: string; cargo: string; familiaCargo: string },
) {
  const apiKey = Deno.env.get('RESEND_API_KEY')
  if (!apiKey) {
    console.warn('RESEND_API_KEY no está configurada: no se envió el aviso a los evaluadores.')
    return { enviado: false, motivo: 'sin_api_key' }
  }
  try {
    const { data: evaluadores, error } = await supabase.from('perfiles')
      .select('correo').eq('rol', 'evaluador').eq('activo', true)
    if (error) throw error

    const correos = (evaluadores ?? []).map((e: { correo: string | null }) => e.correo).filter(Boolean) as string[]
    // Modo pruebas de Resend: solo deja enviar a la casilla dueña de la cuenta.
    const destinoPrueba = Deno.env.get('RESEND_DESTINO_PRUEBA')
    const destinos = destinoPrueba ? (correos.length ? [destinoPrueba] : []) : correos
    if (!destinos.length) return { enviado: false, motivo: 'sin_evaluadores' }

    const resend = new Resend(apiKey)
    const from = Deno.env.get('RESEND_FROM') ?? 'AquaData <onboarding@resend.dev>'
    const { subject, html } = plantillaNuevoPostulante(postulante, Deno.env.get('APP_URL') ?? '')

    // Un correo por evaluador, para que no vean las direcciones de los demás.
    const resultados = await Promise.all(destinos.map(async (to) => {
      const { error: errorEnvio } = await resend.emails.send({ from, to: [to], subject, html })
      if (errorEnvio) console.error('Resend rechazó un aviso:', errorEnvio)
      return !errorEnvio
    }))
    return { enviado: resultados.some(Boolean), cantidad: resultados.filter(Boolean).length }
  } catch (error) {
    console.error('No se pudo avisar a los evaluadores:', error)
    return { enviado: false, motivo: 'error' }
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ message: 'Método no permitido.' }, 405)

  const secreto = Deno.env.get('GOOGLE_FORMS_WEBHOOK_SECRET')
  if (!secreto || req.headers.get('X-Forms-Secret') !== secreto) {
    return json({ message: 'No autorizado.' }, 401)
  }

  try {
    const body = await req.json()
    const nombre = String(body.nombre ?? '').trim()
    const rut = normalizarRut(String(body.rut ?? ''))
    const correo = String(body.correo ?? '').trim().toLowerCase()
    const telefono = String(body.telefono ?? '').trim()
    const cargo = String(body.cargo ?? '').trim()
    const familiaCargo = String(body.familia_cargo ?? '').trim()
    const fileId = String(body.cv_drive_file_id ?? '').trim()
    const folderId = String(body.drive_folder_id ?? '').trim()
    const pdfId = String(body.formulario_pdf_drive_id ?? '').trim()
    const cvNombre = String(body.cv_nombre_archivo ?? '').trim()

    if (!nombre || !rut || !correo || !telefono || !cargo || !familiaCargo || !fileId || !folderId || !pdfId || !cvNombre) {
      return json({ message: 'Faltan datos obligatorios o referencias de documentos.' }, 400)
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      return json({ message: 'El correo electrónico no tiene un formato válido.' }, 400)
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: existente, error: buscarError } = await supabase.from('postulantes')
      .select('id, origen').eq('rut', rut).maybeSingle()
    if (buscarError) throw buscarError

    const registro = {
      rut,
      nombre_completo: nombre,
      correo,
      telefono,
      cargo,
      familia_cargo: familiaCargo,
      origen: 'Externo',
      referido: false,
      cv_nombre_archivo: cvNombre,
      drive_folder_id: folderId,
      formulario_pdf_drive_id: pdfId,
      cv_drive_file_id: fileId,
    }

    if (existente && existente.origen !== 'Externo') {
      return json({ ok: true, id: existente.id, ya_existia: true })
    }

    const query = existente
      ? supabase.from('postulantes').update(registro).eq('id', existente.id).select('id').single()
      : supabase.from('postulantes').insert(registro).select('id').single()
    const { data, error } = await query
    if (error) throw error
    // Solo se avisa cuando el postulante es nuevo; si solo se actualizó, no se repite el correo.
    const aviso = existente ? null : await notificarEvaluadores(supabase, { nombre, cargo, familiaCargo })
    return json({ ok: true, id: data.id, actualizado: !!existente, aviso })
  } catch (error) {
    console.error('Error registrando postulación:', error)
    return json({ message: 'No fue posible registrar la postulación en AquaChile.' }, 500)
  }
})
