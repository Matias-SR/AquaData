export function diasEntre(desde, hasta) {
  const ms = new Date(`${hasta}T00:00:00`) - new Date(`${desde}T00:00:00`)
  return Math.round(ms / 86400000)
}

// Tiempo promedio (en días) desde que se solicita la evaluación hasta que se envía el informe.
export function promedioDiasHastaInforme(solicitudes) {
  const enviadas = solicitudes.filter((s) => s.fechaEnvio)
  if (enviadas.length === 0) return null
  const total = enviadas.reduce((acc, s) => acc + diasEntre(s.fechaSolicitud, s.fechaEnvio), 0)
  return Math.round((total / enviadas.length) * 10) / 10
}

export function contarPor(solicitudes, obtener) {
  const mapa = new Map()
  solicitudes.forEach((s) => {
    const clave = obtener(s)
    if (clave) mapa.set(clave, (mapa.get(clave) ?? 0) + 1)
  })
  return [...mapa].map(([etiqueta, total]) => ({ etiqueta, total })).sort((a, b) => b.total - a.total)
}
