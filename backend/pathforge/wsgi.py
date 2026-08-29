"""WSGI entry point for the PathForge API."""
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pathforge.settings')

application = get_wsgi_application()
