import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import JefaturaInicio from '../inicio/JefaturaInicio.jsx'

const { datos } = vi.hoisted(() => ({ datos: { candidatos: [], solicitudes: [] } }))
vi.mock('../../context/DataContext.jsx', () => ({ useData: () => datos }))

const SOLICITUDES = [
  { id: 1, estado: 'Informe enviado', familiaCargo: 'Técnico A', responsable: 'Evaluador A', fechaSolicitud: '2026-09-01', fechaEnvio: '2026-09-07', informe: { categoria: 'Recomendado' } },
  { id: 2, estado: 'Informe enviado', familiaCargo: 'Técnico A', responsable: 'Evaluador B', fechaSolicitud: '2026-09-03', fechaEnvio: '2026-09-12', informe: { categoria: 'No recomendado' } },
  { id: 3, estado: 'Entrevista agendada', familiaCargo: 'Jefatura', responsable: 'Evaluador A', fechaSolicitud: '2026-09-10', informe: null },
  { id: 4, estado: 'Evaluación recibida', familiaCargo: 'Técnico A', responsable: 'Evaluador A', fechaSolicitud: '2026-09-12', informe: null },
]

function renderIndicadores() {
  render(
    <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <JefaturaInicio />
    </MemoryRouter>,
  )
}

const tarjeta = (titulo) => screen.getByText(titulo).closest('.stat')
const seccion = (titulo) => screen.getByRole('heading', { name: titulo }).closest('section')
const barras = (titulo) =>
  [...seccion(titulo).querySelectorAll('.barra-fila')].map((fila) => [
    fila.querySelector('.barra-etiqueta').textContent,
    fila.querySelector('.barra-valor').textContent,
  ])

describe('Indicadores de Jefatura', () => {
  beforeEach(() => {
    datos.candidatos = [{ id: 10 }, { id: 20 }, { id: 30 }]
    datos.solicitudes = SOLICITUDES
  })

  it('muestra los totales del proceso en las tarjetas de indicadores', () => {
    renderIndicadores()
    expect(within(tarjeta('Solicitudes en total')).getByText('4')).toBeInTheDocument()
    expect(within(tarjeta('Solicitudes en total')).getByText('3 candidatos registrados')).toBeInTheDocument()
    expect(within(tarjeta('En curso')).getByText('2')).toBeInTheDocument()
    expect(within(tarjeta('Informes enviados')).getByText('2')).toBeInTheDocument()
    // (6 + 9) / 2 días desde la solicitud hasta el envío
    expect(within(tarjeta('Días promedio hasta el informe')).getByText('7.5')).toBeInTheDocument()
  })

  it('cuenta las solicitudes de cada etapa, incluidas las que no tienen ninguna', () => {
    renderIndicadores()
    const conteo = Object.fromEntries(
      within(seccion('Solicitudes por etapa')).getAllByRole('listitem').map((li) => [
        li.querySelector('.estado-badge').textContent,
        li.querySelector('strong').textContent,
      ]),
    )
    expect(conteo).toEqual({
      'Evaluación recibida': '1',
      'Entrevista agendada': '1',
      'Entrevista realizada': '0',
      'Informe enviado': '2',
    })
  })

  it('muestra la carga actual por evaluador considerando solo las evaluaciones en curso', () => {
    renderIndicadores()
    expect(barras('Carga actual por evaluador')).toEqual([['Evaluador A', '2']])
  })

  it('muestra las barras por familia de cargo y por resultado del informe', () => {
    renderIndicadores()
    expect(barras('Solicitudes por familia de cargo')).toEqual([['Técnico A', '3'], ['Jefatura', '1']])
    expect(barras('Resultado de los informes')).toEqual([['Recomendado', '1'], ['No recomendado', '1']])
  })

  it('muestra estados vacíos y un guion en el promedio cuando no hay solicitudes', () => {
    datos.candidatos = []
    datos.solicitudes = []
    renderIndicadores()

    expect(within(tarjeta('Solicitudes en total')).getByText('0')).toBeInTheDocument()
    expect(within(tarjeta('Días promedio hasta el informe')).getByText('—')).toBeInTheDocument()
    expect(within(seccion('Carga actual por evaluador')).getByText('No hay evaluaciones en curso.')).toBeInTheDocument()
    expect(within(seccion('Solicitudes por familia de cargo')).getByText('Aún no hay datos.')).toBeInTheDocument()
    expect(within(seccion('Resultado de los informes')).getByText('Aún no hay informes con categoría.')).toBeInTheDocument()
  })

  it('ofrece el enlace al listado de solicitudes para exportarlo', () => {
    renderIndicadores()
    expect(screen.getByRole('link', { name: /Ver y exportar/ })).toHaveAttribute('href', '/solicitudes')
  })
})
