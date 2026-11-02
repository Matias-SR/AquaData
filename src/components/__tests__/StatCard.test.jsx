import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import StatCard from '../StatCard.jsx'

describe('StatCard', () => {
  it('muestra el valor y la etiqueta del indicador recibidos por props', () => {
    render(<StatCard titulo="Informes enviados" valor={12} />)
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Informes enviados')).toBeInTheDocument()
  })

  it('muestra el detalle solo cuando se entrega', () => {
    const { container, rerender } = render(<StatCard titulo="En curso" valor={3} />)
    expect(container.querySelector('.stat-detalle')).toBeNull()
    rerender(<StatCard titulo="En curso" valor={3} detalle="Desde la solicitud al envío" />)
    expect(screen.getByText('Desde la solicitud al envío')).toBeInTheDocument()
  })
})
