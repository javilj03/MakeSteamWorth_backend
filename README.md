# MakeSteamWorth Backend

Backend en Express para recolectar datos de Steam (API oficial) y almacenarlos en PostgreSQL.

## Requisitos
- Node 18+
- PostgreSQL

## Configuracion

Crear `.env` basado en `.env.example` y completar credenciales (para Docker Compose, usa el `.env` en la raiz del proyecto):

```
PORT=3000
PGHOST=db
PGDATABASE=makesteamworth
PGUSER=makesteamworth
PGPASSWORD=change_me
PGPORT=5432
PGSSLMODE=disable
TOP_CHARTS_INTERVAL_MINUTES=30
```

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
