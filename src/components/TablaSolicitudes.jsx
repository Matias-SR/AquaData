import { isValidElement } from 'react'
import { Link } from 'react-router-dom'
import { Table } from 'react-bootstrap'
import { useData } from '../context/DataContext.jsx'
import EstadoBadge from './EstadoBadge.jsx'
import EmptyState from './EmptyState.jsx'
import { formatearFecha } from '../utils/estados.js'

// Tabla de solicitudes usada en el listado general y en el inicio del analista.
// Props: solicitudes (arreglo, ya filtrado y ordenado), mostrarResponsable (por defecto true)
// y vacio (texto o componente que se muestra cuando no hay filas).
export default function TablaSolicitudes({ solicitudes, mostrarResponsable = true, vacio = 'No hay solicitudes para mostrar.' }) {
  const { candidatoPorId } = useData()

  if (solicitudes.length === 0) return isValidElement(vacio) ? vacio : <EmptyState titulo={vacio} />

  return (
    <div className="table-responsive bloque p-0">
      <Table hover className="align-middle mb-0">
        <thead>
          <tr>
            <th>Postulante</th>
            <th>RUT</th>
            <th>Cargo</th>
            <th>Familia</th>
            <th>Solicitada</th>
            {mostrarResponsable && <th>Responsable</th>}
            <th>Etapa</th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.map((s) => {
            const candidato = candidatoPorId(s.candidatoId)
            return (
              <tr key={s.id}>
                <td>
                  <Link to={`/solicitudes/${s.id}`} className="fw-semibold">
                    {candidato?.nombre ?? 'Postulante no disponible'}
                  </Link>
                </td>
                <td>{candidato?.rut ?? '—'}</td>
                <td>{s.cargo}</td>
                <td>{s.familiaCargo}</td>
                <td>{formatearFecha(s.fechaSolicitud)}</td>
                {mostrarResponsable && <td>{s.responsable}</td>}
                <td>
                  <EstadoBadge estado={s.estado} />
                  {s.estado === 'Informe enviado' && s.informeRecibido && <span className="small text-secondary ms-2">recibido</span>}
                </td>
              </tr>
            )
          })}
        </tbody>
      </Table>
    </div>
  )
}
