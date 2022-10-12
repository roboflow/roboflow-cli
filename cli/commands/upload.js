const fs = require("fs");
const path = require("path");
const pLimit = require("p-limit");

const { selectProjectFromWorkspace, getApiKeyWorWorkspace } = require("../core.js");
const api = require("../../api.js");

async function uploadWithAnnotation(f, annotationFilename, projectUrl, apiKey, extraOptions) {
    const uploadResult = await api.uploadImage(f, projectUrl, apiKey, extraOptions);
    const imageId = uploadResult.id;

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
        console.log(`  ${f} uploaded: `, uploadResult);
        console.log("    annotation upload:", annotationResult);
    } else {
        console.log(`  ${f} uploaded: `, uploadResult);
        console.log(
            `   cant stat annotation file: '${annotationFilename}'.  image uploaded without annotation`
        );
        return;
    }
}

async function uploadSimple(f, projectUrl, apiKey, extraOption) {
    const result = await api.uploadImage(f, projectUrl, apiKey, extraOptions);
    console.log("  image uploaded:", result);
}

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

    let concurrency = 10;
    if (options.concurrent) {
        concurrency = parseInt(options.concurrent);
    }

    const uploadPromises = [];

    const limit = pLimit(concurrency);

    if (options.annotation) {
        for (let f of args) {
            const p = limit(() =>
                uploadWithAnnotation(f, options.annotation, projectUrl, apiKey, extraOptions)
            );

            uploadPromises.push(p);
        }
    } else {
        for (let f of args) {
            const p = limit(() => uploadSimple(f, projectUrl, apiKey, extraOptions));
            uploadPromises.push(p);
        }
    }

    await Promise.all(uploadPromises);
}

module.exports = {
    uploadImage
};
