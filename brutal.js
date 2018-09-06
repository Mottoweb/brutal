const async = require('async')
const rp = require('request-promise')
const fs = require('fs-extra')
const humanize = require('humanize')
const replaceall = require("replaceall")

const queue = require('./queue')
const generateConfigs = require('./configGenerator')
const getMoreMetrics = require('./getMoreMetrics')
const saveToCsv = require('writers/saveToCsv')

const writecsv = true
const writeToDB = true
const parallelqueries = 2

const configs = generateConfigs()
const apiUrl = process.env.URL || 'http://localhost:3000'

hitApi(configs)

//this might look familiar...that's cos it's ripped from Gekkoga <3
async function hitApi(configs) {
  const results = await queue(configs, parallelqueries, async (data) => {
		console.log("Running strategy - "+data.tradingAdvisor.method +" on "+data.tradingAdvisor.candleSize +" minute(s) candle size on "+ data.watch.exchange +" for "+ data.watch.currency + data.watch.asset);
    const body = await rp.post({
      url: `${apiUrl}/api/backtest`,
      json: true,
      body: data,
      headers: { 'Content-Type': 'application/json' },
      timeout: 1200000
    }).catch((err) => {
      console.log('Fetching failed')
      console.log(err)
  	});

  	let result = { profit: 0, metrics: false };

  	if (!body.performanceReport || !body.trades) {
  		console.log('No valid backtest data returned, continiuouning :P')
  		return null
  	}

    const report = body.performanceReport;

    if (report) {
      result = {
        runDate: humanize.date('d-m-Y'),
        runTime: humanize.date('H:i:s'),
        sharpe: report.sharpe ? report.sharpe.toFixed(2) : 0,
        exchange: data.watch.exchange,
        currency: data.watch.currency,
        asset: data.watch.asset,
        currencyPair: currency + asset,
        method: data.tradingAdvisor.method,
        fullConfig: data,
        stratConfig: data[data.tradingAdvisor.method],
        merket: report.market.toFixed(2),
        relativeProfit: report.relativeProfit.toFixed(2),
        profit: report.profit.toFixed(2),
        startTime: report.startTime,
        endTime: report.endTime,
        candleSize: data.tradingAdvisor.candleSize,
        historySize: data.tradingAdvisor.historySize,
        timespan: report.timespan,
        yearlyProfit: report.yearlyProfit.toFixed(2),
        relativeYearlyProfit: report.relativeYearlyProfit.toFixed(2),
        startPrice: report.startPrice.toFixed(2),
        endPrice: report.endPrice.toFixed(2),
        trades: report.trades,
        startBalance: report.startBalance.toFixed(2),
        alpha: report.alpha.toFixed(2),
        ...getMoreMetrics(body.roundtrips),
      }
    }

    const profitable = report.profit > 0 && report.profit > report.market

		if (writecsv===true && report && profitable) {  
			saveToCsv(result)
		}

    if (writeToDB === true && report && profitable) {

    }

		return result;
  })
	.catch((err)=>{
		throw err
	});
	return results;
}
