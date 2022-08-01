import argv from './command_cli.js'
import { getPortfolio } from './src/function.js'
import { COMMAND, fileName } from './src/config.js';
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

switch (argv.command) {
  case COMMAND.portfolio:
    let filePath = path.resolve(__dirname, fileName);
    getPortfolio(filePath)
    break

  default:
    console.error(`${argv.command} is not a valid command`)
}
