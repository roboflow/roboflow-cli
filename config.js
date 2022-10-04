const Conf = require("conf");

// these are always either default or come in via ENV vars
// we'll handle re-authing manually when switching between staging and local
const RF_APP_URL = process.env.RF_APP_URL || "https://app.roboflow.com";
const RF_API_URL = process.env.RF_API_URL || "https://api.roboflow.com";

const config = new Conf({
    projectSuffix: "",
    cwd: process.env.HOME + "/.config/roboflow",
    projectName: "roboflow"
});

module.exports = {
    get: function (key) {
        if (process.env[key]) {
            return process.env[key];
        }
        return config.get(key);
    },

    set(key, value) {
        return config.set(key, value);
    },

    getAll() {
        return {
            ...config.store,
            RF_APP_URL: RF_APP_URL,
            RF_API_URL: RF_API_URL
        };
    },

    clear() {
        return config.clear();
    },

    configFile: config.path
};
