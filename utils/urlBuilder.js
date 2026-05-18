function buildDetailUrl(template, appId) {
  if (!template) {
    throw new Error('SCRAPE_DETAIL_URL_TEMPLATE no configurada');
  }

  const token = String(appId);
  return template
    .replace('<id_juego>', token)
    .replace('<idJuego>', token)
    .replace('{id_juego}', token)
    .replace('{idJuego}', token)
    .replace('{id}', token)
    .replace(':id', token);
}

module.exports = {
  buildDetailUrl,
};
