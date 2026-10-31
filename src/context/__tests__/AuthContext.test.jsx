import { describe, expect, it, vi } from 'vitest'
import { tienePermiso } from '../AuthContext.jsx'

vi.mock('../../lib/supabaseClient.js', () => ({ supabase: {} }))

describe('tienePermiso', () => {
  it.each([
    'candidatos:ver',
    'candidatos:escribir',
    'solicitudes:crear',
    'solicitudes:editar',
    'informe:recibir',
  ])('el analista tiene el permiso %s', (permiso) => {
    expect(tienePermiso('analista', permiso)).toBe(true)
  })

  it('el evaluador gestiona entrevistas e informes, pero no ve el listado de postulantes ni crea solicitudes', () => {
    expect(tienePermiso('evaluador', 'entrevista:gestionar')).toBe(true)
    expect(tienePermiso('evaluador', 'informe:redactar')).toBe(true)
    expect(tienePermiso('evaluador', 'candidatos:ver')).toBe(false)
    expect(tienePermiso('evaluador', 'solicitudes:crear')).toBe(false)
  })

  it('jefatura exporta y administra usuarios, pero no edita solicitudes ni redacta informes', () => {
    expect(tienePermiso('jefatura', 'solicitudes:exportar')).toBe(true)
    expect(tienePermiso('jefatura', 'usuarios:administrar')).toBe(true)
    expect(tienePermiso('jefatura', 'solicitudes:editar')).toBe(false)
    expect(tienePermiso('jefatura', 'informe:redactar')).toBe(false)
    expect(tienePermiso('jefatura', 'candidatos:ver')).toBe(false)
  })

  it('niega todo a un rol desconocido', () => {
    expect(tienePermiso('desconocido', 'candidatos:ver')).toBe(false)
    expect(tienePermiso(undefined, 'usuarios:administrar')).toBe(false)
  })
})
