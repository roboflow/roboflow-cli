const config = require("../../config.js");
const chalk = require("chalk");

const { selectWorkspace } = require("../core.js");

module.exports = async function selectDefaultWorkspace() {
    const newDefaultWorkspace = await selectWorkspace();
    config.set("RF_WORKSPACE", newDefaultWorkspace);
};
