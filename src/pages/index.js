// Punto único de entrada para todas las páginas del proyecto.
// Cada ruta de App.jsx se sirve desde un archivo de esta carpeta.
export { default as Login } from './Login.jsx'
export { default as Inicio } from './Inicio.jsx'
export { default as Candidatos } from './Candidatos.jsx'
export { default as CandidatoForm } from './CandidatoForm.jsx'
export { default as Solicitudes } from './Solicitudes.jsx'
export { default as SolicitudForm } from './SolicitudForm.jsx'
export { default as SolicitudDetalle } from './SolicitudDetalle.jsx'
export { default as NoEncontrada } from './NoEncontrada.jsx'

// Vistas de inicio según el rol.
export { default as AnalistaInicio } from './inicio/AnalistaInicio.jsx'
export { default as EvaluadorInicio } from './inicio/EvaluadorInicio.jsx'
export { default as JefaturaInicio } from './inicio/JefaturaInicio.jsx'

export { default as Usuarios } from './jefatura/Usuarios.jsx'
