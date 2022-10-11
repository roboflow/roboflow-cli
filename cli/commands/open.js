const open = require("open");
const enquirer = require("enquirer");
const chalk = require("chalk");
const axios = require("axios");

const config = require("../../config.js");

module.exports = async function openRoboflow(options) {
    return openWorkspace(options);
};

async function openWorkspace(options) {
    const app_url = config.get("RF_APP_URL");
    let workspaceUrl = await config.get("RF_WORKSPACE");

    // could be a bool if just called with -w
    if (typeof options.workspace === "string" || options.workspace instanceof String) {
        workspaceUrl = options.workspace;
    }

    if (workspaceUrl) {
        open(`${app_url}/${workspaceUrl}`);
    } else {
        open(`${app_url}`);
    }
}
