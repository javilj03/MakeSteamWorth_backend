# Puntuacion de compra

## Objetivo
La puntuacion de compra resume si vale la pena comprar un juego en este momento.
Se expresa en una escala de 0 a 10 para facilitar comparaciones.

## Datos utilizados
- Precio actual del juego (en centimos y moneda reportada por Steam Store).
- Jugadores actuales (concurrencia reciente disponible).
- Resenas (positivas/negativas y score de Steam).

## Formula y ponderaciones
Se construye una puntuacion sobre 10 a partir de tres subpuntuaciones (0-10):

```
puntuacion =
  0.50 * puntuacion_resenas +
  0.30 * puntuacion_jugadores +
  0.20 * puntuacion_precio
```

Notas:
- Cada subpuntuacion se calcula en rango 0-10 y luego se pondera.
- La suma de los pesos es 1.00.

- Resenas: se combina el ratio de positivas con el score oficial de Steam.

```
ratio_pos = positivas / (positivas + negativas)
ratio_score = score_steam / 9
puntuacion_resenas = clamp((ratio_pos * 0.7 + ratio_score * 0.3) * 10, 0, 10)
```

- Jugadores: escala logaritmica para evitar sesgo por juegos masivos.

```
puntuacion_jugadores = clamp(log10(jugadores + 1) * 2, 0, 10)
```

- Precio: penaliza precios altos (centimos).

```
puntuacion_precio = clamp(10 - precio_centimos / 600, 0, 10)
```

## Rango
- Minimo: 0
- Maximo: 10

## Cuando puede ser null
La puntuacion de compra puede ser null si falta alguno de los insumos clave:
- No hay precio vigente.
- No hay datos de jugadores actuales.
- No hay datos de reseñas (positivas/negativas) o la fuente no responde.
