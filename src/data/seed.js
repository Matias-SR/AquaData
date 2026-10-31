// Datos 100% ficticios para el prototipo. No incluyen información real de AquaChile.
import { competenciasDe, documentosPorFamilia } from '../utils/estados.js'

export const USUARIOS = [
  { id: 1, nombre: 'Paula Andrade', correo: 'analista@demo.cl', clave: 'demo1234', rol: 'analista' },
  { id: 2, nombre: 'Camila Muñoz', correo: 'analista2@demo.cl', clave: 'demo1234', rol: 'analista' },
  { id: 3, nombre: 'Sofía Marín', correo: 'evaluador@demo.cl', clave: 'demo1234', rol: 'evaluador' },
  { id: 4, nombre: 'Tomás Ibarra', correo: 'evaluador2@demo.cl', clave: 'demo1234', rol: 'evaluador' },
  { id: 5, nombre: 'Ricardo Lagos', correo: 'jefatura@demo.cl', clave: 'demo1234', rol: 'jefatura' },
]

export const CANDIDATOS_SEED = [
  { id: 1, nombre: 'Marcela Torres Vidal', correo: 'marcela.torres@ejemplo.cl', telefono: '+56 9 5550 1101', cargo: 'Operador Sala Control', familiaCargo: 'Técnico B C', origen: 'Interno', ubicacion: 'Planta Pargua', referido: false },
  { id: 2, nombre: 'Diego Fuentes Araya', correo: 'diego.fuentes@ejemplo.cl', telefono: '+56 9 5550 1102', cargo: 'Líder Desarrollo Producción', familiaCargo: 'Profesional A', origen: 'Externo', ubicacion: 'Oficina Central', referido: true },
  { id: 3, nombre: 'Camila Soto Reyes', correo: 'camila.soto@ejemplo.cl', telefono: '+56 9 5550 1103', cargo: 'Analista de Sistemas', familiaCargo: 'Profesional B C', origen: 'Interno', ubicacion: 'Planta Magallanes', referido: false },
  { id: 4, nombre: 'Nicolás Barrientos Leal', correo: 'nicolas.barrientos@ejemplo.cl', telefono: '+56 9 5550 1104', cargo: 'Operador de Máquina', familiaCargo: 'Operario Calificado', origen: 'Externo', ubicacion: 'Planta Puerto Natales', referido: false },
  { id: 5, nombre: 'Javiera Contreras Mora', correo: 'javiera.contreras@ejemplo.cl', telefono: '+56 9 5550 1105', cargo: 'Jefe de Planta', familiaCargo: 'Jefatura', origen: 'Interno', ubicacion: 'Planta Calbuco', referido: false },
  { id: 6, nombre: 'Felipe Gallardo Núñez', correo: 'felipe.gallardo@ejemplo.cl', telefono: '+56 9 5550 1106', cargo: 'Técnico Mantención Senior', familiaCargo: 'Técnico A', origen: 'Interno', ubicacion: 'Planta Calbuco', referido: false },
  { id: 7, nombre: 'Valentina Oyarzún Paredes', correo: 'valentina.oyarzun@ejemplo.cl', telefono: '+56 9 5550 1107', cargo: 'Supervisor de Piscicultura', familiaCargo: 'Supervisor B', origen: 'Externo', ubicacion: 'Piscicultura Sur', referido: true },
  { id: 8, nombre: 'Sebastián Cárcamo Toro', correo: 'sebastian.carcamo@ejemplo.cl', telefono: '+56 9 5550 1108', cargo: 'Asistente Bodega Planta', familiaCargo: 'Técnico B C', origen: 'Interno', ubicacion: 'Planta Pargua', referido: false },
]

const informeEjemplo = (familia, fecha, categoria, conclusion) => ({
  fecha,
  categoria,
  conclusion,
  competencias: competenciasDe(familia).map((nombre) => ({
    nombre,
    criterio: 'Describe ejemplos concretos y consistentes con lo que exige el cargo.',
    fortalezas: 'Muestra disposición y claridad al relatar situaciones reales de trabajo.',
    oportunidades: 'Puede fortalecerse con acompañamiento y retroalimentación periódica.',
  })),
})

const base = (id, candidatoId, cargo, familiaCargo, fechaSolicitud, estado, responsable, creadaPor, observaciones) => ({
  id, candidatoId, cargo, familiaCargo, fechaSolicitud, estado, responsable, creadaPor, observaciones,
  cv: `CV_ficticio_${candidatoId}.pdf`,
  ...documentosPorFamilia(familiaCargo),
  entrevista: null,
  informe: null,
  fechaEnvio: null,
  informeRecibido: false,
})

export const SOLICITUDES_SEED = [
  { ...base(1, 1, 'Operador Sala Control', 'Técnico B C', '2026-09-01', 'Informe enviado', 'Sofía Marín', 'Paula Andrade', 'Candidato interno con buen historial.'),
    entrevista: { fecha: '2026-09-03', hora: '10:00' }, fechaEnvio: '2026-09-07', informeRecibido: true,
    informe: informeEjemplo('Técnico B C', '2026-09-04', 'Recomendado', 'Perfil adecuado para el cargo, con buena disposición al trabajo en turnos.') },
  { ...base(2, 2, 'Líder Desarrollo Producción', 'Profesional A', '2026-09-03', 'Informe enviado', 'Tomás Ibarra', 'Paula Andrade', 'Profundizar en liderazgo de equipos.'),
    entrevista: { fecha: '2026-09-08', hora: '15:30' }, fechaEnvio: '2026-09-12',
    informe: informeEjemplo('Profesional A', '2026-09-08', 'Recomendado con observaciones', 'Buen perfil técnico. Se sugiere acompañar el desarrollo de habilidades de delegación.') },
  { ...base(3, 3, 'Analista de Sistemas', 'Profesional B C', '2026-09-10', 'Entrevista realizada', 'Sofía Marín', 'Paula Andrade', ''),
    entrevista: { fecha: '2026-09-16', hora: '11:00' } },
  { ...base(4, 4, 'Operador de Máquina', 'Operario Calificado', '2026-09-14', 'Entrevista agendada', 'Tomás Ibarra', 'Paula Andrade', 'Requiere traslado a planta.'),
    entrevista: { fecha: '2026-09-29', hora: '15:00' } },
  { ...base(5, 5, 'Jefe de Planta', 'Jefatura', '2026-09-17', 'Entrevista agendada', 'Sofía Marín', 'Camila Muñoz', 'Énfasis en liderazgo y gestión de conflictos.'),
    entrevista: { fecha: '2026-09-30', hora: '09:30' } },
  base(6, 6, 'Técnico Mantención Senior', 'Técnico A', '2026-09-21', 'Evaluación recibida', 'Tomás Ibarra', 'Camila Muñoz', ''),
  base(7, 7, 'Supervisor de Piscicultura', 'Supervisor B', '2026-09-23', 'Evaluación recibida', 'Sofía Marín', 'Camila Muñoz', 'Candidato referido.'),
  base(8, 8, 'Asistente Bodega Planta', 'Técnico B C', '2026-09-24', 'Evaluación recibida', 'Tomás Ibarra', 'Camila Muñoz', ''),
]
