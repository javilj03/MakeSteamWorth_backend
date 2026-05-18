const {
  STEAM_API_BASE_URL,
  STEAM_API_KEY,
  STEAM_APP_LIST_TTL_MINUTES,
  STEAM_STORE_API_BASE_URL,
} = require('../config');

const cacheBusqueda = new Map();

function obtenerCache(nombreNormalizado) {
  const entrada = cacheBusqueda.get(nombreNormalizado);
  if (!entrada) {
    return undefined;
  }

  const expiracionMs = STEAM_APP_LIST_TTL_MINUTES * 60 * 1000;
  if (Date.now() - entrada.actualizadoEn > expiracionMs) {
    cacheBusqueda.delete(nombreNormalizado);
    return undefined;
  }

  return entrada.appId;
}

function guardarCache(nombreNormalizado, appId) {
  cacheBusqueda.set(nombreNormalizado, {
    appId,
    actualizadoEn: Date.now(),
  });
}

async function buscarEnStore(nombre) {
  const url = `${STEAM_STORE_API_BASE_URL}/api/storesearch/?term=${encodeURIComponent(
    nombre
  )}&l=spanish&cc=ES`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'MakeSteamWorthBot/1.0',
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Steam Store API no disponible: ${response.status}`);
  }

  const data = await response.json();
  if (!data || !Array.isArray(data.items)) {
    throw new Error('Formato invalido de Steam Store API');
  }

  return data.items.filter((item) => item && item.type === 'app' && item.id);
}

async function findAppIdByName(nombre) {
  const normalizado = nombre.trim().toLowerCase();
  if (!normalizado) {
    return null;
  }

  const cached = obtenerCache(normalizado);
  if (cached !== undefined) {
    return cached;
  }

  const items = await buscarEnStore(nombre);
  const exact = items.find(
    (item) => item.name && item.name.trim().toLowerCase() === normalizado
  );
  const partial =
    exact ||
    items.find(
      (item) => item.name && item.name.trim().toLowerCase().includes(normalizado)
    );
  const appId = partial ? Number(partial.id) : null;
  guardarCache(normalizado, appId);
  return appId;
}

async function getSteamPlayerSummary(appId) {
  if (!STEAM_API_KEY) {
    throw new Error('STEAM_API_KEY no configurada');
  }

  const url = `${STEAM_API_BASE_URL}/ISteamUserStats/GetNumberOfCurrentPlayers/v1/?appid=${appId}&key=${STEAM_API_KEY}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'MakeSteamWorthBot/1.0',
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Steam API error: ${response.status}`);
  }

  const data = await response.json();
  if (!data || !data.response) {
    throw new Error('Respuesta invalida de Steam API');
  }

  return data.response.player_count || null;
}

async function getPlayerSummary(steamId) {
  if (!STEAM_API_KEY) {
    throw new Error('STEAM_API_KEY no configurada');
  }

  const url = `${STEAM_API_BASE_URL}/ISteamUser/GetPlayerSummaries/v2/?key=${STEAM_API_KEY}&steamids=${steamId}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'MakeSteamWorthBot/1.0',
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Steam API error: ${response.status}`);
  }

  const data = await response.json();
  const players = data && data.response ? data.response.players : null;
  if (!players || players.length === 0) {
    return null;
  }

  return players[0];
}

async function getUserStatsForGame(steamId, appId) {
  if (!STEAM_API_KEY) {
    throw new Error('STEAM_API_KEY no configurada');
  }

  const url = `${STEAM_API_BASE_URL}/ISteamUserStats/GetUserStatsForGame/v2/?appid=${appId}&key=${STEAM_API_KEY}&steamid=${steamId}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'MakeSteamWorthBot/1.0',
      Accept: 'application/json',
    },
  });
  if (!response.ok) {
    throw new Error(`Steam API error: ${response.status}`);
  }

  const data = await response.json();
  if (!data || !data.playerstats) {
    return null;
  }

  return data.playerstats;
}

module.exports = {
  findAppIdByName,
  getSteamPlayerSummary,
  getPlayerSummary,
  getUserStatsForGame,
};
