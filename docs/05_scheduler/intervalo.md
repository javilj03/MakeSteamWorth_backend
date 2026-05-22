# Scheduler de scraping

El scraping del top se programa con `setInterval`.

## Configuracion

- Intervalo en minutos: `TOP_CHARTS_INTERVAL_MINUTES`.
- Se convierte a milisegundos para `setInterval`.
- Al iniciar, se ejecuta una corrida inmediata y luego el intervalo.
- Se bloquean ejecuciones concurrentes para evitar solapes.

## Decisiones y motivos

- Se limpia el top antes de insertar para evitar filas obsoletas.
- Se conserva un unico intervalo activo y se reinicia si cambia la URL.
- El scraping usa Puppeteer para evitar bloqueos por anti-bot.
- Cada guardado enriquece precio/reseñas para calcular `puntuacion_compra`.
