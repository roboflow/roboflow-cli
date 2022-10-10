const config = require("../config.js");
const terminalLink = require("terminal-link");

function link(url) {
    const app_url = config.get("RF_APP_URL");
    return terminalLink(url, url, {
        fallback: () => {
            return url;
        }
    });
}

module.exports = {
    link
};
