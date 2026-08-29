"""ASGI entry point for the PathForge API."""
import os

from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pathforge.settings')

application = get_asgi_application()
