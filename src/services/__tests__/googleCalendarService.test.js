import { agendarCita, armarEventoEntrevista } from '../googleCalendarService.jsx'

const datos = { candidato: 'María Pérez', cargo: 'Técnico A', familiaCargo: 'Técnico A', evaluador: 'Luis Soto', fecha: '2026-11-25', hora: '10:30' }
const respuesta = (ok, cuerpo, status = ok ? 200 : 400) => ({ ok, status, json: async () => cuerpo })

describe('armarEventoEntrevista', () => {
  it('arma el evento con zona horaria de Chile y 1 hora de duración', () => {
    const e = armarEventoEntrevista(datos)
    expect(e.summary).toBe('Entrevista: María Pérez · Técnico A')
    expect(e.start).toEqual({ dateTime: '2026-11-25T10:30:00', timeZone: 'America/Santiago' })
    expect(e.end).toEqual({ dateTime: '2026-11-25T11:30:00', timeZone: 'America/Santiago' })
    expect(e.description).toContain('Evaluador: Luis Soto')
  })

  it('acepta la hora con segundos que entrega la base de datos', () => {
    expect(armarEventoEntrevista({ ...datos, hora: '09:05:00' }).start.dateTime).toBe('2026-11-25T09:05:00')
  })

  it('calcula bien el término cuando la entrevista cruza la medianoche', () => {
    const e = armarEventoEntrevista({ ...datos, fecha: '2026-12-31', hora: '23:30' })
    expect(e.end.dateTime).toBe('2027-01-01T00:30:00')
  })

  it('falla con un mensaje claro si falta la fecha o la hora', () => {
    expect(() => armarEventoEntrevista({ ...datos, hora: '' })).toThrow('fecha y hora')
    expect(() => armarEventoEntrevista({ ...datos, fecha: undefined })).toThrow('fecha y hora')
  })
})

describe('agendarCita', () => {
  beforeEach(() => { globalThis.fetch = vi.fn() })

  it('envía el evento al proxy de Vite sin exponer el token', async () => {
    fetch.mockResolvedValue(respuesta(true, { id: 'ev1', htmlLink: 'https://calendar.google.com/ev1' }))
    const r = await agendarCita(datos)
    expect(r).toEqual({ id: 'ev1', enlace: 'https://calendar.google.com/ev1' })
    const [url, opciones] = fetch.mock.calls[0]
    expect(url).toBe('/api/google-calendar/calendars/primary/events')
    expect(opciones.method).toBe('POST')
    expect(opciones.headers.Authorization).toBeUndefined()
    expect(JSON.parse(opciones.body).summary).toContain('María Pérez')
  })

  it('explica cómo renovar el token cuando Google responde 401', async () => {
    fetch.mockResolvedValue(respuesta(false, { error: { message: 'Invalid Credentials' } }, 401))
    await expect(agendarCita(datos)).rejects.toThrow('OAuth Playground')
  })

  it('informa el motivo cuando Google responde 403', async () => {
    fetch.mockResolvedValue(respuesta(false, { error: { message: 'API no habilitada' } }, 403))
    await expect(agendarCita(datos)).rejects.toThrow('API no habilitada')
  })

  it('no llama a Google si la entrevista no tiene fecha y hora', async () => {
    await expect(agendarCita({ ...datos, hora: '' })).rejects.toThrow('fecha y hora')
    expect(fetch).not.toHaveBeenCalled()
  })
})
