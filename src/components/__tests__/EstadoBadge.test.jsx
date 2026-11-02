import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import EstadoBadge from '../EstadoBadge.jsx'
import { ESTADO_CLASE } from '../../utils/estados.js'

describe('EstadoBadge', () => {
  it.each(Object.entries(ESTADO_CLASE))('muestra la etapa "%s" con la clase %s', (estado, clase) => {
    render(<EstadoBadge estado={estado} />)
    expect(screen.getByText(estado)).toHaveClass('estado-badge', clase)
  })

  it('muestra una etapa desconocida sin clase de color', () => {
    render(<EstadoBadge estado="Etapa nueva" />)
    expect(screen.getByText('Etapa nueva').className.trim()).toBe('estado-badge')
  })
})
