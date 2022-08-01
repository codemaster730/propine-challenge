# Propine Challenge

## Requirements

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

## Usage

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

## Design decisions

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


### 3. Error Handling

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

## Structure of the source code

<pre>
├── LICENSE
├── package.json
├── README.md
├── src
│  ├── config.js
│  ├── command_cli.js
│  ├── services.js
│  └── utils.js
└── index.js
</pre>

I made the structure of the source code simple, no folders for category because it's enough for 4 files.
I like keeping things simple - In fact, 'small is good, short is better and simple is best'.

### config.js
This is where we put the configuration files such as file names, and the urls to be fetched.
We can also set urls and api key as environment variables if needed.

### command_cli.js
This is where we handle the command-line commands in the project.
I have used `yargs` module to create command-line commands in node.js and makes command-line arguments flexible and easy to use.

### services.js
This is where we implement functionalities in commands.
Currently we only have 'portfolio' command and for this command, getPortfolio function is defined in this file.

### utils.js
This file contains the various utilization functions.

convertCurrency: Get the current price of any cryptocurrency in any other currency that you need.
isValidDate: Check if input the date is vaild.
dateToTimeStamp: Convert date format to timestamp format.