import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Col, Form, Row } from 'react-bootstrap'
import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import EstadoBadge from '../components/EstadoBadge.jsx'
import AlertaTemporal from '../components/AlertaTemporal.jsx'
import InformeEditor from '../components/InformeEditor.jsx'
import InformeVista from '../components/InformeVista.jsx'
import { ESTADOS, formatearFecha, formatearHora, hoyISO } from '../utils/estados.js'
import { puedeEditarSolicitud } from '../utils/flujo.js'
import { validarEntrevista } from '../utils/validaciones.js'
import { useMensajeNavegacion } from '../hooks/useMensajeNavegacion.js'

const exito = (texto) => ({ variant: 'success', texto })
const fallo = (texto) => ({ variant: 'danger', texto })

export default function SolicitudDetalle() {
  const { id } = useParams()
  const { solicitudPorId, candidatoPorId, actualizarSolicitud } = useData()
  const { usuario, can } = useAuth()
  const solicitud = solicitudPorId(id)
  const mensajeInicial = useMensajeNavegacion()

  const [entrevista, setEntrevista] = useState(solicitud?.entrevista
    ? { ...solicitud.entrevista, hora: solicitud.entrevista.hora ? formatearHora(solicitud.entrevista.hora) : '' }
    : { fecha: hoyISO(), hora: '' })
  const [errores, setErrores] = useState({})
  const [mensaje, setMensaje] = useState(mensajeInicial ? exito(mensajeInicial) : null)

  if (!solicitud) {
    return (
      <>
        <p className="text-secondary">No encontramos esa solicitud.</p>
        <Link to="/solicitudes">Volver al listado</Link>
      </>
    )
  }

  const candidato = candidatoPorId(solicitud.candidatoId)
  const indiceActual = ESTADOS.indexOf(solicitud.estado)
  const esEvaluador = can('informe:redactar')
  const esResponsable = esEvaluador && solicitud.responsableId === usuario.id
  const { estado } = solicitud

  const agendar = async () => {
    setMensaje(null)
    const e = validarEntrevista(entrevista, solicitud.fechaSolicitud)
    setErrores(e)
    if (Object.keys(e).length) return
    try { await actualizarSolicitud(solicitud.id, { entrevista, estado: 'Entrevista agendada' }); setMensaje(exito('Entrevista agendada. La solicitud pasó a la etapa Entrevista agendada.')) } catch (error) { setMensaje(fallo(`No fue posible guardar: ${error.message}`)) }
  }

  const marcarRealizada = async () => {
    try { await actualizarSolicitud(solicitud.id, { estado: 'Entrevista realizada' }); setMensaje(exito('Entrevista registrada. Ahora puedes redactar el informe.')) } catch (error) { setMensaje(fallo(`No fue posible guardar: ${error.message}`)) }
  }

  // El editor muestra el resultado del borrador; aquí solo se relanza el error para que lo informe.
  const guardarBorrador = (informe) => actualizarSolicitud(solicitud.id, { informe })

  // Si falla, el error vuelve al editor, que sigue abierto. Si resulta, el editor se cierra y el aviso queda aquí.
  const enviarInforme = async (informe) => {
    await actualizarSolicitud(solicitud.id, { informe, estado: 'Informe enviado', fechaEnvio: hoyISO(), informeRecibido: false })
    setMensaje(exito('Informe enviado al analista.'))
  }

  const reabrirInforme = async () => {
    try { await actualizarSolicitud(solicitud.id, { estado: 'Entrevista realizada', informeRecibido: false }); setMensaje(exito('Informe reabierto. Corrígelo y vuelve a enviarlo.')) } catch (error) { setMensaje(fallo(`No fue posible reabrir: ${error.message}`)) }
  }

  const marcarRecibido = async () => {
    try { await actualizarSolicitud(solicitud.id, { informeRecibido: true }); setMensaje(exito('Marcaste el informe como recibido.')) } catch (error) { setMensaje(fallo(`No fue posible guardar: ${error.message}`)) }
  }

  const cambiarEntrevista = (campo) => (ev) => {
    setEntrevista((d) => ({ ...d, [campo]: ev.target.value }))
    if (errores[campo]) setErrores((e) => ({ ...e, [campo]: undefined }))
  }

  // Panel con las acciones que corresponden al rol y a la etapa actual.
  const acciones = () => {
    if (esEvaluador) {
      if (!esResponsable) {
        return <p className="text-secondary mb-0">Esta solicitud está asignada a {solicitud.responsable}. Puedes verla, pero no modificarla.</p>
      }
      if (estado === 'Evaluación recibida' || estado === 'Entrevista agendada') {
        return (
          <>
            <p className="mb-3">
              {estado === 'Evaluación recibida'
                ? 'Siguiente paso: coordinar la entrevista con el candidato y agendarla.'
                : `Entrevista agendada para el ${formatearFecha(solicitud.entrevista?.fecha)} a las ${formatearHora(solicitud.entrevista?.hora)}.`}
            </p>
            <Row className="g-3">
              <Col sm={6}>
                <Form.Group controlId="fechaEntrevista">
                  <Form.Label>Fecha</Form.Label>
                  <Form.Control type="date" value={entrevista.fecha} onChange={cambiarEntrevista('fecha')} isInvalid={!!errores.fecha} />
                  <Form.Control.Feedback type="invalid">{errores.fecha}</Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col sm={6}>
                <Form.Group controlId="horaEntrevista">
                  <Form.Label>Hora</Form.Label>
                  <Form.Control type="time" value={entrevista.hora} onChange={cambiarEntrevista('hora')} isInvalid={!!errores.hora} />
                  <Form.Control.Feedback type="invalid">{errores.hora}</Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex flex-wrap gap-2 mt-3">
              <Button onClick={agendar}>{estado === 'Evaluación recibida' ? 'Agendar entrevista' : 'Reagendar entrevista'}</Button>
              {estado === 'Entrevista agendada' && (
                <Button variant="outline-secondary" onClick={marcarRealizada}>
                  Marcar entrevista como realizada
                </Button>
              )}
            </div>
          </>
        )
      }
      if (estado === 'Entrevista realizada') {
        return <p className="mb-0">La entrevista ya se realizó. Completa el informe en la sección de abajo y envíalo al analista.</p>
      }
      return (
        <>
          <p className="mb-3">El informe fue enviado el {formatearFecha(solicitud.fechaEnvio)}. Si detectas un error, puedes reabrirlo.</p>
          <Button variant="outline-secondary" onClick={reabrirInforme}>
            Reabrir informe para corregir
          </Button>
        </>
      )
    }

    if (can('solicitudes:editar')) {
      return (
        <>
          {estado === 'Informe enviado' ? (
            solicitud.informeRecibido ? (
              <p className="mb-0">Ya marcaste este informe como recibido.</p>
            ) : (
              <>
                <p className="mb-3">El informe está listo. Revísalo abajo y confirma que lo recibiste.</p>
                <Button onClick={marcarRecibido}>Marcar informe como recibido</Button>
              </>
            )
          ) : (
            <>
              <p className="mb-3">
                El evaluador {solicitud.responsable} está trabajando en esta solicitud. Mientras el informe no se envíe, puedes corregir los datos.
              </p>
              {puedeEditarSolicitud(solicitud) && (
                <Button as={Link} to={`/solicitudes/${solicitud.id}/editar`} variant="outline-secondary">
                  Editar solicitud
                </Button>
              )}
            </>
          )}
        </>
      )
    }

    return <p className="text-secondary mb-0">Tu rol solo permite consultar esta solicitud.</p>
  }

  const mostrarEditor = esResponsable && estado === 'Entrevista realizada'
  const mostrarVista = !mostrarEditor && solicitud.informe && (estado === 'Informe enviado' || esEvaluador)

  return (
    <>
      <Link to="/solicitudes" className="small">
        ← Volver a solicitudes
      </Link>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-2 my-3">
        <div>
          <h1 className="h3 mb-1">{candidato?.nombre ?? 'Candidato eliminado'}</h1>
          <p className="text-secondary mb-0">
            {solicitud.cargo} · {solicitud.familiaCargo}
          </p>
        </div>
        <EstadoBadge estado={estado} />
      </div>

      <ol className="etapas" aria-label="Avance de la solicitud">
        {ESTADOS.map((e, i) => (
          <li key={e} className={i < indiceActual ? 'hecha' : i === indiceActual ? 'actual' : ''} aria-current={i === indiceActual ? 'step' : undefined}>
            {e}
          </li>
        ))}
      </ol>

      {mensaje && (
        <AlertaTemporal
          variant={mensaje.variant}
          duracion={mensaje.variant === 'success' ? 6000 : undefined}
          desplazar
          className="mt-3"
          onClose={() => setMensaje(null)}
        >
          {mensaje.texto}
        </AlertaTemporal>
      )}

      <Row className="g-4 mt-1">
        <Col lg={5}>
          <section className="bloque h-100">
            <h2 className="h6 mb-3">Datos de la solicitud</h2>
            <dl className="datos mb-0">
              <dt>Solicitada por</dt>
              <dd>{solicitud.creadaPor} el {formatearFecha(solicitud.fechaSolicitud)}</dd>
              <dt>Profesional evaluador</dt>
              <dd>{solicitud.responsable}</dd>
              <dt>Origen y ubicación</dt>
              <dd>{candidato ? `${candidato.origen || '—'}${candidato.referido ? ' · referido' : ''} · ${candidato.ubicacion || '—'}` : '—'}</dd>
              <dt>RUT</dt><dd>{candidato?.rut || '—'}</dd>
              <dt>Contacto</dt>
              <dd>{candidato ? `${candidato.correo} · ${candidato.telefono}` : '—'}</dd>
              <dt>Aspectos a indagar</dt>
              <dd>{solicitud.observaciones || 'Sin indicaciones.'}</dd>
            </dl>

            <h3 className="h6 mt-4 mb-2">Carpeta del candidato</h3>
            <ul className="carpeta">
              <li>{candidato?.cv || 'CV pendiente de vincular con Drive'}</li>
              <li>{solicitud.plantillaInforme}</li>
              <li>{solicitud.pautaEntrevista}</li>
            </ul>
          </section>
        </Col>

        <Col lg={7}>
          <section className="bloque h-100">
            <h2 className="h6 mb-3">Qué puedes hacer aquí</h2>
            {acciones()}
          </section>
        </Col>
      </Row>

      <div className="mt-4">
        {mostrarEditor && (
          <InformeEditor
            key={`${solicitud.id}-${solicitud.estado}`}
            solicitud={solicitud}
            onGuardarBorrador={guardarBorrador}
            onEnviar={enviarInforme}
          />
        )}
        {mostrarVista && <InformeVista informe={solicitud.informe} candidato={candidato} solicitud={solicitud} />}
      </div>
    </>
  )
}
