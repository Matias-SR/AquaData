// Barras horizontales simples. filas: [{ etiqueta, total }]
export default function Barras({ filas, vacio = 'Aún no hay datos.' }) {
  if (filas.length === 0) return <p className="text-secondary mb-0">{vacio}</p>
  const maximo = Math.max(1, ...filas.map((f) => f.total))
  return filas.map((f) => (
    <div key={f.etiqueta} className="barra-fila">
      <span className="barra-etiqueta">{f.etiqueta}</span>
      <div className="barra-pista">
        <div className="barra-relleno" style={{ width: `${(f.total / maximo) * 100}%` }} />
      </div>
      <span className="barra-valor">{f.total}</span>
    </div>
  ))
}
