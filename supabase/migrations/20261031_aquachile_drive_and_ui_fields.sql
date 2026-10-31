-- Ejecutar en Supabase SQL Editor DESPUÉS de las tablas y políticas iniciales.
-- Agrega columnas que la interfaz necesita y prepara referencias privadas de Drive.

alter table public.postulantes
  add column if not exists origen text,
  add column if not exists ubicacion text,
  add column if not exists referido boolean not null default false,
  add column if not exists cv_nombre_archivo text,
  add column if not exists drive_folder_id text,
  add column if not exists drive_folder_url text,
  add column if not exists formulario_pdf_drive_id text,
  add column if not exists formulario_pdf_url text,
  add column if not exists cv_drive_file_id text,
  add column if not exists cv_drive_url text;

alter table public.solicitudes
  add column if not exists hora_entrevista time,
  add column if not exists informe_recibido boolean not null default false;

alter table public.evaluaciones
  add column if not exists fecha_envio date;

-- Los usuarios internos autenticados necesitan leer el directorio de perfiles
-- para que Analista pueda asignar un Evaluador y mostrar los nombres involucrados.
drop policy if exists perfiles_select_activos_directorio on public.perfiles;
create policy perfiles_select_activos_directorio
on public.perfiles
for select
to authenticated
using (activo = true);

-- Auditoría automática de cambios de etapa.
create or replace function public.registrar_historial_estado()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.estado is distinct from new.estado then
    insert into public.historial_estados (
      solicitud_id, estado_anterior, estado_nuevo, usuario_id, fecha_cambio
    ) values (
      new.id, old.estado, new.estado, auth.uid(), now()
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_historial_estado_solicitud on public.solicitudes;
create trigger trg_historial_estado_solicitud
after update of estado on public.solicitudes
for each row
execute function public.registrar_historial_estado();

-- Índice útil para búsquedas por RUT.
create index if not exists idx_postulantes_rut on public.postulantes (rut);
create index if not exists idx_solicitudes_evaluador on public.solicitudes (evaluador_id);
create index if not exists idx_solicitudes_analista on public.solicitudes (analista_id);
