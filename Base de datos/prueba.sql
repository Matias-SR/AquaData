-- Datos 100% ficticios. Esquema histórico de la versión Oracle; la versión actual usa Supabase (ver supabase/migrations).

-- Insertamos usuario evaluador


INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Andrea Ejemplo', 'evaluador1@ejemplo.cl', 'hash_ficticio_no_usar', 'Psicóloga Selección');
INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Pablo Ejemplo', 'evaluador2@ejemplo.cl', 'hash_ficticio_no_usar', 'Psicólogo Laboral');


-- Insertamos candidatos iniciales
INSERT INTO candidatos (rut, nombre, cargo_postulado, estado_evaluacion, fecha_solicitud) 
VALUES ('11.111.111-1', 'Juan Pérez', 'Operador de Planta', 'Apto', TO_DATE('2026-09-20', 'YYYY-MM-DD'));

INSERT INTO candidatos (rut, nombre, cargo_postulado, estado_evaluacion, fecha_solicitud) 
VALUES ('22.222.222-2', 'María González', 'Jefa de Turno', 'Pendiente', TO_DATE('2026-09-22', 'YYYY-MM-DD'));

INSERT INTO candidatos (rut, nombre, cargo_postulado, estado_evaluacion, fecha_solicitud) 
VALUES ('33.333.333-3', 'Carlos Silva', 'Técnico Mantenimiento', 'No Apto', TO_DATE('2026-09-25', 'YYYY-MM-DD'));


COMMIT;

SELECT * FROM USUARIOS;
SELECT * FROM CANDIDATOS;
SELECT * FROM EVALUACIONES;