import { useState } from 'react'
import { RESUMEN_ROL, useAuth } from '../context/AuthContext.jsx'

export default function RolBanner() {
  const { usuario, etiquetaRol } = useAuth()
  const clave = `aquachile-rol-visto-${usuario.rol}`
  const [oculto, setOculto] = useState(() => {
    try {
      return sessionStorage.getItem(clave) === '1'
    } catch {
      return false
    }
  })

  if (oculto) return null

  const cerrar = () => {
    setOculto(true)
    try {
      sessionStorage.setItem(clave, '1')
    } catch {
      /* solo en memoria */
    }
  }

  return (
    <section className="rol-banner" aria-label="Tu rol">
      <div className="d-flex justify-content-between align-items-start gap-3">
        <div>
          <p className="fw-semibold mb-1">Tu rol: {etiquetaRol}</p>
          <p className="mb-1 small">En este sistema puedes:</p>
          <ul className="small mb-0 ps-3">
            {RESUMEN_ROL[usuario.rol].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <button type="button" className="btn-close" aria-label="Cerrar aviso" onClick={cerrar} />
      </div>
    </section>
  )
}
