import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    return json({ ok: true, id: data.id, actualizado: !!existente })
  } catch (error) {
    console.error('Error registrando postulación:', error)
    return json({ message: 'No fue posible registrar la postulación en AquaChile.' }, 500)
  }
})
