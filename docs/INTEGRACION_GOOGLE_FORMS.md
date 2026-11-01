# Google Forms para postulaciones

**Estado: funcionando, probado el 01-11-2026.** Una postulación enviada por el formulario llegó a `public.postulantes` con su carpeta, el CV y el PDF del formulario en Drive.

## Cómo funciona

1. La persona responde el formulario de Google Forms y adjunta su CV.
2. Un proyecto de Apps Script (`google-apps-script/Code.gs`) se activa al enviar la respuesta:
   - crea en Drive una carpeta privada `Nombre (RUT)` dentro de la carpeta raíz;
   - copia el CV a esa carpeta y genera `Formulario_Postulacion.pdf` con las respuestas;
   - envía los datos y los IDs de Drive a la Edge Function `registrar-postulacion`.
3. La Edge Function comprueba el secreto compartido, valida el RUT y el correo, y crea o actualiza el postulante con origen **Externo**.

No se comparten archivos ni carpetas de forma pública. La Service Role Key solo existe dentro de la Edge Function.

> **Ubicación:** el formulario no pregunta la ubicación (planta). El postulante llega sin ubicación y el analista la completa al editarlo en la app (**Candidatos → Editar**). La app la exige al guardar.

## 1. Crear el formulario y la carpeta en Drive

Hazlo con la cuenta Google propietaria de AquaChile.

1. Crea un formulario nuevo en Google Forms.
2. Agrega a mano la pregunta **Currículum Vitae** de tipo *carga de archivo*, obligatoria (restringe tipos y tamaño según lo que decida AquaChile). La API de Apps Script no permite crear este tipo de pregunta; las demás las crea el script en el paso 4.
3. Copia el ID del formulario: la parte de la URL de edición entre `/d/` y `/edit`.
4. Crea una carpeta privada en Drive para las postulaciones y copia su ID (la parte final de la URL de la carpeta).

La carga de archivos de Google Forms exige que quien postula inicie sesión con una cuenta Google. Pruébalo con una cuenta externa antes de publicar.

## 2. Desplegar la Edge Function en Supabase

Desde el panel de Supabase, sin CLI:

1. **Edge Functions → Deploy a new function → Via Editor.**
2. Nombre: `registrar-postulacion` (exacto).
3. Pega el contenido de `supabase/functions/registrar-postulacion/index.ts` y despliega.
4. En la configuración de la función, desactiva **Verify JWT**. El formulario no envía un token de Supabase; la función se protege con el secreto `X-Forms-Secret`. (`supabase/config.toml` tiene `verify_jwt = false`, pero ese archivo solo se aplica al desplegar con la CLI.)
5. **Edge Functions → Secrets:** agrega `GOOGLE_FORMS_WEBHOOK_SECRET` con un valor largo y aleatorio. `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` ya vienen disponibles en las Edge Functions.
6. Copia la URL de la función: `https://<project-ref>.supabase.co/functions/v1/registrar-postulacion`.

## 3. Crear el proyecto de Apps Script

Se usa un **proyecto independiente** y no uno vinculado al formulario (*Extensiones → Apps Script*), porque con varias cuentas Google abiertas en el navegador el editor vinculado no abre.

1. Entra a [script.google.com](https://script.google.com) con la cuenta propietaria del formulario → **Nuevo proyecto**.
2. Pega el contenido de `google-apps-script/Code.gs`.
3. Reemplaza `REEMPLAZAR_CON_ID_DEL_FORMULARIO` por el ID del formulario (paso 1.3). No subas ese cambio al repositorio.
4. En **Configuración del proyecto → Propiedades del script**, agrega:

   | Propiedad | Valor |
   | --- | --- |
   | `GOOGLE_DRIVE_ROOT_FOLDER_ID` | ID de la carpeta de Drive (paso 1.4) |
   | `SUPABASE_FUNCTION_URL` | URL de la función (paso 2.6) |
   | `GOOGLE_FORMS_WEBHOOK_SECRET` | El mismo valor guardado en Supabase (paso 2.5) |

## 4. Crear las preguntas e instalar el activador

En el editor de Apps Script, elige la función en el menú superior y presiona **Ejecutar**:

1. `crearPreguntas`: crea las preguntas obligatorias que falten (Nombre completo, RUT, Correo electrónico con validación de correo, Teléfono, Cargo al que postula y Familia de cargo como listas) y mueve **Currículum Vitae** al final.
2. `instalarActivador`: deja un único activador *Al enviar el formulario* que llama a `alEnviarPostulacion`.

La primera ejecución pide autorizar Forms, Drive y conexiones externas. Acepta con la cuenta propietaria.

## 5. Probar

1. Envía una respuesta de prueba desde la vista pública del formulario.
2. En Drive, revisa que exista la carpeta `Nombre (RUT)` con el CV y `Formulario_Postulacion.pdf`.
3. En la app (o en `public.postulantes`), revisa que aparezca el postulante con origen Externo.
4. Si algo falla, revisa **Ejecuciones** en Apps Script y los registros de la función en Supabase.

## Problemas frecuentes

| Síntoma | Causa y solución |
| --- | --- |
| `Supabase rechazó el registro (401)` | El secreto no coincide entre Apps Script y Supabase. Supabase no muestra el valor, solo su huella **SHA-256** en **Edge Functions → Secrets**. Calcula la huella del valor guardado en Propiedades del script con la función temporal de abajo y compárala. Si difieren, vuelve a copiar el mismo valor en ambos lados (cuidado con espacios al inicio o al final). |
| `Supabase rechazó el registro (400)` | Faltan datos o el correo no es válido. Revisa que los títulos de las preguntas coincidan exactamente con `CAMPOS` en `Code.gs` y que el RUT tenga dígito verificador válido. |
| `Configura las propiedades del script…` | Falta alguna de las tres propiedades del paso 3.4. |
| El activador no se ejecuta | Vuelve a ejecutar `instalarActivador` y confirma que `FORM_ID` corresponde al formulario correcto. |

Función temporal para obtener la huella del secreto (pégala, ejecútala, mira el registro y bórrala; no la subas al repositorio):

```js
function huellaSecreto() {
  const secreto = PropertiesService.getScriptProperties().getProperty('GOOGLE_FORMS_WEBHOOK_SECRET')
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, secreto, Utilities.Charset.UTF_8)
  Logger.log(bytes.map((b) => ((b + 256) % 256).toString(16).padStart(2, '0')).join(''))
}
```

## Restricciones

- Los títulos de las preguntas deben coincidir exactamente con `CAMPOS` en `Code.gs`.
- `FAMILIAS` en `Code.gs` debe mantenerse igual a `FAMILIAS_CARGO` de `src/utils/estados.js`. Si cambia una, cambia la otra y vuelve a revisar las opciones del formulario.
- Si se envía otra respuesta con el RUT de un postulante externo, se actualiza ese registro y sus referencias de archivo. Si el RUT pertenece a un postulante interno, se conserva su registro.
- No guardes en Git el ID del formulario, URLs del formulario, el secreto compartido ni credenciales de Google.
