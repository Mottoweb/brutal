const r = require('random-ext');

const neataptic = () => ({
  neataptic: {
    hiddenLayers: r.integer(6, 2),
    lookAheadCandles: r.integer(30, 10),
    iterations: r.integer(300, 50),
    error: r.float(0.003, 0.0001),
    momentum: r.float(0.03, 0.005),
    architecture: r.pick(['LSTM', 'Perceptron']),
    minPercentIncrease: r.integer(50, 1),
    candlesForShort: r.integerArray(r.integer(6, 2), 99, 10),
    candlesForLong: r.integerArray(r.integer(6, 2), 99, 10),
    stopLoss: r.integer(5, 1),
    RSI: [r.integer(30, 2)],
    SMA: [r.integer(100, 1), r.integer(1000, 101)],
  },
});

module.exports = neataptic;
