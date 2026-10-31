import { Button } from 'react-bootstrap'
import { formatearFecha } from '../utils/estados.js'

// Informe consolidado, listo para revisar o imprimir.
export default function InformeVista({ informe, candidato, solicitud }) {
  return (
    <section className="bloque informe-vista">
      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
        <div>
          <h2 className="h5 mb-1">Informe psicolaboral</h2>
          <p className="text-secondary small mb-0">
            {candidato?.nombre} · {solicitud.cargo} · {solicitud.familiaCargo}
          </p>
          <p className="text-secondary small mb-0">
            Evaluado el {formatearFecha(informe.fecha)} por {solicitud.responsable} · Plantilla {solicitud.plantillaInforme}
          </p>
        </div>
        <Button variant="outline-secondary" size="sm" className="no-imprimir" onClick={() => window.print()}>
          Imprimir informe
        </Button>
      </div>

      <p className="mb-3">
        <strong>Categoría del evaluado:</strong> {informe.categoria || 'Sin definir'}
      </p>

      {informe.competencias.map((c) => (
        <div key={c.nombre} className="informe-seccion">
          <h3 className="h6">{c.nombre}</h3>
          <dl className="datos mb-0">
            <dt>Criterio</dt>
            <dd>{c.criterio || '—'}</dd>
            <dt>Fortalezas</dt>
            <dd>{c.fortalezas || '—'}</dd>
            <dt>Oportunidades de desarrollo</dt>
            <dd>{c.oportunidades || '—'}</dd>
          </dl>
        </div>
      ))}

      <div className="informe-seccion">
        <h3 className="h6">Conclusión general</h3>
        <p className="mb-0">{informe.conclusion || '—'}</p>
      </div>
    </section>
  )
}
