import open from "open";

import conf from "../../config.js";
import chalk from "chalk";

export default async function reset() {
    conf.clear();
    console.log(chalk.red("all data reset"));
}
