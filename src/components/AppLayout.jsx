import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
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

export default function AppLayout() {
  const { usuario, etiquetaRol, logout } = useAuth()
  const { error, loading } = useData()
  const navigate = useNavigate()
  const [abierto, setAbierto] = useState(false)

  const salir = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <header className="topbar d-lg-none">
        <button type="button" className="btn btn-outline-light btn-sm" aria-label="Abrir menú" aria-expanded={abierto} onClick={() => setAbierto(!abierto)}>Menú</button>
        <span className="marca-logo"><Logo alto={28} /></span>
        <span className="fw-semibold">Evaluaciones</span>
      </header>
      <aside className={`sidebar ${abierto ? 'open' : ''}`}>
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
