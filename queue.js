const { some } = require('bluebird');

function queue(items, parallel, ftc) {

  const queued = [];

  return Promise.all(items.map((item) => {

    const mustComplete = Math.max(0, queued.length - parallel + 1);
    const exec = some(queued, mustComplete).then(() => ftc(item));
    queued.push(exec);

    return exec;

  }))
    .catch((err) => {
      console.log(err)
      throw err
  });

}

module.exports = queue