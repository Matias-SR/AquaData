import { Link } from 'react-router-dom'
import { Alert, Button, Table } from 'react-bootstrap'
import { useData } from '../../context/DataContext.jsx'
import { useAuth } from '../../context/AuthContext.jsx'
import EstadoBadge from '../../components/EstadoBadge.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { formatearFecha } from '../../utils/estados.js'

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

      {mias.length === 0 ? (
        <EmptyState titulo="Aún no has creado solicitudes">Crea la primera con el botón Nueva solicitud.</EmptyState>
      ) : (
        <div className="table-responsive bloque p-0">
          <Table hover className="align-middle mb-0">
            <thead>
              <tr>
                <th>Candidato</th>
                <th>Cargo</th>
                <th>Evaluador</th>
                <th>Solicitada</th>
                <th>Etapa</th>
              </tr>
            </thead>
            <tbody>
              {mias.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link to={`/solicitudes/${s.id}`} className="fw-semibold">
                      {nombre(s)}
                    </Link>
                  </td>
                  <td>{s.cargo}</td>
                  <td>{s.responsable}</td>
                  <td>{formatearFecha(s.fechaSolicitud)}</td>
                  <td>
                    <EstadoBadge estado={s.estado} />
                    {s.estado === 'Informe enviado' && s.informeRecibido && <span className="small text-secondary ms-2">recibido</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      )}
    </>
  )
}
