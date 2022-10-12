const fs = require("fs");
const path = require("path");

const { selectProjectFromWorkspace, getApiKeyWorWorkspace } = require("../core.js");
const api = require("../../api.js");

async function uploadImage(args, options) {
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

    if (options.annotation) {
        for (var f of args) {
            // console.log("upload:", f, projectUrl, apiKey, extraOptions);
            const uploadResult = await api.uploadImage(f, projectUrl, apiKey, extraOptions);
            console.log("image uploaded: ", uploadResult);
            const imageId = uploadResult.id;

            let annotationFilename = options.annotation;

            if (annotationFilename.includes("[filename]")) {
                annotationFilename = annotationFilename.replace("[filename]", path.parse(f).name);
            }

            if (fs.existsSync(annotationFilename)) {
                const annotationResult = await api.uploadAnnotation(
                    imageId,
                    annotationFilename,
                    projectUrl,
                    apiKey
                );
                console.log("annotation uploaded:", annotationResult);
            } else {
                console.log(
                    `cant stat annotation file: '${annotationFilename}'.  image uplaoded without annotation`
                );
                continue;
            }
        }
    } else {
        // console.log("upload unanotated", args, options);

        for (var f of args) {
            // console.log("upload:", f, projectUrl, apiKey, extraOptions);
            const result = await api.uploadImage(f, projectUrl, apiKey, extraOptions);
            console.log("image uplaoded:", result);
        }
    }
}

module.exports = {
    uploadImage
};
