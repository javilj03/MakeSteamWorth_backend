# MakeSteamWorth Backend

Backend en Express para recolectar datos de Steam (API oficial) y almacenarlos en PostgreSQL.

## Requisitos
- Node 18+
- PostgreSQL (Azure)

## Configuracion

Crear `.env` basado en `.env.example` y completar credenciales:

```
PORT=3000
PGHOST=makesteamworthbd.postgres.database.azure.com
PGDATABASE=
PGUSER=
PGPASSWORD=
PGPORT=5432
PGSSLMODE=require
TOP_CHARTS_INTERVAL_MINUTES=30
```

## Ejecutar

```
npm start
```

## Endpoints

- `GET /` estado del servicio
- `GET /charts/top` ultimo top 100 almacenado
- `POST /charts/top/scrape` obtiene datos de top desde Steam API
- `GET /charts/app/:appId` ultimo detalle almacenado por app
- `POST /charts/app/:appId/scrape` obtiene datos actuales por app desde Steam API

## Notas
- El scraping de SteamDB no esta habilitado por restricciones del sitio.
