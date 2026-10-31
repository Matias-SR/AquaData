-- SCRIPT
DROP TABLE CANDIDATOS; 


--  Tabla de Usuarios (Reclutadores / Psicólogos)
CREATE TABLE usuarios (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR2(50) NOT NULL,
    email VARCHAR2(50) NOT NULL UNIQUE,
    password VARCHAR2(20) NOT NULL,
    rol VARCHAR2(50) DEFAULT 'Evaluador',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Candidatos
CREATE TABLE candidatos (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    rut VARCHAR2(12) NOT NULL UNIQUE,
    nombre VARCHAR2(50) NOT NULL,
    cargo_postulado VARCHAR2(50) NOT NULL,
    estado_evaluacion VARCHAR2(20) DEFAULT 'Pendiente' CHECK (estado_evaluacion IN ('Apto', 'Pendiente', 'No Apto')),
    fecha_solicitud DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de Evaluaciones Psicolaborales
CREATE TABLE evaluaciones (
    id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    candidato_id NUMBER NOT NULL,
    evaluador_id NUMBER NOT NULL,
    observaciones CLOB,
    fortalezas CLOB,
    aspectos_mejora CLOB,
    resultado_final VARCHAR2(20) DEFAULT 'Pendiente' CHECK (resultado_final IN ('Apto', 'Pendiente', 'No Apto')),
    fecha_evaluacion DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_evaluacion_candidato FOREIGN KEY (candidato_id) REFERENCES candidatos(id) ON DELETE CASCADE,
    CONSTRAINT fk_evaluacion_evaluador FOREIGN KEY (evaluador_id) REFERENCES usuarios(id)
);