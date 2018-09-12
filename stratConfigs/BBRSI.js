const randomExt = require('random-ext');

const config = {
  BBRSI: {
    interval: randomExt.integer(40, 1),
    thresholds: {
      low: randomExt.integer(40, 1),
      high: randomExt.integer(99, 60),
      persistence: randomExt.integer(15, 1),
    },
    bbands: {
      TimePeriod: randomExt.integer(30, 1),
      NbDevUp: randomExt.integer(5, 1),
      NbDevDn: randomExt.integer(5, 1),
    },
  },
};

module.exports = config;
