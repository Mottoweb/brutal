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
  runDate: STRING,
  runTime: STRING,
  sharpe: FLOAT,
  exchange: STRING,
  currency: STRING,
  asset: STRING,
  currencyPair: STRING,
  method: STRING,
  fullConfig: Sequelize.JSON,
  stratConfig: Sequelize.JSON,
  mostProfitabe: FLOAT,
  biggestLost: FLOAT,
  winningPercentage: FLOAT,
  profitFactor: FLOAT,
  grossProfit: FLOAT,
  grossLoss: FLOAT,
  market: FLOAT,
  relativeProfit: FLOAT,
  profit: FLOAT,
  startTime: STRING,
  endTime: STRING,
  candleSize: INTEGER,
  historySize: INTEGER,
  timespan: STRING,
  yearlyProfit: FLOAT,
  relativeYearlyProfit: FLOAT,
  startPrice: FLOAT,
  endPrice: FLOAT,
  trades: INTEGER,
  startBalance: FLOAT,
  alpha: FLOAT,
});

const writeResultToDB = (data) => {
  Results.sync({ force: true }).then(() => Results.create(data));
};

module.exports = writeResultToDB;
