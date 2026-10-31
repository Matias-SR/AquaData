import { Link, Navigate } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext.jsx'
import EmptyState from './EmptyState.jsx'

export default function ProtectedRoute({ children, permiso }) {
  const { usuario, can, cargando } = useAuth()
  if (cargando) return <div className="d-flex justify-content-center p-5"><Spinner animation="border" role="status" /></div>
  if (!usuario) return <Navigate to="/login" replace />
  if (permiso && !can(permiso)) {
    return (
      <EmptyState titulo="No tienes acceso a esta sección">
        Tu rol no permite ver esta página. <Link to="/">Volver al inicio</Link>.
      </EmptyState>
    )
  }
  return children
}
