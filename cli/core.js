const chalk = require("chalk");
const enquirer = require("enquirer");
const config = require("../config.js");

const { getWorkspace } = require("../api.js");

function debug_log(message) {
    if (global.debug) {
        console.debug(message);
    }
}

function hasApiKeyForWorkspace(workspaceId) {
    const workspaces = config.get("workspaces");

    if (!workspaces) {
        return false;
    }

    const workspaceConf = Object.values(workspaces).find(
        (ws) => ws.url == workspaceId || ws.id == workspaceId
    );

    if (workspaceConf && workspaceConf.apiKey) {
        return true;
    }

    return false;
}

function getApiKeyForWorkspace(workspaceId) {
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
        console.log(
            "Nothing to select from, only 1 default workspace authorized:",
            chalk.green(Object.values(workspaces)[0].url)
        );
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
    const apiKey = getApiKeyForWorkspace(workspaceUrl);
    const workspaceData = await getWorkspace(workspaceUrl, apiKey);
    const projects = workspaceData.workspace?.projects;

    if (!projects || projects.length == 0) {
        console.log(
            chalk.red("No projects found in this workspace. You may need to create one first")
        );
        console.log(
            "You can create a project in this workspace here: https://app.roboflow.com/" +
                workspaceUrl
        );
        process.exit(1);
        return;
    }

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

async function selectObjectDetectionFormat() {
    const prompt = new enquirer.Select({
        name: "Select dataset format:",
        message: `Select a format to export this object detection dataset to:`,
        choices: [
            { name: "'coco' (COCO)", value: "coco" },
            { name: "'yolov5pytorch' (YOLOv5 PyTorch)", value: "yolov5pytorch" },
            { name: "'yolov7pytorch' (YOLOv7 PyTorch)", value: "yolov7pytorch" },
            { name: "'my-yolov6' (meituan/YOLOv6)", value: "my-yolov6" },
            { name: "'darknet' (YOLO Darknet)", value: "darknet" },
            { name: "'voc' (Pascal VOC)", value: "voc" },
            { name: "'tfrecrod' (Tensorflow TFRecord)", value: "tfrecrod" },
            { name: "'createml' (CreateML)", value: "createml" },
            { name: "'clip' (OpenAI CLIP Classification)", value: "clip" },
            { name: "'multiclass' (Multi Label Classification CSV)", value: "multiclass" }
        ],

        result(choice) {
            return this.map(choice)[choice];
        }
    });

    const answer = await prompt.run();

    return answer;
}

async function selectClassificationFormat() {
    const prompt = new enquirer.Select({
        name: "Select dataset format:",
        message: `Select a format to export this classification dataset to:`,
        choices: [
            { name: "'clip' (OpenAI CLIP Structure)", value: "clip" },
            { name: "'multiclass' (Multi Label Classification CSV)", value: "multiclass" }
            // { name: "'folder' (Folder Structure)", value: "folder" } // not supported via API yet
        ],

        result(choice) {
            return this.map(choice)[choice];
        }
    });

    const answer = await prompt.run();

    return answer;
}

async function selectInstanceSegFormat() {
    // ask user to select default work
    const prompt = new enquirer.Select({
        name: "Select dataset format:",
        message: `Select a format to export this instance segmentation dataset to:`,
        choices: [
            { name: "'coco-segmentation' (Coco Segmentation)", value: "coco-segmentation" },
            { name: "'yolo5-obb' (YOLOv5 Oriented Bounding Boxes)", value: "yolo5-obb" },
            {
                name: "'multiclass' (Converts to Classification: Multi Label Classification CSV, )",
                value: "multiclass"
            },
            { name: "'clip' (Converts to Classification: OpenAI CLIP)", value: "clip" },
            { name: "'coco' (Converts to Object-Detection: COCO)", value: "coco" },
            {
                name: "'yolov5pytorch' (Converts to Object-Detection: YOLOv5 PyTorch)",
                value: "yolov5pytorch"
            },
            {
                name: "'yolov7pytorch' (Converts to Object-Detection: YOLOv7 PyTorch)",
                value: "yolov7pytorch"
            },
            {
                name: "'my-yolov6' (Converts to Object-Detection: meituan/YOLOv6)",
                value: "my-yolov6"
            },
            { name: "'darknet' (Converts to Object-Detection: YOLO Darknet)", value: "darknet" },
            { name: "'voc' (Converts to Object-Detection: Pascal VOC)", value: "voc" },
            {
                name: "'tfrecrod' (Converts to Object-Detection: Tensorflow TFRecord)",
                value: "tfrecrod"
            },
            { name: "'createml' (Converts to Object-Detection: CreateML)", value: "createml" }
        ],

        result(choice) {
            return this.map(choice)[choice];
        }
    });

    const answer = await prompt.run();

    return answer;
}

async function selectSemanticSegFormat() {
    // ask user to select default work
    const prompt = new enquirer.Select({
        name: "Select dataset format:",
        message: `Select a format to export this instance segmentation dataset to:`,
        choices: [
            { name: "'coco-segmentation' (Coco Segmentation)", value: "coco-segmentation" },
            {
                name: "'png-mask-semantic' (Semantic Segmentation Masks)",
                value: "png-mask-semantic"
            }
        ],

        result(choice) {
            return this.map(choice)[choice];
        }
    });

    const answer = await prompt.run();

    return answer;
}

function selectExportFormat(datasetType) {
    if (datasetType == "object-detection") {
        return selectObjectDetectionFormat();
    } else if (datasetType == "classification") {
        return selectClassificationFormat();
    } else if (datasetType == "instance-segmentation") {
        return selectInstanceSegFormat();
    } else if (datasetType == "semantic-segmentation") {
        return selectSemanticSegFormat();
    }

    throw new Error(`Error can't choose export format for unknown dataset type: ${datasetType}`);
}

module.exports = {
    debug_log,
    hasApiKeyForWorkspace,
    getApiKeyForWorkspace,
    selectWorkspace,
    selectProjectFromWorkspace,
    selectExportFormat
};
