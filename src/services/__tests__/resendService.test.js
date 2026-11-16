import { enviarCorreo, notificarInformeEnviado } from '../resendService.js'

// Se guardan los argumentos en un arreglo simple: el SDK se crea al importar el servicio, antes de cada prueba.
const { enviar, creaciones } = vi.hoisted(() => ({ enviar: vi.fn(), creaciones: [] }))

vi.mock('resend', () => ({
  Resend: class {
    constructor(...args) { creaciones.push(args); this.emails = { send: enviar } }
  },
}))

describe('resendService', () => {
  beforeEach(() => enviar.mockReset())

  it('crea el SDK apuntando al proxy de Vite y con una clave de relleno', () => {
    expect(creaciones[0]).toEqual(['re_proxy', { baseUrl: '/api/resend' }])
  })

  it('envía el correo con el SDK y devuelve el id', async () => {
    enviar.mockResolvedValue({ data: { id: 'abc' }, error: null })
    const r = await enviarCorreo({ to: 'a@b.cl', subject: 'Hola', html: '<p>x</p>' })
    expect(r).toEqual({ id: 'abc' })
    expect(enviar).toHaveBeenCalledWith(expect.objectContaining({ to: ['a@b.cl'], subject: 'Hola', html: '<p>x</p>' }))
  })

  it('lanza el mensaje de Resend cuando el SDK devuelve un error', async () => {
    enviar.mockResolvedValue({ data: null, error: { message: 'Dominio no verificado' } })
    await expect(enviarCorreo({ to: 'a@b.cl', subject: 's', html: 'h' })).rejects.toThrow('Dominio no verificado')
  })

  it('falla si no hay destinatario', async () => {
    await expect(enviarCorreo({ subject: 's', html: 'h' })).rejects.toThrow('destino')
    expect(enviar).not.toHaveBeenCalled()
  })

  it('notificarInformeEnviado usa la plantilla del informe', async () => {
    enviar.mockResolvedValue({ data: { id: 'x' }, error: null })
    await notificarInformeEnviado({ analista: 'Ana', correoAnalista: 'a@b.cl', candidato: 'Juan', cargo: 'Técnico A', evaluador: 'Luis', fechaEnvio: 'hoy' })
    expect(enviar.mock.calls[0][0].subject).toBe('Informe listo: Juan · Técnico A')
  })

  it('adjunta el PDF del informe al correo', async () => {
    enviar.mockResolvedValue({ data: { id: 'x' }, error: null })
    const adjunto = { filename: 'Informe_Juan_Tecnico_A.pdf', content: new ArrayBuffer(8), contentType: 'application/pdf' }
    await notificarInformeEnviado({ adjunto, analista: 'Ana', correoAnalista: 'a@b.cl', candidato: 'Juan', cargo: 'Técnico A', evaluador: 'Luis', fechaEnvio: 'hoy' })
    expect(enviar.mock.calls[0][0].attachments).toEqual([adjunto])
  })

  it('no envía adjuntos si no se entrega un PDF', async () => {
    enviar.mockResolvedValue({ data: { id: 'x' }, error: null })
    await notificarInformeEnviado({ analista: 'Ana', correoAnalista: 'a@b.cl', candidato: 'Juan', cargo: 'Técnico A', evaluador: 'Luis', fechaEnvio: 'hoy' })
    expect(enviar.mock.calls[0][0].attachments).toBeUndefined()
  })
})
