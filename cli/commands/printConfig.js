import open from "open";

import config from "../../config.js";
import chalk from "chalk";

const log = console.log;

export default async function printConfig(options) {
    log(chalk.green(`Config file is stored at: ${chalk.bold(config.path)}`));
    log(`config values:`);
    log({ ...config.store });
}
