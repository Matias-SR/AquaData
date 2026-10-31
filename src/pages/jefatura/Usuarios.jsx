import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Badge, Button, Form, Modal, Spinner, Table } from 'react-bootstrap'
import { supabase } from '../../lib/supabaseClient.js'
import { useAuth } from '../../context/AuthContext.jsx'

const ROLES = [
  { value: 'analista', label: 'Analista de Reclutamiento' },
  { value: 'evaluador', label: 'Profesional Evaluador' },
  { value: 'jefatura', label: 'Jefatura' },
]
const etiquetaRol = (rol) => ROLES.find((r) => r.value === rol)?.label ?? rol
const vacio = { nombre: '', correo: '', rol: 'analista', password: '' }

export default function Usuarios() {
  const { usuario } = useAuth()
  const [usuarios, setUsuarios] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(true)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [mostrar, setMostrar] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(vacio)

  const llamarFuncion = async (payload) => {
    const { data, error: invokeError } = await supabase.functions.invoke('usuarios', { body: payload })
    if (invokeError) {
      let detalle = invokeError.message || 'No se pudo conectar con la función de usuarios.'
      try {
        const respuesta = await invokeError.context?.json?.()
        if (respuesta?.message) detalle = respuesta.message
      } catch { /* Conserva el mensaje original si la respuesta no es JSON. */ }
      throw new Error(detalle)
    }
    if (data?.message && !data?.users && !data?.userId && !data?.message.includes('correctamente') && !data?.message.includes('activado') && !data?.message.includes('desactivado')) {
      throw new Error(data.message)
    }
    return data
  }

  const cargarUsuarios = useCallback(async () => {
    setCargando(true)
    setError('')
    try {
      const data = await llamarFuncion({ action: 'list' })
      setUsuarios(data.users ?? [])
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargarUsuarios() }, [cargarUsuarios])

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    if (!q) return usuarios
    return usuarios.filter((u) => `${u.nombre} ${u.correo} ${u.rol}`.toLowerCase().includes(q))
  }, [usuarios, busqueda])

  const abrirNuevo = () => {
    setEditando(null)
    setForm(vacio)
    setError('')
    setMensaje('')
    setMostrar(true)
  }
  const abrirEdicion = (u) => {
    setEditando(u)
    setForm({ nombre: u.nombre ?? '', correo: u.correo ?? '', rol: u.rol, password: '' })
    setError('')
    setMensaje('')
    setMostrar(true)
  }
  const cerrar = () => { if (!guardando) setMostrar(false) }
  const cambiar = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }))

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    setError('')
    setMensaje('')
    try {
      if (editando) {
        await llamarFuncion({ action: 'update', userId: editando.id, nombre: form.nombre, correo: form.correo, rol: form.rol })
        setMensaje('Los datos del usuario se actualizaron.')
      } else {
        await llamarFuncion({ action: 'create', nombre: form.nombre, correo: form.correo, rol: form.rol, password: form.password })
        setMensaje('El usuario se creó correctamente. Ya puede iniciar sesión.')
      }
      setMostrar(false)
      await cargarUsuarios()
    } catch (err) {
      setError(err.message)
    } finally {
      setGuardando(false)
    }
  }

  const cambiarEstado = async (u) => {
    const activo = !u.activo
    const confirmar = window.confirm(`${activo ? '¿Activar' : '¿Desactivar'} la cuenta de ${u.nombre}?`)
    if (!confirmar) return
    setError('')
    setMensaje('')
    try {
      const data = await llamarFuncion({ action: 'set_active', userId: u.id, activo })
      setMensaje(data.message)
      await cargarUsuarios()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-4">
        <div>
          <h1 className="h3 mb-1">Administración de usuarios</h1>
          <p className="text-secondary mb-0">Crea cuentas internas y administra sus permisos de acceso.</p>
        </div>
        <Button onClick={abrirNuevo}>+ Nuevo usuario</Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {mensaje && <Alert variant="success" dismissible onClose={() => setMensaje('')}>{mensaje}</Alert>}

      <section className="bloque mb-3">
        <div className="row g-3 align-items-end">
          <div className="col-md-7">
            <Form.Label htmlFor="buscar-usuario">Buscar usuario</Form.Label>
            <Form.Control id="buscar-usuario" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Nombre, correo o rol" />
          </div>
          <div className="col-md-5 text-md-end text-secondary small">
            {usuarios.length} cuenta(s) registradas · {usuarios.filter((u) => u.activo).length} activa(s)
          </div>
        </div>
      </section>

      <section className="bloque p-0">
        {cargando ? (
          <div className="text-center p-5"><Spinner animation="border" /> <span className="ms-2">Cargando usuarios...</span></div>
        ) : filtrados.length === 0 ? (
          <div className="empty-state m-3">No se encontraron usuarios.</div>
        ) : (
          <div className="table-responsive">
            <Table hover className="mb-0 align-middle">
              <thead><tr><th>Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th><th className="text-end">Acciones</th></tr></thead>
              <tbody>
                {filtrados.map((u) => (
                  <tr key={u.id}>
                    <td className="fw-semibold">{u.nombre || 'Sin nombre'}{u.id === usuario.id && <span className="text-secondary small d-block">Tu cuenta</span>}</td>
                    <td>{u.correo}</td>
                    <td>{etiquetaRol(u.rol)}</td>
                    <td><Badge bg={u.activo ? 'success' : 'secondary'}>{u.activo ? 'Activo' : 'Inactivo'}</Badge></td>
                    <td><div className="d-flex justify-content-end gap-2">
                      <Button size="sm" variant="outline-primary" onClick={() => abrirEdicion(u)}>Editar</Button>
                      <Button size="sm" variant={u.activo ? 'outline-danger' : 'outline-success'} onClick={() => cambiarEstado(u)} disabled={u.id === usuario.id}>{u.activo ? 'Desactivar' : 'Activar'}</Button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </section>

      <Modal show={mostrar} onHide={cerrar} centered>
        <Form onSubmit={guardar}>
          <Modal.Header closeButton={!guardando}><Modal.Title>{editando ? 'Editar usuario' : 'Crear usuario'}</Modal.Title></Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Nombre completo</Form.Label>
              <Form.Control name="nombre" value={form.nombre} onChange={cambiar} required maxLength={120} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Correo electrónico</Form.Label>
              <Form.Control type="email" name="correo" value={form.correo} onChange={cambiar} required />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Rol del usuario</Form.Label>
              <Form.Select name="rol" value={form.rol} onChange={cambiar}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </Form.Select>
            </Form.Group>
            {!editando && <Form.Group>
              <Form.Label>Contraseña inicial</Form.Label>
              <Form.Control type="password" name="password" value={form.password} onChange={cambiar} minLength={8} autoComplete="new-password" required />
              <Form.Text>Debe tener al menos 8 caracteres. Entrégala al usuario por un canal seguro.</Form.Text>
            </Form.Group>}
            {editando && <Alert variant="info" className="mb-0">La edición no cambia la contraseña. El usuario puede recuperarla desde el flujo de recuperación cuando esté habilitado.</Alert>}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={cerrar} disabled={guardando}>Cancelar</Button>
            <Button type="submit" disabled={guardando}>{guardando ? 'Guardando...' : editando ? 'Guardar cambios' : 'Crear usuario'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </>
  )
}
