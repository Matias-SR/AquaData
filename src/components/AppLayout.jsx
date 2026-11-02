import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext.jsx'
import { useData } from '../context/DataContext.jsx'
import Logo from './Logo.jsx'

const MENU = {
  analista: [
    { to: '/', etiqueta: 'Mis solicitudes', end: true },
    { to: '/solicitudes/nueva', etiqueta: 'Nueva solicitud', end: true },
    { to: '/candidatos', etiqueta: 'Candidatos' },
    { to: '/solicitudes', etiqueta: 'Todas las solicitudes', end: true },
  ],
  evaluador: [
    { to: '/', etiqueta: 'Mi bandeja', end: true },
    { to: '/solicitudes', etiqueta: 'Todas las solicitudes', end: true },
  ],
  jefatura: [
    { to: '/', etiqueta: 'Indicadores', end: true },
    { to: '/solicitudes', etiqueta: 'Solicitudes', end: true },
    { to: '/usuarios', etiqueta: 'Administrar usuarios', end: true },
  ],
}

// Mismo punto de quiebre que d-lg-none: desde aquí el menú queda fijo a la izquierda.
const ESCRITORIO = '(min-width: 992px)'

export default function AppLayout() {
  const { usuario, etiquetaRol, logout } = useAuth()
  const { error, loading } = useData()
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [abierto, setAbierto] = useState(false)
  const botonMenu = useRef(null)
  const botonCerrar = useRef(null)

  const cerrarMenu = () => {
    setAbierto(false)
    botonMenu.current?.focus()
  }

  // Al cambiar de ruta (por un enlace o por navigate) el menú móvil se cierra.
  useEffect(() => { setAbierto(false) }, [pathname])

  // Mientras está abierto: Escape lo cierra y la página de atrás no hace scroll.
  useEffect(() => {
    if (!abierto) return undefined
    const alPresionar = (ev) => { if (ev.key === 'Escape') cerrarMenu() }
    const overflowAnterior = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', alPresionar)
    botonCerrar.current?.focus()
    return () => {
      document.body.style.overflow = overflowAnterior
      document.removeEventListener('keydown', alPresionar)
    }
  }, [abierto])

  // Si la ventana pasa a tamaño escritorio con el menú abierto, se cierra para liberar el scroll.
  useEffect(() => {
    const consulta = window.matchMedia?.(ESCRITORIO)
    if (!consulta) return undefined
    const alCambiar = (ev) => { if (ev.matches) setAbierto(false) }
    consulta.addEventListener('change', alCambiar)
    return () => consulta.removeEventListener('change', alCambiar)
  }, [])

  const salir = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <header className="topbar d-lg-none">
        <button
          ref={botonMenu}
          type="button"
          className="btn btn-outline-light btn-sm"
          aria-label={abierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={abierto}
          aria-controls="menu-lateral"
          onClick={() => setAbierto(!abierto)}
        >
          Menú
        </button>
        <span className="marca-logo"><Logo alto={28} /></span>
        <span className="fw-semibold">Evaluaciones</span>
      </header>
      {abierto && <div className="sidebar-fondo d-lg-none" data-testid="fondo-menu" aria-hidden="true" onClick={cerrarMenu} />}
      <aside id="menu-lateral" className={`sidebar ${abierto ? 'open' : ''}`}>
        <button ref={botonCerrar} type="button" className="btn-close btn-close-white sidebar-cerrar d-lg-none" aria-label="Cerrar menú" onClick={cerrarMenu} />
        <div className="sidebar-marca">
          <span className="marca-logo"><Logo alto={60} /></span>
          <span className="marca-sub">Evaluaciones psicolaborales</span>
        </div>
        <nav className="sidebar-nav" aria-label="Principal">
          {(MENU[usuario.rol] ?? []).map((e) => (
            <NavLink key={e.to} to={e.to} end={e.end} className={({ isActive }) => `sidebar-link ${isActive ? 'activo' : ''}`} onClick={() => setAbierto(false)}>
              {e.etiqueta}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-pie">
          <div className="fw-semibold">{usuario.nombre}</div>
          <div className="small opacity-75 mb-3">{etiquetaRol}</div>
          <Button variant="outline-light" size="sm" onClick={salir}>Cerrar sesión</Button>
        </div>
      </aside>
      <main className="contenido">
        {error && <Alert variant="danger">No fue posible cargar la información desde Supabase: {error}</Alert>}
        {loading ? <p className="text-secondary">Cargando información...</p> : <Outlet />}
      </main>
    </div>
  )
}
