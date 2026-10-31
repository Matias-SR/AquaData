import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from '../AuthContext.jsx'

// Supabase Auth y la tabla perfiles se simulan; nunca se conecta a la base real.
const { auth, perfil, eventos } = vi.hoisted(() => ({
  auth: {
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
  perfil: { maybeSingle: vi.fn() },
  eventos: { avisar: null },
}))
vi.mock('../../lib/supabaseClient.js', () => {
  const consulta = { select: () => consulta, eq: () => consulta, maybeSingle: (...a) => perfil.maybeSingle(...a) }
  return { supabase: { auth, from: () => consulta } }
})

const PERFIL_ANALISTA = { id: 'u1', nombre: 'Analista de Prueba', correo: 'analista@ejemplo.cl', rol: 'analista', activo: true }

// Componente mínimo que muestra lo que AuthProvider entrega a la app.
function Sesion() {
  const { usuario, cargando, etiquetaRol, can, login, logout } = useAuth()
  const [error, setError] = useState('')
  if (cargando) return <p>Verificando sesión</p>
  return (
    <>
      <p>Usuario: {usuario?.nombre ?? 'ninguno'}</p>
      <p>Rol: {etiquetaRol || 'sin rol'}</p>
      <p>Puede ver postulantes: {can('candidatos:ver') ? 'sí' : 'no'}</p>
      <button type="button" onClick={() => login(' analista@ejemplo.cl ', 'clave').catch((e) => setError(e.message))}>Ingresar</button>
      <button type="button" onClick={() => logout()}>Salir</button>
      {error && <p>Error: {error}</p>}
    </>
  )
}

const renderSesion = () => render(<AuthProvider><Sesion /></AuthProvider>)

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    auth.onAuthStateChange.mockImplementation((avisar) => {
      eventos.avisar = avisar
      return { data: { subscription: { unsubscribe: vi.fn() } } }
    })
    auth.signOut.mockResolvedValue({ error: null })
    perfil.maybeSingle.mockResolvedValue({ data: PERFIL_ANALISTA, error: null })
  })
  afterEach(() => vi.restoreAllMocks())

  it('sin sesión iniciada termina de cargar sin usuario ni permisos', async () => {
    renderSesion()
    expect(await screen.findByText('Usuario: ninguno')).toBeInTheDocument()
    expect(screen.getByText('Puede ver postulantes: no')).toBeInTheDocument()
  })

  it('recupera la sesión guardada y carga el perfil con su rol y permisos', async () => {
    auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } }, error: null })
    renderSesion()
    expect(await screen.findByText('Usuario: Analista de Prueba')).toBeInTheDocument()
    expect(screen.getByText('Rol: Analista de Reclutamiento')).toBeInTheDocument()
    expect(screen.getByText('Puede ver postulantes: sí')).toBeInTheDocument()
  })

  it('cierra la sesión si el perfil está desactivado', async () => {
    auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } }, error: null })
    perfil.maybeSingle.mockResolvedValue({ data: { ...PERFIL_ANALISTA, activo: false }, error: null })
    renderSesion()
    expect(await screen.findByText('Usuario: ninguno')).toBeInTheDocument()
    expect(auth.signOut).toHaveBeenCalled()
  })

  it('inicia sesión con el correo sin espacios y carga el perfil', async () => {
    auth.signInWithPassword.mockResolvedValue({ data: { user: { id: 'u1' } }, error: null })
    renderSesion()
    await screen.findByText('Usuario: ninguno')

    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Usuario: Analista de Prueba')).toBeInTheDocument()
    expect(auth.signInWithPassword).toHaveBeenCalledWith({ email: 'analista@ejemplo.cl', password: 'clave' })
  })

  it('informa el error cuando las credenciales son incorrectas', async () => {
    auth.signInWithPassword.mockResolvedValue({ data: {}, error: new Error('Invalid login credentials') })
    renderSesion()
    await screen.findByText('Usuario: ninguno')

    await userEvent.click(screen.getByRole('button', { name: 'Ingresar' }))

    expect(await screen.findByText('Error: Invalid login credentials')).toBeInTheDocument()
    expect(screen.getByText('Usuario: ninguno')).toBeInTheDocument()
  })

  it('cierra la sesión del usuario al salir', async () => {
    auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'u1' } } }, error: null })
    renderSesion()
    await screen.findByText('Usuario: Analista de Prueba')

    await userEvent.click(screen.getByRole('button', { name: 'Salir' }))

    expect(await screen.findByText('Usuario: ninguno')).toBeInTheDocument()
    expect(auth.signOut).toHaveBeenCalled()
  })

  it('reacciona a los cambios de sesión que avisa Supabase', async () => {
    renderSesion()
    await screen.findByText('Usuario: ninguno')

    await act(async () => { eventos.avisar('SIGNED_IN', { user: { id: 'u1' } }) })
    expect(await screen.findByText('Usuario: Analista de Prueba')).toBeInTheDocument()

    await act(async () => { eventos.avisar('SIGNED_OUT', null) })
    expect(await screen.findByText('Usuario: ninguno')).toBeInTheDocument()
  })
})
