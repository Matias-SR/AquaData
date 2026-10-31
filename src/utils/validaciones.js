const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const REGEX_TELEFONO = /^(\+?56)?\s?9\s?\d{4}\s?\d{4}$/

export function rutValido(rut) {
  const limpio = String(rut ?? '').replace(/\./g, '').replace(/-/g, '').toUpperCase()
  if (!/^\d{7,8}[0-9K]$/.test(limpio)) return false
  const cuerpo = limpio.slice(0, -1)
  const dv = limpio.slice(-1)
  let suma = 0
  let multiplo = 2
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * multiplo
    multiplo = multiplo === 7 ? 2 : multiplo + 1
  }
  const resto = 11 - (suma % 11)
  const calculado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto)
  return dv === calculado
}

export function validarCandidato(d) {
  const e = {}
  if (!d.rut || !rutValido(d.rut)) e.rut = 'Ingresa un RUT válido, por ejemplo 12.345.678-9.'
  if (!d.nombre || d.nombre.trim().length < 3) e.nombre = 'Ingresa el nombre completo (mínimo 3 caracteres).'
  if (!d.correo || !REGEX_CORREO.test(d.correo.trim())) e.correo = 'Ingresa un correo válido, por ejemplo nombre@correo.cl.'
  if (!d.telefono || !REGEX_TELEFONO.test(d.telefono.trim())) e.telefono = 'Usa un celular chileno, por ejemplo +56 9 1234 5678.'
  if (!d.cargo || d.cargo.trim().length < 3) e.cargo = 'Indica el cargo al que postula.'
  if (!d.familiaCargo) e.familiaCargo = 'Selecciona la familia de cargo.'
  return e
}

export function validarSolicitud(d) {
  const e = {}
  if (!d.candidatoId) e.candidatoId = 'Selecciona un postulante.'
  if (!d.cargo || d.cargo.trim().length < 3) e.cargo = 'Indica el cargo de la solicitud.'
  if (!d.familiaCargo) e.familiaCargo = 'Selecciona la familia de cargo.'
  if (!d.responsableId) e.responsable = 'Asigna un profesional evaluador.'
  return e
}

export function validarEntrevista(d, fechaSolicitud) {
  const e = {}
  if (!d.fecha) e.fecha = 'Indica la fecha de la entrevista.'
  else if (fechaSolicitud && d.fecha < fechaSolicitud) e.fecha = 'La fecha no puede ser anterior a la solicitud.'
  if (!d.hora) e.hora = 'Indica la hora de la entrevista.'
  return e
}

export function validarInforme(d, fechaSolicitud) {
  const e = {}
  if (!d.fecha) e.fecha = 'Indica la fecha de la evaluación.'
  else if (fechaSolicitud && d.fecha < fechaSolicitud) e.fecha = 'La fecha no puede ser anterior a la solicitud.'
  if (!d.categoria) e.categoria = 'Selecciona la categoría del evaluado.'
  if (!d.conclusion || d.conclusion.trim().length < 10) e.conclusion = 'Escribe la conclusión general (mínimo 10 caracteres).'
  const faltantes = d.competencias.some((c) =>
    (c.criterio ?? '').trim().length < 5 ||
    (c.fortalezas ?? '').trim().length < 5 ||
    (c.oportunidades ?? '').trim().length < 5
  )
  if (faltantes) e.competencias = 'Completa criterio, fortalezas y oportunidades de cada competencia (mínimo 5 caracteres).'
  return e
}
