import open from "open";
import enquirer from "enquirer";
import chalk from "chalk";
import fetch from "node-fetch";

import conf from "../../config.js";
import selectDefaultWorkspace from "./selectDefaultWorkspace.js";

export default async function auth() {
    const authUrl = `https://${conf.get("app_domain")}/auth-cli`;

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
    const authDataRequest = await fetch(
        `https://${conf.get("app_domain")}/query/cliAuthToken/${cli_auth_token}`
    );
    const authData = await authDataRequest.json();
    conf.set("workspaces", authData);

    await selectDefaultWorkspace();
}
