![Roboflow banner](https://user-images.githubusercontent.com/60797147/240767170-1793a92b-4ef7-469e-ae43-2a188ea9d2d3.jpeg)

# Roboflow CLI (Deprecated)

> **This Node.js CLI has been deprecated in favor of the [Roboflow Python package](https://github.com/roboflow/roboflow-python), which includes a built-in CLI along with a full Python SDK. Please use `roboflow-python` for all new projects.**

## Migrating to the Roboflow Python Package

Install the replacement with:

```bash
pip install roboflow
```

The Python package is a superset of this CLI. Every command available here has an equivalent there, plus significantly more:

| Capability | This CLI (Node.js) | `roboflow` Python package |
|---|---|---|
| **Auth** | Browser-based login | Browser login **or** API key |
| **List workspaces & projects** | Yes | Yes |
| **Upload images** | Yes (single files, glob patterns) | Yes, plus bulk directory upload with parallel workers and retries |
| **Import datasets** | Yes (folder import, annotation auto-detection) | Yes, with more annotation formats and metadata/tag support |
| **Download datasets** | Yes (11+ formats, interactive format picker) | Yes (14+ formats including YOLOv8, YOLOv9) |
| **Run inference** | Yes (detection, classification, instance/semantic seg) | Yes, same model types **plus** keypoint detection, CLIP, and gaze models |
| **Video inference** | No | Yes |
| **Create projects** | No | Yes |
| **Generate dataset versions** | No | Yes (preprocessing + augmentation settings) |
| **Train models** | No | Yes (`roboflow train` CLI or SDK) |
| **Deploy custom model weights** | No | Yes (`roboflow upload_model` CLI or SDK) |
| **Dedicated deployment management** | No | Yes (create, pause, resume, delete, view logs, usage stats) |
| **Search & export images** | No | Yes (RoboQL query language, export as dataset) |
| **Active learning** | No | Yes (confidence-based, class-specific, CLIP similarity filtering) |
| **Annotation job management** | No | Yes (create tasks, manage batches) |
| **Two-stage model pipelines** | No | Yes (cascade detection + classification or OCR) |
| **Python SDK for scripting** | No | Yes (full programmatic API) |

### Command mapping

If you're migrating scripts, here's how the Node CLI commands map:

| Node.js CLI | Python CLI equivalent |
|---|---|
| `roboflow login` | `roboflow login` |
| `roboflow workspace list` | `roboflow workspace list` |
| `roboflow workspace get` | `roboflow workspace get <id>` |
| `roboflow project list` | `roboflow project list` |
| `roboflow project get <id>` | `roboflow project get <id>` |
| `roboflow upload <files> -p <project>` | `roboflow upload <image> -p <project>` |
| `roboflow import <folder> -p <project>` | `roboflow import <folder> -p <project>` |
| `roboflow download <url> -f <format>` | `roboflow download <url> -f <format>` |
| `roboflow infer <file> -m <model>` | `roboflow infer <file> -m <model>` |
| `roboflow config show` | `roboflow whoami` |
| `roboflow open` | *(use app.roboflow.com directly)* |

For full documentation, see the [Roboflow API Reference](https://docs.roboflow.com/api-reference).

## License

This project is licensed under an [MIT license](LICENSE).
