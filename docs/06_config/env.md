# Variables de entorno

Listado de variables usadas y su proposito.

## Scraping

- `SCRAPE_TOP_URL`: URL principal del top charts a scrapear.
- `SCRAPE_DETAIL_URL_TEMPLATE`: plantilla para URL de detalle con placeholder `<id_juego>`.
- `SCRAPE_HTTP_TIMEOUT_MS`: timeout HTTP para scraping.
- `SCRAPE_USER_AGENT`: user agent para requests.
- `PUPPETEER_EXECUTABLE_PATH`: ruta del Chromium en contenedores.
- `PUPPETEER_HEADLESS`: `true` o `false` para modo headless.
- `PUPPETEER_SKIP_DOWNLOAD`: evita descargar Chromium en `npm install` (recomendado en contenedor).
- `PUPPETEER_USER_DATA_DIR`: directorio de perfil para guardar cookies/sesion.
- `PUPPETEER_STEALTH`: habilita el plugin stealth (true/false).
- `PUPPETEER_PROXY_SERVER`: proxy para el navegador en formato `http://host:puerto`.
- `PUPPETEER_PROXY_USER`: usuario del proxy (opcional).
- `PUPPETEER_PROXY_PASS`: password del proxy (opcional).

## Scheduler

- `TOP_CHARTS_INTERVAL_MINUTES`: intervalo del scraping del top.

## Steam API

- `STEAM_API_BASE_URL`: base URL de Steam API.
- `STEAM_API_KEY`: key para ISteamUserStats.
- `STEAM_STORE_API_BASE_URL`: base URL de Steam Store API para busquedas.
- `STEAM_APP_LIST_TTL_MINUTES`: cache de la lista de apps.

## Otros

- `PORT`: puerto del servidor.

## Decisiones y motivos

- Se usa cache de `STEAM_APP_LIST_TTL_MINUTES` para reducir llamadas.
- Separar URLs de top y detalle permite cambiar fuentes sin tocar codigo.
- Si Cloudflare bloquea, el scraper espera la resolucion automatica del desafio antes de continuar.
- El browser se relanza si la conexion CDP se cierra durante el scraping.
- En Azure suele ser necesario mantener `PUPPETEER_HEADLESS=true` para evitar fallos.
