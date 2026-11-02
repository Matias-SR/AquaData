import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Inicio from '../Inicio.jsx'

vi.mock('../../lib/supabaseClient.js', () => ({ supabase: {} }))
vi.mock('../../context/DataContext.jsx', () => ({ useData: () => ({ solicitudes: [], candidatos: [], candidatoPorId: () => null }) }))
vi.mock('../../context/AuthContext.jsx', () => ({
  RESUMEN_ROL: {},
  useAuth: () => ({ usuario: { id: 'u1', nombre: 'Usuario Sin Rol', rol: 'desconocido' }, etiquetaRol: 'desconocido' }),
}))

describe('Inicio', () => {
  it('muestra un aviso en vez de romper la pantalla cuando la cuenta no tiene un rol válido', () => {
    render(<Inicio />)
    expect(screen.getByText('Tu cuenta no tiene un rol asignado. Contacta a Jefatura.')).toBeInTheDocument()
  })
})
