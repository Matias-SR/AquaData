import { afterEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AlertaTemporal from '../AlertaTemporal.jsx'

describe('AlertaTemporal', () => {
  afterEach(() => vi.useRealTimers())

  it('muestra el mensaje con el color indicado', () => {
    render(<AlertaTemporal variant="danger" onClose={() => {}}>No fue posible guardar</AlertaTemporal>)
    expect(screen.getByRole('alert')).toHaveClass('alert-danger')
    expect(screen.getByText('No fue posible guardar')).toBeInTheDocument()
  })

  it('se cierra sola cuando termina la duración indicada', () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    render(<AlertaTemporal duracion={5000} onClose={onClose}>Postulante registrado</AlertaTemporal>)

    act(() => vi.advanceTimersByTime(4999))
    expect(onClose).not.toHaveBeenCalled()
    act(() => vi.advanceTimersByTime(1))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('no se cierra sola cuando no tiene duración, como los mensajes de error', () => {
    vi.useFakeTimers()
    const onClose = vi.fn()
    render(<AlertaTemporal variant="danger" onClose={onClose}>Error</AlertaTemporal>)
    act(() => vi.advanceTimersByTime(60000))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('se cierra al presionar la X', async () => {
    const onClose = vi.fn()
    render(<AlertaTemporal onClose={onClose}>Solicitud creada</AlertaTemporal>)
    await userEvent.click(screen.getByRole('button'))
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('hace scroll hasta la alerta cuando se le pide', () => {
    const scrollIntoView = vi.fn()
    window.HTMLElement.prototype.scrollIntoView = scrollIntoView
    render(<AlertaTemporal desplazar onClose={() => {}}>Informe enviado al analista.</AlertaTemporal>)
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth', block: 'center' })
    delete window.HTMLElement.prototype.scrollIntoView
  })
})
