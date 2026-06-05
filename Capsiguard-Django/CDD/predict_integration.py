import os
import uuid
from django.conf import settings

try:
    from inference_sdk import InferenceHTTPClient
    import cv2
    import numpy as np
    # load .env automatically for convenience in development
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except Exception:
        # dotenv not installed; try a simple fallback that parses a .env file
        try:
            env_path = None
            try:
                # prefer Django BASE_DIR when available
                env_path = os.path.join(str(settings.BASE_DIR), '.env')
            except Exception:
                env_path = os.path.join(os.path.dirname(__file__), '..', '.env')

            if os.path.exists(env_path):
                with open(env_path, 'r', encoding='utf-8') as fh:
                    for line in fh:
                        line = line.strip()
                        if not line or line.startswith('#'):
                            continue
                        if '=' in line:
                            k, v = line.split('=', 1)
                            k = k.strip()
                            v = v.strip().strip('"').strip("'")
                            # Only set if not already present in environment
                            os.environ.setdefault(k, v)
        except Exception:
            pass
except Exception:
    InferenceHTTPClient = None

# Initialize a module-level client if the API key is available. This avoids
# recreating the client on every request and mirrors standalone `predict.py`.
CLIENT = None
API_KEY = os.environ.get("ROBOFLOW_API_KEY")
if InferenceHTTPClient is not None and API_KEY:
    try:
        CLIENT = InferenceHTTPClient(api_url="https://detect.roboflow.com", api_key=API_KEY)
    except Exception:
        CLIENT = None


def get_client():
    """Return an initialized InferenceHTTPClient instance.

    Uses the module-level `CLIENT` if available, otherwise initializes a new
    client from `ROBOFLOW_API_KEY` environment variable.
    """
    global CLIENT
    if CLIENT is not None:
        return CLIENT

    api_key = os.environ.get("ROBOFLOW_API_KEY")
    if InferenceHTTPClient is None:
        raise RuntimeError("inference_sdk is not installed")
    if not api_key:
        raise RuntimeError("ROBOFLOW_API_KEY environment variable is not set")

    CLIENT = InferenceHTTPClient(api_url="https://detect.roboflow.com", api_key=api_key)
    return CLIENT


def infer_image(image_path: str, model_id: str = "my-first-project-2rhyc/2", save_annotated: bool = True):
    """Run inference on the image at image_path and return the raw result.

    If `save_annotated` is True, draw bounding boxes on the image (like `predict.py`) and
    save the annotated image under MEDIA_ROOT; return `annotated_path` in the result dict.
    """
    client = get_client()

    result = client.infer(image_path, model_id=model_id)

    annotated_rel_path = None
    if save_annotated:
        try:
            # Read image using OpenCV
            img = cv2.imread(image_path)
            if img is None:
                raise RuntimeError(f"Failed to read image for annotation: {image_path}")

            for pred in result.get("predictions", []):
                x = pred.get("x")
                y = pred.get("y")
                w = pred.get("width")
                h = pred.get("height")
                class_name = pred.get("class") or pred.get("label") or "obj"
                conf = pred.get("confidence", 0)

                # Convert center x,y,width,height to box corners
                x1 = int(x - w/2)
                y1 = int(y - h/2)
                x2 = int(x + w/2)
                y2 = int(y + h/2)

                # Draw bounding box and label
                cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
                label = f"{class_name} ({conf:.2f})"
                cv2.putText(img, label, (x1, max(y1 - 10, 0)), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

            # Prepare save path
            media_root = getattr(settings, 'MEDIA_ROOT', None)
            if not media_root:
                raise RuntimeError("MEDIA_ROOT not configured in Django settings")

            base_name = os.path.basename(image_path)
            name, ext = os.path.splitext(base_name)
            unique = uuid.uuid4().hex[:8]
            annotated_name = f"{name}_annotated_{unique}{ext}"
            annotated_path = os.path.join(media_root, annotated_name)

            # Ensure directory exists
            os.makedirs(os.path.dirname(annotated_path), exist_ok=True)

            # Save annotated image
            cv2.imwrite(annotated_path, img)

            # Return relative path under MEDIA_URL
            annotated_rel_path = annotated_name
        except Exception:
            # Don't break inference if annotation fails — return raw result instead
            annotated_rel_path = None

    return {"raw": result, "annotated_rel_path": annotated_rel_path, **result}
