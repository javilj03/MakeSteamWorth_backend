# Esquema de base de datos

Resumen de la tabla principal y sus indices.

## Tabla `juegos`

Campos relevantes:

- `id`: clave primaria autonumerica.
- `steam_app_id`: ID de Steam si existe.
- `nombre`: nombre del juego.
- `rango`: posicion en el top (solo cuando `fuente` = `top`).
- `jugadores_actuales`, `pico_24h`, `pico_historico`: metricas de jugadores.
- `pico_30_dias`: pico de jugadores en 30 dias (solo top).
- `horas_jugadas_30_dias`: horas jugadas en 30 dias (solo top).
- `precio_centimos`: precio final en centimos (Steam Store).
- `precio_moneda`: moneda del precio (`EUR`, `USD`, `FREE`, etc.).
- `resenas_total`, `resenas_positivas`, `resenas_negativas`: resumen de reseñas.
- `resenas_score`: score de reseñas de Steam (0-9).
- `puntuacion_compra`: nota 0-10 calculada con precio, jugadores y reseñas.
- `fuente`: `top` o `detalle`.
- `actualizado_en`: timestamp de ultimo refresh.

Restricciones e indices:

- `unique (steam_app_id, fuente)` para evitar duplicados por fuente.
- `idx_juegos_nombre` para busquedas por nombre.
- `idx_juegos_actualizado` para ordenar por frescura.

## Motivos

- El `unique` permite usar upsert y mantener una sola fila por juego y fuente.
- Los indices aceleran busquedas y listados frecuentes desde la API.
- El top se arma usando `jugadores_actuales`, `pico_30_dias` y `horas_jugadas_30_dias`.
- `puntuacion_compra` se calcula al guardar datos para evitar recostruccion posterior.
