const randomExt = require('random-ext');

const config = () => ({
  StochRSI: {
    interval: randomExt.integer(40, 1),
    thresholds: {
      low: randomExt.integer(40, 1),
      high: randomExt.integer(99, 60),
      persistence: randomExt.integer(15, 1),
    },
  },
});

module.exports = config;
