const { query } = require('../db');

async function obtenerJuegoPorNombre(nombre) {
  const result = await query(
    'select * from juegos where lower(nombre) = lower($1) order by actualizado_en desc limit 1',
    [nombre]
  );

  return result.rows[0] || null;
}

async function obtenerJuegoTopPorAppId(appId) {
  const result = await query(
    'select * from juegos where steam_app_id = $1 and fuente = $2 limit 1',
    [appId, 'top']
  );

  return result.rows[0] || null;
}

async function obtenerTop(limit = 100) {
  const result = await query(
    'select * from juegos where fuente = $1 order by rango asc nulls last limit $2',
    ['top', limit]
  );

  return result.rows;
}


async function upsertJuego(juego) {
  const result = await query(
    `insert into juegos (steam_app_id, nombre, rango, jugadores_actuales, pico_24h, pico_historico, pico_30_dias, horas_jugadas_30_dias, fuente, actualizado_en)
     values ($1, $2, $3, $4, $5, $6, $7, $8, $9, now())
     on conflict (steam_app_id, fuente)
     do update set
       nombre = excluded.nombre,
       rango = excluded.rango,
       jugadores_actuales = excluded.jugadores_actuales,
       pico_24h = excluded.pico_24h,
       pico_historico = excluded.pico_historico,
        pico_30_dias = excluded.pico_30_dias,
        horas_jugadas_30_dias = excluded.horas_jugadas_30_dias,
       actualizado_en = now()
      returning *`,
    [
      juego.steam_app_id,
      juego.nombre,
      juego.rango,
      juego.jugadores_actuales,
      juego.pico_24h,
      juego.pico_historico,
      juego.pico_30_dias,
      juego.horas_jugadas_30_dias,
      juego.fuente,
    ]
  );

  return result.rows[0];
}

async function limpiarTop() {
  await query('delete from juegos where fuente = $1', ['top']);
}

module.exports = {
  obtenerJuegoPorNombre,
  obtenerJuegoTopPorAppId,
  obtenerTop,
  upsertJuego,
  limpiarTop,
};
