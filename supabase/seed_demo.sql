-- Datos 100% ficticios para demostración. Ejecutar en Supabase → SQL Editor.
--
-- Carga 10 postulantes y 10 solicitudes repartidas en las 4 etapas del proceso.
-- Las fechas son relativas al día de ejecución (últimas 3 semanas), así el indicador
-- "días promedio hasta el informe" siempre muestra un valor distinto de 0.
--
-- Se puede ejecutar varias veces: al inicio borra SOLO los postulantes cuyo correo
-- termina en @ejemplo.cl, junto con sus solicitudes, evaluaciones e historial de etapas.
--
-- Requisito: deben existir en public.perfiles los usuarios
--   analista@aquadata.cl  (rol analista)
--   evaluador@aquadata.cl (rol evaluador)

begin;

-- 0. Verificar que existan los perfiles a los que se asignan las solicitudes.
do $$
begin
  if not exists (select 1 from public.perfiles where correo = 'analista@aquadata.cl') then
    raise exception 'No existe el perfil analista@aquadata.cl en public.perfiles.';
  end if;
  if not exists (select 1 from public.perfiles where correo = 'evaluador@aquadata.cl') then
    raise exception 'No existe el perfil evaluador@aquadata.cl en public.perfiles.';
  end if;
end;
$$;

-- 1. Limpiar solo los datos de demostración (@ejemplo.cl).
delete from public.evaluaciones
where solicitud_id in (
  select s.id
  from public.solicitudes s
  join public.postulantes p on p.id = s.postulante_id
  where lower(p.correo) like '%@ejemplo.cl'
);

-- El trigger de auditoría escribe aquí cuando se cambia la etapa durante la demo.
delete from public.historial_estados
where solicitud_id in (
  select s.id
  from public.solicitudes s
  join public.postulantes p on p.id = s.postulante_id
  where lower(p.correo) like '%@ejemplo.cl'
);

delete from public.solicitudes
where postulante_id in (
  select id from public.postulantes where lower(correo) like '%@ejemplo.cl'
);

delete from public.postulantes
where lower(correo) like '%@ejemplo.cl';

-- 2. Postulantes (RUT inventados con dígito verificador válido).
insert into public.postulantes
  (rut, nombre_completo, correo, telefono, cargo, familia_cargo, origen, ubicacion, referido, cv_nombre_archivo, created_at)
values
  ('15.234.871-1', 'Camila Rojas Fuentes',     'camila.rojas@ejemplo.cl',      '+56 9 6123 4501', 'Operaria de Planta',              'Operario Calificado', 'Externo', 'Planta Calbuco',        false, 'CV_Camila_Rojas.pdf',      (current_date - 20) + time '11:00'),
  ('16.789.234-5', 'Diego Muñoz Soto',         'diego.munoz@ejemplo.cl',       '+56 9 6123 4502', 'Técnico en Mantención Eléctrica', 'Técnico A',           'Interno', 'Planta Pargua',         false, 'CV_Diego_Munoz.pdf',       (current_date - 10) + time '11:00'),
  ('17.456.123-0', 'Valentina Castro Díaz',    'valentina.castro@ejemplo.cl',  '+56 9 6123 4503', 'Analista de Calidad',             'Profesional B C',     'Externo', 'Oficina Central',       true,  'CV_Valentina_Castro.pdf',  (current_date - 8)  + time '11:00'),
  ('18.923.456-2', 'Matías Herrera Lagos',     'matias.herrera@ejemplo.cl',    '+56 9 6123 4504', 'Supervisor de Turno',             'Supervisor B',        'Interno', 'Planta Magallanes',     false, 'CV_Matias_Herrera.pdf',    (current_date - 18) + time '11:00'),
  ('19.345.872-6', 'Fernanda Morales Vidal',   'fernanda.morales@ejemplo.cl',  '+56 9 6123 4505', 'Jefa de Producción',              'Jefatura',            'Externo', 'Planta Puerto Natales', false, 'CV_Fernanda_Morales.pdf',  (current_date - 21) + time '11:00'),
  ('20.123.987-7', 'Sebastián Pino Araya',     'sebastian.pino@ejemplo.cl',    '+56 9 6123 4506', 'Técnico en Acuicultura',          'Técnico B C',         'Externo', 'Piscicultura Sur',      false, 'CV_Sebastian_Pino.pdf',    (current_date - 6)  + time '11:00'),
  ('13.987.654-7', 'Javiera Navarro Reyes',    'javiera.navarro@ejemplo.cl',   '+56 9 6123 4507', 'Ingeniera de Procesos',           'Profesional A',       'Interno', 'Oficina Central',       false, 'CV_Javiera_Navarro.pdf',   (current_date - 14) + time '11:00'),
  ('14.567.321-6', 'Tomás Vergara Salinas',    'tomas.vergara@ejemplo.cl',     '+56 9 6123 4508', 'Operador de Grúa Horquilla',      'Operario Calificado', 'Externo', 'Planta Magallanes',     true,  'CV_Tomas_Vergara.pdf',     (current_date - 4)  + time '11:00'),
  ('21.034.567-1', 'Antonia Fuentealba Ríos',  'antonia.fuentealba@ejemplo.cl','+56 9 6123 4509', 'Supervisora de Calidad',          'Supervisor B',        'Externo', 'Planta Calbuco',        false, 'CV_Antonia_Fuentealba.pdf',(current_date - 12) + time '11:00'),
  ('11.876.543-5', 'Benjamín Carrasco Molina', 'benjamin.carrasco@ejemplo.cl', '+56 9 6123 4510', 'Técnico en Mantención Mecánica',  'Técnico A',           'Interno', 'Piscicultura Sur',      false, 'CV_Benjamin_Carrasco.pdf', (current_date - 2)  + time '11:00');

-- 3. Solicitudes: 3 Evaluación recibida, 2 Entrevista agendada, 2 Entrevista realizada, 3 Informe enviado.
--    El analista y el evaluador se obtienen por correo desde public.perfiles.
insert into public.solicitudes
  (postulante_id, cargo, familia_cargo, analista_id, evaluador_id, estado, observaciones,
   fecha_entrevista, hora_entrevista, informe_recibido, created_at)
select
  p.id,
  p.cargo,
  p.familia_cargo,
  (select id from public.perfiles where correo = 'analista@aquadata.cl'),
  (select id from public.perfiles where correo = 'evaluador@aquadata.cl'),
  d.estado,
  d.observaciones,
  d.fecha_entrevista,
  d.hora_entrevista,
  d.informe_recibido,
  d.creada
from (values
  -- Informe enviado
  ('fernanda.morales@ejemplo.cl',   'Informe enviado',      'Reemplazo por traslado de la jefatura actual.',      current_date - 14, time '10:00', true,  (current_date - 20) + time '09:15'),
  ('camila.rojas@ejemplo.cl',       'Informe enviado',      'Proceso masivo de temporada.',                       current_date - 16, time '09:30', true,  (current_date - 19) + time '09:40'),
  ('matias.herrera@ejemplo.cl',     'Informe enviado',      'Postulación interna por ascenso.',                   current_date - 12, time '11:30', false, (current_date - 17) + time '10:05'),
  -- Entrevista realizada
  ('javiera.navarro@ejemplo.cl',    'Entrevista realizada', 'Cargo nuevo en el área de mejora continua.',         current_date - 4,  time '15:00', false, (current_date - 13) + time '08:50'),
  ('antonia.fuentealba@ejemplo.cl', 'Entrevista realizada', null,                                                 current_date - 2,  time '12:00', false, (current_date - 11) + time '14:20'),
  -- Entrevista agendada
  ('diego.munoz@ejemplo.cl',        'Entrevista agendada',  'Coordinar entrevista fuera del horario de turno.',   current_date + 2,  time '10:00', false, (current_date - 9)  + time '10:30'),
  ('valentina.castro@ejemplo.cl',   'Entrevista agendada',  'Postulante referida por el área de calidad.',        current_date + 3,  time '15:30', false, (current_date - 7)  + time '16:10'),
  -- Evaluación recibida
  ('sebastian.pino@ejemplo.cl',     'Evaluación recibida',  null,                                                 null,              null,          false, (current_date - 5)  + time '09:00'),
  ('tomas.vergara@ejemplo.cl',      'Evaluación recibida',  'Requiere licencia de operador vigente.',             null,              null,          false, (current_date - 3)  + time '11:45'),
  ('benjamin.carrasco@ejemplo.cl',  'Evaluación recibida',  'Postulación interna por movilidad.',                 null,              null,          false, (current_date - 1)  + time '08:30')
) as d (correo, estado, observaciones, fecha_entrevista, hora_entrevista, informe_recibido, creada)
join public.postulantes p on p.correo = d.correo;

-- 4. Informes completos por competencias para las 3 solicitudes con "Informe enviado".
--    Las competencias coinciden con COMPETENCIAS_POR_FAMILIA de src/utils/estados.js.
insert into public.evaluaciones
  (solicitud_id, evaluador_id, fecha_evaluacion, resultado, conclusion, observaciones,
   competencias, informe_enviado, fecha_envio, informe_url)
select
  s.id,
  s.evaluador_id,
  d.fecha_evaluacion,
  d.resultado,
  d.conclusion,
  d.observaciones,
  d.competencias,
  true,
  d.fecha_envio,
  null
from (values
  -- Operario Calificado → Recomendado (5 días hasta el informe)
  ('camila.rojas@ejemplo.cl',
   current_date - 14, current_date - 14,
   'Recomendado',
   'La postulante presenta un perfil ajustado a las exigencias del cargo. Muestra compromiso con la seguridad y buena disposición al trabajo en equipo. Se recomienda su contratación.',
   'Disponibilidad inmediata para turnos rotativos.',
   '[
     {"nombre": "Orientación a la seguridad", "criterio": "Identifica riesgos del puesto y conoce el uso de EPP.", "fortalezas": "Relata con detalle prácticas seguras de experiencias anteriores.", "oportunidades": "Profundizar en procedimientos específicos de planta de proceso."},
     {"nombre": "Trabajo en equipo", "criterio": "Colabora con compañeros para cumplir metas del turno.", "fortalezas": "Ofrece ayuda de forma espontánea y comparte información.", "oportunidades": "Expresar con mayor claridad sus propias necesidades."},
     {"nombre": "Cumplimiento de procedimientos", "criterio": "Sigue instrucciones y estándares de calidad.", "fortalezas": "Valora el orden y respeta los registros de producción.", "oportunidades": "Familiarizarse con la documentación HACCP de la planta."},
     {"nombre": "Adaptabilidad al cambio", "criterio": "Se ajusta a cambios de turno y de línea.", "fortalezas": "Ha trabajado en distintos puestos de forma rotativa.", "oportunidades": "Manejar la presión en peaks de temporada."}
   ]'::jsonb),
  -- Supervisor B → Recomendado con observaciones (8 días hasta el informe)
  ('matias.herrera@ejemplo.cl',
   current_date - 10, current_date - 9,
   'Recomendado con observaciones',
   'El postulante cuenta con experiencia técnica y conocimiento del proceso. Se recomienda con observaciones: debe fortalecer la gestión de conflictos y la comunicación con su equipo.',
   'Se sugiere acompañamiento de jefatura durante los primeros tres meses.',
   '[
     {"nombre": "Liderazgo de equipos", "criterio": "Guía al equipo hacia metas de producción.", "fortalezas": "Es reconocido por sus pares como referente técnico.", "oportunidades": "Delegar tareas en lugar de resolverlas personalmente."},
     {"nombre": "Orientación a la seguridad", "criterio": "Promueve conductas seguras en su equipo.", "fortalezas": "Detiene la operación ante condiciones inseguras.", "oportunidades": "Registrar de forma sistemática los incidentes menores."},
     {"nombre": "Comunicación", "criterio": "Transmite instrucciones de forma clara y oportuna.", "fortalezas": "Explica bien los aspectos técnicos del proceso.", "oportunidades": "Mejorar la retroalimentación a su equipo y escuchar activamente."},
     {"nombre": "Gestión de conflictos", "criterio": "Aborda desacuerdos entre trabajadores del turno.", "fortalezas": "Mantiene la calma ante situaciones tensas.", "oportunidades": "Intervenir antes y no postergar conversaciones difíciles."}
   ]'::jsonb),
  -- Jefatura → No recomendado (12 días hasta el informe)
  ('fernanda.morales@ejemplo.cl',
   current_date - 9, current_date - 8,
   'No recomendado',
   'La postulante tiene experiencia en producción, pero no evidencia las competencias de liderazgo y toma de decisiones que exige una jefatura en este momento. No se recomienda para el cargo.',
   'Podría evaluarse para un cargo de supervisión en un proceso futuro.',
   '[
     {"nombre": "Liderazgo de equipos", "criterio": "Conduce equipos amplios y desarrolla a sus supervisores.", "fortalezas": "Tiene buena relación con trabajadores operativos.", "oportunidades": "Asumir un rol de conducción más activo frente a su equipo."},
     {"nombre": "Toma de decisiones", "criterio": "Decide con información incompleta y asume responsabilidad.", "fortalezas": "Analiza los antecedentes con cuidado antes de actuar.", "oportunidades": "Reducir la dependencia de validación de terceros para decidir."},
     {"nombre": "Gestión de conflictos", "criterio": "Resuelve conflictos entre áreas y turnos.", "fortalezas": "Muestra empatía con las distintas partes.", "oportunidades": "Establecer acuerdos concretos y hacerles seguimiento."},
     {"nombre": "Visión estratégica", "criterio": "Vincula la operación diaria con objetivos de la compañía.", "fortalezas": "Conoce bien los indicadores de su línea.", "oportunidades": "Proyectar mejoras de mediano plazo más allá de la contingencia."}
   ]'::jsonb)
) as d (correo, fecha_evaluacion, fecha_envio, resultado, conclusion, observaciones, competencias)
join public.postulantes p on p.correo = d.correo
join public.solicitudes s on s.postulante_id = p.id and s.estado = 'Informe enviado';

commit;

-- Verificación rápida (opcional):
-- select s.estado, count(*) from public.solicitudes s
-- join public.postulantes p on p.id = s.postulante_id
-- where p.correo like '%@ejemplo.cl' group by s.estado;
