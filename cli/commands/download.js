const fs = require("fs");
const path = require("path");
const axios = require("axios");

var ProgressBar = require("progress");

const { hasApiKeyForWorkspace, getApiKeyForWorkspace } = require("../core.js");

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

async function getLatestVersion(workspaceUrl, projectUrl, apiKey) {
    const availableVersions = await getProjectVersions(workspaceUrl, projectUrl, apiKey);
    availableVersions.sort((a, b) => a.created - b.created);

    if (availableVersions.length > 0) {
        const versionUrl = availableVersions[availableVersions.length - 1].id;
        const parsed = parseDatasetUrlWithVersion(versionUrl);

        return parsed.version;
    }

    return null;
}

async function verifyVersionExists(workspaceUrl, projectUrl, version, apiKey) {
    const availableVersions = await getProjectVersions(workspaceUrl, projectUrl, apiKey);
    const versionExists = availableVersions.find((v) => v.id.endsWith(`/${version}`));
    if (!versionExists) {
        throw new Error(`version ${version} does not exist for dataset ${projectUrl}`);
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

async function downloadFileWithProgressBar(downloadUrl, outputFile) {
    console.log("Connecting …");
    const { data, headers } = await axios({
        url: downloadUrl,
        method: "GET",
        responseType: "stream"
    });
    const totalLength = headers["content-length"];

    console.log("Starting download");
    const progressBar = new ProgressBar("-> downloading [:bar] :percent :etas", {
        width: 40,
        complete: "=",
        incomplete: " ",
        renderThrottle: 1,
        total: parseInt(totalLength)
    });

    console.log("writing dataset to file:", outputFile);
    const writer = fs.createWriteStream(outputFile);

    data.on("data", (chunk) => progressBar.tick(chunk.length));
    data.pipe(writer);
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

    if (version) {
        await verifyVersionExists(workspaceUrl, projectUrl, version, apiKey);
    } else {
        // if still no version, get the latest version available
        const latestVersion = await getLatestVersion(workspaceUrl, projectUrl, apiKey);
        if (latestVersion) {
            version = latestVersion;
        } else {
            throw new Error("no versions found for dataset.  nothing to download!");
        }
    }

    const downloadLink = await getDownloadLink(
        workspaceUrl,
        projectUrl,
        version,
        options.format,
        apiKey
    );

    const outputFile =
        options.outputFile || `${workspaceUrl}-${projectUrl}-${version}-${options.format}.zip`;
    await downloadFileWithProgressBar(downloadLink, outputFile);
}

module.exports = {
    downloadDataset
};
