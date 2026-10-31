import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import RolBanner from '../RolBanner.jsx'

vi.mock('../../context/AuthContext.jsx', () => ({
  RESUMEN_ROL: { evaluador: ['Ver las solicitudes que tienes asignadas', 'Redactar, guardar y enviar informes'] },
  useAuth: () => ({ usuario: { rol: 'evaluador' }, etiquetaRol: 'Profesional Evaluador' }),
}))

describe('RolBanner', () => {
  beforeEach(() => sessionStorage.clear())

  it('explica qué puede hacer el usuario según su rol', () => {
    render(<RolBanner />)
    expect(screen.getByText('Tu rol: Profesional Evaluador')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'Ver las solicitudes que tienes asignadas',
      'Redactar, guardar y enviar informes',
    ])
  })

  it('se oculta al cerrarlo y lo recuerda durante la sesión', async () => {
    const { unmount } = render(<RolBanner />)
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }))
    expect(screen.queryByText('Tu rol: Profesional Evaluador')).toBeNull()
    expect(sessionStorage.getItem('aquachile-rol-visto-evaluador')).toBe('1')

    unmount()
    render(<RolBanner />)
    expect(screen.queryByText('Tu rol: Profesional Evaluador')).toBeNull()
  })

  it('sigue funcionando si el navegador bloquea el almacenamiento de sesión', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('bloqueado') })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('bloqueado') })
    render(<RolBanner />)
    await userEvent.click(screen.getByRole('button', { name: 'Cerrar aviso' }))
    expect(screen.queryByText('Tu rol: Profesional Evaluador')).toBeNull()
    vi.restoreAllMocks()
  })
})
