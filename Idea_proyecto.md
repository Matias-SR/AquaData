# AquaChile — Documento maestro de requisitos y planificación

**Proyecto:** Sistema de gestión de postulantes y evaluaciones psicolaborales  
**Organización:** AquaChile  
**Estado:** Planificación y desarrollo  
**Versión del documento:** 1.0  
**Fecha:** Octubre de 2026

---

# 1. Descripción general del proyecto

AquaChile necesita una aplicación web interna para gestionar procesos de selección de personal, postulaciones, solicitudes de evaluaciones psicolaborales, entrevistas e informes.

El sistema debe permitir centralizar la información de los postulantes, organizar el trabajo de los analistas reclutadores y profesionales evaluadores, y entregar a las jefaturas herramientas para supervisar los procesos y consultar resultados.

La aplicación tendrá dos partes principales:

1. **Formulario externo de postulación:** utilizado por las personas interesadas en postular a un cargo. Se implementará mediante Google Forms.
2. **Sistema interno de gestión:** aplicación web donde los trabajadores autorizados podrán consultar postulantes, administrar solicitudes, registrar evaluaciones y supervisar los procesos.

El proyecto debe priorizar una interfaz sencilla, ordenada, profesional y fácil de utilizar. No se busca desarrollar un sistema innecesariamente complejo, sino una solución funcional, segura y mantenible.

# 2. Tecnologías definidas

Las siguientes tecnologías ya fueron seleccionadas y deben respetarse durante el desarrollo.

| Componente | Tecnología |
|---|---|
| Frontend | React |
| Herramienta de desarrollo frontend | Vite |
| Lenguaje frontend | JavaScript |
| Base de datos | Supabase PostgreSQL |
| Autenticación | Supabase Auth |
| Seguridad de datos | Supabase Row Level Security (RLS) |
| Formulario externo | Google Forms |
| Automatización | Google Apps Script |
| Almacenamiento de documentos | Google Drive |
| Integración backend | Supabase Edge Functions |
| Control de versiones | Git y GitHub |

**Importante:** La base de datos será Supabase. No utilizar Oracle, MySQL ni Firebase como reemplazo.

El proyecto ya cuenta con una base de código React + Vite. Se debe trabajar sobre esa estructura y aprovechar los componentes, pantallas, navegación, contextos y funcionalidades existentes.

No se debe comenzar un proyecto completamente nuevo sin antes revisar el código existente.

# 3. Objetivo general

Desarrollar una plataforma web que permita gestionar de manera centralizada los procesos de selección de personal de AquaChile, desde la recepción de antecedentes de los postulantes hasta la generación y consulta de resultados de evaluaciones psicolaborales.

# 4. Objetivos específicos

- Centralizar los antecedentes personales y laborales de los postulantes.
- Permitir la recepción de postulaciones mediante Google Forms.
- Automatizar la organización de currículums y documentos en Google Drive.
- Facilitar la búsqueda y consulta de postulantes.
- Gestionar solicitudes de evaluación psicolaboral.
- Asignar solicitudes a profesionales evaluadores.
- Registrar resultados, observaciones e informes.
- Permitir que las jefaturas supervisen los procesos.
- Controlar los permisos según el rol de cada usuario.
- Mantener un historial de los procesos y sus estados.

# 5. Arquitectura general

La arquitectura propuesta es la siguiente:

```text
                  POSTULANTE EXTERNO
                         |
                         v
                   GOOGLE FORMS
                         |
                         v
                  GOOGLE APPS SCRIPT
                         |
             +-----------+-----------+
             |                       |
             v                       v
        GOOGLE DRIVE           SUPABASE EDGE
       (Documentos)             FUNCTION
             |                       |
             |                       v
             |                 SUPABASE
             |               (PostgreSQL)
             |                       ^
             |                       |
             +-----------------------+
                                     |
                                     |
                              REACT + VITE
                           SISTEMA INTERNO
                                     |
                   +-----------------+-----------------+
                   |                 |                 |
                   v                 v                 v
              ANALISTA          EVALUADOR           JEFATURA
              RECLUTADOR        PROFESIONAL
```

## 5.1. Funcionamiento de la integración

1. El postulante completa el formulario de Google Forms.
2. Adjunta su currículum vitae.
3. Google Forms registra la respuesta.
4. Google Apps Script detecta el envío mediante un activador de formulario.
5. El script obtiene los antecedentes del postulante y el archivo adjunto.
6. Se crea una carpeta individual en Google Drive.
7. Se copia el currículum vitae dentro de la carpeta correspondiente.
8. Se genera un documento PDF con los datos entregados en el formulario.
9. Se guarda el PDF en la misma carpeta.
10. Google Apps Script envía los datos y referencias de los documentos a una Supabase Edge Function.
11. La Edge Function valida la información y registra al postulante en Supabase.
12. Los usuarios internos pueden buscar y consultar al postulante desde la aplicación.

## 5.2. Consideraciones sobre Google personal

La cuenta de Google que utilizará AquaChile es una cuenta personal de Gmail, no una cuenta Google Workspace.

Por lo tanto:

- La integración debe funcionar con una cuenta Gmail personal.
- Google Apps Script debe ejecutarse con la cuenta propietaria del formulario.
- La cuenta debe autorizar los permisos necesarios de Google Forms y Google Drive.
- Se debe considerar que Google Forms utiliza inicio de sesión con una cuenta Google para responder preguntas de carga de archivos.
- Los postulantes deberán iniciar sesión con una cuenta Google para adjuntar su currículum mediante este mecanismo.
- No se deben publicar las carpetas ni los documentos de los postulantes para acceso público.
- Los usuarios internos deben tener permisos explícitos para acceder a los documentos.
- Se debe considerar un mecanismo de acceso seguro para visualizar o descargar documentos desde la aplicación.

**Importante:** Antes de implementar el formulario definitivo, se debe probar el comportamiento de la carga de archivos con cuentas personales externas.

# 6. Formulario externo de postulación

Se utilizará Google Forms para recibir postulaciones.

## 6.1. Campos obligatorios

El formulario debe solicitar:

| Campo | Tipo |
|---|---|
| Nombre completo | Respuesta corta |
| RUT | Respuesta corta |
| Correo electrónico | Respuesta corta |
| Teléfono | Respuesta corta |
| Cargo al que postula | Lista desplegable |
| Familia de cargo | Lista desplegable |
| Currículum Vitae | Carga de archivo |

## 6.2. Validaciones

- Ningún campo obligatorio debe quedar vacío.
- El correo debe tener un formato válido.
- El RUT debe almacenarse de forma normalizada para evitar duplicados.
- El currículum debe ser un archivo permitido.
- Se deben definir límites razonables de tamaño y formato para los archivos.
- Se debe evitar registrar dos veces al mismo postulante por su RUT.

## 6.3. Organización de Google Drive

Cada postulación debe generar una carpeta con el siguiente formato:

```text
Nombre Completo (RUT)
```

Ejemplo:

```text
Juan Pérez González (12345678-9)
```

Dentro de la carpeta deben quedar:

```text
Juan Pérez González (12345678-9)/
│
├── Formulario_Postulacion.pdf
│
└── Curriculum_Vitae.pdf
```

La extensión del currículum dependerá del archivo original. No se debe asumir que siempre será PDF.

## 6.4. PDF de postulación

El archivo `Formulario_Postulacion.pdf` debe contener:

- Nombre completo.
- RUT.
- Correo electrónico.
- Teléfono.
- Cargo al que postula.
- Familia de cargo.
- Fecha y hora de postulación.

Debe tener una presentación limpia y profesional, con el nombre de AquaChile y una estructura fácil de leer.

# 7. Roles y permisos del sistema

El sistema tendrá tres roles principales. Deben conservarse y utilizarse para controlar las funcionalidades disponibles.

## 7.1. Analista Reclutador

Es responsable de gestionar los postulantes y crear solicitudes de evaluación.

Funciones:

- Iniciar sesión.
- Visualizar postulantes registrados.
- Buscar postulantes por nombre o RUT.
- Consultar los antecedentes de cada postulante.
- Revisar los documentos asociados.
- Registrar postulantes manualmente cuando sea necesario.
- Crear solicitudes de evaluación psicolaboral.
- Seleccionar el cargo al que postula.
- Seleccionar la familia de cargo.
- Asignar un profesional evaluador.
- Consultar el estado de las solicitudes que creó.

El analista debe poder identificar fácilmente qué postulantes aún no tienen una solicitud de evaluación.

## 7.2. Profesional Evaluador

Es responsable de realizar las evaluaciones psicolaborales.

Funciones:

- Iniciar sesión.
- Visualizar las solicitudes que tiene asignadas.
- Consultar los antecedentes del postulante.
- Revisar el currículum vitae.
- Revisar el cargo y la familia de cargo.
- Consultar la información de la solicitud.
- Registrar resultados de evaluación.
- Registrar observaciones.
- Registrar conclusiones.
- Actualizar el estado del proceso según corresponda.
- Registrar si el postulante es recomendado, recomendado con observaciones o no recomendado.
- Registrar y enviar el informe correspondiente.

El evaluador no debe poder modificar usuarios ni administrar los permisos del sistema.

## 7.3. Jefatura

Es el rol con mayores permisos de administración y supervisión.

Funciones:

- Iniciar sesión.
- Visualizar los usuarios registrados.
- Crear usuarios.
- Editar usuarios.
- Desactivar usuarios.
- Asignar roles.
- Consultar postulantes.
- Consultar solicitudes.
- Visualizar resultados de los analistas.
- Visualizar resultados de los evaluadores.
- Consultar evaluaciones e informes.
- Supervisar el avance de los procesos.

La jefatura debe tener una vista general del funcionamiento del sistema.

# 8. Módulos del sistema

Se deben mantener las pantallas y funcionalidades existentes en el proyecto React cuando sean compatibles con los requisitos.

## 8.1. Módulo de autenticación

Permite iniciar sesión mediante Supabase Auth.

Requisitos:

- Inicio de sesión con correo y contraseña.
- Cierre de sesión.
- Protección de rutas.
- Identificación del rol del usuario.
- Redirección según los permisos.
- Mensajes de error claros.
- Sesión persistente de acuerdo con la configuración de Supabase.

No debe existir un registro público de usuarios internos.

Los usuarios serán creados por la jefatura o por un procedimiento administrativo controlado.

## 8.2. Dashboard

Debe mostrar información resumida y útil.

Indicadores sugeridos:

- Total de postulantes.
- Nuevas postulaciones.
- Solicitudes pendientes.
- Evaluaciones en proceso.
- Entrevistas agendadas.
- Entrevistas realizadas.
- Informes enviados.

El contenido debe adaptarse al rol del usuario.

## 8.3. Módulo de postulantes

Debe permitir:

- Listar postulantes.
- Buscar por nombre.
- Buscar por RUT.
- Filtrar por cargo.
- Filtrar por familia de cargo.
- Consultar los antecedentes.
- Consultar la fecha de postulación.
- Acceder a los documentos de Google Drive.
- Consultar las solicitudes asociadas.

La búsqueda debe ser sencilla y rápida.

### Vista de detalle del postulante

Al seleccionar un postulante, se debe mostrar:

**Datos personales**
- Nombre completo.
- RUT.
- Correo.
- Teléfono.

**Datos de postulación**
- Cargo.
- Familia de cargo.
- Fecha de postulación.

**Documentación**
- Botón para visualizar el formulario PDF.
- Botón para visualizar o descargar el currículum vitae.

**Historial**
- Solicitudes asociadas.
- Evaluadores asignados.
- Estados del proceso.
- Evaluaciones registradas.

## 8.4. Módulo de solicitudes

Permite gestionar las solicitudes de evaluación psicolaboral.

Cada solicitud debe tener:

- Postulante asociado.
- Cargo.
- Familia de cargo.
- Analista responsable.
- Profesional evaluador asignado.
- Fecha de creación.
- Estado del proceso.
- Observaciones.
- Fecha de entrevista, si corresponde.

El sistema debe impedir crear solicitudes sin un postulante asociado.

## 8.5. Módulo de evaluación

Permite que el profesional evaluador registre los resultados.

Información sugerida:

- Solicitud asociada.
- Postulante.
- Evaluador responsable.
- Fecha de evaluación.
- Resultado.
- Conclusión.
- Observaciones.
- Competencias evaluadas.
- Informe asociado.

Resultados posibles:

- Recomendado.
- Recomendado con observaciones.
- No recomendado.

La información de una evaluación debe estar vinculada a una solicitud específica.

## 8.6. Módulo de informes

Permite consultar los informes enviados por los evaluadores.

Debe mostrar:

- Nombre del postulante.
- Cargo.
- Familia de cargo.
- Evaluador.
- Fecha.
- Resultado.
- Conclusión.
- Estado de envío del informe.

## 8.7. Módulo de administración de usuarios

Disponible únicamente para Jefatura.

Debe permitir:

- Crear usuarios.
- Editar datos.
- Asignar roles.
- Activar o desactivar usuarios.
- Consultar usuarios registrados.

No se debe permitir que un usuario común se asigne permisos de jefatura a sí mismo.

# 9. Estados del proceso

Se deben conservar los estados definidos para el proyecto:

1. `Evaluación recibida`
2. `Entrevista agendada`
3. `Entrevista realizada`
4. `Informe enviado`

Estos estados representan el avance del proceso.

La aplicación debe mostrar el estado actual en las tablas y en el detalle del postulante.

Se recomienda mantener un historial de cambios de estado para conocer quién realizó cada modificación y cuándo.

El resultado de la evaluación debe ser un dato independiente del estado del proceso.

# 10. Diseño de base de datos en Supabase

La base de datos debe utilizar PostgreSQL de Supabase.

Se propone la siguiente estructura inicial.

## 10.1. Tabla `perfiles`

Almacena la información de los usuarios internos.

| Campo | Tipo sugerido | Descripción |
|---|---|---|
| id | UUID | Relación con auth.users |
| nombre | TEXT | Nombre del usuario |
| correo | TEXT | Correo electrónico |
| rol | TEXT | analista, evaluador o jefatura |
| activo | BOOLEAN | Estado del usuario |
| created_at | TIMESTAMPTZ | Fecha de creación |

## 10.2. Tabla `postulantes`

Almacena los antecedentes de las personas que postulan.

| Campo | Tipo sugerido | Descripción |
|---|---|---|
| id | UUID | Identificador |
| rut | TEXT | RUT normalizado y único |
| nombre_completo | TEXT | Nombre completo |
| correo | TEXT | Correo electrónico |
| telefono | TEXT | Teléfono |
| cargo | TEXT | Cargo al que postula |
| familia_cargo | TEXT | Familia de cargo |
| drive_folder_id | TEXT | ID de carpeta |
| drive_folder_url | TEXT | Referencia de carpeta |
| formulario_file_id | TEXT | ID del PDF |
| formulario_file_url | TEXT | Referencia del PDF |
| cv_file_id | TEXT | ID del currículum |
| cv_file_url | TEXT | Referencia del currículum |
| google_response_id | TEXT | Identificador de respuesta |
| fecha_postulacion | TIMESTAMPTZ | Fecha de postulación |
| created_at | TIMESTAMPTZ | Fecha de registro |

El RUT debe tener una restricción UNIQUE.

## 10.3. Tabla `solicitudes`

Almacena las solicitudes de evaluación.

| Campo | Tipo sugerido | Descripción |
|---|---|---|
| id | UUID | Identificador |
| postulante_id | UUID | Postulante asociado |
| cargo | TEXT | Cargo solicitado |
| familia_cargo | TEXT | Familia de cargo |
| analista_id | UUID | Analista responsable |
| evaluador_id | UUID | Evaluador asignado |
| estado | TEXT | Estado del proceso |
| observaciones | TEXT | Observaciones |
| fecha_entrevista | TIMESTAMPTZ | Fecha de entrevista |
| created_at | TIMESTAMPTZ | Fecha de creación |
| updated_at | TIMESTAMPTZ | Última modificación |

## 10.4. Tabla `evaluaciones`

Almacena los resultados de las evaluaciones psicolaborales.

| Campo | Tipo sugerido | Descripción |
|---|---|---|
| id | UUID | Identificador |
| solicitud_id | UUID | Solicitud relacionada |
| evaluador_id | UUID | Profesional responsable |
| fecha_evaluacion | TIMESTAMPTZ | Fecha |
| resultado | TEXT | Resultado de evaluación |
| conclusion | TEXT | Conclusión |
| observaciones | TEXT | Observaciones |
| competencias | JSONB | Competencias evaluadas |
| informe_url | TEXT | Referencia al informe |
| informe_enviado | BOOLEAN | Estado de envío |
| created_at | TIMESTAMPTZ | Fecha de creación |

Una solicitud debe tener como máximo una evaluación final, salvo que se defina expresamente un flujo de reevaluación.

## 10.5. Tabla `historial_estados`

Se recomienda agregar una tabla para mantener trazabilidad.

| Campo | Tipo sugerido | Descripción |
|---|---|---|
| id | UUID | Identificador |
| solicitud_id | UUID | Solicitud asociada |
| estado_anterior | TEXT | Estado anterior |
| estado_nuevo | TEXT | Estado nuevo |
| usuario_id | UUID | Usuario que realizó el cambio |
| fecha_cambio | TIMESTAMPTZ | Fecha del cambio |
| comentario | TEXT | Motivo u observación |

## 10.6. Relaciones principales

```text
auth.users
    |
    v
perfiles

postulantes
    |
    +------ solicitudes
                 |
                 +------ evaluaciones
                 |
                 +------ historial_estados
```

Relaciones:

- Un postulante puede tener varias solicitudes.
- Una solicitud pertenece a un postulante.
- Una solicitud puede tener un analista responsable.
- Una solicitud puede tener un evaluador asignado.
- Una solicitud puede tener una evaluación.
- Una solicitud puede tener varios registros de historial de estados.

# 11. Seguridad y permisos

La seguridad es especialmente importante porque se almacenarán antecedentes personales, currículums e informes psicolaborales.

Se deben implementar políticas RLS en las tablas de Supabase.

Reglas generales:

- Un usuario debe estar autenticado para ingresar al sistema interno.
- El rol debe obtenerse desde el perfil registrado en Supabase.
- Un analista puede gestionar sus postulantes y solicitudes según sus permisos.
- Un evaluador puede consultar las solicitudes que tiene asignadas y registrar sus evaluaciones.
- Jefatura puede supervisar y administrar el sistema.
- Los usuarios no deben poder modificar su propio rol.
- Las operaciones administrativas deben estar protegidas.
- No se deben exponer datos privados mediante endpoints públicos.

## 11.1. Google Drive

Las carpetas y documentos deben mantenerse privados.

No se debe utilizar la opción de compartir con "cualquier persona que tenga el enlace".

Se debe implementar una de estas alternativas:

**Alternativa A — Acceso autorizado**

Compartir las carpetas con las cuentas Google autorizadas de los usuarios internos que necesiten consultar documentos.

**Alternativa B — Acceso mediante backend**

La aplicación solicita el documento a un servicio seguro que valida los permisos del usuario y entrega el archivo sin publicar el enlace.

Se recomienda evaluar la alternativa B si se necesita controlar el acceso de manera centralizada.

## 11.2. Protección de credenciales

Nunca guardar en el frontend:

- Supabase Service Role Key.
- Secretos de Google.
- Contraseñas de cuentas.
- Tokens privados.
- Claves de webhook.

El frontend puede utilizar la URL de Supabase y su clave publicable, siempre que RLS esté correctamente configurado.

Las claves privadas deben mantenerse en secretos del entorno seguro correspondiente.

# 12. Diseño e interfaz de usuario

La aplicación debe conservar la estructura visual y funcional del proyecto React existente.

Lineamientos:

- Diseño profesional y corporativo.
- Interfaz limpia.
- Navegación sencilla.
- Menú lateral o navegación equivalente según la estructura existente.
- Tablas legibles.
- Formularios claros.
- Botones con nombres descriptivos.
- Indicadores visuales para los estados.
- Mensajes de confirmación y error.
- Diseño adaptable a escritorio y tablet.

Se debe priorizar la facilidad de uso para personas que no necesariamente tienen conocimientos técnicos.

## 12.1. Pantallas principales

1. Login.
2. Dashboard.
3. Listado de postulantes.
4. Detalle de postulante.
5. Crear solicitud.
6. Listado de solicitudes.
7. Detalle de solicitud.
8. Mis evaluaciones.
9. Registro de evaluación.
10. Informes.
11. Administración de usuarios.

Las pantallas deben mostrarse según los permisos del usuario.

# 13. Plan de desarrollo

El desarrollo se realizará por etapas para facilitar las pruebas y evitar implementar todo de una sola vez.

## Etapa 1 — Revisión del proyecto existente

Objetivos:

- Revisar la estructura de carpetas.
- Identificar componentes reutilizables.
- Revisar las rutas.
- Revisar los contextos.
- Identificar los datos de prueba.
- Identificar las pantallas existentes.
- Detectar funcionalidades que deben mantenerse.

Resultado esperado:

Un diagnóstico del proyecto y una lista de archivos que requieren modificación.

**Regla:** No eliminar funcionalidades existentes sin justificarlo.

## Etapa 2 — Preparación de Supabase

Objetivos:

- Crear el proyecto Supabase.
- Configurar PostgreSQL.
- Crear las tablas.
- Definir las relaciones.
- Crear índices y restricciones.
- Configurar autenticación.
- Configurar RLS.
- Preparar usuarios iniciales.

Resultado esperado:

Base de datos funcional y segura.

## Etapa 3 — Conexión React + Supabase

Objetivos:

- Instalar el cliente oficial de Supabase.
- Crear el archivo de conexión.
- Configurar variables de entorno.
- Reemplazar progresivamente el almacenamiento local por consultas a Supabase.
- Mantener los componentes y pantallas actuales.

Resultado esperado:

La aplicación puede leer y escribir datos reales.

## Etapa 4 — Autenticación y roles

Objetivos:

- Implementar login.
- Implementar logout.
- Obtener el perfil del usuario.
- Implementar protección de rutas.
- Aplicar permisos según rol.
- Crear usuarios desde Jefatura.

Resultado esperado:

Cada usuario accede únicamente a las funcionalidades que le corresponden.

## Etapa 5 — Integración Google Forms y Google Drive

Objetivos:

- Crear el formulario externo.
- Configurar los campos.
- Configurar carga de currículum.
- Crear el proyecto de Apps Script.
- Configurar el activador de envío.
- Crear carpetas individuales.
- Copiar los currículums.
- Generar los PDF.
- Enviar los datos a Supabase mediante Edge Function.

Resultado esperado:

Una postulación enviada desde Google Forms queda registrada en Supabase y sus documentos quedan organizados en Drive.

## Etapa 6 — Módulo de postulantes

Objetivos:

- Listar postulantes.
- Implementar búsqueda por nombre.
- Implementar búsqueda por RUT.
- Mostrar detalle.
- Mostrar documentación.
- Mostrar historial de solicitudes.

Resultado esperado:

Los analistas pueden encontrar y consultar postulantes.

## Etapa 7 — Módulo de solicitudes

Objetivos:

- Crear solicitudes.
- Seleccionar postulantes.
- Seleccionar cargo.
- Seleccionar familia de cargo.
- Asignar evaluadores.
- Consultar solicitudes.
- Cambiar estados.
- Registrar historial.

Resultado esperado:

Los analistas pueden gestionar solicitudes y los evaluadores pueden recibir asignaciones.

## Etapa 8 — Módulo de evaluación

Objetivos:

- Mostrar solicitudes asignadas.
- Consultar antecedentes.
- Registrar resultados.
- Registrar conclusiones.
- Registrar observaciones.
- Registrar competencias.
- Adjuntar o referenciar informes.
- Marcar informes como enviados.

Resultado esperado:

Los evaluadores pueden completar sus evaluaciones.

## Etapa 9 — Dashboard e informes

Objetivos:

- Crear indicadores.
- Mostrar estadísticas.
- Mostrar procesos pendientes.
- Mostrar resultados.
- Mostrar informes.
- Incorporar filtros.

Resultado esperado:

Jefatura puede supervisar el funcionamiento del proceso de selección.

## Etapa 10 — Pruebas y puesta en marcha

Objetivos:

- Probar cada rol.
- Probar cada módulo.
- Probar formularios.
- Probar validaciones.
- Probar integración Google.
- Probar seguridad.
- Corregir errores.
- Documentar instalación y configuración.

Resultado esperado:

Una aplicación funcional, integrada y lista para demostración o implementación controlada.

# 14. Pruebas funcionales obligatorias

Se deben realizar al menos las siguientes pruebas:

## Autenticación

- Login correcto.
- Login con contraseña incorrecta.
- Logout.
- Intento de acceder a una ruta sin sesión.
- Intento de acceder a una funcionalidad sin permisos.

## Postulantes

- Registrar postulante.
- Buscar por nombre.
- Buscar por RUT.
- Evitar duplicados por RUT.
- Consultar documentos.
- Consultar postulante inexistente.

## Google Forms

- Enviar formulario completo.
- Enviar formulario sin campos obligatorios.
- Adjuntar currículum.
- Crear carpeta.
- Generar PDF.
- Registrar información en Supabase.
- Evitar duplicar la respuesta si el webhook se ejecuta nuevamente.

## Solicitudes

- Crear solicitud válida.
- Intentar crear solicitud sin postulante.
- Asignar evaluador.
- Consultar solicitudes.
- Cambiar estado.
- Consultar historial.

## Evaluaciones

- Registrar evaluación.
- Intentar evaluar una solicitud no asignada.
- Registrar observaciones.
- Registrar resultado.
- Enviar informe.
- Verificar permisos.

## Administración

- Crear usuario.
- Editar usuario.
- Desactivar usuario.
- Cambiar rol desde Jefatura.
- Verificar que un usuario común no pueda modificar permisos.

# 15. Criterios de aceptación del proyecto

El proyecto se considerará funcional cuando se cumplan estas condiciones:

1. La aplicación React se conecta correctamente a Supabase.
2. Los usuarios pueden iniciar sesión.
3. Los tres roles funcionan correctamente.
4. La jefatura puede administrar usuarios.
5. Google Forms recibe postulaciones.
6. Google Drive organiza los documentos automáticamente.
7. Supabase registra los postulantes y las referencias de sus documentos.
8. Los analistas pueden buscar postulantes.
9. Los analistas pueden crear solicitudes.
10. Los evaluadores pueden consultar sus solicitudes asignadas.
11. Los evaluadores pueden registrar resultados.
12. Los estados del proceso se actualizan correctamente.
13. Jefatura puede consultar resultados e informes.
14. Los documentos no están expuestos públicamente.
15. Las políticas de seguridad impiden accesos no autorizados.
16. La aplicación mantiene las funcionalidades existentes que siguen siendo necesarias.

# 16. Información y credenciales necesarias

Para implementar la solución se necesitará:

## Supabase

- Cuenta Supabase.
- Proyecto creado.
- Project URL.
- Publishable Key (o la clave pública `anon` en proyectos que utilicen esa nomenclatura).
- Acceso al SQL Editor.
- Acceso a Authentication.
- Acceso a Edge Functions.

La clave Service Role debe mantenerse privada y nunca debe incluirse en el frontend.

## Google

- Cuenta personal Gmail de AquaChile.
- Formulario Google Forms.
- Carpeta principal de Google Drive.
- Acceso a Google Apps Script.
- Permisos para ejecutar scripts y crear archivos.
- Correos de los usuarios internos que necesitarán acceso a documentos.

## Proyecto

- Repositorio GitHub.
- Código fuente actual React + Vite.
- Archivo `.env` local.
- Configuración de despliegue cuando corresponda.

**No compartir contraseñas ni claves privadas directamente en conversaciones públicas o repositorios.**

# 17. Consideraciones importantes para las IA que trabajen en el proyecto

Las siguientes instrucciones deben respetarse durante el desarrollo:

1. Antes de modificar código, revisar la estructura existente.
2. No reemplazar el proyecto por una plantilla nueva.
3. No eliminar pantallas existentes sin justificación.
4. Mantener React + Vite.
5. Utilizar Supabase como base de datos.
6. Utilizar Google Forms para las postulaciones externas.
7. Utilizar Google Apps Script para automatizar Google Drive.
8. Mantener los tres roles: Analista Reclutador, Profesional Evaluador y Jefatura.
9. Respetar las responsabilidades definidas para cada rol.
10. Mantener los estados del proceso establecidos.
11. Implementar seguridad mediante RLS.
12. No colocar claves privadas en el frontend.
13. No publicar documentos personales.
14. Evitar agregar dependencias innecesarias.
15. Evitar complejidad técnica que no aporte valor al proyecto.
16. Mantener nombres de variables, componentes y archivos coherentes con el código existente.
17. No inventar funcionalidades que contradigan los requisitos.
18. Explicar los cambios realizados.
19. Entregar archivos completos cuando se soliciten modificaciones, para facilitar su reemplazo.
20. Desarrollar y probar por etapas, no implementar todo de golpe.
21. No dar por terminada una integración sin probarla.
22. Mantener una documentación clara para instalar y ejecutar el proyecto.

# 18. Prompt general para iniciar el trabajo con una IA

Actúa como desarrollador full-stack y arquitecto de software.

Necesito que me ayudes a desarrollar el proyecto AquaChile, una aplicación web interna para gestionar postulantes, procesos de selección y evaluaciones psicolaborales.

Te proporcionaré el código fuente actual del proyecto y el documento maestro con los requisitos.

Tu primera tarea será revisar completamente el proyecto existente y comparar su estructura con los requisitos.

No debes comenzar creando otro proyecto desde cero.

Debes conservar las pantallas, componentes, navegación y funcionalidades existentes que sean compatibles con los nuevos requerimientos.

La tecnología definida es React + Vite para el frontend y Supabase PostgreSQL para la base de datos y autenticación.

Las postulaciones externas se recibirán mediante Google Forms. Google Apps Script automatizará la creación de carpetas privadas en Google Drive, la generación de PDF y el registro de datos en Supabase mediante una Edge Function.

El sistema tendrá tres roles:

- Analista Reclutador.
- Profesional Evaluador.
- Jefatura.

Debes respetar todas las responsabilidades, permisos, estados, entidades y reglas descritas en este documento.

Quiero desarrollar el proyecto paso a paso. Antes de realizar cambios:

1. Analiza la estructura existente.
2. Identifica qué funcionalidades ya están implementadas.
3. Identifica qué falta.
4. Propón los cambios necesarios.
5. Explica qué archivos modificarás o crearás.

Después de aprobar el análisis, comenzaremos a implementar por etapas.

Utiliza soluciones sencillas, seguras y fáciles de mantener. Explica los pasos de forma clara, evitando asumir conocimientos avanzados.

Cuando modifiques archivos, entrega el contenido completo de los archivos afectados cuando sea posible, indicando exactamente dónde deben ubicarse.

No avances a una nueva etapa sin comprobar que la anterior funciona correctamente.

**El objetivo final es obtener una aplicación funcional, conectada a Supabase, integrada con Google Forms y Google Drive, que permita gestionar de principio a fin los procesos de selección de personal de AquaChile.**

---

**Fin del documento maestro.**