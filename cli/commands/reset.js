const open = require("open");

const config = require("../../config.js");
const chalk = require("chalk");

module.exports = async function reset() {
    config.clear();
    console.log(chalk.red("all data reset"));
};
