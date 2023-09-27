const config = require("../../config.js");
const { Docker } = require("node-docker-api");

const docker = new Docker({ socketPath: "/var/run/docker.sock" });

const promisifyStream = (stream) =>
    new Promise((resolve, reject) => {
        stream.on("data", (data) => console.log(data.toString()));
        stream.on("end", resolve);
        stream.on("error", reject);
    });

async function pullImage() {
    return docker.image
        .create({}, { fromImage: "roboflow/roboflow-inference-server-cpu", tag: "latest" })
        .then((stream) => promisifyStream(stream))
        .then(() => docker.image.get("roboflow/roboflow-inference-server-cpu:latest").status());
}

async function createContainer() {
    const c = await docker.container.create({
        Image: "roboflow/roboflow-inference-server-cpu:latest",
        name: "roboflow-inference-server",
        HostConfig: {
            PortBindings: {
                "9001/tcp": [
                    {
                        HostPort: "9001"
                    }
                ]
            }
        },
        ExposedPorts: {
            "9001/tcp": {}
        },
        Env: [`PROJECT=roboflow-staging`]
    });
    return c;
}

module.exports = async function serve(options) {
    const image = await pullImage();
    const container = await createContainer();
    container.start();
    console.log("Got image id", image.id);
};
