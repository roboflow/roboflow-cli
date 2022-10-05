const chalk = require("chalk");

const { getWorkspace } = require("../../api.js");
const { getApiKeyWorWorkspace } = require("../core.js");

module.exports = async function listProjects(options) {
    const workspaceUrl = options.workspace;
    const apiKey = getApiKeyWorWorkspace(workspaceUrl);

    const workspaceData = await getWorkspace(workspaceUrl, apiKey);

    const projects = workspaceData.workspace?.projects;

    for (let p of projects) {
        console.log();
        console.log(` ${chalk.bold(p.name)}`);
        console.log(`  id: ${chalk.green(p.id)}`);
        console.log(`  type: ${chalk.green(p.type)}`);
        console.log(`  versions: ${chalk.green(p.versions)}`);
        console.log(`  images: ${chalk.green(p.images)}`);
        console.log(`  classes: ${chalk.green(Object.keys(p.classes))}`);
    }

    console.log();
};
