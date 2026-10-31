import { ESTADO_CLASE } from '../utils/estados.js'

export default function EstadoBadge({ estado }) {
  return <span className={`estado-badge ${ESTADO_CLASE[estado] ?? ''}`}>{estado}</span>
}
