const config = require("../../config.js");
const chalk = require("chalk");

module.exports = async function listWorkspaces() {
    const workspaces = config.get("workspaces");
    const defaultWorkspaceUrl = config.get("RF_WORKSPACE");

    if (!workspaces) {
        console.log(
            "No workspaces found. You may need to run " + chalk.bold("roboflow auth") + " first"
        );
        return;
    }

    const defaultWorkspace = Object.values(workspaces).find((w) => (w.url = defaultWorkspaceUrl));

    console.log();
    console.log(`${chalk.bold.green("Default Workspace:")}`);
    console.log(` ${chalk.bold(defaultWorkspace.name)}`);
    console.log(`  url: ${chalk.yellow(defaultWorkspace.url)}`);
    console.log(`  id: ${chalk.yellow(defaultWorkspace.id)}`);

    console.log();
    console.log(`Other  Workspaces:`);

    for (let workspaceId of Object.keys(workspaces)) {
        if (workspaceId == defaultWorkspace.id) continue;
        const workspaceName = workspaces[workspaceId].name;
        const workspaceUrl = workspaces[workspaceId].url;

        console.log(` ${chalk.bold(workspaceName)}`);
        console.log(`  url: ${chalk.yellow(workspaceUrl)}`);
        console.log(`  id: ${chalk.yellow(workspaceId)}`);
        console.log();
    }
};
