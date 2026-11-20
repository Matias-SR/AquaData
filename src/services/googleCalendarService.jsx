import { formatearHora } from '../utils/estados.js'

// El navegador llama al proxy de Vite (/api/google-calendar), que reenvía a Google Calendar API v3
// y agrega el Access Token del lado del servidor (ver vite.config.js). El token nunca llega al navegador.
// "primary" se reemplaza en el proxy por GOOGLE_CALENDAR_ID del .env.
const ENDPOINT = '/api/google-calendar/calendars/primary/events'
const ZONA_HORARIA = 'America/Santiago'
const DURACION_MINUTOS = 60

const dos = (n) => String(n).padStart(2, '0')

// Suma minutos a una fecha/hora local sin pasar por la zona horaria del navegador.
function sumarMinutos(fecha, hora, minutos) {
  const [anio, mes, dia] = fecha.split('-').map(Number)
  const [h, m] = hora.split(':').map(Number)
  const t = new Date(Date.UTC(anio, mes - 1, dia, h, m + minutos))
  return `${t.getUTCFullYear()}-${dos(t.getUTCMonth() + 1)}-${dos(t.getUTCDate())}T${dos(t.getUTCHours())}:${dos(t.getUTCMinutes())}:00`
}

// Arma el evento de Google Calendar para una entrevista. `fecha` es AAAA-MM-DD y `hora` HH:MM.
export function armarEventoEntrevista({ candidato, cargo, familiaCargo, evaluador, fecha, hora, duracion = DURACION_MINUTOS }) {
  const horaLimpia = formatearHora(hora)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(fecha ?? '')) || horaLimpia === '—') {
    throw new Error('La entrevista no tiene una fecha y hora válidas para agendar.')
  }
  return {
    summary: `Entrevista: ${candidato} · ${cargo}`,
    description: [
      `Candidato: ${candidato}`,
      `Cargo: ${cargo}${familiaCargo ? ` (${familiaCargo})` : ''}`,
      evaluador ? `Evaluador: ${evaluador}` : null,
      'Agendado desde AquaData.',
    ].filter(Boolean).join('\n'),
    start: { dateTime: `${fecha}T${horaLimpia}:00`, timeZone: ZONA_HORARIA },
    end: { dateTime: sumarMinutos(fecha, horaLimpia, duracion), timeZone: ZONA_HORARIA },
  }
}

function mensajeDeError(estado, datos) {
  if (estado === 401) {
    return 'El token de Google venció (dura 1 hora). Genera uno nuevo en el OAuth Playground, actualiza GOOGLE_ACCESS_TOKEN en el .env y reinicia npm run dev.'
  }
  const detalle = datos?.error?.message
  if (estado === 403) return `Google rechazó el permiso: ${detalle ?? 'revisa que Google Calendar API esté habilitada y el scope calendar.events autorizado.'}`
  return detalle || `Google Calendar respondió con error ${estado}.`
}

// Crea la entrevista en el calendario. Devuelve { id, enlace }.
export async function agendarCita(datos) {
  const evento = armarEventoEntrevista(datos)
  const respuesta = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(evento),
  })
  const resultado = await respuesta.json().catch(() => ({}))
  if (!respuesta.ok) throw new Error(mensajeDeError(respuesta.status, resultado))
  return { id: resultado.id, enlace: resultado.htmlLink }
}
