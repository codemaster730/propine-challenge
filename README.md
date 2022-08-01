# CurrencyConverter

## What to solve

* Given no parameters, return the latest portfolio value per token in USD.
* Given a token, return the latest portfolio value for that token in USD.
* Given a date, return the portfolio value per token in USD on that date.
* Given a date and a token, return the portfolio value of that token in USD on that date.


---

## Structure of CSV

* timestamp: Integer number of seconds since the Epoch
* transaction_type: Either a DEPOSIT or a WITHDRAWAL
* token: The token symbol
* amount: The amount transacted

| timestamp | transaction_type | token | amount |
|:---:|:---:|:---:|:---:|
| 1571967208 | DEPOSIT | BTC | 0.29866 |
| 1571967200 | DEPOSIT | ETH | 0.68364 |
| 1571967189 | WITHDRAWAL | XRP | 0.493839 |


---

## Dependencies

> **yargs:** Helps build interactive command line tools, by parsing arguments and generating an elegant user interface.

> **fs:** Provides a lot of very useful functionality to access and interact with the file system.

> **papaparse:** Fast and powerful CSV parser for the browser that supports web workers and streaming large files. Converts CSV to JSON and JSON to CSV.

> **node-fetch:** A light-weight module that brings Fetch API to node.js.


---

## How to run the program

> Copy the `transactions.csv` in current folder.

> Use the `portfolio` command to run this program.

### 1. Show help

```sh
node index.js help
```

### 2. Show help for portfolio command

```sh
node index.js portfolio --help
```

or

```sh
node index.js portfolio -h
```

### 3. Given no parameters, return the latest portfolio value per token in USD

```sh
node index.js portfolio
```

### 4. Given a token, return the latest portfolio value for that token in USD

```sh
node index.js portfolio --token BTC
```

or

```sh
node index.js portfolio -t BTC
```

### 5. Given a date, return the portfolio value per token in USD on that date

```sh
node index.js portfolio --date 2019-10-25
```

or

```sh
node index.js portfolio -d 2019-10-25
```

### 6. Given a date and a token, return the portfolio value of that token in USD on that date

***Note***\*: Date must be on YYYY-MM-DD format\*

```sh
node index.js portfolio --token BTC --date 2019-10-25
```

or

```sh
node index.js portfolio -t BTC -d 2019-10-25
```


---

## Design decisions to solve this problem

### 1. Setting Configuration variables

crypto_key=`64 length hex string`

crypto_url=https://min-api.cryptocompare.com/data/price

These are used to convert one currency to another.

### 2. Parsing the contents of CSV

I have tried `csv-parser` and `papaparse` module to parse the contents of csv.

|    | Load Time (sec) | Downloads in past 1 Year |
|:---:|:---:|:---:|
| **csv-parser** | 70 | 740480 |
| **papaparse** | 45 | 1174560 |

### 3. Command Line Program

I have used `yargs` module to create command-line commands in node.js and makes command-line arguments flexible and easy to use.

* Command without any arguments
* Command with token as an argument
* Command with date as an argument
* Command with both token and date as an arguments

#### How to setup yargs

```js
 yargs(hideBin(process.argv))
  .usage('node $0 <command> [options]')
  .command('portfolio', 'List the portfolio of the token', yargs => {
    return yargs
      .option({
        token: {
          alias: 't',
          description: 'Enter token name',
          type: 'string',
        },
        date: {
          alias: 'd',
          description: 'Enter date in YYYY-MM-DD format',
          type: 'string',
        },
      })
      .strictOptions()
      .check((arg, options) => {
        arg.command = arg._[0]
        
        /// check token
        if ('token' in arg) {
          if (!arg.token) {
            throw new Error('Enter token name')
          }
        }
        
        /// check date and convert it to epoch timestamp
        if ('date' in arg) {
          if (arg.date) {
            if (isValidDate(arg.date)) {
              let [startTimestamp, endTimestamp] = dateToEpochTime(arg.date)
              arg.startTimestamp = startTimestamp
              arg.endTimestamp = endTimestamp
            } else {
              throw new Error('Enter valid date in YYYY-MM-DD format')
            }
          } else {
            throw new Error('Enter date')
          }
        }

        return true
      })
  })
  .strictCommands()
  .check((arg, options) => {
    if (!(arg._[0] in COMMAND)) {
      throw new Error('Enter valid command')
    }
    return true
  })
  .help()
  .alias('version', 'v')
  .alias('help', 'h').argv
```

#### I have created:

* `portfolio` command
  * `--token` and `-t` options to pass the token name
  * `--date` and `-d` option to pass the date.
  * Any other options will be invalid as `strictOptions()`
* Any other commands will be invalid as `strictCommands()`.

If we need any other commands or options in the future, we can add it later.

To make the code more manageable, I have used the command approach as mor multiple commands may be needed.

If token or date is passed as an arguments, they are validated before passing to the main function.

### 4. Error Handling

#### 1). If token name is missing

```js
node index.js portfolio --token
```

If `--token` option is enabled but no token name is passed, `check()` function throws an error `Enter token name` and program gets terminated.

#### 2). If date is missing

```
node index.js portfolio --date
```

If `--date` option is enabled but no date is passed didn't pass any date, `check()` function throws an error `Enter date` and program gets terminated.

#### 3). If invalid date is entered

```js
node index.js portfolio --date xxx
```

If given date is not format in `YYYY-MM-DD`, `check()` function throws an error `Enter valid date in YYYY-MM-DD format` and program gets terminated.

#### 4). For invalid token name

We console the error `Given token not found`.

#### 5). If there are no transactions on given date

We console the error `No token transacted on given date`.

### 5. Generating start epoch time and end epoch time for a given date.

For a given date, it is needed to get start epoch timestamp and end epoch timestamp as epoch timestamp is in the csv file.

By default, javascript returns the time in ms considering the timezone so
timezoneOffset is deducted to convert it into UTC epoch time.

startTimestamp and endTimestamp are embedded inside argv.

```js
const dateToTimeStamp = date => {
  date = new Date(`${date}T00:00:00`)
  let userTimezoneOffset = date.getTimezoneOffset() * 60

  const startTimestamp = date.getTime() / 1000 - userTimezoneOffset
  const endTimestamp = startTimestamp + 24 * 60 * 60

  return [startTimestamp, endTimestamp]
}
```

### 6. Convert the portfolio value of token to USD using CryptoCompare API

I have created free API key to make use of this endpoint in our app which I have stored in config.js file.

I have gone through the cryptocompare API documentation where I found https://min-api.cryptocompare.com/data/price REST API
endpoint to be used to convert from one currency to another.

Three params are required to call this endpoint.

* fsym: The cryptocurrency symbol of interest \[ Min length - 1\] \[ Max length - 30\]
* tsysms: Comma separated cryptocurrency symbols list to convert into \[ Min length - 1\] \[ Max length - 500\]
* api_key
