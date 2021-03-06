
const randomExt = require('random-ext');
const configFile = require('../gekko/config-backtester.js');

function generateConfig() {
  const configs = [];
  const config = configFile;
  // const candleSizes = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
  const candleSizes = randomExt.integerArray(15, 123, 2);
  const historySizes = [20, 30, 50, 100];
  const tradingPairs = [
    ['binance', 'USDT', 'BCC'],
    // ['binance', 'BTC', 'XRP'],
    // ['binance', 'USDT', 'ADA'],
    // ['binance', 'USDT', 'ETH'],
    // ['binance', 'USDT', 'BTC'],
    // ['binance', 'USDT', 'XRP'],
    // ['binance', 'USDT', 'XLM'],
    // ['binance', 'BTC', 'XLM'],
    // ['gdax', 'EUR', 'ETH'],
  ];


  const numberofruns = 20;
  const stratKey = 'neataptic';

  const generateStratConf = require(`./stratConfigs/${stratKey}`);

  for (var a = 0, len4 = tradingPairs.length; a < len4; a++) {
    for (var j = 0, len1 = candleSizes.length; j < len1; j++) {
      for (var k = 0, len2 = historySizes.length; k < len2; k++) {
        for (var i = 0, len = numberofruns; i < len; i++) {
          config.tradingAdvisor.method = stratKey;
          config.tradingAdvisor.candleSize = candleSizes[j];
          config.tradingAdvisor.historySize = historySizes[k];
          config.watch.exchange = tradingPairs[a][0];
          config.watch.currency = tradingPairs[a][1];
          config.watch.asset = tradingPairs[a][2];

          const baseConfig = {
            ...generateStratConf(),
            watch: {
              exchange: config.watch.exchange,
              currency: config.watch.currency,
              asset: config.watch.asset,
            },
            paperTrader: {
              slippage: config.paperTrader.slippage,
              feeTaker: config.paperTrader.feeTaker,
              feeMaker: config.paperTrader.feeMaker,
              feeUsing: config.paperTrader.feeUsing,
              simulationBalance: config.paperTrader.simulationBalance,
              reportRoundtrips: true,
              enabled: true,
            },
            tradingAdvisor: {
              enabled: true,
              method: config.tradingAdvisor.method,
              candleSize: config.tradingAdvisor.candleSize,
              historySize: config.tradingAdvisor.historySize,
            },
            backtest: {
              daterange: config.backtest.daterange,
            },
            backtestResultExporter: {
              enabled: true,
              writeToDisk: false,
              data: {
                stratUpdates: false,
                roundtrips: true,
                stratCandles: true,
                stratCandleProps: [
                  'open',
                ],
                trades: true,
              },
            },
            performanceAnalyzer: {
              riskFreeReturn: 2,
              enabled: true,
            },
            valid: true,
            debug: true,
          };
          // console.log(baseConfig);
          configs.push(baseConfig);
        }
      }
    }
  }
  return configs;
}

module.exports = generateConfig;
