import Conf from "conf";

const RF_CLI_ENV = process.env.RF_CLI_ENV;

let conf;

if (!RF_CLI_ENV) {
    conf = new Conf({
        projectSuffix: "",
        projectName: "roboflow",
        defaults: { app_domain: "app.roboflow.com", api_domain: "api.roboflow.com" }
    });
} else {
    conf = new Conf({
        projectSuffix: RF_CLI_ENV,
        projectName: "roboflow",
        defaults: {
            app_domain: process.env.RF_CLI_APP_DOMAIN,
            api_domain: process.env.RF_CLI_API_DOMAIN
        }
    });
}

export default conf;
