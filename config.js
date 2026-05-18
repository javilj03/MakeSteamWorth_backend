const TOP_CHARTS_INTERVAL_MINUTES =
  Number(process.env.TOP_CHARTS_INTERVAL_MINUTES) || 30;
const DEFAULT_SCRAPE_USER_AGENT =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

module.exports = {
  PORT: process.env.PORT ? Number(process.env.PORT) : 3000,
  SCRAPE_TOP_URL: process.env.SCRAPE_TOP_URL || "",
  SCRAPE_DETAIL_URL_TEMPLATE: process.env.SCRAPE_DETAIL_URL_TEMPLATE || "",
  SCRAPE_HTTP_TIMEOUT_MS: process.env.SCRAPE_HTTP_TIMEOUT_MS
    ? Number(process.env.SCRAPE_HTTP_TIMEOUT_MS)
    : 15000,
  SCRAPE_USER_AGENT: process.env.SCRAPE_USER_AGENT || DEFAULT_SCRAPE_USER_AGENT,
  PUPPETEER_EXECUTABLE_PATH: process.env.PUPPETEER_EXECUTABLE_PATH || "",
  PUPPETEER_HEADLESS: process.env.PUPPETEER_HEADLESS === 'false' ? false : 'new',
  PUPPETEER_USER_DATA_DIR: process.env.PUPPETEER_USER_DATA_DIR || "",
  PUPPETEER_STEALTH: process.env.PUPPETEER_STEALTH === 'false' ? false : true,
  PUPPETEER_PROXY_SERVER: process.env.PUPPETEER_PROXY_SERVER || "",
  PUPPETEER_PROXY_USER: process.env.PUPPETEER_PROXY_USER || "",
  PUPPETEER_PROXY_PASS: process.env.PUPPETEER_PROXY_PASS || "",
  TOP_CHARTS_INTERVAL_MINUTES,
  TOP_CHARTS_INTERVAL_MS: TOP_CHARTS_INTERVAL_MINUTES * 60 * 1000,
  STEAM_API_BASE_URL:
    process.env.STEAM_API_BASE_URL || "https://api.steampowered.com",
  STEAM_API_KEY: process.env.STEAM_API_KEY || "",
  STEAM_STORE_API_BASE_URL:
    process.env.STEAM_STORE_API_BASE_URL || "https://store.steampowered.com",
  STEAM_APP_LIST_TTL_MINUTES: process.env.STEAM_APP_LIST_TTL_MINUTES
    ? Number(process.env.STEAM_APP_LIST_TTL_MINUTES)
    : 720,
};
