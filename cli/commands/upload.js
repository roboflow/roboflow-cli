import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import conf from "../../config.js";
import { selectProjectFromWorkspace, getApiKeyWorWorkspace } from "../core.js";
import { uploadFile } from "../../api.js";

export default async function upload(args, options) {
    const workspaceUrl = options.workspace;
    const apiKey = getApiKeyWorWorkspace(workspaceUrl);
    let projectUrl = options.project;

    if (!projectUrl) {
        console.log("No project specified, please select which project to upload to:");

        //these have workspace_url/project_url as id
        projectUrl = await selectProjectFromWorkspace(workspaceUrl);
    }

    console.log("projectUrl", projectUrl);

    // remove the workspace url if its in format workspace_url/project_url
    if (projectUrl.includes("/")) {
        projectUrl = projectUrl.split("/")[1];
    }

    for (var f of args) {
        await uploadFile(f, projectUrl, apiKey);
    }
}
