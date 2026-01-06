from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.conf import settings
from django.conf.urls.static import static

def home(request):
    return HttpResponse("Welcome to Pixel Shop!")

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),  # ← MyPageとLoginはこちら
    path('api/', include('posts.urls')),  # ← 投稿一覧はこちら
    path('api/missions/', include('missions.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
