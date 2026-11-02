import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'

const PERMISOS = {
  analista: ['candidatos:ver', 'candidatos:escribir', 'solicitudes:crear', 'solicitudes:editar', 'informe:recibir'],
  evaluador: ['entrevista:gestionar', 'informe:redactar'],
  jefatura: ['solicitudes:exportar', 'usuarios:administrar'],
}

export function tienePermiso(rol, permiso) {
  return (PERMISOS[rol] ?? []).includes(permiso)
}

const ROLES = {
  analista: 'Analista de Reclutamiento',
  evaluador: 'Profesional Evaluador',
  jefatura: 'Jefatura',
}

export const RESUMEN_ROL = {
  analista: [
    'Registrar candidatos y crear solicitudes de evaluación',
    'Buscar candidatos y consultar sus antecedentes',
    'Revisar y confirmar la recepción de informes',
  ],
  evaluador: [
    'Ver las solicitudes que tienes asignadas',
    'Agendar entrevistas y registrar su realización',
    'Redactar, guardar y enviar informes',
  ],
  jefatura: [
    'Supervisar indicadores y resultados del proceso',
    'Consultar solicitudes y carga de trabajo',
    'Exportar el listado de solicitudes a CSV',
  ],
}

const AuthContext = createContext(null)

async function obtenerPerfil(userId) {
  const { data, error } = await supabase
    .from('perfiles')
    .select('id, nombre, correo, rol, activo')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  if (!data || !data.activo) {
    await supabase.auth.signOut()
    throw new Error('Tu usuario no tiene un perfil activo. Contacta a Jefatura.')
  }

  return {
    id: data.id,
    nombre: data.nombre,
    correo: data.correo,
    rol: data.rol,
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    let activo = true

    const iniciar = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        if (activo) setCargando(false)
        return
      }

      if (data.session?.user) {
        try {
          const perfil = await obtenerPerfil(data.session.user.id)
          if (activo) setUsuario(perfil)
        } catch (err) {
          console.error('No fue posible cargar el perfil:', err.message)
          if (activo) setUsuario(null)
        }
      }
      if (activo) setCargando(false)
    }

    iniciar()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUsuario(null)
        setCargando(false)
        return
      }
      // La consulta se difiere para evitar bloquear el ciclo interno de Auth.
      Promise.resolve().then(async () => {
        try {
          const perfil = await obtenerPerfil(session.user.id)
          if (activo) setUsuario(perfil)
        } catch (err) {
          console.error('No fue posible cargar el perfil:', err.message)
          if (activo) setUsuario(null)
        } finally {
          if (activo) setCargando(false)
        }
      })
    })

    return () => {
      activo = false
      listener.subscription.unsubscribe()
    }
  }, [])

  const login = async (correo, clave) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: correo.trim(),
      password: clave,
    })
    if (error) throw error
    const perfil = await obtenerPerfil(data.user.id)
    setUsuario(perfil)
    return perfil
  }

  const logout = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUsuario(null)
  }

  const can = (permiso) => !!usuario && tienePermiso(usuario.rol, permiso)

  return (
    <AuthContext.Provider value={{
      usuario,
      cargando,
      login,
      logout,
      can,
      etiquetaRol: usuario ? ROLES[usuario.rol] ?? usuario.rol : '',
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
