# MakeSteamWorth Backend

Backend en Express para recolectar datos de Steam (API oficial) y almacenarlos en PostgreSQL.

## Requisitos
- Node 18+
- PostgreSQL


## Ejecutar

```
npm start
```

## Endpoints

- `GET /` estado del servicio
- `GET /api/juegos/top` ultimo top almacenado en base de datos
- `GET /api/juegos/buscar?nombre=` busca juego por nombre y guarda si falta
- `POST /api/juegos/scraping/top` fuerza el scraping del top
- `GET /api/juegos/steam/usuario/:steamId` perfil publico de usuario
- `GET /api/juegos/steam/usuario/:steamId/juego/:appId` estadisticas por juego

## Notas
- Los datos se enriquecen con precio y reseñas para calcular `puntuacion_compra`.
