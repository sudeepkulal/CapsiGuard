import os
from django.shortcuts import render, redirect
from django.contrib.auth.forms import UserCreationForm
from django.contrib.auth.decorators import login_required
from django.conf import settings
from django.core.files.storage import FileSystemStorage
from django.http import JsonResponse, HttpResponseBadRequest
import logging
import traceback

from .predict_integration import infer_image


@login_required
def home(request):
 return render(request, "home.html", {})

def j(request):
 return render(request, "j.html", {})


def authView(request):
 if request.method == "POST":
  form = UserCreationForm(request.POST or None)
  if form.is_valid():
   form.save()
   return redirect("CDD:login")
 else:
  form = UserCreationForm()
 return render(request, "registration/signup.html", {"form": form})


def analyze(request):
  """Endpoint to receive an uploaded image, run inference, and return JSON results.

  Expects a multipart POST with field name `image`.
  """
  logger = logging.getLogger(__name__)
  try:
    if request.method != "POST":
      return HttpResponseBadRequest("Only POST allowed")

    uploaded = request.FILES.get('image')
    if not uploaded:
      return HttpResponseBadRequest("No image file in request (field name 'image')")

    # Ensure MEDIA_ROOT exists
    media_root = getattr(settings, 'MEDIA_ROOT', None)
    if not media_root:
      raise RuntimeError("MEDIA_ROOT not configured in Django settings")
    os.makedirs(str(media_root), exist_ok=True)

    # Save uploaded file to MEDIA_ROOT
    fs = FileSystemStorage(location=str(media_root))
    filename = fs.save(uploaded.name, uploaded)
    saved_path = os.path.join(media_root, filename)

    # Request annotated image to be saved and return full result
    result = infer_image(saved_path, save_annotated=True)

    # Build an accessible URL for the uploaded image
    image_url = request.build_absolute_uri(settings.MEDIA_URL + filename)

    annotated_rel = result.get('annotated_rel_path') or result.get('annotated')
    annotated_url = None
    if annotated_rel:
      annotated_url = request.build_absolute_uri(settings.MEDIA_URL + annotated_rel)

    # The wrapper returns the SDK response under 'raw' and may also include predictions at top level
    preds = result.get('predictions') if result.get('predictions') is not None else result.get('raw', {}).get('predictions', [])

    return JsonResponse({'predictions': preds, 'image_url': image_url, 'annotated_url': annotated_url, 'raw': result})
  except Exception as e:
    tb = traceback.format_exc()
    logger.error("Error in analyze: %s\n%s", str(e), tb)
    # Return error and stack trace for debugging in development
    return JsonResponse({'error': str(e), 'traceback': tb}, status=500)