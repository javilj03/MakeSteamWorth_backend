const { TOP_CHARTS_INTERVAL_MS } = require('../config');
const { scrapearTopCharts } = require('./scraper');
const { limpiarTop, upsertJuego } = require('./gameService');
const { enriquecerJuegoConMetrica } = require('./metricas');

let intervalo = null;
let scrapingEnCurso = false;

async function ejecutarScrapingTop(url) {
  if (scrapingEnCurso) {
    return { total: 0, omitido: true };
  }

  scrapingEnCurso = true;
  try {
    const datos = await scrapearTopCharts(url);
    if (!Array.isArray(datos) || datos.length === 0) {
      return { total: 0 };
    }

    await limpiarTop();
    let guardados = 0;
    for (const juego of datos) {
      const enriquecido = await enriquecerJuegoConMetrica(juego);
      await upsertJuego(enriquecido);
      guardados += 1;
    }

    return { total: guardados };
  } finally {
    scrapingEnCurso = false;
  }
}

function iniciarScrapingProgramado(url) {
  if (!url) {
    return null;
  }

  if (intervalo) {
    clearInterval(intervalo);
  }

  intervalo = setInterval(() => {
    ejecutarScrapingTop(url).catch(() => {
      return null;
    });
  }, TOP_CHARTS_INTERVAL_MS);

  ejecutarScrapingTop(url).catch(() => {
    return null;
  });

  return intervalo;
}

function detenerScrapingProgramado() {
  if (intervalo) {
    clearInterval(intervalo);
    intervalo = null;
  }
}

module.exports = {
  ejecutarScrapingTop,
  iniciarScrapingProgramado,
  detenerScrapingProgramado,
};
