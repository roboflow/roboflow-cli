const conf = require("../../config.js");
const chalk = require("chalk");

const log = console.log;

module.exports = async function printConfig(options) {
    log(chalk.green(`Config file is stored at: ${chalk.bold(conf.path)}`));
    log(`config values:`);
    log({ ...conf.store });
};
