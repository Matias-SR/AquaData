# Google Forms para postulaciones

El flujo agrega postulaciones externas a `public.postulantes` y conserva los archivos privados en Drive. Incluye el receptor Supabase (`registrar-postulacion`) y el Apps Script (`google-apps-script/Code.gs`). El formulario y la carpeta raíz deben crearse desde la cuenta Gmail propietaria de AquaChile.

## 1. Preparar el formulario

Crea un formulario con estos títulos exactos:

- Nombre completo (respuesta corta, obligatorio)
- RUT (respuesta corta, obligatorio)
- Correo electrónico (respuesta corta, obligatorio)
- Teléfono (respuesta corta, obligatorio)
- Cargo al que postula (lista desplegable, obligatorio)
- Familia de cargo (lista desplegable, obligatorio)
- Currículum Vitae (carga de archivo, obligatorio; restringe los tipos y el tamaño según lo que decida AquaChile)

La pregunta de carga de archivo de Google Forms exige que quien postula inicie sesión con una cuenta Google. Prueba ese requisito con una cuenta externa antes de publicar el formulario.

## 2. Desplegar el receptor de Supabase

En Supabase, configura el secreto compartido y despliega la función:

```bash
supabase secrets set GOOGLE_FORMS_WEBHOOK_SECRET="un-secreto-largo-y-aleatorio"
supabase functions deploy registrar-postulacion
```

`SUPABASE_SERVICE_ROLE_KEY` y `SUPABASE_URL` deben estar disponibles como secretos de las Edge Functions. `supabase/config.toml` desactiva la verificación JWT solo para este endpoint; el receptor comprueba `X-Forms-Secret` antes de aceptar datos y nunca expone la Service Role Key al navegador.

## 3. Configurar Apps Script

1. Crea una carpeta privada en Drive para las postulaciones y copia su ID.
2. Abre el formulario, selecciona **Extensiones → Apps Script** y pega `google-apps-script/Code.gs`.
3. En **Configuración del proyecto → Propiedades del script**, añade:
   - `GOOGLE_DRIVE_ROOT_FOLDER_ID`: ID de la carpeta privada creada arriba.
   - `SUPABASE_FUNCTION_URL`: `https://<project-ref>.supabase.co/functions/v1/registrar-postulacion`.
   - `GOOGLE_FORMS_WEBHOOK_SECRET`: el mismo valor configurado en Supabase.
4. Selecciona `instalarActivador` y ejecútala una vez desde el editor; autoriza Forms, Drive y conexiones externas.
5. Envía una respuesta de prueba. Verifica que se cree una carpeta privada con el CV y `Formulario_Postulacion.pdf`, y que el postulante aparezca en AquaChile.

El script copia el CV cargado por Forms a la carpeta individual y genera el PDF de resumen. No comparte públicamente archivos o carpetas. Si la llamada a Supabase falla, el activador deja el error en el registro de Apps Script; tras corregirlo, reenvía una respuesta de prueba.

## 4. Restricciones

- Los nombres de preguntas deben coincidir exactamente con los del script.
- Los valores seleccionables para cargo y familia deben mantenerse alineados con los usados por el equipo en AquaChile.
- Las respuestas repetidas con el mismo RUT de un postulante externo actualizan ese registro y sus referencias de archivo. Si el RUT pertenece a un postulante interno, se conserva su registro actual.
- No guardes el secreto compartido ni credenciales de Google en `.env`, Git o código del navegador.
