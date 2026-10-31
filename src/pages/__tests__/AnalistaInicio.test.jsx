import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import AnalistaInicio from '../inicio/AnalistaInicio.jsx'

const CANDIDATOS = { 1: { nombre: 'Postulante Listo', rut: '11.111.111-1' }, 2: { nombre: 'Postulante en Curso', rut: '22.222.222-2' }, 3: { nombre: 'Postulante Ajeno', rut: '33.333.333-3' } }
const { datos } = vi.hoisted(() => ({ datos: { solicitudes: [] } }))
vi.mock('../../context/DataContext.jsx', () => ({ useData: () => ({ ...datos, candidatoPorId: (id) => CANDIDATOS[id] }) }))
vi.mock('../../context/AuthContext.jsx', () => ({ useAuth: () => ({ usuario: { id: 'an-1', nombre: 'Analista de Prueba', rol: 'analista' } }) }))

const SOLICITUDES = [
  { id: 1, candidatoId: 1, cargo: 'Operador', familiaCargo: 'Técnico A', creadaPorId: 'an-1', fechaSolicitud: '2026-10-01', estado: 'Informe enviado', informeRecibido: false, responsable: 'Evaluador A' },
  { id: 2, candidatoId: 2, cargo: 'Supervisor', familiaCargo: 'Supervisor B', creadaPorId: 'an-1', fechaSolicitud: '2026-10-05', estado: 'Entrevista agendada', responsable: 'Evaluador B' },
  { id: 3, candidatoId: 3, cargo: 'Jefe', familiaCargo: 'Jefatura', creadaPorId: 'an-2', fechaSolicitud: '2026-10-06', estado: 'Evaluación recibida', responsable: 'Evaluador A' },
]

function renderInicio() {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AnalistaInicio />
    </MemoryRouter>,
  )
}

describe('Inicio del analista', () => {
  beforeEach(() => { datos.solicitudes = SOLICITUDES })

  it('muestra solo las solicitudes creadas por el analista, de la más reciente a la más antigua', () => {
    renderInicio()
    const filas = screen.getAllByRole('row').slice(1)
    expect(filas.map((f) => within(f).getByRole('link').textContent)).toEqual(['Postulante en Curso', 'Postulante Listo'])
    expect(screen.queryByText('Postulante Ajeno')).toBeNull()
  })

  it('avisa de los informes listos para revisar con un enlace a cada uno', () => {
    renderInicio()
    const aviso = screen.getByRole('alert')
    expect(aviso).toHaveTextContent('Tienes 1 informe listo para revisar')
    expect(within(aviso).getByRole('link', { name: 'Postulante Listo' })).toHaveAttribute('href', '/solicitudes/1')
  })

  it('no muestra el aviso cuando los informes ya fueron recibidos', () => {
    datos.solicitudes = [{ ...SOLICITUDES[0], informeRecibido: true }]
    renderInicio()
    expect(screen.queryByRole('alert')).toBeNull()
  })

  it('invita a crear la primera solicitud cuando aún no tiene ninguna', () => {
    datos.solicitudes = [SOLICITUDES[2]]
    renderInicio()
    expect(screen.getByText('Aún no has creado solicitudes')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Nueva solicitud' })).toHaveAttribute('href', '/solicitudes/nueva')
  })
})
