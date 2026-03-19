from cloudinary_storage.storage import RawMediaCloudinaryStorage

class PublicRawMediaCloudinaryStorage(RawMediaCloudinaryStorage):
    def get_resource_type(self, name):
        return "raw"

    def get_valid_options(self, options=None):
        if options is None:
            options = {}
        options["resource_type"] = "raw"
        options["type"] = "upload"  # ✅ Makes file PUBLIC
        return options
import cloudinary
import cloudinary.utils
from django.conf import settings

# Ensure Config is loaded
cloudinary.config(
    cloud_name=settings.CLOUDINARY_STORAGE['CLOUD_NAME'],
    api_key=settings.CLOUDINARY_STORAGE['API_KEY'],
    api_secret=settings.CLOUDINARY_STORAGE['API_SECRET'],
    secure=True
)
def get_signed_resume_url(instance):
    # 1. Clean the name. Django sometimes adds a leading / or 
    # the full path. We need the relative path from the 'root' of your Cloudinary.
    public_id = instance.resume.name.lstrip('/')
    
    # 2. Generate the URL using ONLY the essential components
    # Do NOT pass the version here; let the SDK handle it.
    url, options = cloudinary.utils.cloudinary_url(
        public_id,
        sign_url=True,
        resource_type="raw",
        type="upload",
        secure=True
    )
    return url