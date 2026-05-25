const fs = require('fs/promises');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const {
  PUPPETEER_EXECUTABLE_PATH,
  PUPPETEER_HEADLESS,
  PUPPETEER_PROXY_PASS,
  PUPPETEER_PROXY_SERVER,
  PUPPETEER_PROXY_USER,
  PUPPETEER_USER_DATA_DIR,
  PUPPETEER_STEALTH,
  SCRAPE_HTTP_TIMEOUT_MS,
  SCRAPE_USER_AGENT,
} = require('../config');

if (PUPPETEER_STEALTH) {
  puppeteer.use(StealthPlugin());
}

let browserPromise = null;

const CLOUDFLARE_SELECTORS = [
  'form#challenge-form',
  '#challenge-stage',
  '#cf-spinner-please-wait',
  '#cf-wrapper',
  '.cf-browser-verification',
  '.cf-error-details',
  'iframe[src*="turnstile"]',
  'iframe[src*="captcha"]',
];

const USER_DATA_LOCK_FILES = [
  'SingletonLock',
  'SingletonSocket',
  'SingletonCookie',
  'SingletonSync',
];

function construirViewport() {
  const width = 1365 + Math.floor(Math.random() * 120);
  const height = 768 + Math.floor(Math.random() * 120);
  return { width, height };
}

async function limpiarLocksUserDataDir(userDataDir) {
  if (!userDataDir) {
    return;
  }

  await Promise.all(
    USER_DATA_LOCK_FILES.map(async (archivo) => {
      const ruta = path.join(userDataDir, archivo);
      try {
        await fs.unlink(ruta);
      } catch (error) {
        if (error && error.code !== 'ENOENT') {
          throw error;
        }
      }
    })
  );
}

async function prepararUserDataDir() {
  if (!PUPPETEER_USER_DATA_DIR) {
    return null;
  }

  const resolved = path.resolve(PUPPETEER_USER_DATA_DIR);
  await fs.mkdir(resolved, { recursive: true });
  await limpiarLocksUserDataDir(resolved);
  return resolved;
}

function esPerfilBloqueado(error) {
  const mensaje = String(error?.message || '').toLowerCase();
  return mensaje.includes('profile appears to be in use') || mensaje.includes('singletonlock');
}

async function obtenerEstadoCloudflare(page) {
  try {
    return await page.evaluate((selectors) => {
      const selector = selectors.join(',');
      const title = (document.title || '').toLowerCase();
      const hasChallenge = selector
        ? Boolean(document.querySelector(selector))
        : false;
      const hasTitle =
        title.includes('just a moment') ||
        title.includes('checking your browser') ||
        title.includes('un momento') ||
        title.includes('access denied') ||
        title.includes('acceso denegado') ||
        title.includes('attention required');
      return { hasChallenge, hasTitle };
    }, CLOUDFLARE_SELECTORS);
  } catch (error) {
    return { hasChallenge: false, hasTitle: false };
  }
}

async function esperarDesafioCloudflare(page) {
  const inicio = Date.now();
  let desafioDetectado = false;

  while (Date.now() - inicio < SCRAPE_HTTP_TIMEOUT_MS) {
    const estado = await obtenerEstadoCloudflare(page);
    if (!estado.hasChallenge && !estado.hasTitle) {
      return;
    }

    desafioDetectado = true;
    try {
      await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 });
    } catch (error) {
      // Ignorar timeouts mientras se resuelve el desafio.
    }
    await page.waitForTimeout(1000);
  }

  if (desafioDetectado) {
    throw new Error('Cloudflare bloqueó la navegación');
  }
}

function buildLaunchOptions(userDataDir) {
  const launchArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--no-zygote',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-blink-features=AutomationControlled',
  ];

  if (PUPPETEER_PROXY_SERVER) {
    launchArgs.push(`--proxy-server=${PUPPETEER_PROXY_SERVER}`);
  }

  const options = {
    headless: PUPPETEER_HEADLESS,
    args: launchArgs,
  };

  if (userDataDir) {
    options.userDataDir = userDataDir;
  }

  if (PUPPETEER_EXECUTABLE_PATH) {
    options.executablePath = PUPPETEER_EXECUTABLE_PATH;
  }

  return options;
}

async function crearBrowser() {
  const userDataDir = await prepararUserDataDir();
  const options = buildLaunchOptions(userDataDir);

  try {
    const browser = await puppeteer.launch(options);
    browser.on('disconnected', () => {
      browserPromise = null;
    });
    return browser;
  } catch (error) {
    if (userDataDir && esPerfilBloqueado(error)) {
      await limpiarLocksUserDataDir(userDataDir);
      const browser = await puppeteer.launch(options);
      browser.on('disconnected', () => {
        browserPromise = null;
      });
      return browser;
    }
    throw error;
  }
}

async function getBrowser() {
  if (!browserPromise) {
    browserPromise = crearBrowser();
  }

  try {
    const browser = await browserPromise;
    if (!browser.isConnected()) {
      try {
        await browser.close();
      } catch (error) {
        // Ignorar errores al cerrar un browser desconectado.
      }
      browserPromise = crearBrowser();
      return browserPromise;
    }
    return browser;
  } catch (error) {
    browserPromise = null;
    throw error;
  }
}

async function withPage(url, handler) {
  let browser = await getBrowser();
  let page;

  try {
    page = await browser.newPage();
  } catch (error) {
    if (String(error?.message || '').includes('Connection closed')) {
      await closeBrowser();
      browser = await getBrowser();
      page = await browser.newPage();
    } else {
      throw error;
    }
  }

  page.setDefaultTimeout(SCRAPE_HTTP_TIMEOUT_MS);
  page.setDefaultNavigationTimeout(SCRAPE_HTTP_TIMEOUT_MS);

  if (SCRAPE_USER_AGENT) {
    await page.setUserAgent(SCRAPE_USER_AGENT);
  }

  if (PUPPETEER_PROXY_USER || PUPPETEER_PROXY_PASS) {
    await page.authenticate({
      username: PUPPETEER_PROXY_USER || '',
      password: PUPPETEER_PROXY_PASS || '',
    });
  }

  const headers = {
    'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
  };

  await page.setExtraHTTPHeaders(headers);

  await page.setViewport(construirViewport());

  try {
    return await handler(page);
  } finally {
    try {
      await page.close();
    } catch (error) {
      return null;
    }
  }
}

async function navegarConCloudflare(page, url) {
  const response = await page.goto(url, { waitUntil: 'domcontentloaded' });
  await esperarDesafioCloudflare(page);
  const status = response ? response.status() : null;
  const estado = await obtenerEstadoCloudflare(page);
  if (status && status >= 400 && (estado.hasChallenge || estado.hasTitle)) {
    throw new Error(`Cloudflare bloqueo la navegacion (HTTP ${status})`);
  }
  return response;
}

async function closeBrowser() {
  if (!browserPromise) {
    return;
  }

  try {
    const browser = await browserPromise;
    await browser.close();
  } finally {
    browserPromise = null;
  }
}

module.exports = {
  withPage,
  navegarConCloudflare,
  closeBrowser,
};
