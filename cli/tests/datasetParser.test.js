const datasetParser = require("../datasetParser");

const fs = require("fs");

test("parses chess datset folder", function () {
    const datasetFolder = __dirname + "/datasets/chess";

    const result = datasetParser.parseFolder(datasetFolder);

    const actualOutput = JSON.stringify(result, null, 4);
    // fs.writeFileSync(__dirname + "/output/parse-chess.json", actualOutput);

    const expectedOutput = fs.readFileSync(__dirname + "/output/parse-chess.json", "utf8");
    expect(actualOutput).toBe(expectedOutput);
});

test("parses shark-tiny-coco folder", function () {
    const datasetFolder = __dirname + "/datasets/sharks-tiny-coco";

    const result = datasetParser.parseFolder(datasetFolder);

    const actualOutput = JSON.stringify(result, null, 4);
    // fs.writeFileSync(__dirname + "/output/sharks-tiny-coco.json", actualOutput);

    const expectedOutput = fs.readFileSync(__dirname + "/output/sharks-tiny-coco.json", "utf8");
    expect(actualOutput).toBe(expectedOutput);
});
