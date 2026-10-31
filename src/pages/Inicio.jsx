import { useAuth } from '../context/AuthContext.jsx'
import RolBanner from '../components/RolBanner.jsx'
import AnalistaInicio from './inicio/AnalistaInicio.jsx'
import EvaluadorInicio from './inicio/EvaluadorInicio.jsx'
import JefaturaInicio from './inicio/JefaturaInicio.jsx'

const VISTAS = { analista: AnalistaInicio, evaluador: EvaluadorInicio, jefatura: JefaturaInicio }

// La pantalla de inicio cambia según el rol de quien ingresó.
export default function Inicio() {
  const { usuario } = useAuth()
  const Vista = VISTAS[usuario.rol]
  return (
    <>
      <RolBanner />
      <Vista />
    </>
  )
}
