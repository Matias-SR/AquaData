import { Link } from 'react-router-dom'
import { Col, Row } from 'react-bootstrap'
import { useData } from '../../context/DataContext.jsx'
import StatCard from '../../components/StatCard.jsx'
import Barras from '../../components/Barras.jsx'
import EstadoBadge from '../../components/EstadoBadge.jsx'
import { ESTADOS } from '../../utils/estados.js'
import { contarPor, promedioDiasHastaInforme } from '../../utils/indicadores.js'

export default function JefaturaInicio() {
  const { candidatos, solicitudes } = useData()

  const enviadas = solicitudes.filter((s) => s.estado === 'Informe enviado').length
  const promedio = promedioDiasHastaInforme(solicitudes)
  const porEstado = ESTADOS.map((e) => ({ estado: e, total: solicitudes.filter((s) => s.estado === e).length }))
  const porEvaluador = contarPor(solicitudes.filter((s) => s.estado !== 'Informe enviado'), (s) => s.responsable)
  const porFamilia = contarPor(solicitudes, (s) => s.familiaCargo)
  const porCategoria = contarPor(solicitudes, (s) => s.informe?.categoria)

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 mb-1">Indicadores del proceso</h1>
        <p className="text-secondary mb-0">Vista de lectura para seguir la gestión de evaluaciones.</p>
      </div>

      <Row className="g-3 mb-4">
        <Col xs={6} lg={3}>
          <StatCard titulo="Solicitudes en total" valor={solicitudes.length} detalle={`${candidatos.length} candidatos registrados`} />
        </Col>
        <Col xs={6} lg={3}>
          <StatCard titulo="En curso" valor={solicitudes.length - enviadas} />
        </Col>
        <Col xs={6} lg={3}>
          <StatCard titulo="Informes enviados" valor={enviadas} />
        </Col>
        <Col xs={6} lg={3}>
          <StatCard titulo="Días promedio hasta el informe" valor={promedio ?? '—'} detalle="Desde la solicitud al envío" />
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={4}>
          <section className="bloque h-100">
            <h2 className="h6 mb-3">Solicitudes por etapa</h2>
            <ul className="list-unstyled mb-0">
              {porEstado.map((p) => (
                <li key={p.estado} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                  <EstadoBadge estado={p.estado} />
                  <strong>{p.total}</strong>
                </li>
              ))}
            </ul>
          </section>
        </Col>
        <Col lg={8}>
          <section className="bloque h-100">
            <h2 className="h6 mb-3">Carga actual por evaluador</h2>
            <Barras filas={porEvaluador} vacio="No hay evaluaciones en curso." />
          </section>
        </Col>
        <Col lg={6}>
          <section className="bloque h-100">
            <h2 className="h6 mb-3">Solicitudes por familia de cargo</h2>
            <Barras filas={porFamilia} />
          </section>
        </Col>
        <Col lg={6}>
          <section className="bloque h-100">
            <h2 className="h6 mb-3">Resultado de los informes</h2>
            <Barras filas={porCategoria} vacio="Aún no hay informes con categoría." />
          </section>
        </Col>
      </Row>

      <p className="mt-4 mb-0">
        <Link to="/solicitudes">Ver y exportar el listado de solicitudes</Link>
      </p>
    </>
  )
}
