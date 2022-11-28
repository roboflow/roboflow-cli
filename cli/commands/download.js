const fs = require("fs");
const path = require("path");

const { getApiKeyWorWorkspace } = require("../core.js");

const api = require("../../api.js");

async function downloadDataset(datasetUrl, options) {
    console.log("download dataset:", datasetUrl, options);
    // const workspaceUrl = options.workspace;
    // const apiKey = getApiKeyWorWorkspace(workspaceUrl);
}

module.exports = {
    downloadDataset
};
