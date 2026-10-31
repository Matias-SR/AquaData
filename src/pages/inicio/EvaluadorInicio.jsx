import { Link } from 'react-router-dom'
import { useData } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import { ESTADOS, ESTADO_CLASE, formatearFecha } from '../../utils/estados.js'
import { siguienteAccionEvaluador } from '../../utils/flujo.js'

// Tablero por etapa, igual al Planner que usan hoy, pero solo con las solicitudes asignadas al evaluador.
export default function EvaluadorInicio() {
  const { usuario } = useAuth()
  const { solicitudes, candidatoPorId } = useData()
  const mias = solicitudes.filter((s) => s.responsableId === usuario.id)
  const pendientes = mias.filter((s) => s.estado !== 'Informe enviado').length

  return (
    <>
      <div className="mb-4">
        <h1 className="h3 mb-1">Mi bandeja</h1>
        <p className="text-secondary mb-0">
          {pendientes === 0 ? 'No tienes evaluaciones pendientes.' : `Tienes ${pendientes} evaluaciones en curso.`}
        </p>
      </div>

      <div className="tablero">
        {ESTADOS.map((estado) => {
          const tarjetas = mias
            .filter((s) => s.estado === estado)
            .sort((a, b) => a.fechaSolicitud.localeCompare(b.fechaSolicitud))
          return (
            <section key={estado} className="columna" aria-label={estado}>
              <h2 className={`columna-titulo ${ESTADO_CLASE[estado]}`}>
                {estado} <span className="columna-cuenta">{tarjetas.length}</span>
              </h2>
              {tarjetas.length === 0 && <p className="small text-secondary px-1">Sin solicitudes.</p>}
              {tarjetas.map((s) => (
                <Link key={s.id} to={`/solicitudes/${s.id}`} className="tarjeta">
                  <span className="fw-semibold">{candidatoPorId(s.candidatoId)?.nombre ?? 'Candidato eliminado'}</span>
                  <span className="small text-secondary">{s.cargo}</span>
                  {s.entrevista && s.estado === 'Entrevista agendada' && (
                    <span className="small">
                      Entrevista: {formatearFecha(s.entrevista.fecha)} · {s.entrevista.hora}
                    </span>
                  )}
                  <span className="tarjeta-accion">{siguienteAccionEvaluador(s.estado)}</span>
                </Link>
              ))}
            </section>
          )
        })}
      </div>
    </>
  )
}
