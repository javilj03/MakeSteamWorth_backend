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
    `insert into juegos (
       steam_app_id,
       nombre,
       rango,
       jugadores_actuales,
       pico_24h,
       pico_historico,
       pico_30_dias,
       horas_jugadas_30_dias,
       precio_centimos,
       precio_moneda,
       resenas_total,
       resenas_positivas,
       resenas_negativas,
       resenas_score,
       puntuacion_compra,
       fuente,
       actualizado_en
     )
     values (
       $1,
       $2,
       $3,
       $4,
       $5,
       $6,
       $7,
       $8,
       $9,
       $10,
       $11,
       $12,
       $13,
       $14,
       $15,
       $16,
       now()
     )
     on conflict (steam_app_id, fuente)
     do update set
       nombre = excluded.nombre,
       rango = excluded.rango,
       jugadores_actuales = excluded.jugadores_actuales,
       pico_24h = excluded.pico_24h,
       pico_historico = excluded.pico_historico,
       pico_30_dias = excluded.pico_30_dias,
       horas_jugadas_30_dias = excluded.horas_jugadas_30_dias,
       precio_centimos = coalesce(excluded.precio_centimos, juegos.precio_centimos),
       precio_moneda = coalesce(excluded.precio_moneda, juegos.precio_moneda),
       resenas_total = coalesce(excluded.resenas_total, juegos.resenas_total),
       resenas_positivas = coalesce(excluded.resenas_positivas, juegos.resenas_positivas),
       resenas_negativas = coalesce(excluded.resenas_negativas, juegos.resenas_negativas),
       resenas_score = coalesce(excluded.resenas_score, juegos.resenas_score),
       puntuacion_compra = coalesce(excluded.puntuacion_compra, juegos.puntuacion_compra),
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
      juego.precio_centimos,
      juego.precio_moneda,
      juego.resenas_total,
      juego.resenas_positivas,
      juego.resenas_negativas,
      juego.resenas_score,
      juego.puntuacion_compra,
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
