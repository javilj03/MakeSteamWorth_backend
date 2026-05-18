# Requisitos clave y decisiones

Resumen de requisitos funcionales y tecnicos observados en el trabajo.

## Requisitos principales

- API REST con Express para consultar datos de juegos.
- Scraping de top charts y de detalle por juego desde HTML.
- Integracion con Steam API: ISteamUserStats y ISteamUser/ISteamApps.
- Persistencia en base de datos con tabla de juegos.
- Scheduler para refrescar el top automaticamente.

## Decisiones y motivos

- Guardar juegos en una sola tabla con campo `fuente` para diferenciar top y detalle: simplifica consultas y permite reusar el mismo upsert.
- Limpiar registros del top antes de insertar el nuevo top: evita inconsistencias cuando un juego sale del ranking.
- Cachear lista de apps de Steam: reduce llamadas a la API y mejora el tiempo de respuesta al buscar.
- Tomar `TOP_CHARTS_INTERVAL_MINUTES` por configuracion: permite ajustar la frecuencia sin tocar codigo.
- Cambiar la fuente del top a `SCRAPE_TOP_URL` permite desacoplar el origen y sumar columnas de 30 dias.
