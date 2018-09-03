const randomExt = require('random-ext');

function generateConfigs() {
  var configs =[];
  var configFile = '../gekko/config-backtester.js';
  const config = require(configFile);
  var parallelqueries = 2;
  var candleSizes = [5, 10, 15, 20, 25, 30 , 40 ,50, 60, 70, 80, 90, 100, 110, 120];
  var historySizes = [20, 30, 50, 100];
  var tradingPairs = [
    ["poloniex","USDT","DASH"],
    ["poloniex","USDT","BCH"],
    ["poloniex","USDT","ETC"],
    ["poloniex","USDT","NXT"],
    ["poloniex","USDT","LTC"],
    ["poloniex","USDT","ETH"],
    ["poloniex","USDT","XMR"],
    ["poloniex","USDT","REP"],
    ["poloniex","USDT","STR"],
    ["poloniex","ETH","BCH"],
    ["poloniex","ETH","ETC"],
    ["poloniex","ETH","CVC"],
  ];

  var numberofruns = 5;

  let strategies = ["StochRSI"];

  for (var a = 0, len4 = tradingPairs.length; a < len4; a++) {
    for (var j = 0, len1 = candleSizes.length; j < len1; j++) {
      for (var k = 0, len2 = historySizes.length; k < len2; k++) {  
        for (var i = 0, len = numberofruns; i < len; i++) {
          stratKey = strategies[0];
          config.tradingAdvisor.method = stratKey;
          config.tradingAdvisor.candleSize = candleSizes[j];
          config.tradingAdvisor.historySize = historySizes[k];
          config.watch.exchange = tradingPairs[a][0];
          config.watch.currency = tradingPairs[a][1];
          config.watch.asset = tradingPairs[a][2];        
            
            if (this.baseConfig) delete this.baseConfig
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
                enabled: true
              },
              tradingAdvisor: {
                enabled: true,
                method: config.tradingAdvisor.method,
                candleSize: config.tradingAdvisor.candleSize ,
                historySize: config.tradingAdvisor.historySize,  
              },
              StochRSI:{  
                interval: randomExt.integer(5,1),
                thresholds: {  
                   low: randomExt.integer(30,10),
                   high: randomExt.integer(90,70),
                   persistence: randomExt.integer(4,2),
                }
              },
              backtest: {
                daterange: config.backtest.daterange
              },
              backtestResultExporter:{  
                enabled:true,
                writeToDisk:false,
                data:{  
                   stratUpdates:false,
                   roundtrips:true,
                   stratCandles:true,
                   stratCandleProps:[  
                      'open'
                   ],
                   trades:true
                }
              },
              performanceAnalyzer:{  
                riskFreeReturn:2,
                enabled:true
              },
              valid:true,
              debug: true,
            }
          configs.push(this.baseConfig);
        }
      }
    } 
  }
  return configs
}

module.exports = generateConfigs