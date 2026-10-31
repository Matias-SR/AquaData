// Etapas del proceso, tomadas del tablero Planner de AquaChile
export const ESTADOS = [
  'Evaluación recibida',
  'Entrevista agendada',
  'Entrevista realizada',
  'Informe enviado',
]

export const ESTADO_CLASE = {
  'Evaluación recibida': 'estado-recibida',
  'Entrevista agendada': 'estado-agendada',
  'Entrevista realizada': 'estado-realizada',
  'Informe enviado': 'estado-enviado',
}

// Categorías del evaluado, tomadas del Excel de registro
export const CATEGORIAS = ['Recomendado', 'Recomendado con observaciones', 'No recomendado']

export const FAMILIAS_CARGO = [
  'Operario Calificado',
  'Técnico A',
  'Técnico B C',
  'Supervisor B',
  'Jefatura',
  'Profesional A',
  'Profesional B C',
]

export const UBICACIONES = [
  'Oficina Central',
  'Planta Magallanes',
  'Planta Calbuco',
  'Planta Pargua',
  'Planta Puerto Natales',
  'Piscicultura Sur',
]

export const ORIGENES = ['Interno', 'Externo']

export function formatearFecha(iso) {
  if (!iso) return '—'
  return new Date(`${iso}T00:00:00`).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function hoyISO() {
  const d = new Date()
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

// ---------- Carpeta digital e informe por secciones ----------
const COMPETENCIAS_BASE = ['Orientación a la seguridad', 'Trabajo en equipo', 'Comunicación', 'Adaptabilidad al cambio']

export const COMPETENCIAS_POR_FAMILIA = {
  'Operario Calificado': ['Orientación a la seguridad', 'Trabajo en equipo', 'Cumplimiento de procedimientos', 'Adaptabilidad al cambio'],
  'Técnico A': ['Orientación a la seguridad', 'Resolución de problemas', 'Trabajo en equipo', 'Autonomía'],
  'Técnico B C': COMPETENCIAS_BASE,
  'Supervisor B': ['Liderazgo de equipos', 'Orientación a la seguridad', 'Comunicación', 'Gestión de conflictos'],
  Jefatura: ['Liderazgo de equipos', 'Toma de decisiones', 'Gestión de conflictos', 'Visión estratégica'],
  'Profesional A': ['Liderazgo de equipos', 'Pensamiento analítico', 'Comunicación', 'Orientación a resultados'],
  'Profesional B C': ['Pensamiento analítico', 'Comunicación', 'Orientación a resultados', 'Adaptabilidad al cambio'],
}

export function competenciasDe(familia) {
  return COMPETENCIAS_POR_FAMILIA[familia] ?? COMPETENCIAS_BASE
}

// Simula la selección automática de plantilla y pauta según la familia de cargo.
export function documentosPorFamilia(familia) {
  const slug = (familia || 'General').replace(/\s+/g, '_')
  return { plantillaInforme: `Informe_${slug}.xlsx`, pautaEntrevista: `Pauta_entrevista_${slug}.docx` }
}

export function informeVacio(familia) {
  return {
    fecha: hoyISO(),
    categoria: '',
    conclusion: '',
    competencias: competenciasDe(familia).map((nombre) => ({ nombre, criterio: '', fortalezas: '', oportunidades: '' })),
  }
}
