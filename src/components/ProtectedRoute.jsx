import { Navigate } from 'react-router-dom'
import { Spinner } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext.jsx'

export default function ProtectedRoute({ children, permiso }) {
  const { usuario, can, cargando } = useAuth()
  if (cargando) return <div className="d-flex justify-content-center p-5"><Spinner animation="border" role="status" /></div>
  if (!usuario) return <Navigate to="/login" replace />
  if (permiso && !can(permiso)) return <Navigate to="/" replace />
  return children
}
