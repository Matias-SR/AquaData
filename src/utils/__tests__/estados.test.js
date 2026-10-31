import { describe, expect, it } from 'vitest'
import {
  COMPETENCIAS_POR_FAMILIA,
  competenciasDe,
  documentosPorFamilia,
  formatearFecha,
  hoyISO,
  informeVacio,
} from '../estados.js'

describe('formatearFecha', () => {
  it('muestra la fecha en formato chileno con día, mes abreviado y año', () => {
    const texto = formatearFecha('2026-09-07')
    expect(texto).toMatch(/07/)
    expect(texto.toLowerCase()).toMatch(/sept?/)
    expect(texto).toMatch(/2026/)
  })

  it('no desplaza la fecha un día por zona horaria', () => {
    expect(formatearFecha('2026-10-01')).toMatch(/01/)
  })

  it('muestra un guion cuando no hay fecha', () => {
    expect(formatearFecha(null)).toBe('—')
    expect(formatearFecha('')).toBe('—')
  })
})

describe('competenciasDe', () => {
  it('entrega las competencias propias de la familia de cargo', () => {
    expect(competenciasDe('Jefatura')).toEqual(COMPETENCIAS_POR_FAMILIA.Jefatura)
    expect(competenciasDe('Jefatura')).toContain('Liderazgo de equipos')
  })

  it('usa competencias base cuando la familia no está definida', () => {
    expect(competenciasDe('Familia inexistente')).toEqual(competenciasDe('Técnico B C'))
  })
})

describe('documentosPorFamilia', () => {
  it('asigna plantilla de informe y pauta de entrevista según la familia de cargo', () => {
    expect(documentosPorFamilia('Profesional B C')).toEqual({
      plantillaInforme: 'Informe_Profesional_B_C.xlsx',
      pautaEntrevista: 'Pauta_entrevista_Profesional_B_C.docx',
    })
  })

  it('usa documentos generales cuando no hay familia', () => {
    expect(documentosPorFamilia('')).toEqual({
      plantillaInforme: 'Informe_General.xlsx',
      pautaEntrevista: 'Pauta_entrevista_General.docx',
    })
  })
})

describe('informeVacio', () => {
  it('crea un informe en blanco con fecha de hoy y una sección por competencia', () => {
    const informe = informeVacio('Supervisor B')
    expect(informe.fecha).toBe(hoyISO())
    expect(informe.categoria).toBe('')
    expect(informe.conclusion).toBe('')
    expect(informe.competencias.map((c) => c.nombre)).toEqual(competenciasDe('Supervisor B'))
    informe.competencias.forEach((c) => {
      expect(c).toMatchObject({ criterio: '', fortalezas: '', oportunidades: '' })
    })
  })
})
