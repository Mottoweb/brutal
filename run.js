const async = require('async');
const rp = require('request-promise');
const fs = require('fs-extra');
const humanize = require('humanize');
const replaceall = require("replaceall");

const queue = require('./queue')
const generateConfigs = require('./configGenerator')
const getMoreMetrics = require('./getMoreMetrics')

const writecsv = true;
const resultDir = `${__dirname}/results`
const parallelqueries = 2

const configs = generateConfigs()

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
    		return result
    	}

      // These properties will be outputted every epoch, remove property if not needed
      const properties = ['balance', 'profit', 'sharpe', 'market', 'relativeProfit', 'yearlyProfit', 'relativeYearlyProfit', 'startPrice', 'endPrice', 'trades'];
      const report = body.performanceReport;

      if (report) {
        let picked = properties.reduce((o, k) => {
          o[k] = report[k];
          return o;
        }, {});
        result = { strat: data.tradingAdvisor.method, startdate: data.backtest.daterange.from, todate: data.backtest.daterange.to, profit: report.profit, sharpe: report.sharpe, metrics: picked };
      }

      profitable = report.profit > 0

//now we write the backtest results to file:
		if(writecsv===true && report && profitable) {  
			let runDate = humanize.date('d-m-Y');
			let runTime = humanize.date('H:i:s');		
			var sharpe = 0;
			if(report.sharpe){
				sharpe = report.sharpe;
			}
			let exchange = data.watch.exchange; 
			let currency = data.watch.currency;
			let asset = data.watch.asset;
			let currencyPair = currency + asset;
			let method = data.tradingAdvisor.method
			let { mostProfitabe, biggestLost, winningPercentage, profitFactor, grossProfit, grossLoss } = getMoreMetrics(body.roundtrips)
			// console.log(getMoreMetrics(body.roundtrips))
			let configCsvTmp1 = JSON.stringify(data[data.tradingAdvisor.method]);
			let configCsv = replaceall(",", "|", configCsvTmp1)
			headertxt = "Strategy,Market perf(%),Strat perf(%),Profit, Winning %, PF, Most Profitable, Biggest Loss, GP, GL,  Run date, Run time, Start date, End date,Currency pair, Candle size, History size,Currency, Asset, Timespan,Yearly profit, Yearly profit (%), Start price, End price, Trades, Start balance, Sharpe, Alpha, Config\n";
			outtxt = data.tradingAdvisor.method+","+ report.market.toFixed(2)+","+ report.relativeProfit.toFixed(2)+","+ report.profit.toFixed(2)+","+ winningPercentage.toFixed(2) +"," +profitFactor.toFixed(2)+ "," +mostProfitabe.toFixed(2)+ "," +biggestLost.toFixed(2)+ "," +grossProfit.toFixed(2)+ ","+grossLoss.toFixed(2)+ "," +runDate+","+runTime+","+ report.startTime+","+ report.endTime+","+ currencyPair+","+ data.tradingAdvisor.candleSize+","+ data.tradingAdvisor.historySize+","+ currency+","+ asset+","+ report.timespan+","+ report.yearlyProfit.toFixed(2)+","+ report.relativeYearlyProfit.toFixed(2)+","+ report.startPrice.toFixed(2)+","+ report.endPrice.toFixed(2)+","+ report.trades+","+ report.startBalance.toFixed(2)+","+ sharpe.toFixed(2)+","+ report.alpha.toFixed(2)+","+ configCsv+"\n";

			const resultCsv = `${resultDir}/${method}.${exchange}.csv`

			if (fs.existsSync(resultCsv)){
				fs.appendFileSync(resultCsv, outtxt, encoding = 'utf8');		
			}else{
				fs.appendFileSync(resultCsv, headertxt, encoding = 'utf8');	
				fs.appendFileSync(resultCsv, outtxt, encoding = 'utf8');				
			}			
		} 

  
		return result;

    })
	.catch((err)=>{
		//console.log(err)
		throw err
	});
	return results;
}
