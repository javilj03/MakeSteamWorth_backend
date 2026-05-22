# Scraping de top charts

Fuente: `example.html`.

## Pasos de extraccion

- Se usa Puppeteer para cargar la pagina y renderizar el DOM.
- La navegacion se centraliza en un helper comun para todas las URLs.
- Se aplica modo stealth para reducir deteccion de bot.
- Se define un viewport variable por sesion.
- Si hay variables `PUPPETEER_PROXY_*`, se usa un proxy fijo por sesion con autenticacion.
- Se espera el desafio de Cloudflare antes de buscar el DOM.
- Se detectan paginas de Cloudflare por titulos tipo "Un momento" o "Just a moment".
- Si la respuesta HTTP es 4xx y hay un desafio de Cloudflare, se corta con error.
- Se espera `table#top-games tbody tr`.
- Se recorren las filas y se extraen los textos de columnas y el `href`.

## Campos extraidos

- `steam_app_id` desde `data-appid` o `a[href*="/app/"]` (parsea `/app/<id>`).
- Columnas 0..5: rango, nombre, actuales, (chart), pico 30 dias, horas 30 dias.
- El chart se ignora porque no aporta valor numerico.
- Al guardar, se enriquece con precio y reseñas de Steam Store para calcular `puntuacion_compra`.

## Decisiones y motivos

- Puppeteer permite ejecutar JS y reduce bloqueos por anti-bot.
- El modo stealth imita un navegador real y baja la probabilidad de bloqueo.
- Un viewport variable evita patrones repetitivos que delatan automatizacion.
- La espera del desafio Cloudflare evita leer un HTML intermedio incompleto.
- La deteccion por titulo permite identificar paginas de Cloudflare con contenido bloqueado.
- Los 4xx con desafio de Cloudflare se consideran bloqueo y se aborta.
- La navegacion centralizada unifica el manejo del desafio y los tiempos de espera.
- Si el navegador se desconecta, se relanza para evitar fallos por CDP.
- Se usa `normalizarNumero` para limpiar separadores y convertir a enteros.
- Se ignoran filas sin nombre.
