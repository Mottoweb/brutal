const randomExt = require('random-ext');

const bestone = {
  bestone: {
    MACD: {
      optInFastPeriod: randomExt.integer(20, 12),
      optInSlowPeriod: randomExt.integer(40, 20),
      optInSignalPeriod: randomExt.integer(12, 1),
    },
    EMAshort: {
      optInTimePeriod: randomExt.integer(15, 1),
    },
    EMAlong: {
      optInTimePeriod: randomExt.integer(30, 15),
    },
    STOCH: {
      optInFastKPeriod: randomExt.integer(12, 1),
      optInSlowKPeriod: randomExt.integer(12, 1),
      optInSlowKMAType: randomExt.integer(12, 1),
      optInSlowDPeriod: randomExt.integer(12, 1),
      optInSlowDMAType: randomExt.integer(12, 1),
    },
    RSI: {
      optInTimePeriod: randomExt.integer(30, 1),
    },
    thresholds: {
      RSIhigh: randomExt.integer(40, 1),
      RSIlow: randomExt.integer(99, 60),
      MACDhigh: randomExt.float(0.5, 0),
      MACDlow: randomExt.float(0, -0.5),
      persistence: randomExt.integer(12, 1),
    },
  },
};

module.exports = bestone;
