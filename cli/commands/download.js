const fs = require("fs");
const path = require("path");
const axios = require("axios");
const chalk = require("chalk");

var ProgressBar = require("progress");
// const decompress = require("decompress");
const extract = require("progress-extract");
const tempfile = require("tempfile");

const {
    hasApiKeyForWorkspace,
    getApiKeyForWorkspace,
    selectExportFormat,
    debug_log
} = require("../core.js");

const api = require("../../api.js");

function parseDatasetUrlWithVersion(datasetUrl) {
    if (datasetUrl.includes("/")) {
        const parts = datasetUrl.split("/");

        if (parts.length == 3) {
            return {
                workspaceUrl: parts[0],
                projectUrl: parts[1],
                version: parts[2]
            };
        } else if (parts.length == 2) {
            return {
                workspaceUrl: parts[0],
                projectUrl: parts[1],
                version: null
            };
        } else {
            throw new Error("invalid project url");
        }
    } else {
        return {
            workspaceUrl: null,
            datasetUrl: datasetUrl,
            version: null
        };
    }
}

async function getProjectVersions(workspaceUrl, projectUrl, apiKey) {
    const project = await api.getProject(workspaceUrl, projectUrl, apiKey);

    return project.versions || [];
}

async function getLatestVersion(projectData) {
    const availableVersions = projectData.versions || [];
    availableVersions.sort((a, b) => a.created - b.created);

    if (availableVersions.length > 0) {
        const versionUrl = availableVersions[availableVersions.length - 1].id;
        const parsed = parseDatasetUrlWithVersion(versionUrl);

        return parsed.version;
    }

    return null;
}

async function verifyVersionExists(projectData, version) {
    const availableVersions = projectData.versions;
    const versionExists = availableVersions.find((v) => v.id.endsWith(`/${version}`));
    if (!versionExists) {
        throw new Error(`version ${version} does not exist for dataset ${projectData.id}`);
    }
}

async function getDownloadLink(
    workspaceUrl,
    projectUrl,
    version,
    format,
    apiKey,
    recurseDepth = 0
) {
    if (recurseDepth > 12) {
        throw new Error(
            "Too many retries.  Version export in the requested format is not ready for download yet.  Try again later."
        );
    }

    const formatResponse = await api.getFormat(workspaceUrl, projectUrl, version, format, apiKey);

    const progress = parseInt(formatResponse.progress);

    if (progress >= 1) {
        return formatResponse.export && formatResponse.export.link;
    } else if (progress >= 0 && progress < 1) {
        // not ready yet, try again in a few seconds
        console.log(
            "server is generating downloadable version, but it's not ready for download yet, trying again in 5 seconds..."
        );
        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                const link = await getDownloadLink(
                    workspaceUrl,
                    projectUrl,
                    version,
                    format,
                    apiKey,
                    recurseDepth + 1
                );
                resolve(link);
            }, 5000);
        });
    } else {
        throw new Error(`invalid response getting download url`);
    }

    console.log("formatResponse", formatResponse);

    return formatResponse.export;
}

async function pickFormatInteractively(projectData) {
    try {
        const datasetType = projectData.project.type;
        return selectExportFormat(datasetType);
    } catch (e) {
        throw new Error(`Error checking project type to determine supported formats`);
    }
}

function verifyFormatTypeForProject(format, projectData) {
    if (!format) {
        return null;
    }
    try {
        const datasetType = projectData.project.type;
        if (datasetType == "object-detection") {
            if (
                [
                    "coco",
                    "yolov5pytorch",
                    "yolov7pytorch",
                    "my-yolov6",
                    "darknet",
                    "voc",
                    "tfrecord",
                    "createml",
                    "clip",
                    "multiclass"
                ].includes(format)
            ) {
                return format;
            } else {
                throw new Error(`format ${format} is not supported for Object-Detection datasets`);
            }
        } else if (datasetType == "classification") {
            if (["clip", "multiclass"].includes(format)) {
                return format;
            } else {
                throw new Error(`format ${format} is not supported for Classification datasets`);
            }
        } else if (datasetType == "instance-segmentation") {
            if (
                [
                    "coco-segmentation",
                    "yolo5-obb",
                    "clip",
                    "multiclass",
                    "coco",
                    "yolov5pytorch",
                    "yolov7pytorch",
                    "my-yolov6",
                    "darknet",
                    "voc",
                    "tfrecord",
                    "createml"
                ].includes(format)
            ) {
                return format;
            } else {
                throw new Error(
                    `format ${format} is not supported for Instance Segmentation datasets`
                );
            }
        } else if (datasetType == "semantic-segmentation") {
            if (["coco-segmentation", "png-mask-semantic"].includes(format)) {
                return format;
            } else {
                throw new Error(
                    `format ${format} is not supported for Semantic Segmentation datasets`
                );
            }
        }
    } catch (e) {
        console.error(e.message);
        return null;
    }
}

async function downloadFileWithProgressBar(downloadUrl, outputFile) {
    console.log("Connecting …");
    const { data, headers } = await axios({
        url: downloadUrl,
        method: "GET",
        responseType: "stream"
    });
    const totalLength = headers["content-length"];

    console.log("Starting download");

    return new Promise((resolve, reject) => {
        const writer = fs.createWriteStream(outputFile);
        data.pipe(writer);

        const progressBar = new ProgressBar("  downloading [:bar] :percent :etas", {
            width: 40,
            complete: "=",
            incomplete: " ",
            renderThrottle: 1,
            total: parseInt(totalLength)
        });

        data.on("data", (chunk) => progressBar.tick(chunk.length));

        writer.on("error", () => {
            reject();
        });
        writer.on("finish", () => {
            resolve();
        });
    });
}

function generateOutputFolderName(workspaceUrl, projectUrl, version, format) {
    let count = 0;

    let filename = `./${workspaceUrl}-${projectUrl}-${version}-${format}`;
    while (fs.existsSync(filename)) {
        count++;
        filename = `./${workspaceUrl}-${projectUrl}-${version}-${format}_${count}`;
    }

    return filename;
}

async function unzipDownloadedFile(outputFile, outputFolder) {
    return extract(outputFile, path.resolve(outputFolder));
}

async function downloadAndUnzip(downloadLink, outputFolder) {
    const outputFile = tempfile(".zip");

    await downloadFileWithProgressBar(downloadLink, outputFile);

    debug_log(`unzipping file: ${outputFile} to: ${outputFolder}`);
    await unzipDownloadedFile(outputFile, outputFolder);

    debug_log(`deleting temp file ${outputFile}`);
    fs.unlinkSync(outputFile);

    console.log("downloaded dataset to: " + chalk.bold(outputFolder));
}

async function downloadDataset(datasetUrl, options) {
    let workspaceUrl = options.workspace;
    let projectUrl = datasetUrl;
    let version = options.version;

    // parse the datasetUrl into workspaceUrl, projectUrl, and version
    const parsedDatasetUrl = parseDatasetUrlWithVersion(datasetUrl);

    projectUrl = parsedDatasetUrl.projectUrl;
    if (parsedDatasetUrl.workspaceUrl) {
        workspaceUrl = parsedDatasetUrl.workspaceUrl;
    }

    // get api key for the project workspace if we have it, otherwise use the default workspace (e.g. for downloading public datasets)
    let apiKey;
    if (hasApiKeyForWorkspace(workspaceUrl)) {
        apiKey = getApiKeyForWorkspace(workspaceUrl);
    } else {
        //fallback to default workspace or the one sepcified via --workspace if the one in
        // the project id is not one we have an api key for (e.g. for public projects on universe)
        apiKey = getApiKeyForWorkspace(options.workspace);
    }
    // if version wasn't specified as an option, try to get it from the dataset url
    if (!version && parsedDatasetUrl.version) {
        version = parsedDatasetUrl.version;
    }

    // console.log("DOWNLOADING DATASET", parsedDatasetUrl);

    // fetch project data to ensure the requested version exists and so we can check the format is supported for the right dataset type
    let projectData;
    try {
        projectData = await api.getProject(workspaceUrl, projectUrl, apiKey);
    } catch (e) {
        throw new Error(`can't find or access project:  ${workspaceUrl}/${projectUrl}`);
    }

    // console.log("got project data", projectData);

    if (version) {
        await verifyVersionExists(projectData, version);
    } else {
        // if still no version, get the latest version available
        const latestVersion = await getLatestVersion(projectData);
        if (latestVersion) {
            version = latestVersion;
        } else {
            throw new Error("no versions found for dataset.  nothing to download!");
        }
    }

    let format = verifyFormatTypeForProject(options.format, projectData);
    if (!format) {
        format = await pickFormatInteractively(projectData);
    }

    // console.log("DOWNALOD DATASET:", workspaceUrl, projectUrl, version, format, apiKey);

    const downloadLink = await getDownloadLink(workspaceUrl, projectUrl, version, format, apiKey);

    const outputFolder = generateOutputFolderName(workspaceUrl, projectUrl, version, format);

    await downloadAndUnzip(downloadLink, outputFolder);

}

module.exports = {
    downloadDataset
};
