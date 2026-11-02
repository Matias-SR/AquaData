import { describe, expect, it } from 'vitest'
import { puedeEditarSolicitud, siguienteAccionEvaluador } from '../flujo.js'
import { ESTADOS } from '../estados.js'

describe('puedeEditarSolicitud', () => {
  it.each(['Evaluación recibida', 'Entrevista agendada', 'Entrevista realizada'])(
    'permite editar la solicitud en la etapa "%s"',
    (estado) => {
      expect(puedeEditarSolicitud({ estado })).toBe(true)
    },
  )

  it('bloquea la edición cuando el informe ya fue enviado', () => {
    expect(puedeEditarSolicitud({ estado: 'Informe enviado' })).toBe(false)
  })
})

describe('siguienteAccionEvaluador', () => {
  it.each([
    ['Evaluación recibida', 'Agendar entrevista'],
    ['Entrevista agendada', 'Registrar entrevista'],
    ['Entrevista realizada', 'Redactar informe'],
    ['Informe enviado', 'Ver informe'],
  ])('en la etapa "%s" indica al evaluador "%s"', (estado, accion) => {
    expect(siguienteAccionEvaluador(estado)).toBe(accion)
  })

  it('cubre las 4 etapas definidas para el proceso', () => {
    expect(ESTADOS).toHaveLength(4)
    ESTADOS.forEach((estado) => expect(siguienteAccionEvaluador(estado)).toBeTruthy())
  })
})
