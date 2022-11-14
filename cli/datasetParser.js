// parsed datasets from file system folders and files

const annotation = require("@roboflow/annotation");
const path = require("path");
const fs = require("fs");
const glob = require("glob");
const util = require("util");

function listFilesInFolder(folder) {
    const dirName = path.relative("", path.resolve(folder));
    const globPattern = path.join(dirName, "**/*");

    return glob.sync(globPattern);
}

function isImageFile(f) {
    // skip SuperAnnotate thumbnails
    if (f.indexOf("thumb/thmb_") >= 0) return false;
    if (f.indexOf("___fuse.png") >= 0) return false;

    const ext = path.extname(f);
    const imageFormats = [".jpg", ".jpeg", ".png", ".bmp"];
    return imageFormats.includes(ext);
}

function shouldParseAsAnnotation(f) {
    const ext = path.extname(f);
    const annotationFormats = [".json", ".xml", ".csv", ".udacity", ".manifest", ".txt"];
    return annotationFormats.includes(ext);
}

function shouldParseAsLabelMap(f) {
    const ext = path.extname(f);
    if (ext === ".json" && path.basename(f) == "classes.json") {
        return true; // SuperAnnotate label map
    }
    const labelMapFormats = ["yaml", "labels", "pbtxt", "txt"];
    return labelMapFormats.includes(ext);
}

function parseAnnotations(files, labelMap) {
    const annotations = [];

    for (var f of files) {
        if (shouldParseAsAnnotation(f)) {
            const fileData = fs.readFileSync(f, "utf8");
            const fileName = path.basename(f);
            const fileExt = path.extname(f).replace(/^\./, ""); // Annotation.parse expects it without the .

            const annotationsToAdd = annotation.parse(fileData, fileName, fileExt, labelMap);
            // console.log("parsed", f, annotationsToAdd);
            for (var a of annotationsToAdd) {
                annotations.push(a.annotation);
            }
        }
    }

    return annotations;
}

function findMatchingAnnotations(f, annotations) {
    const fileKey = path.basename(f).toLowerCase();

    return annotations.filter((a) => {
        // console.log("checking", a && a.key, fileKey);
        if (!a || !a.original || !a.original.source || !a.key) return false;

        if (typeof a.key === "string" || a.key instanceof String) {
            return a.key.toLowerCase() === fileKey;
        }

        if (Array.isArray(a.key)) {
            const lowerCaseKeys = a.key.map((k) => k.toLowerCase());
            return lowerCaseKeys.includes(fileKey);
        }

        return false;
    });
}

function splitForFileName(f) {
    if (f.includes("/train") || f.includes("/training")) {
        return "train";
    }
    if (f.includes("/valid") || f.includes("/validation") || f.includes("/val")) {
        return "valid";
    }
    if (f.includes("/test") || f.includes("/testing")) {
        return "test";
    }
}

function mapAnnotationAndSplitToImage(f, annotations) {
    const image = {
        file: f,
        name: path.basename(f)
    };

    image.split = splitForFileName(f);

    //TODO: maybe need to keep track of which have already been used here?
    const imageAnnotations = findMatchingAnnotations(f, annotations);
    if (imageAnnotations && imageAnnotations.length > 0) {
        image.annotation = imageAnnotations[0];
    }

    // console.log(image);
    return image;
}

function parseFolder(folder) {
    const files = listFilesInFolder(folder);

    const imageFiles = files.filter((f) => isImageFile(f));
    const annotations = parseAnnotations(files);

    // console.log(imageFiles);
    // console.log(annotations);

    const result = imageFiles.map((f) => mapAnnotationAndSplitToImage(f, annotations));

    return result;
}

module.exports = {
    parseFolder
};
