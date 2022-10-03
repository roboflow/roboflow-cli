import conf from "../../config.js";
import chalk from "chalk";

import { selectWorkspace } from "../core.js";

export default async function selectDefaultWorkspace() {
    console.log("select default");
    const newDefaultWorkspace = await selectWorkspace();
    console.log("select default 1", newDefaultWorkspace);
    conf.set("default_workspace", newDefaultWorkspace);
}
