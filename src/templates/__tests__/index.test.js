import { plantillaInformeEnviado } from '../index.js'

const datos = { analista: 'Ana', candidato: 'Juan Pérez', cargo: 'Técnico A', evaluador: 'Luis', fechaEnvio: '16-11-2026' }

describe('plantillaInformeEnviado', () => {
  it('arma el asunto y el cuerpo con los datos de la solicitud', () => {
    const { subject, html } = plantillaInformeEnviado(datos)
    expect(subject).toBe('Informe listo: Juan Pérez · Técnico A')
    expect(html).toContain('Ana')
    expect(html).toContain('Luis')
    expect(html).toContain('16-11-2026')
  })

  it('escapa HTML en los datos para evitar inyección', () => {
    const { html } = plantillaInformeEnviado({ ...datos, candidato: '<script>alert(1)</script>' })
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
})
