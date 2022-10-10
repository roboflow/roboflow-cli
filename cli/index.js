#! /usr/bin/env node

const { Command, Option } = require("commander");

const auth = require("./commands/auth.js");

const configuration = require("./commands/configuration.js");
const selectDefaultWorkspace = require("./commands/selectDefaultWorkspace.js");
const workspaceCommands = require("./commands/workspace.js");
const projectCommands = require("./commands/project.js");
const upload = require("./commands/upload.js");
const open = require("./commands/open.js");

const inference = require("./commands/inference.js");

const config = require("../config.js");

global.debug = false;

async function main() {
    const defaultWorkspace = await config.get("RF_WORKSPACE");

    const program = new Command();

    program.version("0.0.1");

    program.addHelpText(
        "before",
        `\nWelcome to the roboflow CLI: computer vision at your fingertips 🪄\n`
    );

    program.option("-d, --debug", "print verbose debugging info").on("option:debug", function () {
        console.log("enabling debug logging");
        global.debug = true;
    });

    program
        .command("auth")
        .description("log in to roboflow to store auth credentials for your workspaces")
        .action(auth);

    program
        .command("open")
        .description("opens a roboflow workspace in your browser")
        .option(
            "-w --workspace [workspace]",
            "specify a workspace url or id (will use default workspace if not specified)",
            defaultWorkspace
        )
        .action(open);

    program
        .command("detect")
        .description("perform object detection inference on an image")
        .requiredOption(
            "-m --model <model>",
            "model id (id of a version with trained model e.g. my-project/3)"
        )
        .option(
            "-c --confidence [threshold]",
            "specify a confidence threshold between 0.0 and 1.0, default is 0.5"
        )
        .option(
            "-o --overlap [threshold]",
            "specify an overlap threshold between 0.0 and 1.0, default is 0.5",
            0.5
        )
        .option(
            "-w --workspace [workspace]",
            "specify a workspace url or id (will use default workspace if not specified)",
            defaultWorkspace
        )
        .argument("<file>", "filesystem path to an image file")
        .action(inference.detectObject);

    program
        .command("classify")
        .description("perform classification on an image")
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
        .action(inference.classify);

    program
        .command("instance-segmentation")
        .description("perform instance segmentation on an image")
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
        .action(inference.instanceSegmentation);

    program
        .command("semantic-segmentation")
        .description("perform semantic segmentation on an image")
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
        .action(inference.semanticSegmentation);

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
        .option("-b --batch <batch>", "specify a batch to add the uploaded image to")
        .option(
            "-a --annotation <annotationFile>",
            "specify an annotation filename.  you can pass e.g. '[filename].xml to match based on the image filename'"
        )
        .addOption(
            new Option(
                "-s --split <split>",
                "specify a split value to assign the image ('train', 'valid', or 'test')"
            ).choices(["train", "valid", "test"])
        )
        .action(upload.uploadImage);

    // workspace subcommands
    const workspace = new Command("workspace").description(
        "workspace related commands.  type 'roboflow workspace' to see detailed command help"
    );
    workspace
        .command("select")
        .description("select a default workspace")
        .action(selectDefaultWorkspace);

    workspace
        .command("get")
        .description("show detailed info for a workspace")
        .option(
            "-w --workspace [workspace]",
            "specify a workspace url or id (will use default workspace if not specified)",
            defaultWorkspace
        )
        .action(workspaceCommands.workspaceDetails);

    workspace
        .command("list")
        .description("list workspaces")
        .action(workspaceCommands.listWorkspaces);

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
        .action(projectCommands.listProjects);

    project
        .command("get")
        .description("show detailed info for a project")
        .option(
            "-w --workspace [workspace]",
            "specify a workspace url or id (will use default workspace if not specified)",
            defaultWorkspace
        )
        .argument("<projectId>")
        .action(projectCommands.projectDetails);

    program.addCommand(project);

    program
        .command("config")
        .description("Manage local roboflow config.  Prints config values if run without options")
        .argument("[action]", "'show' or 'reset'.  Default is 'show'", "show")
        .action(configuration);

    try {
        await program.parseAsync();
    } catch (e) {
        console.error(e.message);
        if (global.debug) {
            console.log("[debug]", e);
        }

        process.exit(1);
    }
}

main();
