import { useEffect, useRef } from 'react'
import { Alert } from 'react-bootstrap'

// Alerta que se cierra con la X o sola después de "duracion" ms (sin duracion queda fija).
// Con "desplazar" la página hace scroll hasta la alerta para que el usuario la vea.
export default function AlertaTemporal({ variant = 'success', duracion, desplazar = false, onClose, className, children }) {
  const ref = useRef(null)
  const cerrar = useRef(onClose)
  cerrar.current = onClose

  useEffect(() => {
    if (!duracion) return undefined
    const temporizador = setTimeout(() => cerrar.current?.(), duracion)
    return () => clearTimeout(temporizador)
  }, [duracion, children])

  useEffect(() => {
    if (desplazar) ref.current?.scrollIntoView?.({ behavior: 'smooth', block: 'center' })
  }, [desplazar, children])

  return (
    <div ref={ref}>
      <Alert variant={variant} dismissible onClose={() => cerrar.current?.()} className={className}>
        {children}
      </Alert>
    </div>
  )
}
