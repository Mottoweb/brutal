const r = require('random-ext');

const neataptic = () => ({
  neataptic: {
    hiddenLayers: r.integer(2, 6),
    lookAheadCandles: r.integer(3, 10),
    iterations: r.integer(50, 300),
    error: r.float(0.0001, 0.003),
    momentum: r.float(0.005, 0.03),
    architecture: r.pick(['LSTM', 'Perceptron']),
    minPercentIncrease: r.integer(1, 50),
    candlesForShort: r.integerArray(r.integer(2, 6), 99, 10),
    candlesForLong: r.integerArray(r.integer(2, 6), 99, 10),
    stopLoss: r.integer(1, 5),
    RSI: [r.integer(2, 30)],
    SMA: [r.integer(1, 100), r.integer(101, 1000)],
  },
});

module.exports = neataptic;
