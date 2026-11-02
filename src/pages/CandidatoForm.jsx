import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, Col, Form, Row } from 'react-bootstrap'
import { useData } from '../context/DataContext.jsx'
import { FAMILIAS_CARGO, ORIGENES, UBICACIONES } from '../utils/estados.js'
import { validarCandidato } from '../utils/validaciones.js'

const VACIO = { rut: '', nombre: '', correo: '', telefono: '', cargo: '', familiaCargo: '', origen: '', ubicacion: '', referido: false }

export default function CandidatoForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { candidatoPorId, agregarCandidato, actualizarCandidato } = useData()
  const existente = id ? candidatoPorId(id) : null
  const [datos, setDatos] = useState(existente ?? VACIO)
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [guardando, setGuardando] = useState(false)

  if (id && !existente) return <p className="text-secondary">No encontramos ese postulante. Vuelve al listado e inténtalo de nuevo.</p>

  const cambiar = (campo) => (ev) => {
    const valor = ev.target.type === 'checkbox' ? ev.target.checked : ev.target.value
    setDatos((d) => ({ ...d, [campo]: valor }))
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: undefined }))
  }

  const guardar = async (ev) => {
    ev.preventDefault()
    const e = validarCandidato(datos)
    setErrores(e)
    setErrorGeneral('')
    if (Object.keys(e).length) return
    setGuardando(true)
    try {
      if (existente) await actualizarCandidato(existente.id, datos)
      else await agregarCandidato(datos)
      const mensaje = existente
        ? `Se actualizaron los datos de ${datos.nombre.trim()}.`
        : `Postulante ${datos.nombre.trim()} registrado correctamente.`
      navigate('/candidatos', { state: { mensaje } })
    } catch (error) {
      setErrorGeneral(error.message || 'No fue posible guardar el postulante.')
    } finally {
      setGuardando(false)
    }
  }

  const campoTexto = (campo, etiqueta, tipo = 'text', ayuda) => (
    <Form.Group controlId={campo}>
      <Form.Label>{etiqueta}</Form.Label>
      <Form.Control type={tipo} value={datos[campo] ?? ''} onChange={cambiar(campo)} isInvalid={!!errores[campo]} placeholder={ayuda} />
      <Form.Control.Feedback type="invalid">{errores[campo]}</Form.Control.Feedback>
    </Form.Group>
  )

  const campoSelect = (campo, etiqueta, opciones) => (
    <Form.Group controlId={campo}>
      <Form.Label>{etiqueta}</Form.Label>
      <Form.Select value={datos[campo] ?? ''} onChange={cambiar(campo)} isInvalid={!!errores[campo]}>
        <option value="">Selecciona una opción</option>
        {opciones.map((o) => <option key={o}>{o}</option>)}
      </Form.Select>
      <Form.Control.Feedback type="invalid">{errores[campo]}</Form.Control.Feedback>
    </Form.Group>
  )

  return (
    <>
      <h1 className="h3 mb-4">{existente ? 'Editar postulante' : 'Registrar postulante'}</h1>
      {errorGeneral && <Alert variant="danger">{errorGeneral}</Alert>}
      <Form noValidate onSubmit={guardar} className="bloque">
        <Row className="g-3">
          <Col md={6}>{campoTexto('rut', 'RUT', 'text', '12.345.678-9')}</Col>
          <Col md={6}>{campoTexto('nombre', 'Nombre completo')}</Col>
          <Col md={6}>{campoTexto('correo', 'Correo electrónico', 'email', 'nombre@correo.cl')}</Col>
          <Col md={6}>{campoTexto('telefono', 'Teléfono', 'tel', '+56 9 1234 5678')}</Col>
          <Col md={6}>{campoTexto('cargo', 'Cargo al que postula')}</Col>
          <Col md={6}>{campoSelect('familiaCargo', 'Familia de cargo', FAMILIAS_CARGO)}</Col>
          <Col md={6}>{campoSelect('ubicacion', 'Ubicación', UBICACIONES)}</Col>
          <Col md={6}>{campoSelect('origen', 'Origen del postulante', ORIGENES)}</Col>
          <Col md={6} className="d-flex align-items-end">
            <Form.Check id="referido" type="checkbox" label="Es un postulante referido" checked={!!datos.referido} onChange={cambiar('referido')} />
          </Col>
        </Row>
        <div className="d-flex gap-2 mt-4">
          <Button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : existente ? 'Guardar cambios' : 'Registrar postulante'}</Button>
          <Button variant="outline-secondary" onClick={() => navigate('/candidatos')} disabled={guardando}>Cancelar</Button>
        </div>
      </Form>
    </>
  )
}
