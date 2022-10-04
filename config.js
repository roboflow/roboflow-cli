const Conf = require("conf");

const RF_CLI_ENV = process.env.RF_CLI_ENV;

let conf;

if (!RF_CLI_ENV) {
    conf = new Conf({
        projectSuffix: "",
        projectName: "roboflow",
        defaults: { RF_APP_URL: "https://app.roboflow.com", RF_API_URL: "https://api.roboflow.com" }
    });
} else {
    conf = new Conf({
        projectSuffix: RF_CLI_ENV,
        projectName: "roboflow",
        defaults: {
            RF_APP_URL: process.env.RF_APP_URL,
            RF_API_URL: process.env.RF_API_URL
        }
    });
}

module.exports = conf;
