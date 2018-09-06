const replaceall = require('replaceall');
const fs = require('fs-extra');

const saveToCsv = (data) => {
  const resultDir = `${__dirname}/results`;
  const {
    runDate,
    runTime,
    sharpe,
    exchange,
    currency,
    asset,
    currencyPair,
    method,
    fullConfig,
    stratConfig,
    mostProfitabe,
    biggestLost,
    winningPercentage,
    profitFactor,
    grossProfit,
    grossLoss,
    market,
    relativeProfit,
    profit,
    startTime,
    endTime,
    candleSize,
    historySize,
    timespan,
    yearlyProfit,
    relativeYearlyProfit,
    startPrice,
    endPrice,
    trades,
    startBalance,
    alpha,
  } = data;

  const escapedFullConfig = replaceall(",", "|", JSON.stringify(fullConfig))
  const escapedStratConfig = replaceall(",", "|", JSON.stringify(stratConfig))
  const headertxt = "Strategy,Market perf(%),Strat perf(%),Profit, Winning %, PF, Most Profitable, Biggest Loss, GP, GL,  Run date, Run time, Start date, End date,Currency pair, Candle size, History size,Currency, Asset, Timespan,Yearly profit, Yearly profit (%), Start price, End price, Trades, Start balance, Sharpe, Alpha, Config, Full Config\n";
  const outtxt = method+","+market+","+relativeProfit+","+profit+","+winningPercentage+","+profitFactor+","+mostProfitabe+","+biggestLost+","+grossProfit+","+grossLoss+"," +runDate+","+runTime+","+startTime+","+endTime+","+currencyPair+","+candleSize+","+historySize+","+currency+","+asset+","+timespan+","+yearlyProfit+","+ relativeYearlyProfit+","+startPrice+","+endPrice+","+trades+","+startBalance+","+sharpe+","+alpha+","+escapedStratConfig+ ","+escapedFullConfig+ "\n";

  const resultCsv = `${resultDir}/${method}.${exchange}.${currency}.${asset}.csv`;

  if (fs.existsSync(resultCsv)) {
    fs.appendFileSync(resultCsv, outtxt, 'utf8');
  } else {
    fs.appendFileSync(resultCsv, headertxt, 'utf8');
    fs.appendFileSync(resultCsv, outtxt, 'utf8');
  }
};

module.exports = saveToCsv;
