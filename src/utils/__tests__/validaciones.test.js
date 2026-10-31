import { describe, expect, it } from 'vitest'
import {
  rutValido,
  validarCandidato,
  validarEntrevista,
  validarInforme,
  validarSolicitud,
} from '../validaciones.js'

const candidatoValido = {
  rut: '12.345.678-5',
  nombre: 'Postulante de Prueba',
  correo: 'postulante@ejemplo.cl',
  telefono: '+56 9 1234 5678',
  cargo: 'Operador de Planta',
  familiaCargo: 'Operario Calificado',
}

const competencia = (cambios = {}) => ({
  nombre: 'Trabajo en equipo',
  criterio: 'Relata ejemplos concretos',
  fortalezas: 'Colabora con su turno',
  oportunidades: 'Delegar más tareas',
  ...cambios,
})

describe('rutValido', () => {
  it('acepta un RUT válido escrito con puntos y guion', () => {
    expect(rutValido('12.345.678-5')).toBe(true)
  })

  it('acepta un RUT válido escrito sin puntos ni guion', () => {
    expect(rutValido('123456785')).toBe(true)
  })

  it('rechaza un RUT con dígito verificador incorrecto', () => {
    expect(rutValido('12.345.678-9')).toBe(false)
  })

  it('acepta el dígito verificador K en mayúscula', () => {
    expect(rutValido('10.000.013-K')).toBe(true)
  })

  it('acepta el dígito verificador k en minúscula', () => {
    expect(rutValido('10.000.013-k')).toBe(true)
  })

  it('rechaza un RUT vacío o ausente', () => {
    expect(rutValido('')).toBe(false)
    expect(rutValido(undefined)).toBe(false)
  })

  it('rechaza un RUT con letras en el cuerpo', () => {
    expect(rutValido('12.34A.678-5')).toBe(false)
  })
})

describe('validarCandidato', () => {
  it('no reporta errores cuando el postulante tiene todos sus datos correctos', () => {
    expect(validarCandidato(candidatoValido)).toEqual({})
  })

  it('exige todos los campos obligatorios cuando el formulario está vacío', () => {
    const errores = validarCandidato({})
    expect(Object.keys(errores).sort()).toEqual(['cargo', 'correo', 'familiaCargo', 'nombre', 'rut', 'telefono'])
  })

  it('rechaza un correo sin dominio', () => {
    expect(validarCandidato({ ...candidatoValido, correo: 'postulante@' }).correo).toBeDefined()
  })

  it('rechaza un teléfono que no es celular chileno', () => {
    expect(validarCandidato({ ...candidatoValido, telefono: '22 123 4567' }).telefono).toBeDefined()
  })

  it('acepta un celular chileno sin código de país', () => {
    expect(validarCandidato({ ...candidatoValido, telefono: '912345678' }).telefono).toBeUndefined()
  })

  it('rechaza un nombre de menos de 3 caracteres', () => {
    expect(validarCandidato({ ...candidatoValido, nombre: 'Al' }).nombre).toBeDefined()
  })
})

describe('validarSolicitud', () => {
  const solicitudValida = { candidatoId: '1', cargo: 'Operador de Planta', familiaCargo: 'Operario Calificado', responsableId: 'abc' }

  it('no reporta errores cuando la solicitud está completa', () => {
    expect(validarSolicitud(solicitudValida)).toEqual({})
  })

  it('exige elegir postulante, cargo, familia y evaluador', () => {
    const errores = validarSolicitud({})
    expect(Object.keys(errores).sort()).toEqual(['candidatoId', 'cargo', 'familiaCargo', 'responsable'])
  })

  it('exige asignar un profesional evaluador', () => {
    expect(validarSolicitud({ ...solicitudValida, responsableId: '' }).responsable).toBeDefined()
  })
})

describe('validarEntrevista', () => {
  it('acepta una entrevista con fecha posterior a la solicitud', () => {
    expect(validarEntrevista({ fecha: '2026-10-05', hora: '10:00' }, '2026-10-01')).toEqual({})
  })

  it('acepta una entrevista el mismo día de la solicitud', () => {
    expect(validarEntrevista({ fecha: '2026-10-01', hora: '10:00' }, '2026-10-01')).toEqual({})
  })

  it('rechaza una entrevista con fecha anterior a la solicitud', () => {
    const errores = validarEntrevista({ fecha: '2026-09-30', hora: '10:00' }, '2026-10-01')
    expect(errores.fecha).toMatch(/anterior a la solicitud/)
  })

  it('exige fecha y hora de la entrevista', () => {
    const errores = validarEntrevista({ fecha: '', hora: '' }, '2026-10-01')
    expect(errores.fecha).toBeDefined()
    expect(errores.hora).toBeDefined()
  })
})

describe('validarInforme', () => {
  const informeValido = {
    fecha: '2026-10-05',
    categoria: 'Recomendado',
    conclusion: 'Perfil adecuado para el cargo.',
    competencias: [competencia(), competencia({ nombre: 'Comunicación' })],
  }

  it('no reporta errores cuando el informe está completo', () => {
    expect(validarInforme(informeValido, '2026-10-01')).toEqual({})
  })

  it('rechaza una conclusión de menos de 10 caracteres', () => {
    expect(validarInforme({ ...informeValido, conclusion: 'Apto' }, '2026-10-01').conclusion).toBeDefined()
  })

  it('rechaza el informe si alguna competencia está incompleta', () => {
    const informe = { ...informeValido, competencias: [competencia(), competencia({ fortalezas: '' })] }
    expect(validarInforme(informe, '2026-10-01').competencias).toBeDefined()
  })

  it('exige seleccionar la categoría del evaluado', () => {
    expect(validarInforme({ ...informeValido, categoria: '' }, '2026-10-01').categoria).toBeDefined()
  })

  it('rechaza una fecha de evaluación anterior a la solicitud', () => {
    expect(validarInforme({ ...informeValido, fecha: '2026-09-01' }, '2026-10-01').fecha).toBeDefined()
  })
})
