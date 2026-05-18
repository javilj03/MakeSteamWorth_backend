# Scraping de detalle

Fuente: `example2.html`.

## Pasos de extraccion

- Se usa Puppeteer para cargar la pagina y renderizar el DOM.
- La navegacion se centraliza en un helper comun para todas las URLs.
- Se aplica modo stealth para reducir deteccion de bot.
- Se define un viewport variable por sesion.
- Si hay variables `PUPPETEER_PROXY_*`, se usa un proxy fijo por sesion con autenticacion.
- Se espera el desafio de Cloudflare antes de buscar el DOM.
- Se detectan paginas de Cloudflare por titulos tipo "Un momento" o "Just a moment".
- Si la respuesta HTTP es 4xx y hay un desafio de Cloudflare, se corta con error.
- Se espera `#app-title` o `.app-stat`.
- Se toma el nombre desde `#app-title a`, `#app-title` o el `alt` de `.app-image`.
- Se recorren items `.app-stat` y se asocian labels con `.num`.

## Campos extraidos

- `playing` -> `jugadores_actuales`.
- `24-hour` -> `pico_24h`.
- `all-time` -> `pico_historico`.

## Decisiones y motivos

- Se usa el `appId` sugerido para completar el registro cuando el HTML no lo expone.
- Se valida que exista nombre para evitar datos incompletos.
- El modo stealth imita un navegador real y baja la probabilidad de bloqueo.
- Un viewport variable evita patrones repetitivos que delatan automatizacion.
- La espera del desafio Cloudflare evita leer un HTML intermedio incompleto.
- La deteccion por titulo permite identificar paginas de Cloudflare con contenido bloqueado.
- Los 4xx con desafio de Cloudflare se consideran bloqueo y se aborta.
- La navegacion centralizada unifica el manejo del desafio y los tiempos de espera.
- Si el navegador se desconecta, se relanza para evitar fallos por CDP.
