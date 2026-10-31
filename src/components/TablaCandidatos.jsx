export default function TablaCandidatos() {
  const candidatos = [
    { id: 1, nombre: "Juan Pérez", cargo: "Operador de Planta", estado: "Apto", fecha: "2026-09-20" },
    { id: 2, nombre: "María González", cargo: "Jefa de Turno", estado: "Pendiente", fecha: "2026-09-22" },
    { id: 3, nombre: "Carlos Silva", cargo: "Técnico Mantenimiento", estado: "No Apto", fecha: "2026-09-25" },
  ];

  return (
    <div className="card shadow-sm mt-4">
      <div className="card-header bg-white d-flex justify-content-between align-items-center py-3">
        <h5 className="mb-0 text-primary fw-bold">Candidatos en Evaluación</h5>
        <button className="btn btn-primary btn-sm">+ Nuevo Candidato</button>
      </div>
      <div className="card-body p-0">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Nombre</th>
                <th>Cargo Postulado</th>
                <th>Estado Evaluación</th>
                <th>Fecha Solicitud</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {candidatos.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td className="fw-semibold">{c.nombre}</td>
                  <td>{c.cargo}</td>
                  <td>
                    <span
                      className={`badge ${
                        c.estado === "Apto"
                          ? "bg-success"
                          : c.estado === "Pendiente"
                          ? "bg-warning text-dark"
                          : "bg-danger"
                      }`}
                    >
                      {c.estado}
                    </span>
                  </td>
                  <td>{c.fecha}</td>
                  <td className="text-center">
                    <button className="btn btn-outline-primary btn-sm me-2">Ver Detalle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}