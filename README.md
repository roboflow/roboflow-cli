# Roboflow CLI

Roboflow makes computer vision accessible to all developers.
[https://roboflow.com](https://roboflow.com)

**This project is under active development, use at your own risk**

## CLI tool

This package install a `roboflow` CLI you can use from your terminal.

To install this package and CLI globally:

```
npm i -g roboflow-cli
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

### Run the CLI in a docker container (alpha support)

If you don't want to install node, npm and other roboflow cli dependencies, but still use the roboflow cli you can run it in a docker container.

Assuming you have docker installed on your machine, first build the image

```
docker build -t roboflowcli:latest .
```

Then, run the roboflow cli docker image interactively like so



```
# Authorize 

docker run -it -v ~/.config/roboflow:/root/.config/roboflow roboflowcli:latest auth

# Use the CLI as usual inside a docker container.

docker run -it -v ~/.config/roboflow:/root/.config/roboflow roboflowcli:latest project list
```

Here we have mounted the roboflow credentials into the docker container. The first docker command authorizes the user and stores credentials 
in the user's `$HOME/.config/roboflow` directory. These credentials are then mounted onto the docker container in subsequent runs, as shown above.

You will similarly have to mount any data directories in case you are uploading images or annotations, for example.
