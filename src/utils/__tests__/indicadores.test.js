import { describe, expect, it } from 'vitest'
import { contarPor, diasEntre, promedioDiasHastaInforme } from '../indicadores.js'

describe('diasEntre', () => {
  it('cuenta los días entre dos fechas', () => {
    expect(diasEntre('2026-09-01', '2026-09-07')).toBe(6)
  })

  it('devuelve 0 cuando ambas fechas son el mismo día', () => {
    expect(diasEntre('2026-09-01', '2026-09-01')).toBe(0)
  })

  it('cuenta correctamente al cruzar un cambio de mes', () => {
    expect(diasEntre('2026-09-28', '2026-10-03')).toBe(5)
  })
})

describe('promedioDiasHastaInforme', () => {
  it('no calcula promedio cuando no hay solicitudes', () => {
    expect(promedioDiasHastaInforme([])).toBeNull()
  })

  it('no calcula promedio cuando ninguna solicitud tiene informe enviado', () => {
    const solicitudes = [
      { fechaSolicitud: '2026-09-01', fechaEnvio: null },
      { fechaSolicitud: '2026-09-03', fechaEnvio: null },
    ]
    expect(promedioDiasHastaInforme(solicitudes)).toBeNull()
  })

  it('promedia los días desde la solicitud hasta el envío del informe, con un decimal', () => {
    const solicitudes = [
      { fechaSolicitud: '2026-09-01', fechaEnvio: '2026-09-07' }, // 6 días
      { fechaSolicitud: '2026-09-03', fechaEnvio: '2026-09-12' }, // 9 días
      { fechaSolicitud: '2026-09-04', fechaEnvio: '2026-09-08' }, // 4 días
      { fechaSolicitud: '2026-09-10', fechaEnvio: null },         // en curso, no cuenta
    ]
    expect(promedioDiasHastaInforme(solicitudes)).toBe(6.3)
  })
})

describe('contarPor', () => {
  const solicitudes = [
    { responsable: 'Evaluador A', familiaCargo: 'Técnico A' },
    { responsable: 'Evaluador B', familiaCargo: 'Técnico A' },
    { responsable: 'Evaluador A', familiaCargo: 'Jefatura' },
    { responsable: 'Evaluador A', familiaCargo: null },
  ]

  it('agrupa por el criterio indicado y ordena de mayor a menor', () => {
    expect(contarPor(solicitudes, (s) => s.responsable)).toEqual([
      { etiqueta: 'Evaluador A', total: 3 },
      { etiqueta: 'Evaluador B', total: 1 },
    ])
  })

  it('ignora las solicitudes sin valor para el criterio', () => {
    const porFamilia = contarPor(solicitudes, (s) => s.familiaCargo)
    expect(porFamilia).toEqual([
      { etiqueta: 'Técnico A', total: 2 },
      { etiqueta: 'Jefatura', total: 1 },
    ])
  })

  it('devuelve una lista vacía cuando no hay solicitudes', () => {
    expect(contarPor([], (s) => s.responsable)).toEqual([])
  })
})
