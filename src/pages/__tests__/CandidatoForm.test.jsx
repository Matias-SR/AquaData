import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import CandidatoForm from '../CandidatoForm.jsx'

// El formulario nunca debe tocar la base real: se reemplazan Supabase y el contexto de datos.
vi.mock('../../lib/supabaseClient.js', () => ({ supabase: {} }))

const { agregarCandidato } = vi.hoisted(() => ({ agregarCandidato: vi.fn() }))
vi.mock('../../context/DataContext.jsx', () => ({
  useData: () => ({
    candidatoPorId: () => null,
    agregarCandidato,
    actualizarCandidato: vi.fn(),
  }),
}))

function renderFormulario() {
  render(
    <MemoryRouter initialEntries={['/candidatos/nuevo']}>
      <Routes>
        <Route path="/candidatos/nuevo" element={<CandidatoForm />} />
        <Route path="/candidatos" element={<p>Listado de postulantes</p>} />
      </Routes>
    </MemoryRouter>,
  )
  return userEvent.setup()
}

describe('CandidatoForm', () => {
  beforeEach(() => agregarCandidato.mockReset())

  it('muestra los mensajes de error y no guarda cuando se envía vacío', async () => {
    const usuario = renderFormulario()
    await usuario.click(screen.getByRole('button', { name: 'Registrar postulante' }))

    expect(screen.getByText(/Ingresa un RUT válido/)).toBeInTheDocument()
    expect(screen.getByText(/Ingresa el nombre completo/)).toBeInTheDocument()
    expect(screen.getByText(/Ingresa un correo válido/)).toBeInTheDocument()
    expect(screen.getByText(/Usa un celular chileno/)).toBeInTheDocument()
    expect(screen.getByText(/Indica el cargo al que postula/)).toBeInTheDocument()
    expect(screen.getByText(/Selecciona la familia de cargo/)).toBeInTheDocument()
    expect(screen.getByLabelText('RUT')).toHaveClass('is-invalid')
    expect(agregarCandidato).not.toHaveBeenCalled()
  })

  it('rechaza un RUT con dígito verificador incorrecto aunque el resto esté completo', async () => {
    const usuario = renderFormulario()
    await usuario.type(screen.getByLabelText('RUT'), '12.345.678-9')
    await usuario.type(screen.getByLabelText('Nombre completo'), 'Postulante de Prueba')
    await usuario.type(screen.getByLabelText('Correo electrónico'), 'postulante@ejemplo.cl')
    await usuario.type(screen.getByLabelText('Teléfono'), '+56 9 1234 5678')
    await usuario.type(screen.getByLabelText('Cargo al que postula'), 'Operador de Planta')
    await usuario.selectOptions(screen.getByLabelText('Familia de cargo'), 'Operario Calificado')
    await usuario.click(screen.getByRole('button', { name: 'Registrar postulante' }))

    expect(screen.getByText(/Ingresa un RUT válido/)).toBeInTheDocument()
    expect(screen.getByLabelText('RUT')).toHaveClass('is-invalid')
    expect(screen.getByLabelText('Nombre completo')).not.toHaveClass('is-invalid')
    expect(agregarCandidato).not.toHaveBeenCalled()
  })

  it('registra al postulante y vuelve al listado cuando los datos son válidos', async () => {
    agregarCandidato.mockResolvedValue({ id: 1 })
    const usuario = renderFormulario()
    await usuario.type(screen.getByLabelText('RUT'), '12.345.678-5')
    await usuario.type(screen.getByLabelText('Nombre completo'), 'Postulante de Prueba')
    await usuario.type(screen.getByLabelText('Correo electrónico'), 'postulante@ejemplo.cl')
    await usuario.type(screen.getByLabelText('Teléfono'), '+56 9 1234 5678')
    await usuario.type(screen.getByLabelText('Cargo al que postula'), 'Operador de Planta')
    await usuario.selectOptions(screen.getByLabelText('Familia de cargo'), 'Operario Calificado')
    await usuario.click(screen.getByRole('button', { name: 'Registrar postulante' }))

    expect(agregarCandidato).toHaveBeenCalledWith(expect.objectContaining({ rut: '12.345.678-5', familiaCargo: 'Operario Calificado' }))
    expect(await screen.findByText('Listado de postulantes')).toBeInTheDocument()
  })
})
