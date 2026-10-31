// Reglas del flujo de una solicitud (funciones puras, fáciles de probar).
export function puedeEditarSolicitud(solicitud) {
  return solicitud.estado !== 'Informe enviado'
}

export function siguienteAccionEvaluador(estado) {
  switch (estado) {
    case 'Evaluación recibida':
      return 'Agendar entrevista'
    case 'Entrevista agendada':
      return 'Registrar entrevista'
    case 'Entrevista realizada':
      return 'Redactar informe'
    default:
      return 'Ver informe'
  }
}
