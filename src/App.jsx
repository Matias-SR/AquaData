import { Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import AppLayout from './components/AppLayout.jsx'
import {
  Login,
  Inicio,
  Candidatos,
  CandidatoForm,
  Solicitudes,
  SolicitudForm,
  SolicitudDetalle,
  Usuarios,
  NoEncontrada,
} from './pages/index.js'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Inicio />} />
        <Route
          path="candidatos"
          element={
            <ProtectedRoute permiso="candidatos:ver">
              <Candidatos />
            </ProtectedRoute>
          }
        />
        <Route
          path="candidatos/nuevo"
          element={
            <ProtectedRoute permiso="candidatos:escribir">
              <CandidatoForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="candidatos/:id/editar"
          element={
            <ProtectedRoute permiso="candidatos:escribir">
              <CandidatoForm />
            </ProtectedRoute>
          }
        />
        <Route path="solicitudes" element={<Solicitudes />} />
        <Route
          path="solicitudes/nueva"
          element={
            <ProtectedRoute permiso="solicitudes:crear">
              <SolicitudForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="solicitudes/:id/editar"
          element={
            <ProtectedRoute permiso="solicitudes:editar">
              <SolicitudForm />
            </ProtectedRoute>
          }
        />
        <Route path="solicitudes/:id" element={<SolicitudDetalle />} />
        <Route
          path="usuarios"
          element={
            <ProtectedRoute permiso="usuarios:administrar">
              <Usuarios />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NoEncontrada />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
