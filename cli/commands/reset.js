const open = require("open");

const conf = require("../../config.js");
const chalk = require("chalk");

module.exports = async function reset() {
    conf.clear();
    console.log(chalk.red("all data reset"));
};
