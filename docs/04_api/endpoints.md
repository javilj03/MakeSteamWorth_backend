# Endpoints de API

## GET /api/juegos/top

- Devuelve el top de juegos desde base de datos.
- Parametros: sin parametros.
- Respuesta: `{ total, datos }`.
- Incluye `pico_30_dias` y `horas_jugadas_30_dias` cuando estan disponibles.

## GET /api/juegos/buscar?nombre=

- Busca por nombre exacto en base de datos.
- Si no existe, consulta Steam Store Search para resolver el `appId`.
- Si el `appId` ya esta en el top, devuelve ese registro.
- Si no esta en top, hace scraping de detalle.
- Respuesta: `{ origen, datos }` o error.
- Usa Puppeteer para cargar la pagina de detalle.

## POST /api/juegos/scraping/top

- Fuerza el scraping del top y guarda el resultado.
- Requiere `SCRAPE_TOP_URL` configurada.
- Usa Puppeteer para cargar la pagina.
- El top se mapea por `appId` (extraido del `href`) y actualiza los campos de 30 dias.

## GET /api/juegos/steam/usuario/:steamId

- Devuelve el perfil publico de Steam (ISteamUser).
- Requiere `STEAM_API_KEY` configurada.

## GET /api/juegos/steam/usuario/:steamId/juego/:appId

- Devuelve estadisticas de usuario para un juego (ISteamUserStats).
- Requiere `STEAM_API_KEY` configurada.

## Decisiones y motivos

- Se prioriza la BD para reducir scraping innecesario.
- Se retorna `origen` para distinguir datos de top vs detalle.
