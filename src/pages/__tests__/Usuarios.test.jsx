import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Usuarios from '../jefatura/Usuarios.jsx'

// Se simula la Edge Function "usuarios": nunca se llama a Supabase real.
const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }))
vi.mock('../../lib/supabaseClient.js', () => ({ supabase: { functions: { invoke } } }))
vi.mock('../../context/AuthContext.jsx', () => ({ useAuth: () => ({ usuario: { id: 'jefatura-1' } }) }))

const accionesEnviadas = () => invoke.mock.calls.map(([, { body }]) => body.action)

async function abrirCreacion() {
  render(<Usuarios />)
  const usuario = userEvent.setup()
  await screen.findByText('No se encontraron usuarios.')
  await usuario.click(screen.getByRole('button', { name: '+ Nuevo usuario' }))
  return { usuario, modal: await screen.findByRole('dialog') }
}

async function completarFormulario(usuario, modal) {
  await usuario.type(within(modal).getByLabelText('Nombre completo'), 'Usuario de Prueba')
  await usuario.type(within(modal).getByLabelText('Correo electrónico'), 'usuario@ejemplo.cl')
  await usuario.type(within(modal).getByLabelText('Contraseña inicial'), 'clave-segura')
  await usuario.click(within(modal).getByRole('button', { name: 'Crear usuario' }))
}

describe('Administración de usuarios: crear usuario', () => {
  beforeEach(() => {
    invoke.mockReset()
    invoke.mockResolvedValue({ data: { users: [] }, error: null })
  })

  it('muestra los mensajes de error propios y no llama a la función cuando el formulario está vacío', async () => {
    const { usuario, modal } = await abrirCreacion()
    await usuario.click(within(modal).getByRole('button', { name: 'Crear usuario' }))

    expect(within(modal).getByText(/Ingresa el nombre completo/)).toBeInTheDocument()
    expect(within(modal).getByText(/Ingresa un correo válido/)).toBeInTheDocument()
    expect(within(modal).getByText('La contraseña inicial debe tener al menos 8 caracteres.')).toBeInTheDocument()
    expect(within(modal).getByLabelText('Nombre completo')).toHaveClass('is-invalid')
    expect(accionesEnviadas()).not.toContain('create')
  })

  it('crea la cuenta y lo confirma cuando la función responde con éxito', async () => {
    const { usuario, modal } = await abrirCreacion()
    invoke.mockResolvedValueOnce({ data: { message: 'Usuario creado correctamente.', userId: 'nuevo' }, error: null })

    await completarFormulario(usuario, modal)

    expect(await screen.findByText(/El usuario se creó correctamente/)).toBeInTheDocument()
    expect(invoke).toHaveBeenCalledWith('usuarios', {
      body: expect.objectContaining({ action: 'create', correo: 'usuario@ejemplo.cl', rol: 'analista' }),
    })
  })

  it('muestra dentro del formulario el error que devuelve el servidor', async () => {
    const { usuario, modal } = await abrirCreacion()
    invoke.mockResolvedValueOnce({
      data: null,
      error: { message: 'Edge Function returned a non-2xx status code', context: { json: async () => ({ message: 'El correo ya está registrado.' }) } },
    })

    await completarFormulario(usuario, modal)

    expect(await within(modal).findByText('El correo ya está registrado.')).toBeInTheDocument()
    expect(screen.queryByText(/El usuario se creó correctamente/)).toBeNull()
  })
})
