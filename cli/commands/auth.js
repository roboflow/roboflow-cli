const open = require("open");
const enquirer = require("enquirer");
const chalk = require("chalk");
const axios = require("axios");

const config = require("../../config.js");
const selectDefaultWorkspace = require("./selectDefaultWorkspace.js");

module.exports = async function auth() {
    const authUrl = `${config.get("RF_APP_URL")}/auth-cli`;

    try {
        console.log("opening webrowser for you to log in and retrieve auth token...");
        open(authUrl);
    } catch (e) {
        console.log();
        console.log(chalk.red("failed to open a webrowser."));
    }

    console.log(
        chalk.bold(`
****************
if you are on a headless system without a browser, open the following url in another browser to retrieve your auth token:

${chalk.green(authUrl)}

****************`)
    );
    console.log();
    console.log();

    //ask for the auth token from the web UI
    const token_input = await enquirer.prompt({
        type: "text",
        name: "cli_auth_token",
        message: "Please paste the cli auth token displayed in the webrowser"
    });

    // fetch workspace info and auth data using the auth token
    const cli_auth_token = token_input.cli_auth_token;

    try {
        // console.log("GET", `${config.get("RF_APP_URL")}/query/cliAuthToken/${cli_auth_token}`);
        const authDataResponse = await axios.get(
            `${config.get("RF_APP_URL")}/query/cliAuthToken/${cli_auth_token}`
        );
        const authData = authDataResponse.data;
        config.set("workspaces", authData);
    } catch (e) {
        console.error(chalk.red("failed to validate auth token"));
        console.log(e);
    }

    await selectDefaultWorkspace();
};
