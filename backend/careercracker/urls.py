# careercracker/urls.py
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/accounts/', include('accounts.urls')),  # Single source for auth routes
    path('api/interviews/', include('interviews.urls')),
    path('api/jobs/', include('jobs.urls')),
]