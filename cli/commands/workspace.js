const config = require("../../config.js");
const chalk = require("chalk");
const { link } = require("../utils");

const { getWorkspace } = require("../../api.js");
const { getApiKeyWorWorkspace, selectWorkspace } = require("../core.js");

require("util").inspect.defaultOptions.depth = null;

function printWorkspace(workspace) {
    const app_url = config.get("RF_APP_URL");
    const workspaceLink = link(`${app_url}/${workspace.url}`);

    console.log(` ${chalk.bold(workspace.name)}`);
    console.log(`  link: ${workspaceLink}`);
    console.log(`  id: ${chalk.yellow(workspace.url)}`);
}

async function selectDefaultWorkspace() {
    const newDefaultWorkspace = await selectWorkspace();
    config.set("RF_WORKSPACE", newDefaultWorkspace);
}

async function listWorkspaces() {
    const workspaces = config.get("workspaces");
    const defaultWorkspaceUrl = config.get("RF_WORKSPACE");

    if (!workspaces) {
        console.log(
            "No workspaces found. You may need to run " + chalk.bold("roboflow auth") + " first"
        );
        return;
    }

    const defaultWorkspace = Object.values(workspaces).find((w) => w.url == defaultWorkspaceUrl);

    if (Object.keys(workspaces).length > 1) {
        console.log();
        console.log(`${chalk.bold.green("Default Workspace:")}`);

        printWorkspace(defaultWorkspace);
        console.log();
        console.log(`Other  Workspaces:`);

        for (let workspaceId of Object.keys(workspaces)) {
            if (workspaceId == defaultWorkspace.id) continue;
            printWorkspace(workspaces[workspaceId]);
            console.log();
        }
    } else {
        printWorkspace(defaultWorkspace);
    }
}

async function workspaceDetails(options) {
    const workspaceUrl = options.workspace;
    const apiKey = getApiKeyWorWorkspace(workspaceUrl);

    const workspaceData = await getWorkspace(workspaceUrl, apiKey);
    console.log(workspaceData);
}

module.exports = {
    listWorkspaces,
    workspaceDetails,
    selectDefaultWorkspace
};
