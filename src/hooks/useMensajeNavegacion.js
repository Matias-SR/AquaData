import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// Lee el mensaje enviado con navigate(ruta, { state: { mensaje } }) y lo borra del historial,
// así no reaparece al recargar la página o al volver atrás.
export function useMensajeNavegacion() {
  const location = useLocation()
  const navigate = useNavigate()
  const [mensaje] = useState(location.state?.mensaje ?? '')

  useEffect(() => {
    if (location.state?.mensaje) navigate(`${location.pathname}${location.search}`, { replace: true, state: null })
  }, [location, navigate])

  return mensaje
}
