import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button, Col, Form, Row, Table } from 'react-bootstrap'
import { useData } from '../context/DataContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import EmptyState from '../components/EmptyState.jsx'
import AlertaTemporal from '../components/AlertaTemporal.jsx'
import { useMensajeNavegacion } from '../hooks/useMensajeNavegacion.js'
import { FAMILIAS_CARGO, ORIGENES } from '../utils/estados.js'

export default function Candidatos() {
  const { candidatos } = useData()
  const { can } = useAuth()
  const [texto, setTexto] = useState('')
  const [origen, setOrigen] = useState('')
  const [familia, setFamilia] = useState('')
  const mensajeInicial = useMensajeNavegacion()
  const [aviso, setAviso] = useState(mensajeInicial)

  const filtrados = useMemo(() => {
    const t = texto.trim().toLowerCase()
    return candidatos.filter((c) =>
      (!t || c.nombre.toLowerCase().includes(t) || c.rut.toLowerCase().includes(t) || c.cargo.toLowerCase().includes(t)) &&
      (!origen || c.origen === origen) &&
      (!familia || c.familiaCargo === familia)
    )
  }, [candidatos, texto, origen, familia])

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div><h1 className="h3 mb-1">Postulantes</h1><p className="text-secondary mb-0">{filtrados.length} de {candidatos.length} postulantes</p></div>
        {can('candidatos:escribir') && <Button as={Link} to="/candidatos/nuevo">Registrar postulante</Button>}
      </div>
      {aviso && <AlertaTemporal duracion={5000} onClose={() => setAviso('')}>{aviso}</AlertaTemporal>}
      <Row className="g-2 mb-3">
        <Col md={5}><Form.Control type="search" placeholder="Buscar por nombre, RUT o cargo" aria-label="Buscar postulante" value={texto} onChange={(e) => setTexto(e.target.value)} /></Col>
        <Col sm={6} md={3}><Form.Select aria-label="Filtrar por origen" value={origen} onChange={(e) => setOrigen(e.target.value)}><option value="">Todos los orígenes</option>{ORIGENES.map((o) => <option key={o}>{o}</option>)}</Form.Select></Col>
        <Col sm={6} md={4}><Form.Select aria-label="Filtrar por familia de cargo" value={familia} onChange={(e) => setFamilia(e.target.value)}><option value="">Todas las familias</option>{FAMILIAS_CARGO.map((f) => <option key={f}>{f}</option>)}</Form.Select></Col>
      </Row>
      {filtrados.length === 0 ? <EmptyState titulo="No hay postulantes con esos criterios">Cambia los filtros o registra un postulante.</EmptyState> : (
        <div className="table-responsive bloque p-0"><Table hover className="align-middle mb-0">
          <thead><tr><th>Nombre</th><th>RUT</th><th>Cargo</th><th>Familia</th><th>Origen</th><th>Ubicación</th><th>Contacto</th>{can('candidatos:escribir') && <th />}</tr></thead>
          <tbody>{filtrados.map((c) => <tr key={c.id}>
            <td className="fw-semibold">{c.nombre}</td><td>{c.rut}</td><td>{c.cargo}</td><td>{c.familiaCargo}</td>
            <td>{c.origen || '—'}{c.referido ? ' · referido' : ''}</td><td>{c.ubicacion || '—'}</td>
            <td className="small">{c.correo}<br />{c.telefono}</td>
            {can('candidatos:escribir') && <td className="text-end"><Button as={Link} to={`/candidatos/${c.id}/editar`} size="sm" variant="outline-secondary">Editar</Button></td>}
          </tr>)}</tbody>
        </Table></div>
      )}
    </>
  )
}
