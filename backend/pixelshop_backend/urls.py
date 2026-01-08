from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static

def home(request):
    return HttpResponse("Welcome to Pixel Shop!")

api_patterns = [
    path('', include('users.urls')),
    path('', include('posts.urls')),
    path('missions/', include('missions.urls')),
]

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('api/', include(api_patterns)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
