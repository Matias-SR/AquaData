# Sistema de Gestión de Evaluaciones Psicolaborales — AquaChile

MVP web para registrar postulantes, solicitar evaluaciones psicolaborales y hacer seguimiento de cada evaluación hasta la entrega del informe.

Evaluación Parcial 2 · DSY1104 Desarrollo Full Stack II · Duoc UC.

## Integrantes

| Integrante | Rol en el equipo |
| --- | --- |
| Maximiliano Cáceres | Base de datos |
| Yonathan Machado | Desarrollo backend |
| Matías Sandoval | Desarrollo frontend |

---

## El problema

El área de Selección de AquaChile gestiona las evaluaciones psicolaborales con planillas Excel, correos y un tablero de Planner. La información del postulante, la solicitud del analista, la agenda de la entrevista y el informe del evaluador quedan dispersos, y Jefatura no tiene una vista consolidada de la carga de trabajo ni de los tiempos del proceso.

## Alcance del MVP

- Registro de postulantes con validación de RUT (dígito verificador), correo y celular chileno.
- Solicitudes de evaluación asociadas a un postulante y asignadas a un profesional evaluador.
- Seguimiento por etapas: agendar la entrevista, registrarla como realizada, redactar el informe por competencias y enviarlo al analista.
- Bandeja del evaluador organizada por etapa, al estilo del tablero Planner que se usa hoy.
- Indicadores para Jefatura: solicitudes por etapa, carga por evaluador, familias de cargo, resultados y días promedio hasta el informe.
- Búsqueda y filtros de postulantes y solicitudes, y exportación del listado a CSV.
- Postulación externa por Google Forms (implementado): Apps Script guarda el CV y un PDF del formulario en una carpeta privada de Drive y registra al postulante en Supabase. La ubicación la completa el analista al editar el postulante. Ver [`docs/INTEGRACION_GOOGLE_FORMS.md`](docs/INTEGRACION_GOOGLE_FORMS.md).
- Administración de usuarios internos (Jefatura).
- Inicio de sesión con Supabase Auth y permisos por rol.

## Tecnologías

| Tecnología | Uso |
| --- | --- |
| React 18 | Interfaz basada en componentes |
| Vite | Servidor de desarrollo y build |
| Bootstrap 5 + React-Bootstrap | Estilos, grilla responsive y componentes (formularios, tablas, modales, alertas) |
| React Router 6 | Navegación y rutas protegidas por rol |
| Supabase | Autenticación, base de datos PostgreSQL con RLS y Edge Functions |
| Vitest + Testing Library | Pruebas unitarias y de componentes |

## Requisitos

- **Node.js 22.12 o superior** (Vite 8 y Vitest 5 lo exigen). Comprueba la versión con `node -v`.
- npm (viene con Node).
- Un proyecto Supabase con las tablas `postulantes`, `solicitudes`, `evaluaciones` y `perfiles`.

## Instalación y ejecución

1. Clona el repositorio y entra a la carpeta:

   ```bash
   git clone <url-del-repositorio>
   cd AquaData
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea el archivo `.env` a partir de la plantilla:

   ```bash
   cp .env.example .env
   ```

   Completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` con los valores de **Supabase → Project Settings → API** (URL del proyecto y *publishable/anon key*). Nunca uses la clave `service_role` en el frontend. El archivo `.env` está en `.gitignore` y no se sube al repositorio.

4. *(Opcional)* Cargar datos de demostración: en **Supabase → SQL Editor** ejecuta el contenido de [`supabase/seed_demo.sql`](supabase/seed_demo.sql). Crea 10 postulantes y 10 solicitudes 100% ficticios repartidos en las 4 etapas, con 3 informes enviados. Requiere la migración aplicada y los perfiles `analista@aquadata.cl` y `evaluador@aquadata.cl` creados. Se puede ejecutar varias veces: al inicio solo borra los registros con correo `@ejemplo.cl` (y sus solicitudes, evaluaciones e historial); no toca ningún otro dato.

5. Levanta el servidor de desarrollo:

   ```bash
   npm run dev
   ```

   Abre la URL que muestra la terminal (por defecto `http://localhost:5173`).

6. Para generar la versión de producción:

   ```bash
   npm run build
   npm run preview
   ```

La configuración de la base de datos (migración, perfiles y políticas RLS) está en [`README_SUPABASE.md`](README_SUPABASE.md). Las cuentas de usuario las crea Jefatura desde **Administrar usuarios** o el equipo desde Supabase Auth; el repositorio no incluye credenciales.

## Pruebas

| Comando | Qué hace |
| --- | --- |
| `npm test` | Ejecuta Vitest en modo observación (se repite al guardar cambios) |
| `npm run test:run` | Ejecuta todas las pruebas una sola vez |
| `npm run coverage` | Ejecuta las pruebas y muestra el reporte de cobertura (HTML en `coverage/`) |

Las pruebas usan jsdom y no se conectan a Supabase: el formulario de postulantes se prueba con el contexto de datos simulado.

Resultados, cobertura, justificación de los escenarios y capturas: [`docs/EVIDENCIA_PRUEBAS.md`](docs/EVIDENCIA_PRUEBAS.md).

| Archivo | Qué comprueba |
| --- | --- |
| `src/utils/__tests__/validaciones.test.js` | RUT (con y sin puntos, dígito verificador, K), postulante, solicitud, entrevista e informe |
| `src/utils/__tests__/flujo.test.js` | Qué se puede editar y cuál es la siguiente acción del evaluador en cada etapa |
| `src/utils/__tests__/indicadores.test.js` | Días entre fechas, promedio hasta el informe y conteos para el dashboard |
| `src/utils/__tests__/estados.test.js` | Formato de fecha, competencias, plantillas por familia de cargo e informe en blanco |
| `src/utils/__tests__/exportarCsv.test.js` | CSV con comas, punto y coma y comillas en los datos, y descarga del archivo |
| `src/components/__tests__/EstadoBadge`, `StatCard`, `EmptyState`, `Barras` | Componentes de presentación según sus props |
| `src/components/__tests__/RolBanner.test.jsx` | Resumen del rol, cierre recordado en la sesión |
| `src/components/__tests__/TablaSolicitudes.test.jsx` | Una fila por solicitud, estado vacío, columna opcional y enlace al detalle |
| `src/components/__tests__/AlertaTemporal.test.jsx` | Cierre automático, cierre con la X y scroll hasta el mensaje |
| `src/components/__tests__/AppLayout.test.jsx` | Menú móvil: fondo, Escape, cierre al navegar y opciones según rol |
| `src/components/__tests__/ProtectedRoute.test.jsx` | Acceso a `/candidatos` según rol, login y carga de sesión |
| `src/pages/__tests__/CandidatoForm.test.jsx` | Mensajes de error con el formulario vacío, RUT inválido y registro exitoso |
| `src/pages/__tests__/Usuarios.test.jsx` | Validación del formulario de usuarios y respuestas de la Edge Function |
| `src/pages/__tests__/Inicio.test.jsx` | Aviso cuando la cuenta no tiene un rol válido |
| `src/pages/__tests__/JefaturaInicio.test.jsx` | Totales, conteo por etapa, barras por evaluador, familia y resultado, y estados vacíos |
| `src/pages/__tests__/EvaluadorInicio.test.jsx` | Bandeja con solo las solicitudes asignadas, por etapa, con hora y acción siguiente |
| `src/pages/__tests__/AnalistaInicio.test.jsx` | Solicitudes propias, aviso de informes listos y estado vacío |
| `src/context/__tests__/AuthContext.test.jsx` | Permisos de cada rol (`tienePermiso`) |
| `src/context/__tests__/AuthProvider.test.jsx` | Sesión guardada, perfil inactivo, login, error de credenciales, logout y eventos de Supabase |

## Roles

| Rol | Qué puede hacer |
| --- | --- |
| **Analista de Reclutamiento** | Registrar y editar postulantes, crear y editar solicitudes de evaluación, revisar los informes recibidos y confirmar su recepción |
| **Profesional Evaluador** | Ver su bandeja de solicitudes asignadas, agendar y reagendar entrevistas, marcarlas como realizadas, redactar el informe (con borrador) y enviarlo o reabrirlo para corregirlo |
| **Jefatura** | Ver los indicadores del proceso, consultar y exportar las solicitudes a CSV y administrar los usuarios (crear, editar, activar y desactivar cuentas) |

Las rutas de postulantes y las que modifican datos están protegidas por permiso (`src/components/ProtectedRoute.jsx` y `src/context/AuthContext.jsx`). Si un rol sin permiso entra por URL, ve el aviso "No tienes acceso a esta sección". En Supabase, las políticas RLS hacen la validación definitiva.

## Flujo de una evaluación

```text
Postulante registrado ─► Solicitud creada ─► Entrevista agendada ─► Entrevista realizada ─► Informe enviado
     (Analista)             (Analista)           (Evaluador)            (Evaluador)            (Evaluador)
                     estado "Evaluación recibida"                                                  │
                                                                                                   ▼
                                                              Analista marca el informe como recibido
                                                              Indicadores de Jefatura se actualizan
```

1. **Registro del postulante.** El analista ingresa RUT, nombre, correo, teléfono, cargo, familia de cargo, ubicación y origen.
2. **Solicitud de evaluación.** El analista elige el postulante (el cargo y la familia se completan solos), asigna un evaluador y anota los aspectos a indagar. Según la familia de cargo se asignan la plantilla del informe y la pauta de entrevista. La solicitud parte en *Evaluación recibida*.
3. **Entrevista.** El evaluador agenda fecha y hora (no puede ser anterior a la solicitud) y luego la marca como realizada.
4. **Informe.** El evaluador completa el informe por competencias, la categoría (*Recomendado*, *Recomendado con observaciones*, *No recomendado*) y la conclusión. Puede guardarlo como borrador y, al enviarlo, la solicitud queda en *Informe enviado* y ya no se puede editar. Si detecta un error, puede reabrirlo.
5. **Cierre.** El analista revisa o imprime el informe y confirma su recepción. Jefatura ve reflejado el avance en sus indicadores.

## Mapa de rutas

| Ruta | Página | Acceso |
| --- | --- | --- |
| `/login` | `Login.jsx` | Público |
| `/` | `Inicio.jsx` (vista según rol: `AnalistaInicio`, `EvaluadorInicio` o `JefaturaInicio`) | Usuarios con sesión |
| `/candidatos` | `Candidatos.jsx` | Analista |
| `/candidatos/nuevo` | `CandidatoForm.jsx` | Analista |
| `/candidatos/:id/editar` | `CandidatoForm.jsx` | Analista |
| `/solicitudes` | `Solicitudes.jsx` | Usuarios con sesión |
| `/solicitudes/nueva` | `SolicitudForm.jsx` | Analista |
| `/solicitudes/:id` | `SolicitudDetalle.jsx` (acciones según rol y etapa) | Usuarios con sesión |
| `/solicitudes/:id/editar` | `SolicitudForm.jsx` | Analista, mientras el informe no esté enviado |
| `/usuarios` | `jefatura/Usuarios.jsx` | Jefatura |
| Cualquier otra | `NoEncontrada.jsx` | — |

## Qué está simulado o pendiente

- **Ver el CV desde la app (Google Drive).** Las postulaciones por Google Forms ya guardan el CV y el PDF en Drive (ver *Alcance del MVP*), pero la app todavía no abre esos archivos: el CV, la plantilla de informe y la pauta de entrevista se muestran por nombre. Ya existen la capa de servicio (`src/services/googleDriveService.js`) y la Edge Function `google-drive`, que responde *501* hasta que se configuren las credenciales del servidor. Detalle en [`docs/INTEGRACION_GOOGLE_DRIVE.md`](docs/INTEGRACION_GOOGLE_DRIVE.md).
- **Plantillas por familia de cargo.** Los nombres de archivo y las competencias de cada familia son una propuesta para el MVP (`src/utils/estados.js`) y deben validarse con el área de Selección.
- **Administración de usuarios.** Requiere desplegar la Edge Function `usuarios` ([`docs/ADMINISTRACION_USUARIOS.md`](docs/ADMINISTRACION_USUARIOS.md)). La recuperación de contraseña aún no está habilitada.

## Estructura de carpetas

```text
AquaData/
├── index.html
├── vite.config.js            # Vite + configuración de Vitest (jsdom)
├── .env.example              # Plantilla de variables de entorno (sin claves reales)
├── README_SUPABASE.md        # Configuración de la base de datos
├── docs/                     # Integraciones (Drive, Forms) y administración de usuarios
├── google-apps-script/       # Script de Google Forms → Supabase
├── supabase/
│   ├── functions/            # Edge Functions: usuarios, google-drive, registrar-postulacion
│   └── migrations/           # Migraciones SQL
└── src/
    ├── main.jsx              # Punto de entrada: Bootstrap, Router y proveedores de contexto
    ├── App.jsx               # Definición de rutas
    ├── setupTests.js         # Matchers de Testing Library para Vitest
    ├── assets/               # Logo e imágenes
    ├── components/           # Componentes reutilizables (layout, tabla de solicitudes, alertas, badges, tarjetas, informe)
    │   └── __tests__/
    ├── context/              # AuthContext (sesión y permisos) y DataContext (datos de Supabase)
    │   └── __tests__/
    ├── hooks/                # useMensajeNavegacion (mensajes de éxito entre páginas)
    ├── lib/                  # Cliente de Supabase
    ├── pages/                # Una página por ruta
    │   ├── inicio/           # Inicio según rol
    │   ├── jefatura/         # Administración de usuarios
    │   └── __tests__/
    ├── services/             # Servicio de Google Drive
    ├── styles/               # Estilos propios sobre Bootstrap
    └── utils/                # Reglas de negocio puras: validaciones, flujo, indicadores, estados, CSV
        └── __tests__/
```
