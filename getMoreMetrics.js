const getMoreMetrics = (roundtrips) => {
  let mostProfitabe = 0;
  let biggestLost = 0;
  let grossProfit = 0;
  let grossLoss = 0;
  let winningPercentage = 0;
  let profitFactor = 0;
  let wins = 0;

  roundtrips.forEach((roundtrip) => {
    const { pnl, profit } = roundtrip;
    if (pnl > mostProfitabe) mostProfitabe = pnl;
    if (pnl < biggestLost) biggestLost = pnl;
    if (pnl > 0) grossProfit += pnl;
    if (pnl < 0) grossLoss += pnl;
    if (profit > 0) wins++;
  });

  profitFactor = Math.abs(grossProfit / grossLoss);
  winningPercentage = 100 * wins / roundtrips.length;

  mostProfitabe = mostProfitabe.toFixed(2);
  biggestLost = biggestLost.toFixed(2);
  winningPercentage = winningPercentage.toFixed(2);
  profitFactor = profitFactor.toFixed(2);
  grossProfit = grossProfit.toFixed(2);
  grossLoss = grossLoss.toFixed(2);

  return {
    mostProfitabe, biggestLost, winningPercentage, profitFactor, grossProfit, grossLoss,
  };
};

module.exports = getMoreMetrics;
