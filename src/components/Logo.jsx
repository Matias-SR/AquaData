import logoAquaChile from '../assets/Logo-limpio.png'

/**
 * Logo corporativo de AquaChile.
 * `alto` se expresa en píxeles y el ancho se calcula solo para no deformar la imagen.
 * `tono`: "claro" para fondos oscuros y "oscuro" para fondos claros.
 */
export default function Logo({ alto = 48, className = '', alt = 'AquaChile', tono = 'claro' }) {
  const clases = ['logo-aquachile', `logo-aquachile--${tono}`, className].filter(Boolean).join(' ')

  return <img src={logoAquaChile} alt={alt} className={clases} style={{ height: alto }} />
}
