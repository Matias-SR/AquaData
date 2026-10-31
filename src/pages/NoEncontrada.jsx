import { Link } from 'react-router-dom'
import EmptyState from '../components/EmptyState.jsx'

export default function NoEncontrada() {
  return (
    <>
      <h1 className="h3 mb-3">Página no encontrada</h1>
      <EmptyState titulo="No existe una página en esta dirección">
        Puede que el enlace esté mal escrito o que la página haya cambiado de lugar.{' '}
        <Link to="/">Volver al inicio</Link>.
      </EmptyState>
    </>
  )
}
