const chalk = require("chalk");
const { link } = require("../utils");
const config = require("../../config");

const { getWorkspace, getProject } = require("../../api.js");
const { getApiKeyWorWorkspace } = require("../core.js");

function printProject(p) {
    const app_url = config.get("RF_APP_URL");
    // the id here has both the workspace url and project url
    const projectLink = link(`${app_url}/${p.id}`);

    console.log();
    console.log(` ${chalk.bold(p.name)}`);
    console.log(`  link: ${projectLink}`);
    console.log(`  id: ${chalk.green(p.id)}`);
    console.log(`  type: ${chalk.green(p.type)}`);
    console.log(`  versions: ${chalk.green(p.versions)}`);
    console.log(`  images: ${chalk.green(p.images)}`);
    console.log(`  classes: ${chalk.green(Object.keys(p.classes))}`);
}

async function listProjects(options) {
    const workspaceUrl = options.workspace;
    const apiKey = getApiKeyWorWorkspace(workspaceUrl);

    const workspaceData = await getWorkspace(workspaceUrl, apiKey);

    const projects = workspaceData.workspace?.projects;

    for (let p of projects) {
        printProject(p);
    }

    console.log();
}

async function projectDetails(projectId, options) {
    let workspaceUrl = options.workspace;
    let projectUrl = projectId;

    // if project id is given as workspace / project id
    // split it and use those values
    if (projectId.includes("/")) {
        [workspaceUrl, projectUrl] = projectId.split("/");
    }

    console.log(workspaceUrl, projectUrl);

    const apiKey = getApiKeyWorWorkspace(workspaceUrl);

    const result = await getProject(workspaceUrl, projectUrl, apiKey);
    console.log(result);
}

module.exports = {
    listProjects,
    projectDetails
};
