import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient.js'
import { useAuth } from './AuthContext.jsx'
import { hoyISO } from '../utils/estados.js'

const DataContext = createContext(null)

function fechaCorta(valor) {
  return valor ? String(valor).slice(0, 10) : null
}

function mapPostulante(row) {
  return {
    id: row.id,
    rut: row.rut ?? '',
    nombre: row.nombre_completo ?? '',
    correo: row.correo ?? '',
    telefono: row.telefono ?? '',
    cargo: row.cargo ?? '',
    familiaCargo: row.familia_cargo ?? '',
    origen: row.origen ?? '',
    ubicacion: row.ubicacion ?? '',
    referido: !!row.referido,
    cv: row.cv_nombre_archivo ?? '',
    driveFolderId: row.drive_folder_id ?? null,
    driveFolderUrl: row.drive_folder_url ?? null,
    formularioPdfDriveId: row.formulario_pdf_drive_id ?? null,
    formularioPdfUrl: row.formulario_pdf_url ?? null,
    cvDriveFileId: row.cv_drive_file_id ?? null,
    cvDriveUrl: row.cv_drive_url ?? null,
    fechaPostulacion: fechaCorta(row.fecha_postulacion ?? row.created_at),
  }
}

function mapEvaluacion(row) {
  if (!row) return null
  return {
    fecha: fechaCorta(row.fecha_evaluacion),
    categoria: row.resultado ?? '',
    conclusion: row.conclusion ?? '',
    observaciones: row.observaciones ?? '',
    competencias: Array.isArray(row.competencias) ? row.competencias : [],
    informeUrl: row.informe_url ?? null,
    informeEnviado: !!row.informe_enviado,
  }
}

function mapSolicitud(row, perfiles, evaluaciones) {
  const analista = perfiles.get(row.analista_id)
  const evaluador = perfiles.get(row.evaluador_id)
  const evaluacion = evaluaciones.get(row.id)
  const fechaEntrevista = fechaCorta(row.fecha_entrevista)
  return {
    id: row.id,
    candidatoId: row.postulante_id,
    cargo: row.cargo ?? '',
    familiaCargo: row.familia_cargo ?? '',
    responsableId: row.evaluador_id,
    responsable: evaluador?.nombre ?? 'Evaluador asignado',
    creadaPorId: row.analista_id,
    creadaPor: analista?.nombre ?? 'Analista',
    fechaSolicitud: fechaCorta(row.created_at),
    estado: row.estado,
    observaciones: row.observaciones ?? '',
    entrevista: fechaEntrevista ? { fecha: fechaEntrevista, hora: row.hora_entrevista ?? '' } : null,
    informe: mapEvaluacion(evaluacion),
    fechaEnvio: fechaCorta(evaluacion?.fecha_envio),
    informeRecibido: !!row.informe_recibido,
    cv: '',
    plantillaInforme: `Informe_${(row.familia_cargo ?? 'General').replace(/\s+/g, '_')}.xlsx`,
    pautaEntrevista: `Pauta_entrevista_${(row.familia_cargo ?? 'General').replace(/\s+/g, '_')}.docx`,
  }
}

export function DataProvider({ children }) {
  const { usuario, cargando: authCargando } = useAuth()
  const [candidatos, setCandidatos] = useState([])
  const [solicitudes, setSolicitudes] = useState([])
  const [evaluadores, setEvaluadores] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // "silencioso" recarga sin mostrar la pantalla de carga: así la página abierta no se desmonta
  // y conserva sus mensajes y formularios después de guardar.
  const cargar = useCallback(async ({ silencioso = false } = {}) => {
    if (!usuario) {
      setCandidatos([])
      setSolicitudes([])
      setEvaluadores([])
      setLoading(false)
      return
    }

    if (!silencioso) setLoading(true)
    setError('')
    const [postRes, solRes, evalRes, perfilesRes] = await Promise.all([
      supabase.from('postulantes').select('*').order('created_at', { ascending: false }),
      supabase.from('solicitudes').select('*').order('created_at', { ascending: false }),
      supabase.from('evaluaciones').select('*'),
      supabase.from('perfiles').select('id, nombre, correo, rol, activo').eq('activo', true),
    ])

    const primerError = postRes.error || solRes.error || evalRes.error || perfilesRes.error
    if (primerError) {
      setError(primerError.message)
      setLoading(false)
      return
    }

    const perfiles = new Map((perfilesRes.data ?? []).map((p) => [p.id, p]))
    const evaluaciones = new Map((evalRes.data ?? []).map((e) => [e.solicitud_id, e]))
    const candidatosMapeados = (postRes.data ?? []).map(mapPostulante)
    const solicitudesMapeadas = (solRes.data ?? []).map((s) => {
      const solicitud = mapSolicitud(s, perfiles, evaluaciones)
      solicitud.cv = candidatosMapeados.find((c) => c.id === solicitud.candidatoId)?.cv || 'CV pendiente de vincular'
      return solicitud
    })

    setCandidatos(candidatosMapeados)
    setSolicitudes(solicitudesMapeadas)
    setEvaluadores((perfilesRes.data ?? []).filter((p) => p.rol === 'evaluador'))
    setLoading(false)
  }, [usuario])

  useEffect(() => {
    if (!authCargando) cargar()
  }, [authCargando, cargar])

  const agregarCandidato = async (candidato) => {
    const payload = {
      rut: candidato.rut.trim(),
      nombre_completo: candidato.nombre.trim(),
      correo: candidato.correo.trim(),
      telefono: candidato.telefono.trim(),
      cargo: candidato.cargo.trim(),
      familia_cargo: candidato.familiaCargo,
      origen: candidato.origen || null,
      ubicacion: candidato.ubicacion || null,
      referido: !!candidato.referido,
    }
    const { data, error } = await supabase.from('postulantes').insert(payload).select('*').single()
    if (error) throw error
    const nuevo = mapPostulante(data)
    setCandidatos((actuales) => [nuevo, ...actuales])
    return nuevo
  }

  const actualizarCandidato = async (id, cambios) => {
    const payload = {}
    const mapa = {
      rut: 'rut', nombre: 'nombre_completo', correo: 'correo', telefono: 'telefono',
      cargo: 'cargo', familiaCargo: 'familia_cargo', origen: 'origen',
      ubicacion: 'ubicacion', referido: 'referido',
    }
    Object.entries(mapa).forEach(([front, db]) => {
      if (cambios[front] !== undefined) payload[db] = cambios[front]
    })
    const { data, error } = await supabase.from('postulantes').update(payload).eq('id', id).select('*').single()
    if (error) throw error
    const actualizado = mapPostulante(data)
    setCandidatos((actuales) => actuales.map((c) => c.id === id ? actualizado : c))
    return actualizado
  }

  const agregarSolicitud = async (solicitud) => {
    const payload = {
      postulante_id: solicitud.candidatoId,
      cargo: solicitud.cargo.trim(),
      familia_cargo: solicitud.familiaCargo,
      analista_id: usuario.id,
      evaluador_id: solicitud.responsableId,
      estado: 'Evaluación recibida',
      observaciones: solicitud.observaciones || null,
      informe_recibido: false,
    }
    const { data, error } = await supabase.from('solicitudes').insert(payload).select('*').single()
    if (error) throw error
    await cargar({ silencioso: true })
    return solicitudes.find((s) => s.id === data.id) ?? { id: data.id }
  }

  const actualizarSolicitud = async (id, cambios) => {
    const actual = solicitudes.find((s) => s.id === id)
    if (!actual) throw new Error('No encontramos la solicitud que intentas actualizar.')

    const payload = {}
    if (cambios.cargo !== undefined) payload.cargo = cambios.cargo
    if (cambios.familiaCargo !== undefined) payload.familia_cargo = cambios.familiaCargo
    if (cambios.responsableId !== undefined) payload.evaluador_id = cambios.responsableId
    if (cambios.observaciones !== undefined) payload.observaciones = cambios.observaciones || null
    if (cambios.estado !== undefined) payload.estado = cambios.estado
    if (cambios.entrevista !== undefined) {
      payload.fecha_entrevista = cambios.entrevista?.fecha || null
      payload.hora_entrevista = cambios.entrevista?.hora || null
    }
    if (cambios.informeRecibido !== undefined) payload.informe_recibido = cambios.informeRecibido

    if (Object.keys(payload).length) {
      const { error } = await supabase.from('solicitudes').update(payload).eq('id', id)
      if (error) throw error
    }

    if (cambios.informe !== undefined) {
      const informe = cambios.informe
      const enviar = cambios.estado === 'Informe enviado'
      const evaluacionPayload = {
        solicitud_id: id,
        evaluador_id: usuario.id,
        fecha_evaluacion: informe.fecha || hoyISO(),
        resultado: informe.categoria || null,
        conclusion: informe.conclusion || null,
        observaciones: informe.observaciones || null,
        competencias: informe.competencias ?? [],
        informe_enviado: !!enviar,
        fecha_envio: enviar ? hoyISO() : null,
        informe_url: informe.informeUrl ?? null,
      }
      const { error } = await supabase
        .from('evaluaciones')
        .upsert(evaluacionPayload, { onConflict: 'solicitud_id' })
      if (error) throw error
    } else if (cambios.estado === 'Entrevista realizada' && actual.informe) {
      // Al reabrir un informe conservamos su contenido, pero quitamos la marca de enviado.
      const informe = actual.informe
      const { error } = await supabase.from('evaluaciones').upsert({
        solicitud_id: id,
        evaluador_id: usuario.id,
        fecha_evaluacion: informe.fecha || hoyISO(),
        resultado: informe.categoria || null,
        conclusion: informe.conclusion || null,
        observaciones: informe.observaciones || null,
        competencias: informe.competencias ?? [],
        informe_enviado: false,
        fecha_envio: null,
        informe_url: informe.informeUrl ?? null,
      }, { onConflict: 'solicitud_id' })
      if (error) throw error
    }

    await cargar({ silencioso: true })
    return true
  }

  const candidatoPorId = useCallback((id) => candidatos.find((c) => String(c.id) === String(id)), [candidatos])
  const solicitudPorId = useCallback((id) => solicitudes.find((s) => String(s.id) === String(id)), [solicitudes])

  const value = useMemo(() => ({
    candidatos, solicitudes, evaluadores, loading, error, recargar: cargar,
    agregarCandidato, actualizarCandidato, agregarSolicitud, actualizarSolicitud,
    candidatoPorId, solicitudPorId,
  }), [candidatos, solicitudes, evaluadores, loading, error, cargar])

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>
}

export function useData() {
  return useContext(DataContext)
}
