import { Link, NavLink } from 'react-router-dom'
import Logo from './Logo.jsx'

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary px-3 shadow-sm">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold d-flex align-items-center gap-2" to="/">
          <span className="marca-logo">
            <Logo alto={30} />
          </span>
          <span>Proyecto AquaChile</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <NavLink end className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/">
                Inicio / Dashboard
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/candidatos">
                Candidatos
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} to="/solicitudes">
                Solicitudes
              </NavLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}