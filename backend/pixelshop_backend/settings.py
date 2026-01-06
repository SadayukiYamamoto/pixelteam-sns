import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-test-key-change-this')
DEBUG = os.environ.get('DJANGO_DEBUG', 'True') == 'True'

ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '*').split(',')

# タイムゾーン設定
LANGUAGE_CODE = 'ja'
TIME_ZONE = 'Asia/Tokyo'
USE_I18N = True
USE_TZ = True

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# SQL (PostgreSQL) configuration for production
if os.environ.get('DATABASE_URL'):
    import dj_database_url
    DATABASES['default'] = dj_database_url.config(conn_max_age=600)
elif os.environ.get('DB_NAME'):
    DATABASES['default'] = {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.environ.get('DB_NAME'),
        'USER': os.environ.get('DB_USER'),
        'PASSWORD': os.environ.get('DB_PASSWORD'),
        'HOST': os.environ.get('DB_HOST', 'localhost'),
        'PORT': os.environ.get('DB_PORT', '5432'),
    }

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework.authtoken',  # ← 🔸これを追加！
    'corsheaders',
    'posts',
    'users',
    'missions',
]

ROOT_URLCONF = 'pixelshop_backend.urls'

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Top for CORS
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Proxy settings for Firebase Hosting
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = True

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

# === 静的ファイル (CSS, JS, 画像など) ===
STATIC_URL = '/static/'

# （開発時のみ）収集先を指定しておくと安心
STATICFILES_DIRS = []
STATIC_ROOT = BASE_DIR / 'staticfiles'

# メディアファイル（ユーザーアップロード用）
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# CSRF settings for proxy
CSRF_TRUSTED_ORIGINS = [
    "https://pixelteamsns.web.app",
    "https://pixelteamsns.firebaseapp.com",
    "https://pixelshop-backend-237007524936.us-central1.run.app", # Add backend URL itself
]
CSRF_ALLOWED_ORIGINS = CSRF_TRUSTED_ORIGINS # Some versions of django use this
CORS_ALLOW_ALL_ORIGINS = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

AUTH_USER_MODEL = 'users.User'

# === REST Framework 設定 ===
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',  # ← これを追加
    ],
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  # ← 認証が必要なデフォルト設定
    ],
}

AUTHENTICATION_BACKENDS = [
    'users.backends.UserIdAuthBackend',  # ← これを追加！
    'django.contrib.auth.backends.ModelBackend',  # 既存も残す
]


