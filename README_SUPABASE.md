# AquaChile — conexión Supabase

## 1. Variables locales

Crea `.env` en la raíz del proyecto (junto a `package.json`) usando `.env.example` como guía:

```env
VITE_SUPABASE_URL=https://TU_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=TU_SUPABASE_PUBLISHABLE_KEY
```

Usa la URL del proyecto y la Publishable Key desde Supabase > Project Settings > API. Nunca uses `service_role` en React.

Después de modificar `.env`, reinicia Vite:

```bash
Ctrl + C
npm run dev
```

## 2. Migración de base de datos

En Supabase > SQL Editor ejecuta el archivo:

`supabase/migrations/20261031_aquachile_drive_and_ui_fields.sql`

La migración agrega campos que la interfaz utiliza, habilita la lectura del directorio de perfiles activos para asignar evaluadores y registra automáticamente cambios de etapa.

## 3. Usuarios

Cada persona debe existir en Authentication > Users y tener una fila en `public.perfiles` con el mismo UUID:

- `id`: UUID de Auth
- `nombre`
- `correo`
- `rol`: `analista`, `evaluador` o `jefatura`
- `activo`: `true`

El login utiliza Supabase Auth. Ya no existen las cuentas ficticias `@demo.cl`.

## 4. Datos

Las pantallas leen y escriben las tablas `postulantes`, `solicitudes`, `evaluaciones` y `perfiles`. Las políticas RLS siguen siendo obligatorias. La app no contiene la Service Role Key.

## 5. Google Drive

La estructura de integración está preparada en `src/services/googleDriveService.js` y `supabase/functions/google-drive/`. La función devuelve 501 hasta que se configure Drive del lado servidor. Revisa `docs/INTEGRACION_GOOGLE_DRIVE.md`.

## 6. Importante antes de usar datos reales

Las políticas RLS iniciales deben probarse con una cuenta de cada rol. En particular, comprueba que un evaluador solo pueda consultar postulantes asociados a solicitudes asignadas y que no pueda editar solicitudes ajenas. La migración no sustituye una auditoría completa de seguridad.
