import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Alert, Button, Form, Spinner } from 'react-bootstrap'
import { useAuth } from '../context/AuthContext.jsx'
import Logo from '../components/Logo.jsx'

export default function Login() {
  const { usuario, cargando, login } = useAuth()
  const navigate = useNavigate()
  const [correo, setCorreo] = useState('')
  const [clave, setClave] = useState('')
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)

  if (cargando) return <div className="login-pagina"><Spinner animation="border" /></div>
  if (usuario) return <Navigate to="/" replace />

  const enviar = async (ev) => {
    ev.preventDefault()
    const e = {}
    if (!correo.trim()) e.correo = 'Ingresa tu correo.'
    if (!clave) e.clave = 'Ingresa tu contraseña.'
    setErrores(e)
    setErrorGeneral('')
    if (Object.keys(e).length) return

    setEnviando(true)
    try {
      await login(correo, clave)
      navigate('/')
    } catch (error) {
      setErrorGeneral(error.message || 'No fue posible iniciar sesión. Revisa tus credenciales y tu perfil en Supabase.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="login-pagina">
      <div className="login-panel">
        <h1 className="visually-hidden">AquaChile · Evaluaciones psicolaborales</h1>
        <div className="login-marca"><Logo alto={92} tono="oscuro" /></div>
        <p className="text-secondary mb-4">Gestión de evaluaciones psicolaborales</p>
        {errorGeneral && <Alert variant="danger">{errorGeneral}</Alert>}
        <Form noValidate onSubmit={enviar}>
          <Form.Group className="mb-3" controlId="correo">
            <Form.Label>Correo</Form.Label>
            <Form.Control type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} isInvalid={!!errores.correo} autoComplete="username" />
            <Form.Control.Feedback type="invalid">{errores.correo}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className="mb-3" controlId="clave">
            <Form.Label>Contraseña</Form.Label>
            <Form.Control type="password" value={clave} onChange={(e) => setClave(e.target.value)} isInvalid={!!errores.clave} autoComplete="current-password" />
            <Form.Control.Feedback type="invalid">{errores.clave}</Form.Control.Feedback>
          </Form.Group>
          <Button type="submit" className="w-100" disabled={enviando}>
            {enviando ? <><Spinner size="sm" className="me-2" />Ingresando...</> : 'Ingresar'}
          </Button>
        </Form>
        <p className="small text-secondary mt-4 mb-0">
          Acceso exclusivo para usuarios habilitados por Jefatura.
        </p>
      </div>
    </div>
  )
}
