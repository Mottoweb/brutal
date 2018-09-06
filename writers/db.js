const Sequelize = require('sequelize');
const {
  dbname, dbusername, dbpass, dbhost,
} = require('../dbconf');

const sequelize = new Sequelize(dbname, dbusername, dbpass, {
  host: dbhost,
  dialect: 'postgres',
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  operatorsAliases: false,
});

const { STRING, FLOAT, INTEGER } = Sequelize;

const Results = sequelize.define('results', {
  method: STRING,
  market: FLOAT,
  relativeProfit: FLOAT,
  profit: FLOAT,
  winningPercentage: FLOAT,
  profitFactor: FLOAT,
  mostProfitabe: FLOAT,
  biggestLost: FLOAT,
  grossProfit: FLOAT,
  grossLoss: FLOAT,
  sharpe: FLOAT,
  alpha: FLOAT,
  candleSize: INTEGER,
  historySize: INTEGER,
  runDate: STRING,
  runTime: STRING,
  yearlyProfit: FLOAT,
  relativeYearlyProfit: FLOAT,
  exchange: STRING,
  currency: STRING,
  asset: STRING,
  currencyPair: STRING,
  trades: INTEGER,
  startTime: STRING,
  endTime: STRING,
  timespan: STRING,
  startPrice: FLOAT,
  endPrice: FLOAT,
  startBalance: FLOAT,
  fullConfig: Sequelize.JSON,
  stratConfig: Sequelize.JSON,
});

const saveResult = async data => Results.create(data);

module.exports = {
  handlers: {
    saveResult,
  },
  db: sequelize,
};
