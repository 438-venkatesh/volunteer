from django.urls import path
from . import views

app_name = 'home'

urlpatterns = [
    path('', views.HomeView.as_view(), name='index'),
    path('about/', views.AboutUsView.as_view(), name='about'),
    path('features/', views.FeaturesView.as_view(), name='features'),
    path('contact/', views.ContactView.as_view(), name='contact'),
    path('student/dashboard/', views.StudentDashboardView.as_view(), name='student_dashboard'),
    path('volunteer/dashboard/', views.VolunteerDashboardView.as_view(), name='volunteer_dashboard'),
]
