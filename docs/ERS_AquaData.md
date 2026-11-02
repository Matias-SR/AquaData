# Especificación de Requisitos de Software (ERS)

**Sistema de Gestión de Evaluaciones Psicolaborales — AquaChile**
Proyecto de Vinculación con el Medio (VcM) · DSY1104 Desarrollo Full Stack II · Duoc UC
Versión: Evaluación Parcial 2 (avance frontend) · Rama `maxi-dev` · 01-11-2026

| Integrante | Rol en el equipo |
| --- | --- |
| Maximiliano Cáceres | Base de datos |
| Yonathan Machado | Desarrollo backend |
| Matías Sandoval | Desarrollo frontend |

> Todas las referencias `archivo:línea` corresponden al código de la rama `maxi-dev` a la fecha de este documento. Los datos de ejemplo son ficticios.

---

## 1. Introducción

### 1.1 Propósito

Este documento describe qué hace hoy el MVP, qué funciona con datos simulados y qué queda pendiente. Sirve para evaluar el avance de la Evaluación Parcial 2 y para planificar la etapa Full Stack.

### 1.2 Alcance de esta etapa

La Evaluación Parcial 2 corresponde al **avance frontend**: una SPA en React que cubre el proceso de evaluación psicolaboral con tres roles internos. Como avance adicional, la app ya trabaja contra Supabase (autenticación, base de datos y Edge Functions), y la postulación externa por Google Forms está implementada.

### 1.3 Definiciones

| Término | Significado en el sistema |
| --- | --- |
| **Postulante** | Persona que postula a un cargo. Se registra con RUT, nombre, correo, teléfono, cargo, familia de cargo, ubicación y origen (Interno/Externo). Tabla `postulantes`. |
| **Solicitud** | Pedido de evaluación psicolaboral que crea el Analista para un postulante y asigna a un Evaluador. Tabla `solicitudes`. |
| **Evaluación** | Registro del informe asociado a una solicitud (una por solicitud). Tabla `evaluaciones`. |
| **Informe** | Resultado de la evaluación: categoría, conclusión y una sección por competencia (criterio, fortalezas, oportunidades). |
| **Familia de cargo** | Agrupación de cargos que define las competencias, la plantilla de informe y la pauta de entrevista (`src/utils/estados.js:19-27`). |
| **Etapa** | Estado de la solicitud: *Evaluación recibida*, *Entrevista agendada*, *Entrevista realizada*, *Informe enviado* (`src/utils/estados.js:2-7`). |
| **Categoría** | Resultado del informe: *Recomendado*, *Recomendado con observaciones*, *No recomendado* (`src/utils/estados.js:17`). |

### 1.4 Referencias

- [`README.md`](../README.md): instalación, roles, flujo, rutas y pendientes.
- [`README_SUPABASE.md`](../README_SUPABASE.md): configuración de Supabase.
- [`docs/EVIDENCIA_PRUEBAS.md`](EVIDENCIA_PRUEBAS.md): pruebas Vitest, cobertura y pruebas manuales.
- [`docs/INTEGRACION_GOOGLE_FORMS.md`](INTEGRACION_GOOGLE_FORMS.md): postulación externa.
- [`docs/INTEGRACION_GOOGLE_DRIVE.md`](INTEGRACION_GOOGLE_DRIVE.md): apertura de documentos (pendiente).
- [`docs/ADMINISTRACION_USUARIOS.md`](ADMINISTRACION_USUARIOS.md): Edge Function de usuarios.
- [`Idea_proyecto.md`](../Idea_proyecto.md): documento maestro de requisitos y planificación.

---

## 2. Problemática de AquaChile

El área de Selección de AquaChile gestiona las evaluaciones psicolaborales con **planillas Excel, correos y un tablero de Planner**. Esto genera:

- **Información dispersa:** los datos del postulante, la solicitud del analista, la agenda de la entrevista y el informe del evaluador están en lugares distintos.
- **Sin vista consolidada para Jefatura:** no hay un lugar donde ver la carga de cada evaluador, las etapas del proceso o los resultados.
- **Sin medición de tiempos:** no se sabe cuánto demora una evaluación desde que se pide hasta que llega el informe.
- **Riesgo de errores:** RUT, correos o teléfonos mal escritos y versiones distintas de un mismo informe.
- **Riesgo de exposición de datos personales:** CV e informes circulan por correo y en archivos compartidos.

---

## 3. Usuarios y roles

Los permisos se definen en `src/context/AuthContext.jsx:4-8` y se aplican en las rutas (`src/App.jsx:28-77`) y en los botones de cada pantalla (`can(...)`). Se sigue el principio de **mínimo privilegio**: cada rol solo tiene los permisos que necesita.

| Rol | Qué hace | Qué NO puede hacer |
| --- | --- | --- |
| **Analista de Reclutamiento** (`analista`) | Registra, busca y edita postulantes; crea y edita solicitudes mientras el informe no esté enviado; revisa el informe y marca su recepción. | Agendar entrevistas, redactar informes, exportar CSV ni administrar usuarios. |
| **Profesional Evaluador** (`evaluador`) | Ve su bandeja por etapa; agenda y reagenda entrevistas, las marca como realizadas; redacta el informe (borrador), lo envía y lo reabre. Solo actúa sobre las solicitudes que tiene asignadas (`src/pages/SolicitudDetalle.jsx:43,83-85`). | Ver el listado de postulantes (`/candidatos`), crear o editar solicitudes, modificar solicitudes de otro evaluador, exportar ni administrar usuarios. |
| **Jefatura** (`jefatura`) | Ve los indicadores del proceso; consulta solicitudes y su detalle en modo lectura; exporta el listado a CSV; administra usuarios (crear, editar, activar/desactivar). | Ver el listado de postulantes, crear o editar solicitudes, gestionar entrevistas ni redactar informes. |
| **Postulante externo** | Responde el formulario de Google Forms y adjunta su CV. No entra a la app. | Acceder al sistema o ver datos de otros postulantes. |

Notas:
- Las rutas `/solicitudes` y `/solicitudes/:id` están abiertas a los tres roles (`src/App.jsx:52,69`). Lo que cada uno puede hacer en el detalle depende de su rol y de la etapa (`src/pages/SolicitudDetalle.jsx:81-163`).
- Una cuenta con perfil inactivo no puede entrar: se cierra la sesión (`src/context/AuthContext.jsx:48-51`).

---

## 4. Requisitos funcionales

Estados: **Implementado** · **Implementado con datos simulados** (funciona, pero con contenido de muestra o sin el archivo real) · **Pendiente**.

| ID | Nombre | Descripción | Rol | Prioridad | Estado | Evidencia (vista · archivo) |
| --- | --- | --- | --- | --- | --- | --- |
| RF-01 | Iniciar y cerrar sesión | Ingreso con correo y contraseña de Supabase Auth; validación de campos vacíos; cierre de sesión. | Todos | Alta | Implementado | Login · `src/pages/Login.jsx:19-37`, `src/context/AuthContext.jsx:115-130` |
| RF-02 | Permisos por rol | Tabla de permisos por rol y rutas protegidas; sin sesión redirige a `/login`. | Todos | Alta | Implementado | `src/context/AuthContext.jsx:4-12`, `src/components/ProtectedRoute.jsx:6-18`, `src/App.jsx:28-77` |
| RF-03 | Bloqueo de perfiles inactivos | Si el perfil no existe o está inactivo, se cierra la sesión con un mensaje. | Todos | Alta | Implementado | `src/context/AuthContext.jsx:40-59` |
| RF-04 | Menú e inicio según rol | Cada rol ve su menú y su pantalla de inicio, con un aviso que resume lo que puede hacer. | Todos | Alta | Implementado | `src/components/AppLayout.jsx:8-24`, `src/pages/Inicio.jsx:8-26`, `src/components/RolBanner.jsx` |
| RF-05 | Registrar postulante | Formulario con validación de RUT (módulo 11), correo, celular chileno y campos obligatorios (incluye ubicación y origen). | Analista | Alta | Implementado | Registrar postulante · `src/pages/CandidatoForm.jsx:28-47`, `src/utils/validaciones.js:4-31` |
| RF-06 | Editar postulante | Mismo formulario precargado; vuelve al listado con mensaje de éxito. | Analista | Alta | Implementado | `src/pages/CandidatoForm.jsx:14-15,36-41`, `src/context/DataContext.jsx:148-163` |
| RF-07 | Buscar y filtrar postulantes | Búsqueda por nombre, RUT o cargo; filtros por origen y familia; contador de resultados. | Analista | Media | Implementado | Candidatos · `src/pages/Candidatos.jsx:20-40` |
| RF-08 | Postulación externa por Google Forms | El formulario crea la carpeta en Drive con el CV y un PDF, y registra al postulante (origen Externo) mediante la Edge Function `registrar-postulacion`, protegida por un secreto. | Postulante externo | Alta | Implementado | `google-apps-script/Code.gs`, `supabase/functions/registrar-postulacion/index.ts:25-89` |
| RF-09 | Crear solicitud | Al elegir el postulante se autocompletan cargo y familia; se asigna un evaluador activo; parte en *Evaluación recibida*. | Analista | Alta | Implementado | Nueva solicitud · `src/pages/SolicitudForm.jsx:33-37,104-113`, `src/context/DataContext.jsx:165-180` |
| RF-10 | Editar solicitud | Permite corregir cargo, familia, evaluador y observaciones mientras el informe no esté enviado. | Analista | Media | Implementado | `src/pages/SolicitudForm.jsx:24-26,47-54`, `src/utils/flujo.js:2-4` |
| RF-11 | Plantilla y pauta por familia | Según la familia se asignan competencias, plantilla de informe y pauta de entrevista. | Analista / Evaluador | Media | Implementado con datos simulados (solo nombres de archivo; competencias propuestas) | `src/utils/estados.js:64-84`, `src/pages/SolicitudForm.jsx:129`, `src/pages/SolicitudDetalle.jsx:221-226` |
| RF-12 | Bandeja del evaluador | Tablero por etapa con solo las solicitudes asignadas, hora de entrevista y acción siguiente. | Evaluador | Alta | Implementado | Mi bandeja · `src/pages/inicio/EvaluadorInicio.jsx:8-52`, `src/utils/flujo.js:6-17` |
| RF-13 | Agendar y reagendar entrevista | Fecha y hora obligatorias; la fecha no puede ser anterior a la solicitud. | Evaluador | Alta | Implementado | Detalle · `src/pages/SolicitudDetalle.jsx:46-52,86-111`, `src/utils/validaciones.js:54-60` |
| RF-14 | Marcar entrevista realizada | Cambia la etapa a *Entrevista realizada*. | Evaluador | Alta | Implementado | `src/pages/SolicitudDetalle.jsx:54-56,112-116` |
| RF-15 | Informe por competencias | Editor con categoría, conclusión y una sección por competencia; guardar borrador o enviar (valida que todo esté completo). | Evaluador | Alta | Implementado | `src/components/InformeEditor.jsx:8-116`, `src/utils/validaciones.js:62-75`, `src/context/DataContext.jsx:203-221` |
| RF-16 | Reabrir informe | Vuelve a *Entrevista realizada* conservando el contenido para corregirlo y reenviarlo. | Evaluador | Media | Implementado | `src/pages/SolicitudDetalle.jsx:67-69,124-131`, `src/context/DataContext.jsx:222-238` |
| RF-17 | Ver e imprimir informe | Vista consolidada del informe con botón de impresión. | Analista / Evaluador / Jefatura | Media | Implementado | `src/components/InformeVista.jsx:5-47` |
| RF-18 | Marcar informe como recibido | El analista confirma la recepción; su inicio avisa de los informes listos. | Analista | Media | Implementado | `src/pages/SolicitudDetalle.jsx:71-73,137-145`, `src/pages/inicio/AnalistaInicio.jsx:15,30-43` |
| RF-19 | Listado de solicitudes | Búsqueda por postulante, RUT o cargo; filtros por etapa, familia y evaluador; orden por fecha. | Todos | Alta | Implementado | Solicitudes · `src/pages/Solicitudes.jsx:19-30,54-63`, `src/components/TablaSolicitudes.jsx` |
| RF-20 | Indicadores de Jefatura | Totales, solicitudes por etapa, carga por evaluador, familias, resultados y días promedio hasta el informe. | Jefatura | Alta | Implementado | Indicadores · `src/pages/inicio/JefaturaInicio.jsx:10-81`, `src/utils/indicadores.js` |
| RF-21 | Exportar CSV | Descarga `solicitudes.csv` con el listado filtrado (separador `;`, BOM para Excel). | Jefatura | Media | Implementado | `src/pages/Solicitudes.jsx:32-45,52`, `src/utils/exportarCsv.js` |
| RF-22 | Administración de usuarios | Listar, buscar, crear, editar y activar/desactivar cuentas mediante la Edge Function `usuarios` (solo Jefatura). | Jefatura | Alta | Implementado | Administrar usuarios · `src/pages/jefatura/Usuarios.jsx`, `supabase/functions/usuarios/index.ts:34-36` |
| RF-23 | Mensajes de éxito y error | Alertas que se cierran solas en éxito, quedan fijas en error y hacen scroll; mensajes que viajan entre páginas. | Todos | Media | Implementado | `src/components/AlertaTemporal.jsx`, `src/hooks/useMensajeNavegacion.js`, `src/components/AppLayout.jsx:112` |
| RF-24 | Vistas "sin acceso", "sin rol" y "no encontrada" | Aviso al entrar por URL sin permiso, cuenta sin rol válido y ruta inexistente. | Todos | Media | Implementado | `src/components/ProtectedRoute.jsx:10-15`, `src/pages/Inicio.jsx:14-20`, `src/pages/NoEncontrada.jsx` |
| RF-25 | Detalle con avance por etapas | Datos de la solicitud y del postulante, barra de etapas y acciones según rol. | Todos | Alta | Implementado | `src/pages/SolicitudDetalle.jsx:168-250` |
| RF-26 | Historial de etapas (base de datos) | Un trigger registra cada cambio de etapa en `historial_estados`. La app aún no lo muestra. | Sistema | Baja | Implementado (solo en BD) | `supabase/migrations/20261031_aquachile_drive_and_ui_fields.sql:32-55` |
| RF-27 | Ver/abrir CV y documentos desde la app | Abrir el CV, el PDF del formulario, la plantilla y la pauta desde Drive con enlaces temporales. Hoy se muestran solo por nombre. | Analista / Evaluador | Alta | Pendiente | `src/services/googleDriveService.js` (sin uso en pantallas), `supabase/functions/google-drive/index.ts` (responde 501), `docs/INTEGRACION_GOOGLE_DRIVE.md` |
| RF-28 | Recuperación de contraseña | Flujo para que el usuario recupere o cambie su contraseña. | Todos | Media | Pendiente | `src/pages/jefatura/Usuarios.jsx:213`, `docs/ADMINISTRACION_USUARIOS.md` (Notas) |

---

## 5. Requisitos no funcionales

| ID | Tipo | Requisito | Evidencia |
| --- | --- | --- | --- |
| RNF-01 | Responsive | La interfaz se adapta a celular, tablet y escritorio con Bootstrap 5 (grilla `Row`/`Col`), tablas con scroll horizontal, menú lateral móvil y bandeja apilada. Probado manualmente a 375 px. | `src/main.jsx:4`, `src/pages/CandidatoForm.jsx:73-85`, `src/components/TablaSolicitudes.jsx:18`, `src/styles/app.css:86,115,136-138`, `src/components/AppLayout.jsx:43-67` |
| RNF-02 | Usabilidad | Validación con mensajes propios junto a cada campo (`noValidate` + `Form.Control.Feedback`), confirmaciones de éxito, botones deshabilitados mientras se guarda, estados vacíos con indicación y confirmación antes de desactivar una cuenta. | `src/pages/CandidatoForm.jsx:52-53,72,87`, `src/components/EmptyState.jsx`, `src/pages/jefatura/Usuarios.jsx:118` |
| RNF-03 | Accesibilidad básica | Etiquetas en controles, `aria-label`/`aria-current`, foco gestionado en el menú móvil, cierre con Escape y respeto de `prefers-reduced-motion`. | `src/components/AppLayout.jsx:47-58,81-83`, `src/pages/SolicitudDetalle.jsx:185`, `src/styles/app.css:127` |
| RNF-04 | Seguridad | (a) Permisos por rol en el frontend con `ProtectedRoute` y `can()`; es una ayuda de interfaz, no la barrera final. (b) La validación definitiva es RLS en Supabase. En el repo solo está versionada la política de lectura de `perfiles` (`supabase/migrations/...sql:23-30`); las políticas iniciales se configuraron en el panel de Supabase. (c) Las claves de servidor (`service_role`, secreto de Forms) solo existen en el servidor: secretos de Edge Functions y Propiedades del script de Apps Script; nunca en React. (d) El `.env` de Vite solo contiene la URL y la *publishable/anon key*; `.env` está en `.gitignore`. (e) Las Edge Functions validan el JWT y el rol, o el secreto compartido. | `src/components/ProtectedRoute.jsx`, `.env.example`, `src/lib/supabaseClient.js:3-8`, `supabase/functions/usuarios/index.ts:24-36`, `supabase/functions/registrar-postulacion/index.ts:28-31` |
| RNF-05 | Privacidad | Solo datos ficticios en el repo, en las pruebas y en la demo (`@ejemplo.cl`). Los archivos en Drive quedan en carpetas privadas, sin enlaces públicos. | `supabase/seed_demo.sql`, `docs/INTEGRACION_GOOGLE_FORMS.md` |
| RNF-06 | Calidad | Pruebas con Vitest + Testing Library + jsdom: **22 archivos, 146 pruebas, todas aprobadas**. Cobertura: **87,6 % statements, 75,65 % branches, 84,96 % functions, 89,25 % lines** (medida sobre los archivos que cargan las pruebas). | `vite.config.js:6-10`, `docs/EVIDENCIA_PRUEBAS.md` |
| RNF-07 | Mantenibilidad | Reglas de negocio como funciones puras en `src/utils/` (fáciles de probar); componentes reutilizables con props; datos y sesión centralizados en contextos; un punto único de exportación de páginas. | `src/utils/`, `src/components/TablaSolicitudes.jsx:9-12`, `src/context/`, `src/pages/index.js` |
| RNF-08 | Entorno | Node.js 22.12 o superior; `npm run dev`, `npm run build`, `npm run test:run`, `npm run coverage`. | `README.md` (Requisitos), `package.json` |

---

## 6. Correspondencia problema → solución

| Dolor actual de AquaChile | Funcionalidad del MVP | Beneficio |
| --- | --- | --- |
| Postulante, solicitud, agenda e informe en Excel, correos y Planner | Ficha única: postulante → solicitud → entrevista → informe en la misma app (RF-05, RF-09, RF-13, RF-15, RF-25) | Una sola fuente de información por evaluación |
| Planner sin vínculo con los datos | Bandeja del evaluador por etapa, al estilo Planner (RF-12) | El evaluador mantiene su forma de trabajo, ahora con datos conectados |
| Jefatura sin vista consolidada | Indicadores: etapas, carga por evaluador, familias y resultados (RF-20) | Decisiones con datos actualizados |
| No se miden los tiempos | Días promedio desde la solicitud hasta el envío del informe (RF-20) | Medir y mejorar el tiempo de respuesta |
| Errores de digitación | Validación de RUT (módulo 11), correo, celular y campos obligatorios (RF-05) | Datos confiables y menos duplicados |
| Postulaciones externas que llegan por correo | Google Forms → Drive → Supabase (RF-08) | Registro automático y CV en carpeta privada |
| Informes con formatos distintos | Informe por competencias según la familia de cargo (RF-11, RF-15) | Informes comparables y completos |
| Datos personales expuestos en correos y archivos compartidos | Permisos por rol, RLS, perfiles inactivos bloqueados y documentos privados (RF-02, RF-03, RNF-04) | Cada persona ve solo lo que le corresponde |
| No se sabe si el analista recibió el informe | Marcar informe como recibido y aviso de informes listos (RF-18) | Cierre del proceso trazable |
| Reportes manuales para Jefatura | Exportar a CSV (RF-21) | Reportes en Excel en segundos |

---

## 7. Alcance

### 7.1 Implementado

RF-01 a RF-25: inicio de sesión y permisos, postulantes, solicitudes, bandeja del evaluador, entrevista, informe (borrador, envío, reapertura, impresión), recepción del informe, listado con filtros, indicadores, exportación CSV, administración de usuarios, mensajes y vistas de error. También la postulación por Google Forms (RF-08) y el registro de cambios de etapa en la base de datos (RF-26).

### 7.2 Funciona con datos simulados

- **Datos de demostración:** `supabase/seed_demo.sql` carga 10 postulantes y 10 solicitudes ficticios repartidos en las 4 etapas, con 3 informes enviados.
- **Plantillas y competencias por familia:** los nombres de archivo y las competencias de cada familia (`src/utils/estados.js:64-84`) son una propuesta que debe validar el área de Selección.
- **Documentos mostrados solo por nombre:** el CV, la plantilla de informe y la pauta de entrevista aparecen por nombre en la carpeta del candidato, pero no se pueden abrir (`src/pages/SolicitudDetalle.jsx:221-226`, `src/pages/SolicitudForm.jsx:118-119`).

### 7.3 Pendiente para la etapa Full Stack

Ver la sección 13.

### 7.4 Sobre el backend

La rúbrica de esta etapa no exige backend. Supabase (Auth, PostgreSQL con RLS y Edge Functions) y la integración con Google Forms son un **avance adicional** que adelanta parte de la etapa Full Stack.

---

## 8. Diseño frontend

### 8.1 Stack

| Tecnología | Versión (`package.json`) | Uso |
| --- | --- | --- |
| React | ^18.3.1 | Componentes y estado |
| Vite | ^8.3.5 | Servidor de desarrollo y build |
| Bootstrap / React-Bootstrap | ^5.3.3 / ^2.10.5 | Estilos, grilla responsive, formularios, tablas, modales, alertas |
| React Router DOM | ^6.26.2 | Rutas, parámetros y rutas protegidas |
| Supabase JS | ^2.118.0 | Auth, consultas y Edge Functions |
| Vitest + Testing Library + jsdom | ^5.0.5 / ^16.3.3 / ^30.1.3 | Pruebas unitarias y de componentes |

### 8.2 Estructura de carpetas

```text
src/
├── main.jsx            # Bootstrap CSS, BrowserRouter, AuthProvider y DataProvider
├── App.jsx             # Definición de rutas
├── components/         # Componentes reutilizables
├── context/            # AuthContext (sesión y permisos) y DataContext (datos)
├── hooks/              # useMensajeNavegacion
├── lib/                # Cliente de Supabase
├── pages/              # Una página por ruta (inicio/ por rol, jefatura/)
├── services/           # Servicio de Google Drive (preparado)
├── styles/             # app.css sobre Bootstrap
└── utils/              # Reglas de negocio puras
```

### 8.3 Rutas (`src/App.jsx`)

| Ruta | Página | Rol / permiso |
| --- | --- | --- |
| `/login` | `Login.jsx` | Público |
| `/` | `Inicio.jsx` → `AnalistaInicio`, `EvaluadorInicio` o `JefaturaInicio` | Con sesión |
| `/candidatos` | `Candidatos.jsx` | Analista (`candidatos:ver`) |
| `/candidatos/nuevo` | `CandidatoForm.jsx` | Analista (`candidatos:escribir`) |
| `/candidatos/:id/editar` | `CandidatoForm.jsx` | Analista (`candidatos:escribir`) |
| `/solicitudes` | `Solicitudes.jsx` | Con sesión (los 3 roles) |
| `/solicitudes/nueva` | `SolicitudForm.jsx` | Analista (`solicitudes:crear`) |
| `/solicitudes/:id/editar` | `SolicitudForm.jsx` | Analista (`solicitudes:editar`), solo si el informe no está enviado |
| `/solicitudes/:id` | `SolicitudDetalle.jsx` | Con sesión; acciones según rol y etapa |
| `/usuarios` | `jefatura/Usuarios.jsx` | Jefatura (`usuarios:administrar`) |
| `*` (con sesión) | `NoEncontrada.jsx` | — |

### 8.4 Contextos

| Contexto | Archivo | Qué entrega |
| --- | --- | --- |
| `AuthContext` | `src/context/AuthContext.jsx:134-145` | `usuario`, `cargando`, `login`, `logout`, `can(permiso)`, `etiquetaRol` |
| `DataContext` | `src/context/DataContext.jsx:247-251` | `candidatos`, `solicitudes`, `evaluadores`, `loading`, `error`, `recargar`, `agregarCandidato`, `actualizarCandidato`, `agregarSolicitud`, `actualizarSolicitud`, `candidatoPorId`, `solicitudPorId` |

`DataContext` traduce las columnas de la base (snake_case) a objetos de la interfaz (`mapPostulante`, `mapSolicitud`, `mapEvaluacion`, líneas 12-73).

### 8.5 Componentes reutilizables principales

| Componente | Props | Uso |
| --- | --- | --- |
| `TablaSolicitudes` | `solicitudes`, `mostrarResponsable` (por defecto `true`), `vacio` (texto o componente) | Listado general e inicio del analista |
| `AlertaTemporal` | `variant` (por defecto `success`), `duracion`, `desplazar`, `onClose`, `className`, `children` | Mensajes de éxito y error |
| `StatCard` | `titulo`, `valor`, `detalle` (opcional) | Tarjetas de indicadores |
| `Barras` | `filas` (`[{ etiqueta, total }]`), `vacio` | Gráficos de barras de Jefatura |
| `EstadoBadge` | `estado` | Etiqueta de color por etapa |
| `EmptyState` | `titulo`, `children` | Pantallas sin datos y "sin acceso" |
| `ProtectedRoute` | `children`, `permiso` (opcional) | Protección de rutas |
| `InformeEditor` | `solicitud`, `onGuardarBorrador`, `onEnviar` | Redacción del informe |
| `InformeVista` | `informe`, `candidato`, `solicitud` | Lectura e impresión del informe |
| `Logo` | `alto`, `className`, `alt`, `tono` | Marca en login y menú |
| `AppLayout` | — (usa `<Outlet />`) | Menú lateral y contenido |
| `RolBanner` | — | Resumen del rol al iniciar |

---

## 9. Modelo de datos

Las columnas se obtienen de las consultas de `src/context/DataContext.jsx`, de la migración `supabase/migrations/20261031_aquachile_drive_and_ui_fields.sql` y de las Edge Functions. El script de creación de las tablas base no está versionado en el repositorio (se creó en el panel de Supabase), por lo que aquí no se indican tipos de datos exactos.

| Tabla | Columnas clave | Relaciones |
| --- | --- | --- |
| `perfiles` | `id`, `nombre`, `correo`, `rol` (`analista` / `evaluador` / `jefatura`), `activo` | `id` = usuario de Supabase Auth |
| `postulantes` | `id`, `rut`, `nombre_completo`, `correo`, `telefono`, `cargo`, `familia_cargo`, `origen`, `ubicacion`, `referido`, `cv_nombre_archivo`, `drive_folder_id`, `formulario_pdf_drive_id`, `cv_drive_file_id` (y sus URLs), `created_at` | Un postulante puede tener varias solicitudes |
| `solicitudes` | `id`, `postulante_id`, `cargo`, `familia_cargo`, `analista_id`, `evaluador_id`, `estado`, `observaciones`, `fecha_entrevista`, `hora_entrevista`, `informe_recibido`, `created_at` | Pertenece a un postulante; `analista_id` y `evaluador_id` apuntan a `perfiles` |
| `evaluaciones` | `solicitud_id` (una por solicitud: `upsert` con `onConflict: 'solicitud_id'`), `evaluador_id`, `fecha_evaluacion`, `resultado`, `conclusion`, `observaciones`, `competencias` (lista de `{ nombre, criterio, fortalezas, oportunidades }`), `informe_enviado`, `fecha_envio`, `informe_url` | Pertenece a una solicitud |
| `historial_estados` | `solicitud_id`, `estado_anterior`, `estado_nuevo`, `usuario_id`, `fecha_cambio` | Varios registros por solicitud; los escribe el trigger de la migración |

```text
auth.users ── perfiles ──┬── solicitudes.analista_id
                         └── solicitudes.evaluador_id
postulantes ── solicitudes ──┬── evaluaciones (1 a 1)
                             └── historial_estados (1 a muchos)
```

---

## 10. Flujo del proceso

| Paso | Etapa resultante | Rol que actúa | Dónde |
| --- | --- | --- | --- |
| 1. Registrar postulante (o llega por Google Forms) | — | Analista / Postulante externo | `CandidatoForm.jsx`, `Code.gs` |
| 2. Crear solicitud y asignar evaluador | *Evaluación recibida* | Analista | `SolicitudForm.jsx`, `DataContext.jsx:172` |
| 3. Agendar entrevista (fecha y hora) | *Entrevista agendada* | Evaluador | `SolicitudDetalle.jsx:46-52` |
| 4. Marcar entrevista como realizada | *Entrevista realizada* | Evaluador | `SolicitudDetalle.jsx:54-56` |
| 5. Redactar informe (borrador) y enviarlo | *Informe enviado* | Evaluador | `InformeEditor.jsx`, `SolicitudDetalle.jsx:62-65` |
| 5b. (Opcional) Reabrir para corregir | vuelve a *Entrevista realizada* | Evaluador | `SolicitudDetalle.jsx:67-69` |
| 6. Marcar informe como recibido | *Informe enviado* + recibido | Analista | `SolicitudDetalle.jsx:71-73` |
| 7. Ver avance en indicadores y exportar | — | Jefatura | `JefaturaInicio.jsx`, `Solicitudes.jsx:32-45` |

```text
Postulante ─► Solicitud ─► Entrevista agendada ─► Entrevista realizada ─► Informe enviado ─► Recibido
(Analista /    (Analista)      (Evaluador)            (Evaluador)            (Evaluador)       (Analista)
 Forms)                                                    ▲                       │
                                                           └──── reabrir ──────────┘
```

---

## 11. Trazabilidad RF → pruebas

Archivos de prueba en `src/**/__tests__/`. "Prueba manual" = verificada en el navegador (ver `docs/EVIDENCIA_PRUEBAS.md`, sección 6).

| RF | Prueba automatizada (Vitest) | Prueba manual |
| --- | --- | --- |
| RF-01 | `context/__tests__/AuthProvider.test.jsx` | Sí (flujo con 3 roles) |
| RF-02 | `context/__tests__/AuthContext.test.jsx`, `components/__tests__/ProtectedRoute.test.jsx` | Sí (permisos por URL) |
| RF-03 | `context/__tests__/AuthProvider.test.jsx` | — |
| RF-04 | `components/__tests__/AppLayout.test.jsx`, `components/__tests__/RolBanner.test.jsx`, `pages/__tests__/Inicio.test.jsx` | Sí |
| RF-05 | `utils/__tests__/validaciones.test.js`, `pages/__tests__/CandidatoForm.test.jsx` | Sí (validaciones) |
| RF-06 | — | Sí |
| RF-07 | — | Sin prueba registrada |
| RF-08 | — (corre en Apps Script y Supabase) | Sí (01-11-2026) |
| RF-09 | `utils/__tests__/validaciones.test.js` (`validarSolicitud`) | Sí |
| RF-10 | `utils/__tests__/flujo.test.js` (`puedeEditarSolicitud`) | — |
| RF-11 | `utils/__tests__/estados.test.js` | — |
| RF-12 | `pages/__tests__/EvaluadorInicio.test.jsx`, `utils/__tests__/flujo.test.js` | Sí |
| RF-13 | `utils/__tests__/validaciones.test.js` (`validarEntrevista`) | Sí |
| RF-14 | — | Sí |
| RF-15 | `utils/__tests__/validaciones.test.js` (`validarInforme`), `utils/__tests__/estados.test.js` (`informeVacio`) | Sí |
| RF-16 | — | Sí |
| RF-17 | — | Sin prueba registrada |
| RF-18 | `pages/__tests__/AnalistaInicio.test.jsx` (aviso), `components/__tests__/TablaSolicitudes.test.jsx` (marca "recibido") | Pendiente |
| RF-19 | `components/__tests__/TablaSolicitudes.test.jsx`, `components/__tests__/EstadoBadge.test.jsx` | — |
| RF-20 | `pages/__tests__/JefaturaInicio.test.jsx`, `utils/__tests__/indicadores.test.js`, `components/__tests__/StatCard.test.jsx`, `components/__tests__/Barras.test.jsx` | Sí |
| RF-21 | `utils/__tests__/exportarCsv.test.js` | Sí |
| RF-22 | `pages/__tests__/Usuarios.test.jsx` (crear), `utils/__tests__/validaciones.test.js` (`validarUsuario`) | Crear: sí (validaciones). Editar/activar: pendiente |
| RF-23 | `components/__tests__/AlertaTemporal.test.jsx`, `pages/__tests__/CandidatoForm.test.jsx` | Sí |
| RF-24 | `components/__tests__/ProtectedRoute.test.jsx`, `pages/__tests__/Inicio.test.jsx`, `components/__tests__/EmptyState.test.jsx` | Sí ("sin acceso") |
| RF-25 | — | Sí |
| RF-26 | — | — |
| RF-27, RF-28 | Pendientes | — |

---

## 12. Cumplimiento de contenidos (Clases 1 a 9)

Tabla del anexo de la rúbrica ("contenidos mínimos verificables"). Las referencias se verificaron en el código.

| Clase | Evidencia mínima esperada | Evidencia en el proyecto |
| --- | --- | --- |
| 1 | Proyecto React creado con Vite, estructura comprensible y punto de inicio VcM | Vite: `package.json:6-13` (scripts), `vite.config.js:1-5`, `index.html:13-14`, `src/main.jsx:10-20`. Estructura: sección 8.2 y `src/pages/index.js:1-17`. Punto de inicio VcM: `README.md:1-5` y sección "El problema" (`README.md:17-19`), sección 2 de este documento. |
| 2 | Uso de Bootstrap 5 para estilos y componentes visuales | `src/main.jsx:4` (Bootstrap 5). Componentes React-Bootstrap: `Table` (`src/pages/Candidatos.jsx:42`), `Form`/`Button` (`src/pages/CandidatoForm.jsx:72-89`), `Modal` (`src/pages/jefatura/Usuarios.jsx:184-220`), `Badge` (`src/pages/jefatura/Usuarios.jsx:171`), `Alert` (`src/components/AlertaTemporal.jsx:23`), `Spinner` (`src/components/ProtectedRoute.jsx:8`). |
| 3 y 4 | Componentes funcionales, props, datos en arreglos y renderizado mediante .map() | Componentes con props: `src/components/StatCard.jsx:2`, `src/components/TablaSolicitudes.jsx:12`, `src/components/EstadoBadge.jsx:3`. Datos en arreglos: `src/utils/estados.js:2-7` (etapas), `src/utils/estados.js:19-27` (familias), `src/components/AppLayout.jsx:8-24` (menú por rol). `.map()`: `src/components/TablaSolicitudes.jsx:32-52`, `src/pages/inicio/EvaluadorInicio.jsx:24-48`, `src/pages/inicio/JefaturaInicio.jsx:47-52`, `src/pages/Candidatos.jsx:38-39,44-49`. |
| 5 | Maquetación responsive en las vistas principales | Grilla `Row`/`Col`: `src/pages/CandidatoForm.jsx:73-85`, `src/pages/inicio/JefaturaInicio.jsx:27-74`, `src/pages/Solicitudes.jsx:54-59`. Tablas con scroll: `src/components/TablaSolicitudes.jsx:18`, `src/pages/Candidatos.jsx:42`. Menú lateral móvil: `src/components/AppLayout.jsx:76-93`. Media queries: `src/styles/app.css:86,115,136-138`. Probado a 375 px (`docs/EVIDENCIA_PRUEBAS.md`, sección 6). |
| 6 | useState, eventos, filtros, búsquedas y renderizado condicional | `useState`: `src/pages/Candidatos.jsx:14-18`. Eventos: `src/pages/Candidatos.jsx:37-39` (`onChange`), `src/components/AppLayout.jsx:84` (`onClick`). Filtros y búsquedas: `src/pages/Candidatos.jsx:20-27`, `src/pages/Solicitudes.jsx:19-30`, `src/pages/jefatura/Usuarios.jsx:58-62`. Renderizado condicional: `src/pages/Candidatos.jsx:33,41`, `src/pages/SolicitudDetalle.jsx:81-163` (acciones según rol y etapa), `src/components/ProtectedRoute.jsx:8-17`. |
| 7 | Formularios con validación y navegación entre pantallas con React Router | Formularios con validación: `src/pages/CandidatoForm.jsx:28-47,72`, `src/pages/SolicitudForm.jsx:39-66`, `src/pages/SolicitudDetalle.jsx:46-52`, `src/components/InformeEditor.jsx:32-38`, `src/pages/jefatura/Usuarios.jsx:91-114`; reglas en `src/utils/validaciones.js:4-75`. React Router: rutas en `src/App.jsx:18-81`, parámetros con `useParams` (`src/pages/CandidatoForm.jsx:11`), `navigate` (`src/pages/CandidatoForm.jsx:41`), `Link` (`src/components/TablaSolicitudes.jsx:37`), `NavLink` (`src/components/AppLayout.jsx:100`). |
| 8 | Integración de vistas en un frontend coherente y recorridos funcionales | Flujo completo Analista → Evaluador → Jefatura (sección 10). Layout común con rutas anidadas: `src/App.jsx:20-79` y `<Outlet />` en `src/components/AppLayout.jsx:113`. Navegación entre vistas con mensaje: `src/pages/CandidatoForm.jsx:41` → `src/pages/Candidatos.jsx:17-18,35`; `src/pages/SolicitudForm.jsx:54,59` → `src/pages/SolicitudDetalle.jsx:23,29`. Cada acción que guarda avisa su resultado (éxito o error): `src/pages/SolicitudDetalle.jsx:51,55,64,68,72`, `src/components/InformeEditor.jsx:29,37`, `src/pages/CandidatoForm.jsx:38-43,71`, `src/pages/SolicitudForm.jsx:54-62,74`, `src/pages/jefatura/Usuarios.jsx:102,105,110,124,127`; error de carga general en `src/components/AppLayout.jsx:112`. |
| 9 | Pruebas del frontend ejecutadas con Vitest y resultados demostrables | Configuración: `vite.config.js:6-10`, scripts `package.json:9-10`. 22 archivos y 146 pruebas aprobadas, cobertura 87,6 % statements; resultados y capturas en `docs/EVIDENCIA_PRUEBAS.md` y `Evidencia fotografica/Segundo Avance/`. Ejemplos: `src/utils/__tests__/validaciones.test.js:30-49`, `src/pages/__tests__/CandidatoForm.test.jsx:40-89`, `src/components/__tests__/ProtectedRoute.test.jsx:44-50`. |

Condición de cumplimiento de la rúbrica: todos los contenidos están aplicados en funcionalidades del caso AquaChile, no como ejemplos aislados.

Contenidos adicionales usados: `useEffect` (`src/components/AppLayout.jsx:44-67`), Context API (`src/context/AuthContext.jsx:38,148-150`), `useMemo` (`src/pages/Candidatos.jsx:20`), `useRef` (`src/components/AlertaTemporal.jsx:7-9`).

---

## 13. Próxima etapa (pendientes priorizados)

1. **Abrir CV y documentos desde la app** (RF-27): implementar la Edge Function `google-drive` con credenciales de servidor y conectar `googleDriveService.js` a las pantallas (`docs/INTEGRACION_GOOGLE_DRIVE.md`).
2. **Versionar el esquema y las políticas RLS** en `supabase/migrations/` y probarlas con una cuenta de cada rol (`README_SUPABASE.md`, sección 6; `docs/ADMINISTRACION_USUARIOS.md`, Notas).
3. **Recuperación de contraseña** (RF-28).
4. **Completar pruebas:** automatizadas para `SolicitudDetalle`, `SolicitudForm`, `Candidatos`, `InformeEditor` y `DataContext`; manuales pendientes de "Marcar informe como recibido" y de editar/activar usuarios (`docs/EVIDENCIA_PRUEBAS.md`, secciones 5 y 6).
5. **Validar con Selección** las competencias y plantillas por familia de cargo, y vincular los archivos reales.
6. **Mostrar el historial de etapas** en el detalle de la solicitud (los datos ya se registran, RF-26).
7. **Ordenar permisos:** `informe:recibir` y `entrevista:gestionar` están definidos (`src/context/AuthContext.jsx:5-6`) pero las pantallas usan `solicitudes:editar` e `informe:redactar`; unificarlos.
