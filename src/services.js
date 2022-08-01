import fs from 'fs'
import papa from 'papaparse'

import argv from './command_cli.js'
import { convertCurrency } from "./utils.js"

export const getPortfolio = (filePath) => {
    const csvFilePath = filePath;
    let portfolioValue = {}
    
    console.time('Loading file')
  
    let file = fs.createReadStream(csvFilePath);
    papa.parse(file, {
      header: true,
      step: results => {
        /// add portfolio value if token and date meet the condition
        let data = results.data
        if (
          (!argv.token || data.token == argv.token) && 
          (!argv.date || (data.timestamp >= argv.startTimestamp && data.timestamp < argv.endTimestamp))
        ) {
          let amount = Number(data.amount)
          portfolioValue[data.token] = (portfolioValue[data.token] | 0) + (data.transaction_type == 'DEPOSIT' ? amount : -amount)
        }
      },
      complete: async () => {
        console.timeEnd('Loading file')
        console.log()
  
        if (Object.keys(portfolioValue).length === 0) {
          /// if no value is extracted
          if (argv.date && argv.token) {
            console.error(`No ${argv.token} token transacted on ${argv.date}`)
          } else if (argv.date) {
            console.error(`No token transacted on ${argv.date} `)
          } else if (argv.token) {
            console.error(`${argv.token} token not found`)
          } else {
            console.error('No transactions on the CSV')
          }
        } else {
          /// convert token value to usd
          for (let token in portfolioValue){
            portfolioValue[token] *= (await convertCurrency(token, 'USD'))
          }
          
          /// show result
          console.log('Portfolio value in USD')
          console.log(portfolioValue)
        }
      },
      error: err => { console.log(err) }
    });
  }