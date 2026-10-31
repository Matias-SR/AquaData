import { Link } from 'react-router-dom'
import { Alert, Button } from 'react-bootstrap'
import { useData } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import TablaSolicitudes from '../../components/TablaSolicitudes.jsx'

export default function AnalistaInicio() {
  const { usuario } = useAuth()
  const { solicitudes, candidatoPorId } = useData()

  const mias = solicitudes
    .filter((s) => s.creadaPorId === usuario.id)
    .sort((a, b) => b.fechaSolicitud.localeCompare(a.fechaSolicitud))
  const listos = mias.filter((s) => s.estado === 'Informe enviado' && !s.informeRecibido)
  const nombre = (s) => candidatoPorId(s.candidatoId)?.nombre ?? 'Candidato eliminado'

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="h3 mb-1">Mis solicitudes</h1>
          <p className="text-secondary mb-0">Las evaluaciones que pediste, {usuario.nombre.split(' ')[0]}.</p>
        </div>
        <Button as={Link} to="/solicitudes/nueva">
          Nueva solicitud
        </Button>
      </div>

      {listos.length > 0 && (
        <Alert variant="success">
          <p className="fw-semibold mb-1">
            {listos.length === 1 ? 'Tienes 1 informe listo' : `Tienes ${listos.length} informes listos`} para revisar
          </p>
          <ul className="mb-0 ps-3">
            {listos.map((s) => (
              <li key={s.id}>
                <Link to={`/solicitudes/${s.id}`}>{nombre(s)}</Link> · {s.cargo}
              </li>
            ))}
          </ul>
        </Alert>
      )}

      <TablaSolicitudes
        solicitudes={mias}
        vacio={<EmptyState titulo="Aún no has creado solicitudes">Crea la primera con el botón Nueva solicitud.</EmptyState>}
      />
    </>
  )
}
