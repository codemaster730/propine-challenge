import fetch from 'node-fetch'
import { crypto_url, crypto_key } from "./config.js"

//Get the current price of any cryptocurrency in any other currency that you need.
export const convertCurrency = async (_from, _to) => {
    try {
      /// prepare url
      let url = new URL(crypto_url)
      url.search = new URLSearchParams({
        fsym: _from,
        tsyms: _to,
        api_key: crypto_key
      }).toString()
  
      /// fetch and return price
      let response = await fetch(url)
      if (response.ok) {
        response = await response.json()
        if (response.Response == 'Error') {
          throw new Error(response.Message)
        }
        return response[_to]
      }
    } catch (err) {
      console.log('Convert Currency Error:', err.message)
    }
}

export const dateToTimeStamp = date => {
    date = new Date(`${date}T00:00:00`)
    let userTimezoneOffset = date.getTimezoneOffset() * 60
  
    const startTimestamp = date.getTime() / 1000 - userTimezoneOffset
    const endTimestamp = startTimestamp + 24 * 60 * 60
  
    return [startTimestamp, endTimestamp]
}

export const isValidDate = date => {
    date = new Date(`${date}T00:00:00`)
    return date instanceof Date && !isNaN(date)
}