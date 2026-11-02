import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import EvaluadorInicio from '../inicio/EvaluadorInicio.jsx'

const CANDIDATOS = {
  1: { nombre: 'Postulante Recibido' },
  2: { nombre: 'Postulante Agendado' },
  3: { nombre: 'Postulante Enviado' },
  4: { nombre: 'Postulante de Otro Evaluador' },
}
const { datos } = vi.hoisted(() => ({ datos: { solicitudes: [] } }))
vi.mock('../../context/DataContext.jsx', () => ({
  useData: () => ({ ...datos, candidatoPorId: (id) => CANDIDATOS[id] }),
}))
vi.mock('../../context/AuthContext.jsx', () => ({ useAuth: () => ({ usuario: { id: 'ev-1', rol: 'evaluador' } }) }))

const SOLICITUDES = [
  { id: 11, candidatoId: 1, cargo: 'Operador de Planta', estado: 'Evaluación recibida', responsableId: 'ev-1', fechaSolicitud: '2026-10-01', entrevista: null },
  { id: 12, candidatoId: 2, cargo: 'Jefe de Turno', estado: 'Entrevista agendada', responsableId: 'ev-1', fechaSolicitud: '2026-10-02', entrevista: { fecha: '2026-10-09', hora: '15:00:00' } },
  { id: 13, candidatoId: 3, cargo: 'Técnico Mantención', estado: 'Informe enviado', responsableId: 'ev-1', fechaSolicitud: '2026-09-20', entrevista: { fecha: '2026-09-25', hora: '10:00:00' } },
  { id: 14, candidatoId: 4, cargo: 'Supervisor', estado: 'Evaluación recibida', responsableId: 'ev-2', fechaSolicitud: '2026-10-03', entrevista: null },
]

function renderBandeja() {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <EvaluadorInicio />
    </MemoryRouter>,
  )
}

const columna = (estado) => screen.getByRole('region', { name: estado })

describe('Bandeja del evaluador', () => {
  beforeEach(() => { datos.solicitudes = SOLICITUDES })

  it('muestra solo las solicitudes asignadas al evaluador que inició sesión', () => {
    renderBandeja()
    expect(screen.getByText('Postulante Recibido')).toBeInTheDocument()
    expect(screen.queryByText('Postulante de Otro Evaluador')).toBeNull()
    expect(screen.getByText('Tienes 2 evaluaciones en curso.')).toBeInTheDocument()
  })

  it('ubica cada solicitud en la columna de su etapa con la acción siguiente', () => {
    renderBandeja()
    const recibida = within(columna('Evaluación recibida'))
    expect(recibida.getByText('Postulante Recibido')).toBeInTheDocument()
    expect(recibida.getByText('Agendar entrevista')).toBeInTheDocument()

    const agendada = within(columna('Entrevista agendada'))
    expect(agendada.getByText('Postulante Agendado')).toBeInTheDocument()
    expect(agendada.getByText('Registrar entrevista')).toBeInTheDocument()

    const enviada = within(columna('Informe enviado'))
    expect(enviada.getByText('Postulante Enviado')).toBeInTheDocument()
    expect(enviada.getByText('Ver informe')).toBeInTheDocument()
  })

  it('muestra la hora de la entrevista agendada sin segundos', () => {
    renderBandeja()
    const tarjeta = within(columna('Entrevista agendada')).getByRole('link')
    expect(tarjeta).toHaveTextContent(/Entrevista: .+ · 15:00(?!:)/)
    expect(tarjeta).not.toHaveTextContent('15:00:00')
  })

  it('indica las columnas sin solicitudes', () => {
    renderBandeja()
    expect(within(columna('Entrevista realizada')).getByText('Sin solicitudes.')).toBeInTheDocument()
  })

  it('cada tarjeta lleva al detalle de su solicitud', () => {
    renderBandeja()
    expect(within(columna('Evaluación recibida')).getByRole('link')).toHaveAttribute('href', '/solicitudes/11')
  })

  it('avisa cuando no hay evaluaciones pendientes', () => {
    datos.solicitudes = [SOLICITUDES[2]]
    renderBandeja()
    expect(screen.getByText('No tienes evaluaciones pendientes.')).toBeInTheDocument()
  })
})
