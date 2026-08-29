"""
Django settings for the PathForge API.

Configuration is environment driven (see backend/.env.example). The database
defaults to Microsoft SQL Server through mssql-django; setting DB_ENGINE=sqlite
switches to a local file so the API can be run without a SQL Server instance.
"""
from datetime import timedelta
from pathlib import Path
import os

from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / '.env')


def env(name, default=None):
    value = os.getenv(name)
    return default if value is None or value == '' else value


def env_bool(name, default=False):
    return str(env(name, str(default))).strip().lower() in {'1', 'true', 'yes', 'on'}


def env_list(name, default=''):
    return [item.strip() for item in str(env(name, default)).split(',') if item.strip()]


# ---------------------------------------------------------------------------
# Core
# ---------------------------------------------------------------------------
SECRET_KEY = env('DJANGO_SECRET_KEY', 'insecure-development-key-change-me')
DEBUG = env_bool('DJANGO_DEBUG', True)
ALLOWED_HOSTS = env_list('DJANGO_ALLOWED_HOSTS', 'localhost,127.0.0.1')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party
    'rest_framework',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'drf_spectacular',

    # Local
    'accounts',
    'visualizations',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'pathforge.urls'
WSGI_APPLICATION = 'pathforge.wsgi.application'
ASGI_APPLICATION = 'pathforge.asgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ---------------------------------------------------------------------------
# Database
#
# Microsoft SQL Server via mssql-django. When DB_USER is blank the connection
# falls back to Windows integrated authentication, which is the usual setup for
# a local SQL Server Express instance.
# ---------------------------------------------------------------------------
if env('DB_ENGINE', 'mssql') == 'sqlite':
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }
else:
    _db_user = env('DB_USER', '')
    _options = {
        'driver': env('DB_DRIVER', 'ODBC Driver 18 for SQL Server'),
        'extra_params': (
            f"TrustServerCertificate={env('DB_TRUST_SERVER_CERTIFICATE', 'yes')}"
        ),
    }
    if not _db_user:
        _options['trusted_connection'] = 'yes'

    _db_host = env('DB_HOST', 'localhost')
    # A named instance (localhost\SQLEXPRESS) is resolved by SQL Browser, and
    # supplying a port alongside it makes the driver ignore the instance name.
    _db_port = '' if '\\' in _db_host else env('DB_PORT', '1433')

    DATABASES = {
        'default': {
            'ENGINE': 'mssql',
            'NAME': env('DB_NAME', 'pathforge'),
            'USER': _db_user,
            'PASSWORD': env('DB_PASSWORD', ''),
            'HOST': _db_host,
            'PORT': _db_port,
            'OPTIONS': _options,
        }
    }

# ---------------------------------------------------------------------------
# Migration overrides
#
# simplejwt's token_blacklist ships a migration (0008) that ALTERs a column a
# unique constraint depends on. SQL Server refuses that outright, so the app is
# pointed at a locally generated migration that creates the same tables in their
# final shape — no ALTER, and identical model state on every backend. Delete the
# override and this directory to fall back to the upstream migrations.
# ---------------------------------------------------------------------------
MIGRATION_MODULES = {
    'token_blacklist': 'pathforge.migrations.token_blacklist',
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'accounts.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
     'OPTIONS': {'min_length': 8}},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# ---------------------------------------------------------------------------
# Internationalisation / static files
# ---------------------------------------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

# ---------------------------------------------------------------------------
# Django REST Framework
# ---------------------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 25,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'anon': '60/min',
        'user': '600/min',
    },
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=int(env('JWT_ACCESS_MINUTES', '60'))),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=int(env('JWT_REFRESH_DAYS', '7'))),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'UPDATE_LAST_LOGIN': True,
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'PathForge API',
    'DESCRIPTION': (
        'REST API for PathForge, an interactive pathfinding algorithm visualiser. '
        'Search algorithms execute in the browser; this API provides authentication, '
        'visualisation run history, saved boards and aggregate analytics.'
    ),
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api',
    'TAGS': [
        {'name': 'auth', 'description': 'Registration, login, token refresh and logout'},
        {'name': 'runs', 'description': 'Visualisation run history'},
        {'name': 'grids', 'description': 'Saved boards'},
        {'name': 'statistics', 'description': 'Aggregated analytics for the current user'},
    ],
}

# ---------------------------------------------------------------------------
# CORS — the SPA runs on a different origin during development
# ---------------------------------------------------------------------------
CORS_ALLOWED_ORIGINS = env_list(
    'CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173'
)
CORS_ALLOW_CREDENTIALS = False
