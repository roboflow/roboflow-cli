const fs = require("fs");
const path = require("path");
const pLimit = require("p-limit");

const annotation = require("@roboflow/annotation");

const { selectProjectFromWorkspace, getApiKeyForWorkspace } = require("../core.js");

const { parseFolder } = require("../datasetParser");

const glob = require("glob");

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
    const extraOptions = extraOption || {};
    const result = await api.uploadImage(f, projectUrl, apiKey, extraOptions);
    console.log("  image uploaded:", result);
}

async function uploadImage(args, options) {
    const workspaceUrl = options.workspace;
    const apiKey = getApiKeyForWorkspace(workspaceUrl);
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

    // glob files if wildcard in args
    var globbed_files = args[0].includes("*") ? await glob.sync(args[0]) : args;

    if (options.annotation) {
        for (let f of globbed_files) {
            const p = limit(() =>
                uploadWithAnnotation(f, options.annotation, projectUrl, apiKey, extraOptions)
            );

            uploadPromises.push(p);
        }
    } else {
        for (let f of globbed_files) {
            const p = limit(() => uploadSimple(f, projectUrl, apiKey, extraOptions));
            uploadPromises.push(p);
        }
    }

    await Promise.all(uploadPromises);
}

async function uploadParsedDatasetImage(
    imageInfo,
    projectUrl,
    apiKey,
    annotationGroup,
    datasetFolder
) {
    const annot = new annotation(imageInfo.annotation, null, annotationGroup, datasetFolder);
    const vocAnnotation = annot.toVOC();

    // console.log("annotation name: ", imageInfo.file, vocAnnotation.name);

    const extraOptions = {};
    if (imageInfo.split) {
        extraOptions.split = imageInfo.split;
    }

    const uploadResult = await api.uploadImage(imageInfo.file, projectUrl, apiKey, extraOptions);
    const imageId = uploadResult.id;

    const annotationResult = await api.uploadAnnotationRaw(
        imageId,
        vocAnnotation.name,
        vocAnnotation.contents,
        projectUrl,
        apiKey
    );

    // console.log("annotationResult", annotationResult);
    console.log("added image with annotations:", imageInfo.file, annotationResult);
}

async function importDataset(datasetFolder, options) {
    const workspaceUrl = options.workspace;
    const apiKey = getApiKeyForWorkspace(workspaceUrl);
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

    const projectData = await api.getProject(workspaceUrl, projectUrl, apiKey);

    if (projectData.project.type == "classification") {
        console.log("Importing dataset is is not supported for classification type projects yet");
        return;
    }

    const datasetName = projectData.project.name;
    const annotationGroup = projectData.project.annotation;

    const parsedDataset = parseFolder(datasetFolder);

    let concurrency = 10;
    if (options.concurrent) {
        concurrency = parseInt(options.concurrent);
    }

    const limit = pLimit(concurrency);
    const uploadPromises = [];
    for (let i = 0; i < parsedDataset.length; i++) {
        const imageInfo = parsedDataset[i];
        const p = limit(() =>
            uploadParsedDatasetImage(imageInfo, projectUrl, apiKey, annotationGroup, datasetFolder)
        );
        uploadPromises.push(p);
    }

    // await Promise.all(uploadPromises);
}

module.exports = {
    uploadImage,
    importDataset
};
