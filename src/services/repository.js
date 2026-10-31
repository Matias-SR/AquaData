// AquaChile ahora consulta y persiste la información directamente en Supabase.
// Este archivo se conserva para no romper imports antiguos; ya no guarda datos locales.
export function cargarDatos() {
  return { candidatos: [], solicitudes: [] }
}
export function guardarDatos() {}
export function reiniciarDatos() {
  return { candidatos: [], solicitudes: [] }
}
export function siguienteId() {
  throw new Error('Los identificadores ahora son generados por PostgreSQL.')
}
