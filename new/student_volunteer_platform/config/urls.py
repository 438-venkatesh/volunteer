from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from apps.home.views import profile

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('apps.home.urls')),
    path('auth/', include('apps.authentication.urls' ,namespace='authentication')),
    path('students/', include('apps.students.urls')),
    path('volunteers/', include('apps.volunteers.urls')),
 
    path('admin/', include('apps.admin.urls')),
    path('api/', include('api.urls')),
    path('profile/', profile, name='profile'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
