const async = require('async');
const nodemailer = require('nodemailer');
const randomExt = require('random-ext');
const rp = require('request-promise');
const { some } = require('bluebird');
const fs = require('fs-extra');
const flat = require('flat');
const util = require('util');
const humanize = require('humanize');
var replaceall = require("replaceall");

//setup variables
var viableStrategies = [];
var stratKey = "";
var configs =[];
var count=0;
//configuration elements
//starting with paths and the all important gekko config
//where are your gekko strategies?
var strategiesFolder = '../gekko/strategies/';
//where is your config?
var configFile = '../gekko/config-backtester.js';
//where is your api server? (default is port 3000)
//to run the server type node gekko --ui in to the console
var apiUrl= process.env.URL || "http://localhost:3000";
const config = require(configFile);

//then we setup the filewriter to store the backtests
//if you don't want to write the output to a file then set this to false, but then why the fuck else would you run this....derp
var writecsv = true;
//by default we throw the results into the folder and file you see below, the results will be appended...again....derp.
var resultDir = `${__dirname}/results`


//then we load up the important shit!

//how many backtests do you want to run parralel, 1928374982734 I bet but unless you're armed with a serious bit of pro, multi cpu kit...how about you keep this lower than the number of cores you have for now?
var parallelqueries = 2;

//this is where it gets interesting right?
//RIGHT!!!!
//setup params for backtesting
//fuck json, this is pure arrays as god intended us pony coders to use
//throw in the candle sizes here
// var candleSizes = [5, 10, 15, 20, 25, 30 , 40 ,50, 60, 70, 80, 90, 100, 110, 120];
var candleSizes = randomExt.integerArray(16, 120, 5);
//list different history sizes here
// var historySizes = [20, 30, 50, 100];
var historySizes = randomExt.integerArray(4, 120, 40);
//ooo this looks fun - this is where you set up the trading pairs and back testing exchange data
//you can load up as many sets as you like
var tradingPairs = [
	// ["poloniex","USDT","DASH"],
	// ["poloniex","USDT","BCH"],
	// ["poloniex","USDT","ETC"],
	// ["poloniex","USDT","NXT"],
	// ["poloniex","USDT","LTC"],
	// ["poloniex","USDT","ETH"],
	["poloniex","USDT","XMR"],
	["poloniex","USDT","REP"],
	["poloniex","USDT","STR"],
];
//so this is the number of configs that will be generated with different strategy settings
//if you multiply this by the number of candle sizes and history sizes and trading pairs you'll get the total number of backtests this sucker will run
//Note: if you wanna test candle sizes, against the same config setup then just set this to 1. Cute right???
var numberofruns = 5;

let dirCont = fs.readdirSync( strategiesFolder );

//oh wait, there's more....

//so there is another version of this script that will run every single strategy in your strategy file that has an entry in the config but while useful...it was a bit crap when it came to brute forcing shit. So now you have to enter in your strategy name.
//make sure the strategy has a config entry in the config below
let strategies = ["StochRSI"];



for (var a = 0, len4 = tradingPairs.length; a < len4; a++) {

	for (var j = 0, len1 = candleSizes.length; j < len1; j++) {
		for (var k = 0, len2 = historySizes.length; k < len2; k++) {	
	//check which strategies have equivalent config entries for in the config 
			for (var i = 0, len = numberofruns; i < len; i++) {
				stratKey = strategies[0];
				config.tradingAdvisor.method = stratKey;
				config.tradingAdvisor.candleSize = candleSizes[j];
				config.tradingAdvisor.historySize = historySizes[k];
				config.watch.exchange = tradingPairs[a][0];
				config.watch.currency = tradingPairs[a][1];
				config.watch.asset = tradingPairs[a][2];				
					
					if (this.baseConfig) delete this.baseConfig
					this.baseConfig = {
						watch: {
						  exchange: config.watch.exchange,
						  currency: config.watch.currency,
						  asset: config.watch.asset,									
						},
						paperTrader: {
						  slippage: config.paperTrader.slippage,
						  feeTaker: config.paperTrader.feeTaker,
						  feeMaker: config.paperTrader.feeMaker,
						  feeUsing: config.paperTrader.feeUsing,
						  simulationBalance: config.paperTrader.simulationBalance,
						  reportRoundtrips: true,
						  enabled: true
						},
						tradingAdvisor: {
						  enabled: true,
						  method: config.tradingAdvisor.method,
						  candleSize: config.tradingAdvisor.candleSize ,
						  historySize: config.tradingAdvisor.historySize,  
						},
						StochRSI:{  
						  interval: randomExt.integer(5,1),
						  thresholds: {  
						     low: randomExt.integer(30,10),
						     high: randomExt.integer(90,70),
						     persistence: randomExt.integer(4,2),
						  }
						},
						backtest: {
						  daterange: config.backtest.daterange
						},
						backtestResultExporter:{  
						  enabled:true,
						  writeToDisk:false,
						  data:{  
						     stratUpdates:false,
						     roundtrips:true,
						     stratCandles:true,
						     stratCandleProps:[  
						        'open'
						     ],
						     trades:true
						  }
						},
						performanceAnalyzer:{  
						  riskFreeReturn:2,
						  enabled:true
						},
						valid:true,
						debug: true,
					}
				configs.push(this.baseConfig);
			}
		}
	}	
}	

//by this point you have an array of all the configs you're gonna run. 

//run the backtests against all the stored configs. 
hitApi(configs);


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

      positiveProfitAndSharpe = report.profit > 0 || sharpe > 0

//now we write the backtest results to file:
		if(writecsv===true && report && positiveProfitAndSharpe) {  
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
			let { mostProfitabe, biggestLost, winningPercentage, profitFactor } = getMoreMetrics(body.roundtrips)
			// console.log(getMoreMetrics(body.roundtrips))
			let configCsvTmp1 = JSON.stringify(data[data.tradingAdvisor.method]);
			let configCsv = replaceall(",", "|", configCsvTmp1)
			headertxt = "Strategy,Market performance(%),Strat performance (%),Profit, Winning %, PF, Most Profitable, Biggest Loss,  Run date, Run time, Start date, End date,Currency pair, Candle size, History size,Currency, Asset, Timespan,Yearly profit, Yearly profit (%), Start price, End price, Trades, Start balance, Sharpe, Alpha, Config\n";
			outtxt = data.tradingAdvisor.method+","+ report.market.toFixed(2)+","+ report.relativeProfit.toFixed(2)+","+ report.profit.toFixed(2)+","+ winningPercentage.toFixed(2) +"," +profitFactor.toFixed(2)+ "," +mostProfitabe.toFixed(2)+ "," +biggestLost.toFixed(2)+ "," +runDate+","+runTime+","+ report.startTime+","+ report.endTime+","+ currencyPair+","+ data.tradingAdvisor.candleSize+","+ data.tradingAdvisor.historySize+","+ currency+","+ asset+","+ report.timespan+","+ report.yearlyProfit.toFixed(2)+","+ report.relativeYearlyProfit.toFixed(2)+","+ report.startPrice.toFixed(2)+","+ report.endPrice.toFixed(2)+","+ report.trades+","+ report.startBalance.toFixed(2)+","+ sharpe.toFixed(2)+","+ report.alpha.toFixed(2)+","+ configCsv+"\n";

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

const getMoreMetrics = (roundtrips) => {
	let mostProfitabe = 0
	let biggestLost = 0
	let grossProfit = 0
	let grossLoss = 0
	let winningPercentage = 0
	let profitFactor = 0
	let wins = 0

	roundtrips.forEach((roundtrip) => {
		const { pnl, profit } = roundtrip
		if (pnl > mostProfitabe) mostProfitabe = pnl
		if (pnl < biggestLost) biggestLost = pnl
		if (pnl > 0) grossProfit += pnl
		if (pnl < 0) grossLoss += pnl
		if (profit > 0) wins++
	})

	profitFactor = grossProfit/grossLoss
	winningPercentage = 100 * wins / roundtrips.length

	return { mostProfitabe, biggestLost, winningPercentage, profitFactor }

}


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

