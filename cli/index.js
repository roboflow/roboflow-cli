#! /usr/bin/env node

const { Command, Option } = require("commander");

const auth = require("./commands/auth.js");

const configuration = require("./commands/configuration.js");
const workspaceCommands = require("./commands/workspace.js");
const projectCommands = require("./commands/project.js");
const upload = require("./commands/upload.js");
const open = require("./commands/open.js");
const download = require("./commands/download.js");

const inference = require("./commands/inference.js");

const config = require("../config.js");

global.debug = false;

async function main() {
    const defaultWorkspace = await config.get("RF_WORKSPACE");

    const program = new Command();

    program.version(require("../package.json").version);

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
        .command("config")
        .description("Manage local roboflow config.  Prints config values if run without options")
        .argument("[action]", "'show' or 'reset'.  Default is 'show'", "show")
        .action(configuration);

    program
        .command("open")
        .description("opens a roboflow workspace in your browser")
        .option(
            "-w --workspace [workspace]",
            "specify a workspace url or id (will use default workspace if not specified)",
            defaultWorkspace
        )
        .action(open);

    // workspace subcommands
    const workspace = new Command("workspace").description(
        "workspace related commands.  type 'roboflow workspace' to see detailed command help"
    );
    workspace
        .command("select")
        .description("select a default workspace")
        .action(workspaceCommands.selectDefaultWorkspace);

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
        .option("-c --concurrent [n]", "how many image uploads to perform concurrently", 10)
        .argument("<files...>")
        .option("-b --batch <batch>", "specify a batch to add the uploaded image to")
        .option(
            "-a --annotation <annotationFile>",
            "specify an annotation filename.  you can pass e.g. '[filename].xml to match based on the image filename'"
        )
        .addOption(
            new Option("-s --split <split>", "specify a split value to assign the image").choices([
                "train",
                "valid",
                "test"
            ])
        )
        .action(upload.uploadImage);

    program
        .command("import")
        .description("import a dataset from a local folder to your project")
        .option(
            "-w --workspace [workspace]",
            "specify a workspace url or id (will use default workspace if not specified)",
            defaultWorkspace
        )
        .option(
            "-p --project [project]",
            "specify a project url or id (or the program will prompt you to select which project in your workspace to upload to)"
        )
        .option("-c --concurrent [n]", "how many image uploads to perform concurrently", 10)
        .argument("<folder>", "filesystem path to a folder that contains your dataset")

        .action(upload.importDataset);

    program
        .command("download")
        .description(
            "download a dataset version from a your workspace or roboflow universe.  The dataset will be downloaded to the current working directory."
        )
        .option(
            "-w --workspace [workspace]",
            "specify a workspace url or id (will use default workspace if not specified)",
            defaultWorkspace
        )
        .option(
            "-v --version [version]",
            "specify a dataset version to download (will override the version specified in the datasetUrl if specified)"
        )
        .addOption(
            new Option(
                "-f --format [format]",
                "Specify the format to download the version in.  The supported format depends on the dataset type; if you don't pass a specific format, you will get an interactive prompt to pick a format supported for the dataset type."
            ).choices([
                "coco",
                "yolov5pytorch",
                "yolov7pytorch",
                "my-yolov6",
                "darknet",
                "voc",
                "tfrecord",
                "createml",
                "clip",
                // "folder", //not supported via API yet
                "multiclass",
                "coco-segmentation",
                "yolo5-obb",
                "png-mask-semantic"
            ])
        )

        .argument("<datasetUrl>", "dataset url (e.g.: `roboflow-100/cells-uyemf/2`)")

        .action(download.downloadDataset);

    program
        .command("infer")
        .description("perform object detection inference on an image")
        .requiredOption(
            "-m --model <model>",
            "model id (id of a version with trained model e.g. my-project/3)"
        )
        .option(
            "-c --confidence [threshold]",
            "specify a confidence threshold between 0.0 and 1.0, default is 0.5 (only applies to object-detection models)"
        )
        .option(
            "-o --overlap [threshold]",
            "specify an overlap threshold between 0.0 and 1.0, default is 0.5 (only applies to object-detection models)",
            0.5
        )
        .option(
            "-w --workspace [workspace]",
            "specify a workspace url or id (will use default workspace if not specified)",
            defaultWorkspace
        )
        .addOption(
            new Option(
                "-t --type [modelType]",
                `specify the model type to skip api call to look it up`
            ).choices([
                "object-detection",
                "classification",
                "instance-segmentation",
                "semantic-segmentation"
            ])
        )
        .argument("<file>", "filesystem path to an image file")
        .action(inference.infer);

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
