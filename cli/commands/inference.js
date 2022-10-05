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

    const overlap = options.overlap;
    const confidence = options.confidence;

    const result = await api.detectObject(file, modelUrl, apiKey, { overlap, confidence });
    console.log(result);
}

async function classify(args, options) {
    const workspaceUrl = options.workspace;
    const apiKey = getApiKeyWorWorkspace(workspaceUrl);

    const modelUrl = options.model;
    const file = args;

    const result = await api.classify(file, modelUrl, apiKey);
    console.log(result);
}

async function instanceSegmentation(args, options) {
    const workspaceUrl = options.workspace;
    const apiKey = getApiKeyWorWorkspace(workspaceUrl);

    const modelUrl = options.model;
    const file = args;

    const result = await api.instanceSegmentation(file, modelUrl, apiKey);
    console.log(result);
}

async function semanticSegmentation(args, options) {
    const workspaceUrl = options.workspace;
    const apiKey = getApiKeyWorWorkspace(workspaceUrl);

    const modelUrl = options.model;
    const file = args;

    const result = await api.semanticSegmentation(file, modelUrl, apiKey);
    console.log(result);
}

module.exports = {
    detectObject,
    classify,
    instanceSegmentation,
    semanticSegmentation
};
