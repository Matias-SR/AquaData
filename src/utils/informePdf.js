import { formatearFecha } from './estados.js'

const MARGEN = 20
const ANCHO_PAGINA = 210
const ALTO_PAGINA = 297
const ANCHO_TEXTO = ANCHO_PAGINA - MARGEN * 2

// Nombre de archivo seguro: sin tildes, espacios ni símbolos.
export function nombreArchivoInforme(candidato, cargo) {
  const limpio = (t) =>
    String(t ?? '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
  return `Informe_${limpio(candidato) || 'Candidato'}_${limpio(cargo) || 'Cargo'}.pdf`
}

// Arma el PDF del informe en el navegador. jsPDF se carga recién al usarlo para no alargar la carga inicial.
export async function generarInformePdf({ informe, candidato, solicitud }) {
  if (!informe) throw new Error('Esta solicitud todavía no tiene un informe para adjuntar.')

  const { jsPDF } = await import('jspdf')
  const doc = new jsPDF({ unit: 'mm', format: 'a4' })
  let y = MARGEN

  // Salta de página si el bloque que viene no cabe.
  const asegurarEspacio = (alto) => {
    if (y + alto > ALTO_PAGINA - MARGEN) {
      doc.addPage()
      y = MARGEN
    }
  }

  const escribir = (texto, { tam = 10, estilo = 'normal', color = [31, 41, 51], separacion = 1.5 } = {}) => {
    doc.setFont('helvetica', estilo)
    doc.setFontSize(tam)
    doc.setTextColor(...color)
    const alturaLinea = tam * 0.4
    const lineas = doc.splitTextToSize(String(texto || '-'), ANCHO_TEXTO)
    lineas.forEach((linea) => {
      asegurarEspacio(alturaLinea)
      doc.text(linea, MARGEN, y)
      y += alturaLinea
    })
    y += separacion
  }

  // Encabezado
  doc.setFillColor(11, 79, 108)
  doc.rect(0, 0, ANCHO_PAGINA, 22, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.text('AquaData', MARGEN, 14)
  y = 34

  escribir('Informe psicolaboral', { tam: 16, estilo: 'bold', separacion: 3 })
  escribir(`Candidato: ${candidato?.nombre || 'Candidato'}${candidato?.rut ? ` (RUT ${candidato.rut})` : ''}`, { tam: 11, estilo: 'bold' })
  escribir(`Cargo: ${solicitud.cargo} - ${solicitud.familiaCargo}`)
  escribir(`Evaluado el ${formatearFecha(informe.fecha)} por ${solicitud.responsable}`)
  escribir(`Solicitado por ${solicitud.creadaPor}`, { separacion: 4 })
  escribir(`Categoría del evaluado: ${informe.categoria || 'Sin definir'}`, { tam: 12, estilo: 'bold', separacion: 5 })

  // Competencias
  ;(informe.competencias ?? []).forEach((c) => {
    asegurarEspacio(30)
    escribir(c.nombre, { tam: 12, estilo: 'bold', color: [11, 79, 108], separacion: 1 })
    escribir('Criterio', { estilo: 'bold', color: [17, 24, 39], separacion: 0.5 })
    escribir(c.criterio)
    escribir('Fortalezas', { estilo: 'bold', color: [17, 24, 39], separacion: 0.5 })
    escribir(c.fortalezas)
    escribir('Oportunidades de desarrollo', { estilo: 'bold', color: [17, 24, 39], separacion: 0.5 })
    escribir(c.oportunidades, { separacion: 5 })
  })

  // Conclusión
  asegurarEspacio(25)
  escribir('Conclusión general', { tam: 12, estilo: 'bold', color: [11, 79, 108], separacion: 1 })
  escribir(informe.conclusion)

  return {
    filename: nombreArchivoInforme(candidato?.nombre, solicitud.cargo),
    content: doc.output('arraybuffer'),
    contentType: 'application/pdf',
  }
}
