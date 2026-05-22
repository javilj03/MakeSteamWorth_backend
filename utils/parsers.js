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

function limitarNumero(valor, min, max) {
  if (!Number.isFinite(valor)) {
    return null;
  }
  return Math.min(max, Math.max(min, valor));
}

function calcularPuntuacionCompra({
  precioCentimos,
  jugadoresActuales,
  resenasPositivas,
  resenasNegativas,
  resenasScore,
}) {
  if (
    precioCentimos === null ||
    precioCentimos === undefined ||
    jugadoresActuales === null ||
    jugadoresActuales === undefined ||
    resenasPositivas === null ||
    resenasPositivas === undefined ||
    resenasNegativas === null ||
    resenasNegativas === undefined
  ) {
    return null;
  }

  const totalResenas = resenasPositivas + resenasNegativas;
  const ratioResenas = totalResenas > 0 ? resenasPositivas / totalResenas : 0.5;
  const ratioScore = Number.isFinite(resenasScore) ? resenasScore / 9 : ratioResenas;
  const scoreResenas = limitarNumero((ratioResenas * 0.7 + ratioScore * 0.3) * 10, 0, 10);

  const scoreJugadores = limitarNumero(Math.log10(jugadoresActuales + 1) * 2, 0, 10);
  const scorePrecio = limitarNumero(10 - precioCentimos / 600, 0, 10);

  const nota = scoreResenas * 0.5 + scoreJugadores * 0.3 + scorePrecio * 0.2;
  return Number(nota.toFixed(2));
}

module.exports = {
  normalizarNumero,
  calcularPuntuacionCompra,
};
