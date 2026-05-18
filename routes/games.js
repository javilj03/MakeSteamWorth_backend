const express = require('express');

const { SCRAPE_TOP_URL, SCRAPE_DETAIL_URL_TEMPLATE } = require('../config');
const {
  obtenerTop,
  obtenerJuegoPorNombre,
  obtenerJuegoTopPorAppId,
  upsertJuego,
} = require('../services/gameService');
const { scrapearDetalle } = require('../services/scraper');
const { findAppIdByName, getPlayerSummary, getUserStatsForGame } = require('../services/steamApi');
const { buildDetailUrl } = require('../utils/urlBuilder');

const router = express.Router();

router.get('/top', async (req, res) => {
  try {
    const datos = await obtenerTop(100);
    res.json({ total: datos.length, datos });
  } catch (error) {
    res.status(500).json({ error: 'No se pudo obtener el top' });
  }
});

router.get('/buscar', async (req, res) => {
  const nombre = (req.query.nombre || '').toString().trim();
  if (!nombre) {
    res.status(400).json({ error: 'El parametro nombre es obligatorio' });
    return;
  }

  try {
    const existente = await obtenerJuegoPorNombre(nombre);
    if (existente) {
      res.json({ origen: existente.fuente, datos: existente });
      return;
    }

    const appId = await findAppIdByName(nombre);
    if (!appId) {
      res.status(404).json({ error: 'No se encontro el ID del juego en Steam' });
      return;
    }

    const topPorId = await obtenerJuegoTopPorAppId(appId);
    if (topPorId) {
      res.json({ origen: 'top', datos: topPorId });
      return;
    }

    if (!SCRAPE_DETAIL_URL_TEMPLATE) {
      res.status(400).json({ error: 'SCRAPE_DETAIL_URL_TEMPLATE no configurada' });
      return;
    }

    const url = buildDetailUrl(SCRAPE_DETAIL_URL_TEMPLATE, appId);
    const detalle = await scrapearDetalle(url, appId);
    const guardado = await upsertJuego(detalle);
    res.json({ origen: 'detalle', datos: guardado });
  } catch (error) {
    console.error('Error en buscar', error);
    res.status(500).json({ error: 'No se pudo completar la busqueda' });
  }
});

router.post('/scraping/top', async (req, res) => {
  try {
    if (!SCRAPE_TOP_URL) {
      res.status(400).json({ error: 'SCRAPE_TOP_URL no configurada' });
      return;
    }

    const { ejecutarScrapingTop } = require('../services/scheduler');
    const resultado = await ejecutarScrapingTop(SCRAPE_TOP_URL);
    res.json({ actualizado: true, total: resultado.total });
  } catch (error) {
    console.error('Error en scraping/top', error);
    res.status(500).json({ error: 'No se pudo ejecutar el scraping' });
  }
});


router.get('/steam/usuario/:steamId', async (req, res) => {
  const steamId = req.params.steamId;
  if (!steamId) {
    res.status(400).json({ error: 'steamId es obligatorio' });
    return;
  }

  try {
    const perfil = await getPlayerSummary(steamId);
    if (!perfil) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.json({ datos: perfil });
  } catch (error) {
    console.error('Error en steam/usuario', error);
    res.status(500).json({ error: 'No se pudo obtener el usuario' });
  }
});

router.get('/steam/usuario/:steamId/juego/:appId', async (req, res) => {
  const steamId = req.params.steamId;
  const appId = req.params.appId;
  if (!steamId || !appId) {
    res.status(400).json({ error: 'steamId y appId son obligatorios' });
    return;
  }

  try {
    const stats = await getUserStatsForGame(steamId, appId);
    if (!stats) {
      res.status(404).json({ error: 'Sin estadisticas para el juego' });
      return;
    }

    res.json({ datos: stats });
  } catch (error) {
    console.error('Error en steam/usuario/juego', error);
    res.status(500).json({ error: 'No se pudo obtener estadisticas' });
  }
});

module.exports = router;
