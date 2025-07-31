from django.urls import path
from .views import BrandMapAPIView

urlpatterns = [
    path('api/brandmap/', BrandMapAPIView.as_view(), name='brandmap-api'),
]