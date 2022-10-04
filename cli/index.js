#! /usr/bin/env node

const { Command } = require("commander");

const auth = require("./commands/auth.js");

const printConfig = require("./commands/printConfig.js");
const reset = require("./commands/reset.js");
const selectDefaultWorkspace = require("./commands/selectDefaultWorkspace.js");
const listWorkspaces = require("./commands/listWorkspaces.js");
const listProjects = require("./commands/listProjects.js");
const upload = require("./commands/upload.js");

const inference = require("./commands/inference.js");

const config = require("../config.js");

global.debug = false;

async function main() {
    const defaultWorkspace = await config.get("RF_WORKSPACE");

    const program = new Command();

    program.version("0.0.1");

    program.option("-d, --debug", "print verbose debugging info").on("option:debug", function () {
        console.log("enabling debug logging");
        global.debug = true;
    });

    program
        .command("auth")
        .description("log in to roboflow to store auth credentials for your workspaces")
        .action(auth);

    program.command("config").description("displays the current configuration").action(printConfig);

    program.command("reset").description("resets all config and auth settings").action(reset);

    program
        .command("detect")
        .description("perform object detection inference on an image")
        .requiredOption(
            "-m --model <model>",
            "model id (id of a version with trained model e.g. my-project/3)"
        )
        .option(
            "-w --workspace [workspace]",
            "specify a workspace url or id (will use default workspace if not specified)",
            defaultWorkspace
        )
        .argument("<file>", "filesystem path to an image file")
        .action(inference.detectObject);

    program
        .command("upload")
        .description("upload a file to your project")
        .option(
            "-w --workspace [workspace]",
            "specify a workspace url or id (will use default workspace if not specified)",
            defaultWorkspace
        )
        .option(
            "-p --project [project]",
            "specify a project url or id (or the program will prompt you to select which project in your workspace to upload to)"
        )
        .argument("<files...>")
        .action(upload);

    // workspace subcommands
    const workspace = new Command("workspace").description(
        "workspace related commands.  type 'roboflow workspace' to see detailed command help"
    );
    workspace
        .command("select")
        .description("select a default workspace")
        .action(selectDefaultWorkspace);

    workspace.command("list").description("list workspaces").action(listWorkspaces);

    program.addCommand(workspace);

    // project subcommands
    const project = new Command("project").description(
        "project related commands.  type 'roboflow project' to see detailed command help"
    );

    project
        .command("list")
        .description("list projects")
        .option(
            "-w --workspace [workspace]",
            "specify a workspace url or id (will use default workspace if not specified)",
            defaultWorkspace
        )
        .action(listProjects);

    program.addCommand(project);

    try {
        await program.parseAsync();
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

main();
