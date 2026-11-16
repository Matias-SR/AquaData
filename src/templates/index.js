// Plantillas HTML de los correos. Cada función recibe datos y devuelve { subject, html }.

const escapar = (valor) =>
  String(valor ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

const layout = (titulo, cuerpo) => `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;border:1px solid #dde3ea;border-radius:8px;overflow:hidden">
  <div style="background:#0b4f6c;color:#ffffff;padding:16px 24px">
    <h1 style="margin:0;font-size:20px">AquaData</h1>
  </div>
  <div style="padding:24px;color:#1f2933">
    <h2 style="margin-top:0;font-size:18px">${escapar(titulo)}</h2>
    ${cuerpo}
  </div>
  <div style="background:#f4f6f8;color:#6b7785;padding:12px 24px;font-size:12px">
    Mensaje automático de AquaData · No respondas a este correo.
  </div>
</div>`

// Aviso al analista cuando el evaluador envía el informe de una solicitud.
export function plantillaInformeEnviado({ analista, candidato, cargo, evaluador, fechaEnvio }) {
  return {
    subject: `Informe listo: ${candidato} · ${cargo}`,
    html: layout(
      'Tienes un informe listo para revisar',
      `<p>Hola ${escapar(analista)},</p>
       <p>El evaluador <strong>${escapar(evaluador)}</strong> envió el informe de
       <strong>${escapar(candidato)}</strong> para el cargo <strong>${escapar(cargo)}</strong>
       el ${escapar(fechaEnvio)}.</p>
       <p>Adjuntamos el informe completo en formato PDF. También puedes revisarlo en AquaData y marcarlo como recibido.</p>`,
    ),
  }
}
