![Roboflow banner](https://user-images.githubusercontent.com/60797147/240767170-1793a92b-4ef7-469e-ae43-2a188ea9d2d3.jpeg)

# Roboflow CLI 💻

The Roboflow CLI provides a command line-driven method through which you can interface with Roboflow, upload data, and run inference on images.

## Installation 🛠️

This package install a `roboflow` CLI you can use from your terminal.

To install the Roboflow CLI, use the following command:

```
npm i -g roboflow-cli
```

<details close>
<summary>👉 Run the CLI in a docker container (alpha support)</summary>

### Run the CLI in a docker container (alpha support)

If you don't want to install node, npm and other roboflow cli dependencies, but still use the roboflow cli you can run it in a docker container.

Assuming you have docker installed on your machine, first build the image

```
docker build -t roboflowcli:latest .
```

Then, run the Roboflow cli docker image:

```
# Authorize 

docker run -it --rm -v ~/.config/roboflow:/root/.config/roboflow roboflowcli:latest auth

# Use the CLI as usual inside a docker container.

docker run -it --rm -v ~/.config/roboflow:/root/.config/roboflow roboflowcli:latest project list
```

Here we have mounted the roboflow credentials into the docker container. The first docker command authorizes the user and stores credentials 
in the user's `$HOME/.config/roboflow` directory. These credentials are then mounted onto the docker container in subsequent runs, as shown above.
</details>

## Authenticate with the CLI

To authorize your CLI, run the following command.

```
roboflow login
```

This will open a browser window and have you log into roboflow where you can select any workspaces you want the CLI to store auth credentials for (The CLi will download the api keys for the workspaces and store them in a config fle in the `~/.config/roboflow` directory on your system).

## Quickstart 🚀

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

You can also get specific help for each of the available subcommands, like e.g.:

```
roboflow upload -h
```

or

```
roboflow detect -h
```

You will similarly have to mount any data directories in case you are uploading images or annotations, for example.

## Documentation 📚

To view a full reference for the RoboflowAPI and CLI, check out the [Roboflow API Reference](https://docs.roboflow.com/api-reference/install-cli).

## License 🧑‍⚖

This project is licensed under an [MIT license](LICENSE).
