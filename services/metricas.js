const { STEAM_API_KEY } = require('../config');
const { getStoreAppDetails, getStoreAppReviews, getSteamPlayerSummary } = require('./steamApi');
const { calcularPuntuacionCompra } = require('../utils/parsers');

async function enriquecerJuegoConMetrica(juego) {
  if (!juego || !juego.steam_app_id) {
    return { ...juego, puntuacion_compra: null };
  }

  let detalle = null;
  let reviews = null;

  try {
    detalle = await getStoreAppDetails(juego.steam_app_id);
  } catch (error) {
    console.warn('No se pudo obtener el precio desde Steam Store', error.message);
  }

  try {
    reviews = await getStoreAppReviews(juego.steam_app_id);
  } catch (error) {
    console.warn('No se pudieron obtener las reseñas desde Steam Store', error.message);
  }

  const precioCentimos = detalle ? detalle.precio_centimos : null;
  const precioMoneda = detalle ? detalle.precio_moneda : null;
  const resenasTotal = reviews ? reviews.total_reviews : null;
  const resenasPositivas = reviews ? reviews.total_positive : null;
  const resenasNegativas = reviews ? reviews.total_negative : null;
  const resenasScore = reviews ? reviews.review_score : null;

  let jugadoresApi = null;
  if (STEAM_API_KEY) {
    try {
      jugadoresApi = await getSteamPlayerSummary(juego.steam_app_id);
    } catch (error) {
      console.warn('No se pudo obtener jugadores desde Steam API', error.message);
      jugadoresApi = null;
    }
  }

  const jugadoresActuales = jugadoresApi ?? juego.jugadores_actuales ?? null;

  const puntuacionCompra = calcularPuntuacionCompra({
    precioCentimos,
    jugadoresActuales,
    resenasPositivas,
    resenasNegativas,
    resenasScore,
  });

  return {
    ...juego,
    precio_centimos: precioCentimos,
    precio_moneda: precioMoneda,
    jugadores_actuales: jugadoresApi ?? juego.jugadores_actuales ?? null,
    resenas_total: resenasTotal,
    resenas_positivas: resenasPositivas,
    resenas_negativas: resenasNegativas,
    resenas_score: resenasScore,
    puntuacion_compra: puntuacionCompra,
  };
}

module.exports = {
  enriquecerJuegoConMetrica,
};
