import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
})
const ROLES = ['jefatura', 'analista', 'evaluador'] as const

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ message: 'Método no permitido.' }, 405)

  try {
    const authorization = req.headers.get('Authorization')
    const token = authorization?.replace(/^Bearer\s+/i, '')
    if (!token) return json({ message: 'Debes iniciar sesión.' }, 401)

    const url = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    if (!serviceKey) return json({ message: 'Falta configurar SUPABASE_SERVICE_ROLE_KEY en las funciones.' }, 500)

    const authClient = createClient(url, anonKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data: authData, error: authError } = await authClient.auth.getUser(token)
    if (authError || !authData.user) return json({ message: 'La sesión no es válida.' }, 401)

    const admin = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } })
    const { data: actor, error: actorError } = await admin.from('perfiles')
      .select('id, rol, activo').eq('id', authData.user.id).maybeSingle()
    if (actorError || !actor?.activo || actor.rol !== 'jefatura') {
      return json({ message: 'Solo Jefatura puede administrar usuarios.' }, 403)
    }

    const body = await req.json()
    const action = body?.action

    if (action === 'list') {
      const { data, error } = await admin.from('perfiles')
        .select('id, nombre, correo, rol, activo, created_at')
        .order('nombre', { ascending: true })
      if (error) throw error
      return json({ users: data ?? [] })
    }

    if (action === 'create') {
      const nombre = String(body.nombre ?? '').trim()
      const correo = String(body.correo ?? '').trim().toLowerCase()
      const password = String(body.password ?? '')
      const rol = body.rol
      if (!nombre || !correo || password.length < 8 || !ROLES.includes(rol)) {
        return json({ message: 'Completa nombre, correo, rol y una contraseña de al menos 8 caracteres.' }, 400)
      }
      const { data: created, error: createError } = await admin.auth.admin.createUser({
        email: correo, password, email_confirm: true,
        user_metadata: { nombre, rol },
      })
      if (createError) return json({ message: createError.message }, 400)

      const { error: profileError } = await admin.from('perfiles').insert({
        id: created.user.id, nombre, correo, rol, activo: true,
      })
      if (profileError) {
        await admin.auth.admin.deleteUser(created.user.id)
        return json({ message: `No se pudo crear el perfil: ${profileError.message}` }, 400)
      }
      return json({ message: 'Usuario creado correctamente.', userId: created.user.id }, 201)
    }

    if (action === 'update') {
      const userId = String(body.userId ?? '')
      const nombre = String(body.nombre ?? '').trim()
      const correo = String(body.correo ?? '').trim().toLowerCase()
      const rol = body.rol
      if (!userId || !nombre || !correo || !ROLES.includes(rol)) {
        return json({ message: 'Datos incompletos o rol inválido.' }, 400)
      }
      if (userId === actor.id && rol !== 'jefatura') {
        return json({ message: 'No puedes quitarte tu propio rol de Jefatura.' }, 400)
      }
      if (userId !== actor.id && rol !== 'jefatura') {
        // No permitir quitar la última cuenta activa de Jefatura.
        const { count, error: countError } = await admin.from('perfiles')
          .select('id', { count: 'exact', head: true }).eq('rol', 'jefatura').eq('activo', true)
        if (countError) throw countError
        const { data: target } = await admin.from('perfiles').select('rol, activo').eq('id', userId).maybeSingle()
        if (target?.rol === 'jefatura' && target.activo && (count ?? 0) <= 1) {
          return json({ message: 'Debe existir al menos una cuenta activa de Jefatura.' }, 400)
        }
      }
      const { error: authUpdateError } = await admin.auth.admin.updateUserById(userId, {
        email: correo, user_metadata: { nombre, rol },
      })
      if (authUpdateError) return json({ message: authUpdateError.message }, 400)
      const { error } = await admin.from('perfiles').update({ nombre, correo, rol }).eq('id', userId)
      if (error) return json({ message: error.message }, 400)
      return json({ message: 'Usuario actualizado correctamente.' })
    }

    if (action === 'set_active') {
      const userId = String(body.userId ?? '')
      const activo = body.activo === true
      if (!userId) return json({ message: 'Falta el usuario.' }, 400)
      if (userId === actor.id && !activo) return json({ message: 'No puedes desactivar tu propia cuenta.' }, 400)

      const { data: target, error: targetError } = await admin.from('perfiles')
        .select('id, rol, activo').eq('id', userId).maybeSingle()
      if (targetError || !target) return json({ message: 'No encontramos ese usuario.' }, 404)
      if (!activo && target.rol === 'jefatura' && target.activo) {
        const { count, error: countError } = await admin.from('perfiles')
          .select('id', { count: 'exact', head: true }).eq('rol', 'jefatura').eq('activo', true)
        if (countError) throw countError
        if ((count ?? 0) <= 1) return json({ message: 'No puedes desactivar la última cuenta activa de Jefatura.' }, 400)
      }
      const { error: profileError } = await admin.from('perfiles').update({ activo }).eq('id', userId)
      if (profileError) throw profileError
      const { error: authBanError } = await admin.auth.admin.updateUserById(userId, {
        ban_duration: activo ? 'none' : '876000h',
      })
      if (authBanError) {
        await admin.from('perfiles').update({ activo: !activo }).eq('id', userId)
        throw authBanError
      }
      return json({ message: activo ? 'Usuario activado.' : 'Usuario desactivado.' })
    }

    return json({ message: 'Acción no reconocida.' }, 400)
  } catch (error) {
    console.error('usuarios function:', error)
    return json({ message: 'Ocurrió un error interno al administrar usuarios.' }, 500)
  }
})
