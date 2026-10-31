-- Insertamos usuario evaluador


INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Margarita Soto', 'msoto@aquachile.cl', '123456', 'Psicóloga Selección');
INSERT INTO usuarios (nombre, email, password, rol) 
VALUES ('Maximiliano Caceres', 'mcaceres@gmail.com', '123456', 'Psicologo de famosos');


-- Insertamos candidatos iniciales
INSERT INTO candidatos (rut, nombre, cargo_postulado, estado_evaluacion, fecha_solicitud) 
VALUES ('15.432.111-9', 'Juan Pérez', 'Operador de Planta', 'Apto', TO_DATE('2026-09-20', 'YYYY-MM-DD'));

INSERT INTO candidatos (rut, nombre, cargo_postulado, estado_evaluacion, fecha_solicitud) 
VALUES ('18.765.432-1', 'María González', 'Jefa de Turno', 'Pendiente', TO_DATE('2026-09-22', 'YYYY-MM-DD'));

INSERT INTO candidatos (rut, nombre, cargo_postulado, estado_evaluacion, fecha_solicitud) 
VALUES ('12.987.654-K', 'Carlos Silva', 'Técnico Mantenimiento', 'No Apto', TO_DATE('2026-09-25', 'YYYY-MM-DD'));


COMMIT;

SELECT * FROM USUARIOS;
SELECT * FROM CANDIDATOS;
SELECT * FROM EVALUACIONES;