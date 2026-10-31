# Sistema de Gestión de Evaluaciones Psicolaborales - AquaChile

Frontend desarrollado en React + Vite para la gestión y seguimiento del proceso de selección y evaluaciones psicolaborales para **AquaChile**.

## Integrantes del Equipo
* **Maximiliano Cáceres**
* **Yonathan Machado**
* **Matías Sandoval**

---
## Rol de Integrantes
* **Maximiliano Cáceres: Base de datos del proyecto**
* **Yonathan Machado: Desarrollador Backend**
* **Matías Sandoval: Desarrollador Frontend**

---

## Tecnologías Utilizadas
* **React** (Librería UI)
* **Vite** (Build Tool / Dev Server)
* **JavaScript / JSX**
* **Base de datos Oracle**
---

## Funcionalidades  
- [x] **Identidad visual:** logo corporativo de AquaChile (`src/assets/Logo-limpio.png`, sin fondo) en login, barra lateral, barra móvil, navbar y favicon.
- [x] **Páginas por ruta (`src/pages`):** cada vista del sistema tiene su propio archivo y se exporta desde `src/pages/index.js`.
- [x] **Navegación Corporativa (`Navbar`):** Encabezado responsivo con la marca del proyecto.
- [x] **Panel de Candidatos (`TablaCandidatos`):** Visualización en tabla con estados dinámicos (*Apto*, *Pendiente*, *No Apto*) mediante insignias (badges).
- [x] **Integración de Estilos:** Configuración limpia de Bootstrap 5 sin interferencias de CSS por defecto.

### Mapa de páginas

| Ruta | Página |
| --- | --- |
| `/login` | `Login.jsx` |
| `/` | `Inicio.jsx` (según rol: analista, evaluador o jefatura) |
| `/candidatos` | `Candidatos.jsx` |
| `/candidatos/nuevo` | `CandidatoForm.jsx` |
| `/candidatos/:id/editar` | `CandidatoForm.jsx` |
| `/solicitudes` | `Solicitudes.jsx` |
| `/solicitudes/nueva` | `SolicitudForm.jsx` |
| `/solicitudes/:id` | `SolicitudDetalle.jsx` |
| `/solicitudes/:id/editar` | `SolicitudForm.jsx` |
| Cualquier otra | `NoEncontrada.jsx` |
