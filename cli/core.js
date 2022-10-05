const chalk = require("chalk");
const enquirer = require("enquirer");
const config = require("../config.js");

const { getWorkspace } = require("../api.js");

function getApiKeyWorWorkspace(workspaceId) {
    const workspaces = config.get("workspaces");

    if (!workspaces) {
        console.log(
            "No workspaces found. You may need to run " + chalk.bold("roboflow auth") + " first"
        );
        process.exit(1);
    }

    const workspaceConf = Object.values(workspaces).find(
        (ws) => ws.url == workspaceId || ws.id == workspaceId
    );

    if (!workspaceConf.apiKey) {
        console.log(
            "Could not find api key for the specified workspace. You may need to run " +
                chalk.bold("roboflow auth") +
                " first"
        );
        process.exit(1);
    }

    return workspaceConf.apiKey;
}

async function selectWorkspace() {
    const workspaces = config.get("workspaces");

    if (!workspaces) {
        console.log(
            "No workspaces found. You may need to run " + chalk.bold("roboflow auth") + "first"
        );
    }

    if (Object.keys(workspaces).length == 1) {
        return Object.values(workspaces)[0].url;
    }

    // ask user to select default work
    const prompt = new enquirer.Select({
        name: "default workspace",
        message: "Pick a default workspace",
        choices: Object.keys(workspaces).map((workspaceId) => {
            return {
                name: `${workspaces[workspaceId].name} (${workspaces[workspaceId].url})`,
                value: workspaces[workspaceId].url
            };
        }),

        result(choice) {
            return this.map(choice)[choice];
        }
    });

    const answer = await prompt.run();

    return answer;
}

async function selectProjectFromWorkspace(workspaceUrl) {
    const apiKey = getApiKeyWorWorkspace(workspaceUrl);
    const workspaceData = await getWorkspace(workspaceUrl, apiKey);
    const projects = workspaceData.workspace?.projects;

    const choices = projects.map((project) => {
        return {
            name: `${chalk.bold(project.name)}  (${project.id})`,
            value: project.id
        };
    });

    // ask user to select default work
    const prompt = new enquirer.Select({
        name: "select project",
        message: `Select a project from the workspace (${workspaceUrl})`,
        choices: choices,

        result(choice) {
            return this.map(choice)[choice];
        }
    });

    const answer = await prompt.run();

    return answer;
}

module.exports = {
    getApiKeyWorWorkspace,
    selectWorkspace,
    selectProjectFromWorkspace
};
