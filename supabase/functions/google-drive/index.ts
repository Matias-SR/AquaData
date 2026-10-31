import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authorization = req.headers.get('Authorization')
    if (!authorization) {
      return new Response(JSON.stringify({ message: 'No autorizado.' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const client = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authorization } },
    })
    const { data: authData, error: authError } = await client.auth.getUser()
    if (authError || !authData.user) {
      return new Response(JSON.stringify({ message: 'Sesión inválida.' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: perfil } = await client.from('perfiles')
      .select('id, rol, activo').eq('id', authData.user.id).maybeSingle()

    if (!perfil?.activo) {
      return new Response(JSON.stringify({ message: 'Perfil inactivo.' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Punto de entrada seguro para la futura integración con Google Drive.
    // No se entrega ningún enlace hasta implementar y configurar la API de Drive.
    return new Response(JSON.stringify({
      configured: false,
      message: 'Google Drive aún no está configurado. Agrega la integración del lado servidor antes de habilitar documentos.',
    }), {
      status: 501, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (_error) {
    return new Response(JSON.stringify({ message: 'Error interno al consultar Google Drive.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
