// Configura los títulos de las preguntas para que coincidan exactamente con Google Forms.
const CAMPOS = {
  nombre: 'Nombre completo',
  rut: 'RUT',
  correo: 'Correo electrónico',
  telefono: 'Teléfono',
  cargo: 'Cargo al que postula',
  familia: 'Familia de cargo',
  cv: 'Currículum Vitae',
}

function instalarActivador() {
  const form = FormApp.getActiveForm()
  ScriptApp.getProjectTriggers()
    .filter((trigger) => trigger.getHandlerFunction() === 'alEnviarPostulacion')
    .forEach((trigger) => ScriptApp.deleteTrigger(trigger))
  ScriptApp.newTrigger('alEnviarPostulacion').forForm(form).onFormSubmit().create()
}

function alEnviarPostulacion(evento) {
  const props = PropertiesService.getScriptProperties()
  const raizId = props.getProperty('GOOGLE_DRIVE_ROOT_FOLDER_ID')
  const endpoint = props.getProperty('SUPABASE_FUNCTION_URL')
  const secreto = props.getProperty('GOOGLE_FORMS_WEBHOOK_SECRET')
  if (!raizId || !endpoint || !secreto) throw new Error('Configura las propiedades del script antes de recibir respuestas.')

  const respuestas = Object.fromEntries(evento.response.getItemResponses().map((respuesta) => [
    respuesta.getItem().getTitle(), respuesta.getResponse(),
  ]))
  const valor = (campo) => String(respuestas[campo] ?? '').trim()
  const nombre = valor(CAMPOS.nombre)
  const rut = valor(CAMPOS.rut)
  const correo = valor(CAMPOS.correo)
  const telefono = valor(CAMPOS.telefono)
  const cargo = valor(CAMPOS.cargo)
  const familia = valor(CAMPOS.familia)
  const idsCV = respuestas[CAMPOS.cv]
  const cvId = Array.isArray(idsCV) ? idsCV[0] : idsCV
  if (!nombre || !rut || !correo || !telefono || !cargo || !familia || !cvId) {
    throw new Error('La respuesta no incluye todos los campos obligatorios y el CV.')
  }

  const raiz = DriveApp.getFolderById(raizId)
  const carpeta = raiz.createFolder(`${nombre} (${rut})`)
  const cvOriginal = DriveApp.getFileById(String(cvId))
  const cv = cvOriginal.makeCopy(cvOriginal.getName(), carpeta)
  const fecha = Utilities.formatDate(evento.response.getTimestamp(), Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm:ss')
  const pdfHtml = HtmlService.createHtmlOutput(`
    <h1>Formulario de postulación</h1>
    <p><b>Nombre:</b> ${escapar(nombre)}</p><p><b>RUT:</b> ${escapar(rut)}</p>
    <p><b>Correo:</b> ${escapar(correo)}</p><p><b>Teléfono:</b> ${escapar(telefono)}</p>
    <p><b>Cargo:</b> ${escapar(cargo)}</p><p><b>Familia:</b> ${escapar(familia)}</p>
    <p><b>Fecha de postulación:</b> ${escapar(fecha)}</p>
  `).getBlob().getAs(MimeType.PDF).setName('Formulario_Postulacion.pdf')
  const pdf = carpeta.createFile(pdfHtml)

  const response = UrlFetchApp.fetch(endpoint, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'X-Forms-Secret': secreto },
    payload: JSON.stringify({
      nombre, rut, correo, telefono, cargo, familia_cargo: familia,
      cv_nombre_archivo: cv.getName(), cv_drive_file_id: cv.getId(),
      drive_folder_id: carpeta.getId(), formulario_pdf_drive_id: pdf.getId(),
    }),
    muteHttpExceptions: true,
  })
  const status = response.getResponseCode()
  if (status < 200 || status >= 300) {
    throw new Error(`Supabase rechazó el registro (${status}): ${response.getContentText()}`)
  }
}

function escapar(texto) {
  return String(texto).replace(/[&<>"']/g, (caracter) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[caracter])
}
