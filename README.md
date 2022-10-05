# Roboflow node library

Roboflow makes computer vision accessible to all developers.
[https://roboflow.ai](https://roboflow.ai)

**This project is under active development, use at your own risk**

## Node Module

The node module is currently a very basic wrapper around roboflow API endpoints.

You can use it like so:

```
const roboflow = require("roboflow");
const workspaceInfo = roboflow.getWorkspace(workspaceUrl, apiKey);
```

It currently includes the following functions, which are implemented in [api.js](api.js):

-   `getWorkspace(workspaceUrl, apiKey)`
-   `getProject(workspaceUrl, projectUrl, apiKey)`
-   `getVersion(workspaceUrl, projectUrl, version, apiKey)`
-   `getFormat(workspaceUrl, projectUrl, version, format, apiKey)`
-   `uploadImage(filepath, projectUrl, apiKey, options)`
-   `detectObject(filepath, modelUrl, apiKey, options)`
-   `classify(filepath, modelUrl, apiKey)`
-   `instanceSegmentation(filepath, modelUrl, apiKey)`
-   `semanticSegmentation(filepath, modelUrl, apiKey)`

## CLI tool

This package install a `roboflow` CLI you can use from your terminal.

To install this package and CLI globally:

```
npm i -g roboflow
```

### Authorize the CLI

To authotize your CLI, run the following command.

```
roboflow auth
```

This will open a browser window and have you log into roboflow where you can select any workspaces you want the CLI to store auth credentials for (The CLi will download the api keys for the workspaces and store them in a config fle in the `~/.config/roboflow` directory on your system).

### Using the CLI

You can use the `roboflow` CLI to:

-   list your workspaces
-   select a default workspace to use
-   list your projects
-   upload images to your projects
-   use it to get inference results for local images (for any of your object detection, classification, or segmentation models)

For more info on how to use the CLI see the help an usage instructions by running:

```
roboflow -h
```

You can also get specific help for each of the available sucommands, like e.g.:

```
roboflow upload -h
```

or

```
roboflow detect -h
```
