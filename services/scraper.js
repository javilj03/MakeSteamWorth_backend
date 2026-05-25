const { normalizarNumero } = require('../utils/parsers');
const { withPage, navegarConCloudflare } = require('./browser');

function parsearEnteroSeguro(valor) {
  if (typeof valor === 'number') {
    return Number.isFinite(valor) ? valor : null;
  }
  return normalizarNumero(valor);
}

function esperar(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function esperarSelector(page, selector, status) {
  try {
    await page.waitForSelector(selector);
  } catch (error) {
    const contenido = await page.content().catch(() => '');
    const snippet = contenido ? ` ${contenido.slice(0, 200)}` : '';
    const estado = typeof status === 'number' ? status : 'sin respuesta';
    throw new Error(`Respuesta HTTP invalida: ${estado}.${snippet}`);
  }
}

async function scrapearTopCharts(url) {
  return withPage(url, async (page) => {
    const response = await navegarConCloudflare(page, url);
    const status = response ? response.status() : null;
    await esperar(1500);
    await esperarSelector(page, 'table#top-games tbody tr', status);

    const datos = await page.$$eval('table#top-games tbody tr', (rows) =>
      rows.map((row) => {
        const columnas = Array.from(row.querySelectorAll('td'));
        const texto = (node) => (node ? node.textContent.trim() : '');
        const enlace = row.querySelector('a[href*="/app/"]');
        const href = enlace ? enlace.getAttribute('href') : '';
        const match = href ? href.match(/\/app\/(\d+)/) : null;
        const dataAppId = row.getAttribute('data-appid');
        const nombre = texto(columnas[1]) || (enlace ? enlace.textContent.trim() : '');

        return {
          steam_app_id: dataAppId ? Number(dataAppId) : match ? Number(match[1]) : null,
          rango: texto(columnas[0]),
          nombre,
          jugadores_actuales: texto(columnas[2]),
          pico_30_dias: texto(columnas[4]),
          horas_jugadas_30_dias: texto(columnas[5]),
        };
      })
    );

    return datos
      .filter((juego) => juego.nombre && juego.steam_app_id)
      .map((juego) => ({
        steam_app_id: juego.steam_app_id,
        nombre: juego.nombre,
        rango: parsearEnteroSeguro(juego.rango),
        jugadores_actuales: parsearEnteroSeguro(juego.jugadores_actuales),
        pico_30_dias: parsearEnteroSeguro(juego.pico_30_dias),
        horas_jugadas_30_dias: parsearEnteroSeguro(juego.horas_jugadas_30_dias),
        pico_24h: null,
        pico_historico: null,
        precio_centimos: null,
        precio_moneda: null,
        resenas_total: null,
        resenas_positivas: null,
        resenas_negativas: null,
        resenas_score: null,
        puntuacion_compra: null,
        fuente: 'top',
      }));
  });
}

async function scrapearDetalle(url, appIdSugerido) {
  return withPage(url, async (page) => {
    const response = await navegarConCloudflare(page, url);
    const status = response ? response.status() : null;
    await esperar(1500);
    await esperarSelector(page, '#app-title, .app-stat', status);

    const datos = await page.evaluate(() => {
      const nombre =
        document.querySelector('#app-title a')?.textContent?.trim() ||
        document.querySelector('#app-title')?.textContent?.trim() ||
        document.querySelector('#app-heading .app-image')?.getAttribute('alt')?.trim() ||
        '';
      const items = Array.from(document.querySelectorAll('.app-stat'));

      const resultado = {
        nombre,
        jugadores_actuales: null,
        pico_24h: null,
        pico_historico: null,
        pico_30_dias: null,
      };

      items.forEach((item) => {
        const etiqueta =
          item.querySelector('.label, .name, .title')?.textContent?.trim().toLowerCase() ||
          item.textContent.toLowerCase();
        const valor = item.querySelector('.num')?.textContent?.trim() || '';
        if (etiqueta.includes('playing')) {
          resultado.jugadores_actuales = valor;
        } else if (etiqueta.includes('24-hour peak')) {
          resultado.pico_24h = valor;
        } else if (etiqueta.includes('all-time peak')) {
          resultado.pico_historico = valor;
        }
      });

      const filas = Array.from(document.querySelectorAll('table.common-table tbody tr'));
      const filaUltimos30 = filas.find((fila) => {
        const etiqueta = fila.querySelector('.month-cell')?.textContent?.trim().toLowerCase();
        return etiqueta === 'last 30 days';
      });

      if (filaUltimos30) {
        const celdas = Array.from(filaUltimos30.querySelectorAll('td'));
        const picoCelda = celdas[4];
        const valor = picoCelda ? picoCelda.textContent?.trim() : '';
        resultado.pico_30_dias = valor || null;
      }

      return resultado;
    });

    if (!datos.nombre) {
      throw new Error('No se pudo obtener el nombre del juego');
    }

    return {
      steam_app_id: appIdSugerido || null,
      nombre: datos.nombre,
      rango: null,
      jugadores_actuales: parsearEnteroSeguro(datos.jugadores_actuales),
      pico_24h: parsearEnteroSeguro(datos.pico_24h),
      pico_historico: parsearEnteroSeguro(datos.pico_historico),
      pico_30_dias: parsearEnteroSeguro(datos.pico_30_dias),
      horas_jugadas_30_dias: null,
      precio_centimos: null,
      precio_moneda: null,
      resenas_total: null,
      resenas_positivas: null,
      resenas_negativas: null,
      resenas_score: null,
      puntuacion_compra: null,
      fuente: 'detalle',
    };
  });
}

module.exports = {
  scrapearTopCharts,
  scrapearDetalle,
};
