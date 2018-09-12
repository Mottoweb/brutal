const axios = require('axios');
const { Op } = require('sequelize');
const _ = require('lodash');
const moment = require('moment');

const queue = require('./queue');
const {
  models,
  db,
} = require('./writers/db');

const host = process.env.HOST || 'http://localhost:3000';

const timeout = ms => new Promise(res => setTimeout(res, ms));

const getProfitable = async () => {
  const data = await models.Results.findAll({
    where: {
      relativeProfit: {
        [Op.gt]: 20,
      },
      profitFactor: {
        [Op.gt]: 2,
      },
      trades: {
        [Op.gt]: 19,
      },
      exchange: 'binance',
    },
  });
  return data;
};

const getRunningGekkos = async () => {
  const url = `${host}/api/gekkos`;
  try {
    const response = await axios.get(url);
    const paperTraders = Object.keys(response.data.live).filter(itemKey => /papertrader/.test(itemKey)).map(itemKey => response.data.live[itemKey]);
    const marketWatchers = Object.keys(response.data.live).filter(itemKey => /watcher/.test(itemKey)).map(itemKey => response.data.live[itemKey]);
    return ({ paperTraders, marketWatchers });
  } catch (error) {
    console.error(error);
    return null;
  }
};

const startWatchers = async (watchers) => {
  const result = await queue(watchers, 1, async (watcher) => {
    await timeout(3000);
    axios.post(`${host}/api/startGekko`, watcher)
      .then(async () => {
        console.log('Started watcher \n');
        console.log(watcher.watch);
      }).catch(e => console.error(e));
  });
  return result;
};

const getWatchersConfigs = (gekkos, watchers) => {
  const needWatcher = gekkos.filter((gekko) => {
    let filterResult = true;
    if (watchers && watchers.length >= 1) {
      return watchers.forEach((watcher) => {
        filterResult = !_.isEqual(watcher.config.watch, gekko.fullConfig.watch);
        return filterResult;
      });
    }
  }).map(item => ({
    type: 'market watcher',
    mode: 'realtime',
    watch: item.fullConfig.watch,
    candleWriter: {
      enabled: true,
      adapter: 'sqlite',
    },
  }));
  const result = _.uniqWith(needWatcher, _.isEqual);
  console.log(result);
  return result;
};

const launchOnPaper = async (gekkos, watchers) => {
  console.log('Hit launchOnPaper()');
  if (watchers && watchers.length >= 1) {
    console.log('Attempting to launch missing watchers');
    await startWatchers(watchers);
    await timeout(5000); // just wait 5 secs yay
  }

  const extension = {
    market: {
      type: 'leech',
      from: moment().add(30, 'seconds').toISOString(),
    },
    mode: 'realtime',
    type: 'paper trader',
  };
  const prepedData = gekkos.map(item => _.extend(item.fullConfig, extension));
  const result = await queue(prepedData, 1, async (quededItemData) => {
    await timeout(5000);
    axios.post(`${host}/api/startGekko`, quededItemData)
      .then(async () => {
        console.log('Launched paper trader');
      }).catch((e) => {
        console.error('error strating paper gekko');
        console.error(e);
      });
  });
  return result;
};

const compare = (runningGekkos, newResults) => {
  const result = newResults.filter((resultItem) => {
    let filterRes = true;
    if (runningGekkos && runningGekkos.length >= 1) {
      runningGekkos.forEach((runningGekko) => {
        const matchAdvisor = !_.isEqual(resultItem.fullConfig.tradingAdvisor, runningGekko.config.tradingAdvisor);
        const matchStrategyConfig = !_.isEqual(resultItem.stratConfig, runningGekko.config[runningGekko.config.tradingAdvisor.method]);
        if (!(matchAdvisor && matchStrategyConfig)) {
          console.log('Found one already running \n');
        }
        filterRes = matchAdvisor && matchStrategyConfig;
      });
    }
    return filterRes;
  });
  // console.log(result);
  return result;
};

db.sync().then(async () => {
  const results = await getProfitable();
  const newResults = results.map(result => result.toJSON());
  const { paperTraders, marketWatchers } = await getRunningGekkos();
  const compared = _.uniqWith(compare(paperTraders, newResults), _.isEqual);
  const watcherConfigs = getWatchersConfigs(compared, marketWatchers);
  // const finalResult = await launchOnPaper(compared, watcherConfigs);
  process.exit(finalResult);
}).catch(e => console.error(e));
