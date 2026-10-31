import { afterEach, describe, expect, it, vi } from 'vitest'
import { aCsv, descargarCsv } from '../exportarCsv.js'

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

describe('descargarCsv', () => {
  afterEach(() => vi.restoreAllMocks())

  it('descarga el archivo con el nombre indicado y libera la URL temporal', async () => {
    // jsdom no implementa URL.createObjectURL ni la descarga real, por eso se simulan.
    URL.createObjectURL = vi.fn(() => 'blob:aquachile/solicitudes')
    URL.revokeObjectURL = vi.fn()
    let enlace
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function () { enlace = this })

    descargarCsv('solicitudes.csv', aCsv([{ nombre: 'Ana Pérez' }], [{ titulo: 'Postulante', valor: (s) => s.nombre }]))

    expect(click).toHaveBeenCalledTimes(1)
    expect(enlace.download).toBe('solicitudes.csv')
    expect(enlace.href).toBe('blob:aquachile/solicitudes')

    const blob = URL.createObjectURL.mock.calls[0][0]
    expect(blob.type).toBe('text/csv;charset=utf-8')
    expect(await blob.text()).toContain('"Ana Pérez"')
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:aquachile/solicitudes')
  })
})
