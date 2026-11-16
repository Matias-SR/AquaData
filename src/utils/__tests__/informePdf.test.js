import { generarInformePdf, nombreArchivoInforme } from '../informePdf.js'

const candidato = { nombre: 'María Pérez', rut: '12.345.678-9' }
const solicitud = { cargo: 'Técnico A', familiaCargo: 'Técnico A', responsable: 'Luis Soto', creadaPor: 'Ana Rojas' }
const informe = {
  fecha: '2026-11-10',
  categoria: 'Recomendado',
  conclusion: 'Cumple con el perfil del cargo.',
  competencias: [
    { nombre: 'Trabajo en equipo', criterio: 'Colabora', fortalezas: 'Comunicación', oportunidades: 'Delegar' },
  ],
}

describe('nombreArchivoInforme', () => {
  it('quita tildes y símbolos para que el nombre sea seguro', () => {
    expect(nombreArchivoInforme('María Pérez', 'Técnico A')).toBe('Informe_Maria_Perez_Tecnico_A.pdf')
  })

  it('usa valores por defecto cuando faltan datos', () => {
    expect(nombreArchivoInforme('', '')).toBe('Informe_Candidato_Cargo.pdf')
  })
})

describe('generarInformePdf', () => {
  it('genera un PDF válido con el nombre del candidato', async () => {
    const pdf = await generarInformePdf({ informe, candidato, solicitud })
    expect(pdf.filename).toBe('Informe_Maria_Perez_Tecnico_A.pdf')
    expect(pdf.contentType).toBe('application/pdf')
    const cabecera = String.fromCharCode(...new Uint8Array(pdf.content).slice(0, 5))
    expect(cabecera).toBe('%PDF-')
  })

  it('falla con un mensaje claro si no hay informe', async () => {
    await expect(generarInformePdf({ informe: null, candidato, solicitud })).rejects.toThrow('informe')
  })

  it('soporta informes largos que ocupan varias páginas', async () => {
    const largo = { ...informe, conclusion: 'texto largo '.repeat(2000) }
    const pdf = await generarInformePdf({ informe: largo, candidato, solicitud })
    expect(pdf.content.byteLength).toBeGreaterThan(5000)
  })
})
