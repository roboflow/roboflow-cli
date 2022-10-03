import fetch from "node-fetch";
import config from "./config.js";

async function api_GET(endpoint, apiKey) {
    const api_domain = config.get("api_domain");
    const url = `https://${api_domain}` + endpoint;

    if (global.debug) {
        console.debug(`making request to: ${url}`);
    }

    const apiResponse = await fetch(`${url}?api_key=${apiKey}`);

    return apiResponse.json();
}

export async function getWorkspace(workspaceUrl, apiKey) {
    return api_GET(`/${workspaceUrl}`, apiKey);
}

export async function getProject(workspaceUrl, projectUrl, apiKey) {
    return api_GET(`/${workspaceUrl}/${projectUrl}`, apiKey);
}

export async function getVersion(workspaceUrl, projectUrl, version, apiKey) {
    return api_GET(`/${workspaceUrl}/${projectUrl}/${version}`, apiKey);
}

export async function getFormat(workspaceUrl, projectUrl, version, format, apiKey) {
    return api_GET(`/${workspaceUrl}/${projectUrl}/${version}/${format}`, apiKey);
}

export async function uploadFile(filepath, projectUrl, apiKey) {
    const uploadUrl = `https://${config.get(
        "api_domain"
    )}/dataset/${projectUrl}/upload?api_key=${apiKey}`;

    console.log(uploadUrl);

    const filename = path.basename(filepath);

    const imageData = fs.readFileSync(filepath, {
        encoding: "base64"
    });

    const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: imageData
    });

    const responseData = await response.json();

    return responseData;
}

const api = {
    getWorkspace,
    getProject,
    getVersion,
    getFormat,
    uploadFile
};

export default api;
