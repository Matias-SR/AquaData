# Administración de usuarios de AquaChile

## Qué incorpora

- Ruta `/usuarios`, visible solo para perfiles con rol `jefatura`.
- Listado de cuentas, búsqueda por nombre/correo/rol y estado.
- Creación de cuentas de Supabase Auth y su fila correspondiente en `public.perfiles`.
- Edición de nombre, correo y rol.
- Activación y desactivación: además de `perfiles.activo`, se aplica o retira un bloqueo de acceso de Auth.
- Protección para impedir que Jefatura se desactive a sí misma o que se quite la última cuenta activa de Jefatura.

## Desplegar la función segura

La interfaz llama a `supabase/functions/usuarios/index.ts`. La clave `service_role` se utiliza exclusivamente dentro de la Edge Function; nunca debe agregarse al `.env` del frontend ni al repositorio.

Desde la carpeta raíz del proyecto, con Supabase CLI instalado y el proyecto vinculado:

```bash
supabase login
supabase link --project-ref tcizmravpkvrejlhwiur
supabase functions deploy usuarios
```

En el proyecto alojado, comprueba en **Supabase → Edge Functions → Secrets** que exista `SUPABASE_SERVICE_ROLE_KEY`. En proyectos donde no esté disponible como variable predeterminada, agrega allí el valor de la clave `service_role` de **Project Settings → API**. No compartas esa clave ni la pongas en Vite.

`SUPABASE_URL` y `SUPABASE_ANON_KEY` son variables estándar disponibles para Edge Functions de Supabase. La función valida el JWT de quien llama y vuelve a comprobar que su perfil activo tenga rol `jefatura` antes de ejecutar cualquier operación administrativa.

## Cómo probar

1. Inicia la aplicación con `npm install` y `npm run dev`.
2. Ingresa con la cuenta Jefatura.
3. Abre **Administrar usuarios** en el menú lateral.
4. Crea primero una cuenta de prueba Analista y otra Evaluador, usando correos que controles y contraseñas iniciales de al menos 8 caracteres.
5. Cierra sesión e inicia sesión con cada cuenta para comprobar el rol.
6. Vuelve a Jefatura, edita un usuario y prueba desactivarlo/reactivarlo.
7. Comprueba que una cuenta desactivada no pueda iniciar sesión.

## Notas

- La contraseña inicial se entrega al usuario por un canal seguro. La pantalla no permite consultar ni recuperar contraseñas existentes.
- La edición de datos no cambia la contraseña.
- No se elimina el usuario de Auth ni su perfil: se desactiva para conservar trazabilidad y relaciones históricas.
- Antes de producción, añade un flujo de recuperación/cambio de contraseña y revisa las políticas RLS de todas las tablas.
