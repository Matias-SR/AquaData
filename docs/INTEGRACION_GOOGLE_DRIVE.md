# Preparación de Google Drive

La aplicación ya tiene una capa de servicio (`src/services/googleDriveService.js`), una Edge Function (`supabase/functions/google-drive`) y columnas para guardar referencias de Drive en `postulantes`.

## Seguridad

- No guardar credenciales de Google en `.env` de Vite ni en archivos `src/`.
- No usar enlaces públicos para CV, formularios o informes.
- La aplicación solicita el documento a una Edge Function; la función valida la sesión y más adelante consultará Drive con credenciales del servidor.
- Los documentos deben permanecer privados y la función debe comprobar que el usuario tenga acceso al postulante/solicitud antes de devolver un enlace temporal.

## Pendiente para habilitar la integración

1. Crear/configurar un proyecto en Google Cloud.
2. Habilitar Google Drive API.
3. Crear una cuenta de servicio o flujo OAuth adecuado para la organización.
4. Compartir la carpeta raíz de Drive con la identidad técnica que corresponda.
5. Configurar los secretos en Supabase (nunca en React): `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` y `GOOGLE_DRIVE_ROOT_FOLDER_ID`, según el mecanismo de autenticación elegido.
6. Implementar en `supabase/functions/google-drive/index.ts` las acciones de listar metadatos y generar enlaces de lectura temporales.
7. Desplegar la función con `supabase functions deploy google-drive`.
8. Probar permisos con usuarios de los tres roles.

## Flujo previsto

Google Forms / Apps Script crea la carpeta del postulante y sus archivos. Apps Script registra en Supabase los IDs de Drive (carpeta, formulario PDF y CV). La app consulta esos IDs y la Edge Function entrega acceso solo después de verificar permisos.

La función incluida es un esqueleto seguro: responde `501` mientras Drive no esté configurado. Esto es intencional; evita mostrar botones que parezcan funcionar o exponer documentos por accidente.
