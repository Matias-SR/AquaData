import { useAuth } from '../context/AuthContext.jsx'
import RolBanner from '../components/RolBanner.jsx'
import EmptyState from '../components/EmptyState.jsx'
import AnalistaInicio from './inicio/AnalistaInicio.jsx'
import EvaluadorInicio from './inicio/EvaluadorInicio.jsx'
import JefaturaInicio from './inicio/JefaturaInicio.jsx'

const VISTAS = { analista: AnalistaInicio, evaluador: EvaluadorInicio, jefatura: JefaturaInicio }

// La pantalla de inicio cambia según el rol de quien ingresó.
export default function Inicio() {
  const { usuario } = useAuth()
  const Vista = VISTAS[usuario.rol]
  if (!Vista) {
    return (
      <EmptyState titulo="Tu cuenta no tiene un rol asignado. Contacta a Jefatura.">
        Mientras tanto no puedes acceder a las secciones del sistema.
      </EmptyState>
    )
  }
  return (
    <>
      <RolBanner />
      <Vista />
    </>
  )
}
