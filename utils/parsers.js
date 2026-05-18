function normalizarNumero(value) {
  if (!value) {
    return null;
  }

  const numeric = value.replace(/[^0-9]/g, '');
  if (!numeric) {
    return null;
  }

  return Number(numeric);
}

module.exports = {
  normalizarNumero,
};
