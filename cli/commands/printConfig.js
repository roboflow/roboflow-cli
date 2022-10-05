const config = require("../../config.js");
const chalk = require("chalk");

const log = console.log;

module.exports = async function printConfig(options) {
    log(chalk.green(`Config file is stored at: ${chalk.bold(config.configFile)}`));
    log(`config values:`);
    log({ ...config.getAll() });
};
