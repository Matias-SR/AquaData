// Separador ";" y BOM para que Excel en español abra bien los acentos.
export function aCsv(filas, columnas) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const encabezado = columnas.map((c) => esc(c.titulo)).join(';')
  const cuerpo = filas.map((f) => columnas.map((c) => esc(c.valor(f))).join(';'))
  return '\ufeff' + [encabezado, ...cuerpo].join('\r\n')
}

export function descargarCsv(nombre, contenido) {
  const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = nombre
  a.click()
  URL.revokeObjectURL(url)
}
