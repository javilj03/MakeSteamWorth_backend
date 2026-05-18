create table if not exists juegos (
  id serial primary key,
  steam_app_id integer,
  nombre text not null,
  rango integer,
  jugadores_actuales integer,
  pico_24h integer,
  pico_historico integer,
  pico_30_dias integer,
  horas_jugadas_30_dias integer,
  fuente text not null,
  actualizado_en timestamptz not null default now(),
  unique (steam_app_id, fuente)
);

create index if not exists idx_juegos_nombre on juegos (nombre);
create index if not exists idx_juegos_actualizado on juegos (actualizado_en);

alter table juegos add column if not exists pico_30_dias integer;
alter table juegos add column if not exists horas_jugadas_30_dias integer;
