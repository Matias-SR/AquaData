import { afterEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import AppLayout from '../AppLayout.jsx'

vi.mock('../../context/AuthContext.jsx', () => ({
  useAuth: () => ({ usuario: { id: 'a1', nombre: 'Analista de Prueba', rol: 'analista' }, etiquetaRol: 'Analista de Reclutamiento', logout: vi.fn() }),
}))
vi.mock('../../context/DataContext.jsx', () => ({ useData: () => ({ error: '', loading: false }) }))

function renderLayout() {
  render(
    <MemoryRouter initialEntries={['/']} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<p>Página de inicio</p>} />
          <Route path="candidatos" element={<p>Página de candidatos</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  )
  return userEvent.setup()
}

const botonMenu = () => screen.getByRole('button', { name: 'Abrir menú' })
const menu = () => screen.getByRole('complementary')

async function abrirMenu(usuario) {
  await usuario.click(screen.getByRole('button', { name: 'Abrir menú' }))
}

describe('Menú lateral en móvil', () => {
  afterEach(() => { document.body.style.overflow = '' })

  it('al abrirse muestra el fondo oscuro, bloquea el scroll de la página y lleva el foco al botón de cierre', async () => {
    const usuario = renderLayout()
    expect(screen.queryByTestId('fondo-menu')).toBeNull()

    await abrirMenu(usuario)

    expect(menu()).toHaveClass('open')
    expect(screen.getByTestId('fondo-menu')).toBeInTheDocument()
    expect(document.body.style.overflow).toBe('hidden')
    expect(screen.getByRole('button', { name: 'Cerrar menú', expanded: true })).toHaveAttribute('aria-controls', 'menu-lateral')
    expect(within(menu()).getByRole('button', { name: 'Cerrar menú' })).toHaveFocus()
  })

  it('se cierra al apretar Escape, libera el scroll y devuelve el foco al botón Menú', async () => {
    const usuario = renderLayout()
    await abrirMenu(usuario)

    await usuario.keyboard('{Escape}')

    expect(menu()).not.toHaveClass('open')
    expect(screen.queryByTestId('fondo-menu')).toBeNull()
    expect(document.body.style.overflow).toBe('')
    expect(botonMenu()).toHaveFocus()
    expect(botonMenu()).toHaveAttribute('aria-expanded', 'false')
  })

  it('se cierra al tocar el fondo oscuro', async () => {
    const usuario = renderLayout()
    await abrirMenu(usuario)

    await usuario.click(screen.getByTestId('fondo-menu'))

    expect(menu()).not.toHaveClass('open')
    expect(document.body.style.overflow).toBe('')
  })

  it('se cierra con el botón de cierre dentro del menú', async () => {
    const usuario = renderLayout()
    await abrirMenu(usuario)

    await usuario.click(within(menu()).getByRole('button', { name: 'Cerrar menú' }))

    expect(menu()).not.toHaveClass('open')
  })

  it('se cierra al navegar a otra página desde el menú', async () => {
    const usuario = renderLayout()
    await abrirMenu(usuario)

    await usuario.click(within(menu()).getByRole('link', { name: 'Candidatos' }))

    expect(screen.getByText('Página de candidatos')).toBeInTheDocument()
    expect(menu()).not.toHaveClass('open')
    expect(screen.queryByTestId('fondo-menu')).toBeNull()
  })

  it('muestra solo las opciones del rol que inició sesión', () => {
    renderLayout()
    const enlaces = within(menu()).getAllByRole('link').map((a) => a.textContent)
    expect(enlaces).toEqual(['Mis solicitudes', 'Nueva solicitud', 'Candidatos', 'Todas las solicitudes'])
  })
})
