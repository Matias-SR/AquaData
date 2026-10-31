// Indicador simple del dashboard. Props: titulo, valor y detalle opcional.
export default function StatCard({ titulo, valor, detalle }) {
  return (
    <div className="stat h-100">
      <div className="stat-valor">{valor}</div>
      <div className="stat-titulo">{titulo}</div>
      {detalle && <div className="stat-detalle">{detalle}</div>}
    </div>
  )
}
