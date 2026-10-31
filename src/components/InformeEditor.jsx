import { useState } from 'react'
import { Alert, Button, Col, Form, Row } from 'react-bootstrap'
import AlertaTemporal from './AlertaTemporal.jsx'
import { CATEGORIAS, informeVacio } from '../utils/estados.js'
import { validarInforme } from '../utils/validaciones.js'

// Editor del informe por secciones. El evaluador guarda un borrador o lo envía al analista.
export default function InformeEditor({ solicitud, onGuardarBorrador, onEnviar }) {
  const [informe, setInforme] = useState(solicitud.informe ?? informeVacio(solicitud.familiaCargo))
  const [errores, setErrores] = useState({})
  const [aviso, setAviso] = useState(null)

  const cambiar = (campo) => (ev) => {
    setInforme((d) => ({ ...d, [campo]: ev.target.value }))
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: undefined }))
  }

  const cambiarCompetencia = (indice, campo) => (ev) => {
    const valor = ev.target.value
    setInforme((d) => ({
      ...d,
      competencias: d.competencias.map((c, i) => (i === indice ? { ...c, [campo]: valor } : c)),
    }))
    if (errores.competencias) setErrores((e) => ({ ...e, competencias: undefined }))
  }

  const guardar = async () => {
    setAviso(null)
    try { await onGuardarBorrador(informe); setAviso({ variant: 'success', texto: 'Borrador guardado.' }) } catch (error) { setAviso({ variant: 'danger', texto: `No fue posible guardar el borrador: ${error.message}` }) }
  }

  const enviar = async () => {
    setAviso(null)
    const e = validarInforme(informe, solicitud.fechaSolicitud)
    setErrores(e)
    if (Object.keys(e).length) return
    try { await onEnviar(informe) } catch (error) { setAviso({ variant: 'danger', texto: `No fue posible enviar el informe: ${error.message}` }) }
  }

  return (
    <section className="bloque">
      <h2 className="h5 mb-1">Informe psicolaboral</h2>
      <p className="text-secondary small">
        Plantilla asignada: {solicitud.plantillaInforme}. Completa cada sección y envía el informe al analista.
      </p>

      {aviso && (
        <AlertaTemporal variant={aviso.variant} duracion={aviso.variant === 'success' ? 5000 : undefined} desplazar onClose={() => setAviso(null)}>
          {aviso.texto}
        </AlertaTemporal>
      )}
      {errores.competencias && <Alert variant="danger">{errores.competencias}</Alert>}

      <Row className="g-3 mb-3">
        <Col md={5}>
          <Form.Group controlId="fechaInforme">
            <Form.Label>Fecha de evaluación</Form.Label>
            <Form.Control type="date" value={informe.fecha} onChange={cambiar('fecha')} isInvalid={!!errores.fecha} />
            <Form.Control.Feedback type="invalid">{errores.fecha}</Form.Control.Feedback>
          </Form.Group>
        </Col>
        <Col md={7}>
          <Form.Group controlId="categoriaInforme">
            <Form.Label>Categoría del evaluado</Form.Label>
            <Form.Select value={informe.categoria} onChange={cambiar('categoria')} isInvalid={!!errores.categoria}>
              <option value="">Selecciona una categoría</option>
              {CATEGORIAS.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">{errores.categoria}</Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      {informe.competencias.map((c, i) => (
        <fieldset key={c.nombre} className="informe-seccion">
          <legend className="h6">{c.nombre}</legend>
          <Row className="g-3">
            <Col md={12}>
              <Form.Group controlId={`criterio-${i}`}>
                <Form.Label>Criterio</Form.Label>
                <Form.Control as="textarea" rows={2} value={c.criterio} onChange={cambiarCompetencia(i, 'criterio')} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId={`fortalezas-${i}`}>
                <Form.Label>Fortalezas</Form.Label>
                <Form.Control as="textarea" rows={3} value={c.fortalezas} onChange={cambiarCompetencia(i, 'fortalezas')} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId={`oportunidades-${i}`}>
                <Form.Label>Oportunidades de desarrollo</Form.Label>
                <Form.Control as="textarea" rows={3} value={c.oportunidades} onChange={cambiarCompetencia(i, 'oportunidades')} />
              </Form.Group>
            </Col>
          </Row>
        </fieldset>
      ))}

      <Form.Group controlId="conclusion" className="mt-3">
        <Form.Label>Conclusión general</Form.Label>
        <Form.Control as="textarea" rows={4} value={informe.conclusion} onChange={cambiar('conclusion')} isInvalid={!!errores.conclusion} />
        <Form.Control.Feedback type="invalid">{errores.conclusion}</Form.Control.Feedback>
      </Form.Group>

      <div className="d-flex flex-wrap gap-2 mt-4">
        <Button variant="outline-secondary" onClick={guardar}>
          Guardar borrador
        </Button>
        <Button onClick={enviar}>Enviar informe al analista</Button>
      </div>
    </section>
  )
}
