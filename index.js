const dotenv = require('dotenv');

const overrideEnv = process.env.PGHOST === '/var/run/postgresql';
dotenv.config({ override: overrideEnv });

const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const { PORT, SCRAPE_TOP_URL } = require('./config');
const { query, close } = require('./db');
const juegosRouter = require('./routes/games');
const { iniciarScrapingProgramado } = require('./services/scheduler');
const { closeBrowser } = require('./services/browser');

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  const inicio = Date.now();
  res.on('finish', () => {
    const duracionMs = Date.now() - inicio;
    console.log(`${req.method} ${req.originalUrl} -> ${res.statusCode} (${duracionMs}ms)`);
  });
  next();
});

app.get('/', (req, res) => {
  res.json({
    status: 'ok',
    service: 'MakeSteamWorth backend',
  });
});

app.use('/api/juegos', juegosRouter);

async function ejecutarMigraciones() {
  const ruta = path.join(__dirname, 'db', 'migrations', '001_init.sql');
  const sql = await fs.readFile(ruta, 'utf8');
  await query(sql);
}

async function iniciarServidor() {
  console.log('Iniciando servidor...');
  await ejecutarMigraciones();
  console.log('Migraciones aplicadas');
  if (SCRAPE_TOP_URL) {
    iniciarScrapingProgramado(SCRAPE_TOP_URL);
    console.log('Scraping top programado');
  } else {
    console.log('SCRAPE_TOP_URL no configurada; scraping top deshabilitado');
  }

  const server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en puerto ${PORT}`);
  });

  server.on('error', (error) => {
    console.error('No se pudo iniciar el servidor', error);
  });
}

iniciarServidor().catch((error) => {
  console.error('No se pudo iniciar el servidor', error);
  closeBrowser().catch(() => undefined);
  close().catch(() => undefined);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await closeBrowser();
  await close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeBrowser();
  await close();
  process.exit(0);
});
