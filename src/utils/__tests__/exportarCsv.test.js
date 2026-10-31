import { describe, expect, it } from 'vitest'
import { aCsv } from '../exportarCsv.js'

const columnas = [
  { titulo: 'Postulante', valor: (s) => s.nombre },
  { titulo: 'Observaciones', valor: (s) => s.observaciones },
]

describe('aCsv', () => {
  it('incluye BOM para que Excel en español abra bien los acentos', () => {
    expect(aCsv([], columnas).startsWith('﻿')).toBe(true)
  })

  it('genera encabezado y filas separadas por punto y coma', () => {
    const csv = aCsv([{ nombre: 'Ana Pérez', observaciones: 'Sin indicaciones' }], columnas)
    expect(csv.slice(1).split('\r\n')).toEqual([
      '"Postulante";"Observaciones"',
      '"Ana Pérez";"Sin indicaciones"',
    ])
  })

  it('mantiene en una sola celda los datos que contienen comas o punto y coma', () => {
    const csv = aCsv([{ nombre: 'Pérez, Ana', observaciones: 'Turno A; turno B' }], columnas)
    expect(csv).toContain('"Pérez, Ana";"Turno A; turno B"')
  })

  it('duplica las comillas internas de los datos', () => {
    const csv = aCsv([{ nombre: 'Ana "Anita" Pérez', observaciones: '' }], columnas)
    expect(csv).toContain('"Ana ""Anita"" Pérez";""')
  })

  it('deja la celda vacía cuando el valor no existe', () => {
    const csv = aCsv([{ nombre: undefined, observaciones: null }], columnas)
    expect(csv.slice(1).split('\r\n')[1]).toBe('"";""')
  })
})
