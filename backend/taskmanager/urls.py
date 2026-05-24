from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('tasks.urls')),
<<<<<<< HEAD
    path('auth/', include('djoser.urls')),
    path('auth/', include('djoser.urls.jwt')),
=======
    path('api/v1/auth/', include('djoser.urls')),
    path('api/v1/auth/', include('djoser.urls.jwt')),
>>>>>>> 8224f62d054782341a71003b6335b6195a750d10
]