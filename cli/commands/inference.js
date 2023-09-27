const chalk = require("chalk");
const axios = require("axios");
const fs = require("fs");

const api = require("../../api.js");
const { getApiKeyForWorkspace } = require("../core.js");

async function infer(args, options) {
    const workspaceUrl = options.workspace;
    const apiKey = options.apiKey ? options.apiKey : getApiKeyForWorkspace(workspaceUrl);

    // console.log("infer", args, options);

    //this is project/version
    const modelUrl = options.model;

    const [projectUrl, modelVersion] = modelUrl.split("/");

    let inferenceType = options.type;

    if (!inferenceType) {
        //fetch the version so we know which endpoint / model type to use

        const versionData = await api.getVersion(workspaceUrl, projectUrl, modelVersion, apiKey);

        // console.log(versionData);

        // if (!versionData.version.model) {
        //     throw new Error("no trained model found for this version");
        // }

        inferenceType = versionData.project.type;
    }

    switch (inferenceType) {
        case "object-detection":
            return detectObject(args, options);
        case "classification":
            return classify(args, options);
        case "instance-segmentation":
            return instanceSegmentation(args, options);
        case "semantic-segmentation":
            return semanticSegmentation(args, options);
        default:
            console.log("unknown project type:", inferenceType);
            return;
    }
}

async function detectObject(args, options) {
    const workspaceUrl = options.workspace;
    const apiKey = options.apiKey ? options.apiKey : getApiKeyForWorkspace(workspaceUrl);

    const modelUrl = options.model;
    const file = args;

    const overlap = options.overlap;
    const confidence = options.confidence;

    const result = await api.detectObject(
        file,
        modelUrl,
        apiKey,
        { overlap, confidence },
        options.port
    );
    console.log(result);
}

async function classify(args, options) {
    const workspaceUrl = options.workspace;
    const apiKey = getApiKeyForWorkspace(workspaceUrl);

    const modelUrl = options.model;
    const file = args;

    const result = await api.classify(file, modelUrl, apiKey);
    console.log(result);
}

async function instanceSegmentation(args, options) {
    const workspaceUrl = options.workspace;
    const apiKey = getApiKeyForWorkspace(workspaceUrl);

    const modelUrl = options.model;
    const file = args;

    const result = await api.instanceSegmentation(file, modelUrl, apiKey);
    console.log(result);
}

async function semanticSegmentation(args, options) {
    const workspaceUrl = options.workspace;
    const apiKey = getApiKeyForWorkspace(workspaceUrl);

    const modelUrl = options.model;
    const file = args;

    const result = await api.semanticSegmentation(file, modelUrl, apiKey);
    console.log(result);
}

module.exports = {
    infer,
    detectObject,
    classify,
    instanceSegmentation,
    semanticSegmentation
};
