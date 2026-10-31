import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, Col, Form, Row } from 'react-bootstrap'
import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { FAMILIAS_CARGO, documentosPorFamilia } from '../utils/estados.js'
import { puedeEditarSolicitud } from '../utils/flujo.js'
import { validarSolicitud } from '../utils/validaciones.js'

export default function SolicitudForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { candidatos, evaluadores, candidatoPorId, solicitudPorId, agregarSolicitud, actualizarSolicitud } = useData()
  const existente = id ? solicitudPorId(id) : null
  const [datos, setDatos] = useState(existente
    ? { candidatoId: String(existente.candidatoId), cargo: existente.cargo, familiaCargo: existente.familiaCargo, responsableId: existente.responsableId ?? '', observaciones: existente.observaciones ?? '' }
    : { candidatoId: '', cargo: '', familiaCargo: '', responsableId: '', observaciones: '' })
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)

  if (id && !existente) return <p className="text-secondary">No encontramos esa solicitud. Vuelve al listado e inténtalo de nuevo.</p>
  if (existente && !puedeEditarSolicitud(existente)) {
    return <><Alert variant="warning">Esta solicitud ya tiene el informe enviado y no se puede editar.</Alert><Link to={`/solicitudes/${existente.id}`}>Volver a la solicitud</Link></>
  }

  const cambiar = (campo) => (ev) => {
    setDatos((d) => ({ ...d, [campo]: ev.target.value }))
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: undefined }))
  }

  const elegirCandidato = (ev) => {
    const c = candidatoPorId(ev.target.value)
    setDatos((d) => ({ ...d, candidatoId: ev.target.value, cargo: c ? c.cargo : d.cargo, familiaCargo: c ? c.familiaCargo : d.familiaCargo }))
    setErrores((e) => ({ ...e, candidatoId: undefined }))
  }

  const guardar = async (ev) => {
    ev.preventDefault()
    const e = validarSolicitud(datos)
    setErrores(e)
    setErrorGeneral('')
    if (Object.keys(e).length) return
    setGuardando(true)
    try {
      if (existente) {
        await actualizarSolicitud(existente.id, {
          cargo: datos.cargo,
          familiaCargo: datos.familiaCargo,
          responsableId: datos.responsableId,
          observaciones: datos.observaciones,
        })
        navigate(`/solicitudes/${existente.id}`)
      } else {
        const nueva = await agregarSolicitud({ ...datos, candidatoId: datos.candidatoId, creadaPor: usuario.nombre })
        navigate(`/solicitudes/${nueva.id}`)
      }
    } catch (error) {
      setErrorGeneral(error.message || 'No fue posible guardar la solicitud.')
    } finally {
      setGuardando(false)
    }
  }

  const docs = datos.familiaCargo ? documentosPorFamilia(datos.familiaCargo) : null
  const candidatoSeleccionado = candidatoPorId(datos.candidatoId)

  return (
    <>
      <h1 className="h3 mb-4">{existente ? 'Editar solicitud' : 'Nueva solicitud de evaluación'}</h1>
      {errorGeneral && <Alert variant="danger">{errorGeneral}</Alert>}
      <Form noValidate onSubmit={guardar} className="bloque">
        <Row className="g-3">
          <Col md={12}>
            <Form.Group controlId="candidatoId">
              <Form.Label>Postulante</Form.Label>
              <Form.Select value={datos.candidatoId} onChange={elegirCandidato} isInvalid={!!errores.candidatoId} disabled={!!existente}>
                <option value="">Selecciona un postulante</option>
                {candidatos.map((c) => <option key={c.id} value={c.id}>{c.nombre} · {c.rut}</option>)}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errores.candidatoId}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="cargo">
              <Form.Label>Cargo</Form.Label>
              <Form.Control value={datos.cargo} onChange={cambiar('cargo')} isInvalid={!!errores.cargo} />
              <Form.Control.Feedback type="invalid">{errores.cargo}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="familiaCargo">
              <Form.Label>Familia de cargo</Form.Label>
              <Form.Select value={datos.familiaCargo} onChange={cambiar('familiaCargo')} isInvalid={!!errores.familiaCargo}>
                <option value="">Selecciona una opción</option>
                {FAMILIAS_CARGO.map((f) => <option key={f}>{f}</option>)}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errores.familiaCargo}</Form.Control.Feedback>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group controlId="responsableId">
              <Form.Label>Profesional evaluador</Form.Label>
              <Form.Select value={datos.responsableId} onChange={cambiar('responsableId')} isInvalid={!!errores.responsable}>
                <option value="">Selecciona un evaluador</option>
                {evaluadores.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
              </Form.Select>
              <Form.Control.Feedback type="invalid">{errores.responsable}</Form.Control.Feedback>
              {evaluadores.length === 0 && <Form.Text className="text-danger">No hay perfiles activos con rol evaluador. Revisa la tabla perfiles y sus políticas RLS.</Form.Text>}
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Currículum</Form.Label>
              <Form.Control value={candidatoSeleccionado?.cv || 'Pendiente de vincular con Google Drive'} readOnly />
              <Form.Text>La carga y apertura segura de documentos se conectará mediante una función de Google Drive. No se almacena el archivo en el navegador.</Form.Text>
            </Form.Group>
          </Col>
          <Col md={12}>
            <Form.Group controlId="observaciones">
              <Form.Label>Aspectos a indagar (opcional)</Form.Label>
              <Form.Control as="textarea" rows={3} value={datos.observaciones} onChange={cambiar('observaciones')} />
            </Form.Group>
          </Col>
        </Row>
        {docs && <div className="carpeta-aviso mt-4">La pauta y plantilla sugeridas corresponden a la familia <strong>{datos.familiaCargo}</strong>: <strong>{docs.plantillaInforme}</strong> y <strong>{docs.pautaEntrevista}</strong>. Los archivos reales se vincularán desde Drive.</div>}
        <div className="d-flex gap-2 mt-4">
          <Button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : existente ? 'Guardar cambios' : 'Crear solicitud'}</Button>
          <Button variant="outline-secondary" onClick={() => navigate(existente ? `/solicitudes/${existente.id}` : '/solicitudes')} disabled={guardando}>Cancelar</Button>
        </div>
      </Form>
    </>
  )
}
