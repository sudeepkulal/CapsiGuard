# import inference_sdk
# from inference_sdk import InferenceHTTPClient

# # Initialize Client
# CLIENT = InferenceHTTPClient(
#     api_url="https://detect.roboflow.com",   # Use detect.roboflow.com for inference
#     api_key="Z329Y2FN1wOL2HvocEIg"
# )

# # Run inference
# result = CLIENT.infer(
#     "C:\\Users\\sudee\\majorproject\\majorproject\\Curl Virus00001_flipped_1385.jpg",        # Path to your image
#     model_id="my-first-project-2rhyc/2"  # Your model version
# )

# # Print predictions
# print(result)
import os
from pathlib import Path

# load .env in local/dev if present (optional dependency)
try:
    from dotenv import load_dotenv
    # load .env in project root
    project_root = Path(__file__).resolve().parent
    load_dotenv(project_root.parent / '.env')
except Exception:
    pass

from inference_sdk import InferenceHTTPClient
import cv2
import matplotlib.pyplot as plt


# Initialize the client using an env var for safety
def get_client():
    api_key = os.environ.get("ROBOFLOW_API_KEY")
    if not api_key:
        raise RuntimeError("ROBOFLOW_API_KEY not set in environment")
    return InferenceHTTPClient(api_url="https://detect.roboflow.com", api_key=api_key)


def run_demo(image_path: str, model_id: str = "my-first-project-2rhyc/2"):
    client = get_client()
    result = client.infer(image_path, model_id=model_id)
    print(result)

    img = cv2.imread(image_path)
    for pred in result.get("predictions", []):
        x = pred.get("x")
        y = pred.get("y")
        w = pred.get("width")
        h = pred.get("height")
        class_name = pred.get("class")
        conf = pred.get("confidence")

        x1 = int(x - w / 2)
        y1 = int(y - h / 2)
        x2 = int(x + w / 2)
        y2 = int(y + h / 2)

        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
        label = f"{class_name} ({conf:.2f})"
        cv2.putText(img, label, (x1, y1 - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)

    plt.imshow(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    plt.axis("off")
    plt.show()


if __name__ == '__main__':
    # quick demo runner
    IMAGE = os.environ.get('DEMO_IMAGE') or "Management-of-Bacterial-Leaf-Spot-in-Chilli3.jpg"
    run_demo(IMAGE)
