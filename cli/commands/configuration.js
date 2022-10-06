const config = require("../../config.js");
const chalk = require("chalk");
const { prompt } = require("enquirer");

const log = console.log;

module.exports = async function configuration(action) {
    if (action == "show") {
        await printConfig();
    }

    if (action == "reset") {
        await reset();
    }
};

async function printConfig() {
    log(chalk.green(`Config file is stored at: ${chalk.bold(config.configFile)}`));
    log(`\nYour current config values:`);
    log({ ...config.getAll() });
}

async function reset() {
    const answer = await prompt({
        type: "confirm",
        name: "confirm",
        message: "This will delete you local configuration!  Are you sure?"
    });

    if (answer.confirm) {
        log(chalk.red("local config reset"));
        await config.clear();
        printConfig();
    } else {
        console.log("local config unchanged");
        printConfig();
    }
}
