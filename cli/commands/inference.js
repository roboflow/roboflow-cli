const chalk = require("chalk");
const axios = require("axios");
const fs = require("fs");

const api = require("../../api.js");
const { getApiKeyWorWorkspace } = require("../core.js");

async function detectObject(args, options) {
    const workspaceUrl = options.workspace;
    const apiKey = getApiKeyWorWorkspace(workspaceUrl);

    const modelUrl = options.model;
    const file = args;

    console.log("object detection:", modelUrl, file);
    const result = await api.detectObject(file, modelUrl, apiKey);
    console.log(result);
}

async function classify(args, options) {
    console.log(chalk.red("NOT IMPLEMENTED YET"));
}

async function segmentInstances(args, options) {
    console.log(chalk.red("NOT IMPLEMENTED YET"));
}

async function segmentSemantic(args, options) {
    console.log(chalk.red("NOT IMPLEMENTED YET"));
}

module.exports = {
    detectObject,
    classify,
    segmentInstances,
    segmentSemantic
};
