import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import EmptyState from '../EmptyState.jsx'

describe('EmptyState', () => {
  it('muestra el título y la indicación para el usuario', () => {
    render(<EmptyState titulo="No hay postulantes con esos criterios">Cambia los filtros.</EmptyState>)
    expect(screen.getByText('No hay postulantes con esos criterios')).toBeInTheDocument()
    expect(screen.getByText('Cambia los filtros.')).toBeInTheDocument()
  })
})
