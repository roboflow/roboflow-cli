const fs = require("fs");
const path = require("path");

const { selectProjectFromWorkspace, getApiKeyWorWorkspace } = require("../core.js");
const { uploadImage } = require("../../api.js");

module.exports = async function upload(args, options) {
    const workspaceUrl = options.workspace;
    const apiKey = getApiKeyWorWorkspace(workspaceUrl);
    let projectUrl = options.project;

    if (!projectUrl) {
        console.log("No project specified, please select which project to upload to:");

        //these have workspace_url/project_url as id
        projectUrl = await selectProjectFromWorkspace(workspaceUrl);
    }

    // remove the workspace url if its in format workspace_url/project_url
    if (projectUrl.includes("/")) {
        projectUrl = projectUrl.split("/")[1];
    }

    const extraOptions = {};
    if (options.batch) {
        extraOptions.batch = options.batch;
    }

    if (options.split) {
        extraOptions.split = options.split;
    }

    for (var f of args) {
        const result = await uploadImage(f, projectUrl, apiKey, extraOptions);
        console.log(result);
    }
};
