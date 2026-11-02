import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import ProtectedRoute from '../ProtectedRoute.jsx'

// Se usa la tabla de permisos real (tienePermiso); solo se simula quién inició sesión.
const { sesion } = vi.hoisted(() => ({ sesion: { usuario: null, cargando: false } }))
vi.mock('../../lib/supabaseClient.js', () => ({ supabase: {} }))
vi.mock('../../context/AuthContext.jsx', async (importOriginal) => {
  const original = await importOriginal()
  return {
    ...original,
    useAuth: () => ({
      ...sesion,
      can: (permiso) => !!sesion.usuario && original.tienePermiso(sesion.usuario.rol, permiso),
    }),
  }
})

function entrarA(ruta) {
  render(
    <MemoryRouter initialEntries={[ruta]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/login" element={<p>Pantalla de login</p>} />
        <Route path="/" element={<p>Inicio</p>} />
        <Route path="/candidatos" element={<ProtectedRoute permiso="candidatos:ver"><p>Listado de postulantes</p></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute en /candidatos', () => {
  beforeEach(() => {
    sesion.usuario = null
    sesion.cargando = false
  })

  it('permite al analista ver el listado de postulantes', () => {
    sesion.usuario = { id: 'a1', rol: 'analista' }
    entrarA('/candidatos')
    expect(screen.getByText('Listado de postulantes')).toBeInTheDocument()
  })

  it.each(['evaluador', 'jefatura'])('muestra "No tienes acceso" al rol %s que entra por URL', (rol) => {
    sesion.usuario = { id: 'x1', rol }
    entrarA('/candidatos')
    expect(screen.getByText('No tienes acceso a esta sección')).toBeInTheDocument()
    expect(screen.queryByText('Listado de postulantes')).toBeNull()
    expect(screen.getByRole('link', { name: 'Volver al inicio' })).toHaveAttribute('href', '/')
  })

  it('envía al login a quien no ha iniciado sesión', () => {
    entrarA('/candidatos')
    expect(screen.getByText('Pantalla de login')).toBeInTheDocument()
  })

  it('muestra un indicador de carga mientras se verifica la sesión', () => {
    sesion.cargando = true
    entrarA('/candidatos')
    expect(screen.getByRole('status')).toBeInTheDocument()
    expect(screen.queryByText('Listado de postulantes')).toBeNull()
  })
})
