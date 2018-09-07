const randomExt = require('random-ext');
const configFile = require('../gekko/config-backtester.js');

function generateConfigs() {
  const configs = [];
  const config = configFile;
  const candleSizes = [5, 10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120];
  const historySizes = [20, 30, 50, 100];
  const tradingPairs = [
    ['poloniex', 'BTC', 'DASH'],
    ['poloniex', 'BTC', 'ETH'],
    ['poloniex', 'BTC', 'LTC'],
    ['poloniex', 'BTC', 'STR'],
    ['poloniex', 'BTC', 'XMR'],
    ['poloniex', 'ETH', 'BCH'],
    ['poloniex', 'ETH', 'ETC'],
    ['poloniex', 'USDT', 'BCH'],
    ['poloniex', 'USDT', 'DASH'],
    ['poloniex', 'USDT', 'ETC'],
    ['poloniex', 'USDT', 'ETH'],
    ['poloniex', 'USDT', 'LTC'],
    ['poloniex', 'USDT', 'NXT'],
    ['poloniex', 'USDT', 'REP'],
    ['poloniex', 'USDT', 'STR'],
    ['poloniex', 'USDT', 'XMR'],
  ];

  const numberofruns = 5;

  const strategies = ["StochRSI"];

  for (var a = 0, len4 = tradingPairs.length; a < len4; a++) {
    for (var j = 0, len1 = candleSizes.length; j < len1; j++) {
      for (var k = 0, len2 = historySizes.length; k < len2; k++) {
        for (var i = 0, len = numberofruns; i < len; i++) {
          const stratKey = strategies[0];
          config.tradingAdvisor.method = stratKey;
          config.tradingAdvisor.candleSize = candleSizes[j];
          config.tradingAdvisor.historySize = historySizes[k];
          config.watch.exchange = tradingPairs[a][0];
          config.watch.currency = tradingPairs[a][1];
          config.watch.asset = tradingPairs[a][2];

          if (this.baseConfig) delete this.baseConfig;
          this.baseConfig = {
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
            StochRSI: {
              interval: randomExt.integer(20, 1),
              thresholds: {
                low: randomExt.integer(35, 5),
                high: randomExt.integer(95, 65),
                persistence: randomExt.integer(9, 1),
              },
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
          configs.push(this.baseConfig);
        }
      }
    }
  }
  return configs;
}

module.exports = generateConfigs;
