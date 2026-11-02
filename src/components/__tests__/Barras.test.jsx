import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import Barras from '../Barras.jsx'

describe('Barras', () => {
  const filas = [
    { etiqueta: 'Técnico A', total: 4 },
    { etiqueta: 'Jefatura', total: 2 },
    { etiqueta: 'Profesional A', total: 1 },
  ]

  it('renderiza una barra por elemento con su etiqueta y su valor', () => {
    const { container } = render(<Barras filas={filas} />)
    const barras = container.querySelectorAll('.barra-fila')
    expect(barras).toHaveLength(3)
    expect(barras[0]).toHaveTextContent('Técnico A')
    expect(barras[0]).toHaveTextContent('4')
    expect(screen.getByText('Jefatura')).toBeInTheDocument()
  })

  it('dibuja el largo de cada barra en proporción al valor más alto', () => {
    const { container } = render(<Barras filas={filas} />)
    const largos = [...container.querySelectorAll('.barra-relleno')].map((b) => b.style.width)
    expect(largos).toEqual(['100%', '50%', '25%'])
  })

  it('muestra el mensaje vacío indicado cuando no hay datos', () => {
    render(<Barras filas={[]} vacio="No hay evaluaciones en curso." />)
    expect(screen.getByText('No hay evaluaciones en curso.')).toBeInTheDocument()
  })

  it('usa un mensaje vacío por defecto', () => {
    render(<Barras filas={[]} />)
    expect(screen.getByText('Aún no hay datos.')).toBeInTheDocument()
  })
})
