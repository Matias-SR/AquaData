import { describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes, useParams } from 'react-router-dom'
import TablaSolicitudes from '../TablaSolicitudes.jsx'

const CANDIDATOS = {
  10: { id: 10, nombre: 'Postulante Uno', rut: '11.111.111-1' },
  20: { id: 20, nombre: 'Postulante Dos', rut: '22.222.222-2' },
}
vi.mock('../../context/DataContext.jsx', () => ({
  useData: () => ({ candidatoPorId: (id) => CANDIDATOS[id] }),
}))

const SOLICITUDES = [
  { id: 1, candidatoId: 10, cargo: 'Operador de Planta', familiaCargo: 'Operario Calificado', fechaSolicitud: '2026-10-01', responsable: 'Evaluador A', estado: 'Evaluación recibida' },
  { id: 2, candidatoId: 20, cargo: 'Jefe de Turno', familiaCargo: 'Jefatura', fechaSolicitud: '2026-10-03', responsable: 'Evaluador B', estado: 'Informe enviado', informeRecibido: true },
  { id: 3, candidatoId: 99, cargo: 'Técnico', familiaCargo: 'Técnico A', fechaSolicitud: '2026-10-05', responsable: 'Evaluador A', estado: 'Entrevista agendada' },
]

function DetalleSimulado() {
  const { id } = useParams()
  return <p>Detalle de la solicitud {id}</p>
}

function renderTabla(props) {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/" element={<TablaSolicitudes {...props} />} />
        <Route path="/solicitudes/:id" element={<DetalleSimulado />} />
      </Routes>
    </MemoryRouter>,
  )
}

const filas = () => screen.getAllByRole('row').slice(1)

describe('TablaSolicitudes', () => {
  it('renderiza una fila por solicitud con el postulante, el cargo y la etapa', () => {
    renderTabla({ solicitudes: SOLICITUDES })

    expect(filas()).toHaveLength(3)
    const primera = within(filas()[0])
    expect(primera.getByText('Postulante Uno')).toBeInTheDocument()
    expect(primera.getByText('11.111.111-1')).toBeInTheDocument()
    expect(primera.getByText('Operador de Planta')).toBeInTheDocument()
    expect(primera.getByText('Evaluación recibida')).toHaveClass('estado-badge', 'estado-recibida')
  })

  it('indica cuando el analista ya marcó el informe como recibido', () => {
    renderTabla({ solicitudes: SOLICITUDES })
    expect(within(filas()[1]).getByText('recibido')).toBeInTheDocument()
    expect(within(filas()[0]).queryByText('recibido')).toBeNull()
  })

  it('avisa cuando el postulante de la solicitud ya no está disponible', () => {
    renderTabla({ solicitudes: SOLICITUDES })
    expect(within(filas()[2]).getByText('Postulante no disponible')).toBeInTheDocument()
  })

  it('muestra la columna del evaluador responsable por defecto', () => {
    renderTabla({ solicitudes: SOLICITUDES })
    expect(screen.getByRole('columnheader', { name: 'Responsable' })).toBeInTheDocument()
    expect(screen.getAllByText('Evaluador A')).toHaveLength(2)
  })

  it('oculta la columna del evaluador cuando mostrarResponsable es false', () => {
    renderTabla({ solicitudes: SOLICITUDES, mostrarResponsable: false })
    expect(screen.queryByRole('columnheader', { name: 'Responsable' })).toBeNull()
    expect(screen.queryByText('Evaluador A')).toBeNull()
  })

  it('el nombre del postulante lleva al detalle de la solicitud', async () => {
    renderTabla({ solicitudes: SOLICITUDES })
    await userEvent.click(screen.getByRole('link', { name: 'Postulante Dos' }))
    expect(screen.getByText('Detalle de la solicitud 2')).toBeInTheDocument()
  })

  it('muestra el texto de estado vacío cuando no hay solicitudes', () => {
    renderTabla({ solicitudes: [], vacio: 'No hay solicitudes con esos criterios' })
    expect(screen.getByText('No hay solicitudes con esos criterios')).toBeInTheDocument()
    expect(screen.queryByRole('table')).toBeNull()
  })

  it('acepta un componente como estado vacío', () => {
    renderTabla({ solicitudes: [], vacio: <p>Crea la primera solicitud.</p> })
    expect(screen.getByText('Crea la primera solicitud.')).toBeInTheDocument()
  })
})
