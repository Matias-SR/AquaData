# Evidencia de pruebas — Evaluación Parcial 2 (DSY1104)

Sistema de Gestión de Evaluaciones Psicolaborales — AquaChile. Rama `maxi-dev`, ejecución del 01-11-2026.

## 1. Resumen

| Ítem | Valor |
| --- | --- |
| Herramientas | Vitest 5.0.5 + React Testing Library + jsdom (cobertura con `@vitest/coverage-v8`) |
| Archivos de prueba | 22 |
| Pruebas | 146 (146 aprobadas, 0 fallidas) |
| Cobertura total | 87,6 % statements · 75,65 % branches · 84,96 % functions · 89,25 % lines |

Cómo ejecutarlas:

```bash
npm install
npm run test:run   # ejecuta todas las pruebas una vez
npm run coverage   # pruebas + reporte de cobertura (HTML en coverage/index.html)
```

## 2. Casos de prueba por archivo

| Archivo | Pruebas | Qué verifica | Regla de negocio / caso AquaChile que respalda |
| --- | ---: | --- | --- |
| `utils/__tests__/validaciones.test.js` | 33 | RUT (con/sin puntos, dígito verificador, K/k, vacío, letras), correo, celular chileno, campos obligatorios de postulante, solicitud, entrevista, informe y usuario | Datos del postulante confiables; entrevista e informe no pueden ser anteriores a la solicitud; informe completo por competencias |
| `utils/__tests__/estados.test.js` | 12 | Formato de fecha chileno sin desfase horario, hora sin segundos, competencias, plantilla y pauta por familia de cargo, informe en blanco | Cada familia de cargo usa sus competencias, su plantilla de informe y su pauta de entrevista |
| `utils/__tests__/flujo.test.js` | 9 | Edición permitida por etapa y acción siguiente del evaluador en las 4 etapas | Flujo del tablero Planner: Evaluación recibida → Entrevista agendada → Entrevista realizada → Informe enviado; con el informe enviado ya no se edita |
| `utils/__tests__/indicadores.test.js` | 9 | Días entre fechas, promedio de días hasta el informe, conteos agrupados | Indicadores de Jefatura (tiempo de respuesta y distribución) |
| `utils/__tests__/exportarCsv.test.js` | 6 | BOM para Excel, separador `;`, comillas, celdas vacías y descarga | Jefatura exporta el listado de solicitudes para Excel en español |
| `context/__tests__/AuthContext.test.jsx` | 8 | Permisos de cada rol (`tienePermiso`) y rol desconocido | Separación de funciones entre Analista, Evaluador y Jefatura |
| `context/__tests__/AuthProvider.test.jsx` | 7 | Sesión guardada, perfil inactivo, login, error de credenciales, logout y eventos de sesión | Solo usuarios activos entran; el rol se toma del perfil |
| `components/__tests__/ProtectedRoute.test.jsx` | 5 | Acceso a `/candidatos` por rol, redirección al login y carga | Un evaluador o jefatura no ve postulantes aunque escriba la URL |
| `components/__tests__/AppLayout.test.jsx` | 6 | Menú móvil (fondo, Escape, foco, cierre al navegar) y opciones según rol | Cada rol ve solo su menú; uso en celular |
| `components/__tests__/TablaSolicitudes.test.jsx` | 8 | Filas, informe recibido, postulante no disponible, columna de evaluador, enlace al detalle, estado vacío | Seguimiento de solicitudes por el analista |
| `components/__tests__/AlertaTemporal.test.jsx` | 5 | Color, cierre automático solo en éxito, cierre manual, scroll al mensaje | Mensajes de éxito y error visibles para el usuario |
| `components/__tests__/RolBanner.test.jsx` | 3 | Explicación del rol, cierre recordado, almacenamiento bloqueado | Orientación del usuario según su rol |
| `components/__tests__/EstadoBadge.test.jsx` | 5 | Color por etapa y etapa desconocida | Etapas identificables a simple vista |
| `components/__tests__/Barras.test.jsx` | 4 | Barras proporcionales y mensaje vacío | Gráficos del panel de Jefatura |
| `components/__tests__/StatCard.test.jsx` | 2 | Valor, etiqueta y detalle opcional | Tarjetas de indicadores |
| `components/__tests__/EmptyState.test.jsx` | 1 | Título e indicación | Pantallas sin datos con orientación |
| `pages/__tests__/CandidatoForm.test.jsx` | 3 | Errores con formulario vacío, RUT inválido, registro exitoso con mensaje | Registro de postulantes por el analista |
| `pages/__tests__/AnalistaInicio.test.jsx` | 4 | Solicitudes propias ordenadas, aviso de informes listos, estado vacío | Analista revisa los informes que le envían |
| `pages/__tests__/EvaluadorInicio.test.jsx` | 6 | Solo solicitudes asignadas, columna por etapa, hora sin segundos, enlace al detalle | Bandeja del evaluador |
| `pages/__tests__/JefaturaInicio.test.jsx` | 6 | Totales, conteo por etapa (incluye etapas en 0), carga por evaluador, barras, promedio vacío, enlace a exportar | Panel de indicadores de Jefatura |
| `pages/__tests__/Usuarios.test.jsx` | 3 | Validación al crear usuario, éxito y error devuelto por el servidor | Jefatura administra las cuentas |
| `pages/__tests__/Inicio.test.jsx` | 1 | Aviso si la cuenta no tiene rol válido | La app no se rompe con perfiles mal configurados |

Rutas relativas a `src/`.

## 3. Justificación de los escenarios

- **Validaciones (RUT, correo, teléfono):** son la entrada de todo el proceso. Un RUT con dígito verificador incorrecto o un contacto inválido genera postulantes duplicados o inubicables. Se prueban casos válidos, inválidos y bordes (K minúscula, sin puntos, celular sin +56).
- **Flujo de etapas:** replica el tablero Planner de AquaChile. Se verifica que cada etapa indique la acción correcta y que un informe enviado no se pueda modificar.
- **Indicadores de Jefatura:** son los datos que usa Jefatura para tomar decisiones. Un error en el promedio de días o en los conteos pasaría inadvertido en una revisión visual, por eso se prueban los cálculos aparte y también en pantalla.
- **Permisos por rol:** el sistema maneja datos sensibles de postulantes. Se comprueba la matriz de permisos y que el acceso por URL directa quede bloqueado.
- **Formularios:** son el punto donde el usuario puede equivocarse. Se prueba que los errores se muestren, que no se guarde nada inválido y que el éxito se confirme.
- **Supabase simulado (`vi.mock`):** las pruebas no tocan la base real ni dependen de la red. Así son repetibles, rápidas (≈11 s), no ensucian datos y no requieren credenciales. Se simulan `supabaseClient`, `AuthContext` o `DataContext` según el caso.

## 4. Resultados (ejecución real)

`npm run test:run`:

```
 Test Files  22 passed (22)
      Tests  146 passed (146)
   Duration  11.27s
```

`npm run coverage` — total:

| Statements | Branches | Functions | Lines |
| ---: | ---: | ---: | ---: |
| 87,6 % (438/500) | 75,65 % (258/341) | 84,96 % (113/133) | 89,25 % (357/400) |

Por carpeta:

| Carpeta | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: |
| `components` | 91,91 % | 89,39 % | 91,17 % | 93,67 % |
| `context` | 88,05 % | 65,78 % | 100 % | 92,85 % |
| `pages` | 85,41 % | 57,14 % | 81,81 % | 92,68 % |
| `pages/inicio` | 97,43 % | 84,21 % | 95,45 % | 96,42 % |
| `pages/jefatura` | 65,74 % | 40,29 % | 41,66 % | 68,75 % |
| `utils` | 99,28 % | 95,68 % | 100 % | 100 % |

> La cobertura de V8 se calcula sobre los archivos que cargan las pruebas. Los archivos sin pruebas (sección 5) no aparecen en el reporte, por lo que el 87,6 % corresponde al código probado y no a toda la aplicación.

## 5. Qué no está cubierto y por qué

| Área | Motivo |
| --- | --- |
| Estilos CSS y diseño responsive | jsdom no calcula diseño ni medidas. Se probaron manualmente en el navegador a 375 px. |
| `SolicitudDetalle.jsx`, `Solicitudes.jsx`, `SolicitudForm.jsx`, `Candidatos.jsx`, `Login.jsx`, `InformeEditor.jsx`, `InformeVista.jsx`, `DataContext.jsx` | Sin pruebas automatizadas propias. Sus reglas (validaciones, flujo, permisos, informe por competencias) están probadas en `utils` y `context`, y las pantallas se verificaron manualmente con los 3 roles. |
| `Usuarios.jsx`: editar y activar/desactivar | Solo está probada la creación (65,74 % statements). Edición y activación quedan pendientes de prueba manual (no se probaron para no alterar las cuentas reales del equipo). |
| Integración Google Forms (`Code.gs` y Edge Function `registrar-postulacion`) | Implementada. No tiene pruebas automatizadas porque corre en Apps Script y en Supabase, fuera de Vitest; se probó de punta a punta (sección 6). Ver `docs/INTEGRACION_GOOGLE_FORMS.md`. |
| Ver el CV desde la app (Google Drive) | Pendiente: la función `google-drive` responde 501 hasta configurar las credenciales del servidor. Ver `docs/INTEGRACION_GOOGLE_DRIVE.md`. |

## 6. Pruebas manuales en navegador

| Prueba | Qué se verificó |
| --- | --- |
| Flujo completo con los 3 roles | Analista registra y edita postulante, y crea solicitud → Evaluador agenda entrevista, la marca como realizada, guarda borrador, envía informe, lo reabre y lo reenvía → Jefatura ve los indicadores actualizados (10 solicitudes, 7 en curso, 3 informes, 8,3 días promedio). "Marcar informe como recibido" por el Analista queda pendiente de prueba manual. |
| Validaciones | RUT con dígito verificador incorrecto, correo sin @, teléfono vacío, campos obligatorios (incluidos Ubicación y Origen), entrevista sin hora, informe con competencias incompletas y conclusión corta, crear usuario vacío y con correo inválido |
| Mensajes | Éxito al editar postulante (se cierra solo), un solo mensaje al guardar borrador, scroll a la confirmación al enviar informe, mensaje al reabrir informe |
| Permisos por URL | Evaluador y Jefatura ven "No tienes acceso" en `/candidatos` y `/solicitudes/nueva` |
| Exportar CSV (Jefatura) | Descarga `solicitudes.csv` con encabezado + 10 filas, separador `;` y tildes correctas |
| Responsive a 375 px | Tablas con scroll horizontal, menú lateral con fondo (cierre con fondo, Escape y al navegar), bandeja kanban apilada, barra de etapas en 2x2; ningún elemento se sale de la pantalla |
| Datos de demostración | `supabase/seed_demo.sql` ejecutado en el SQL Editor |
| Integración Google Forms (01-11-2026) | Postulación enviada desde el formulario: se creó la carpeta del postulante en Drive con el CV y `Formulario_Postulacion.pdf`, y el registro llegó a `public.postulantes` con origen Externo (los datos de la prueba se eliminaron después) |

## 7. Evidencia

**Pruebas Vitest (`npm run test:run`)**

![Resultado de npm run test:run: 22 archivos y 146 pruebas aprobadas](../Evidencia%20fotografica/Segundo%20Avance/01-pruebas-vitest.png)

**Cobertura en terminal (`npm run coverage`)**

![Reporte de cobertura en la terminal](../Evidencia%20fotografica/Segundo%20Avance/02-cobertura-terminal.png)

**Reporte HTML de cobertura (`coverage/index.html`)**

![Reporte HTML de cobertura por carpeta](../Evidencia%20fotografica/Segundo%20Avance/03-cobertura-html.png)
