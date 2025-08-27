# views.py
from django.shortcuts import render, redirect
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.urls import reverse
from django.views.decorators.http import require_http_methods
from django.contrib.auth.views import LoginView, PasswordResetView
from django.contrib.messages.views import SuccessMessageMixin
from .forms import (
    CustomUserCreationForm, CustomAuthenticationForm, StudentProfileForm,
    VolunteerProfileForm, UserUpdateForm, CustomPasswordResetForm
)
from .models import User, StudentProfile, VolunteerProfile

@require_http_methods(["GET", "POST"])
def signup_view(request):
    if request.user.is_authenticated:
        return redirect('home:index')
        
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST, request.FILES)
        if form.is_valid():
            user = form.save()
            
            # Create corresponding profile based on user type
            if user.user_type == 'student':
                StudentProfile.objects.create(user=user)
            else:
                VolunteerProfile.objects.create(user=user)
                
            login(request, user)
            messages.success(request, 'Registration successful!')
            return redirect('authentication:complete_profile')
    else:
        form = CustomUserCreationForm()
    
    return render(request, 'authentication/signup.html', {'form': form})

class CustomLoginView(SuccessMessageMixin, LoginView):
    form_class = CustomAuthenticationForm
    template_name = 'authentication/login.html'
    success_message = "Successfully logged in!"
    
    def get_success_url(self):
        if self.request.user.user_type == 'student':
            return reverse('home:student_dashboard')
        return reverse('home:volunteer_dashboard')

@login_required
def complete_profile_view(request):
    user = request.user
    profile_form = None
    
    if user.user_type == 'student':
        profile = StudentProfile.objects.get(user=user)
        form_class = StudentProfileForm
    else:
        profile = VolunteerProfile.objects.get(user=user)
        form_class = VolunteerProfileForm
        
    if request.method == 'POST':
        profile_form = form_class(request.POST, instance=profile)
        user_form = UserUpdateForm(request.POST, request.FILES, instance=user)
        
        if profile_form.is_valid() and user_form.is_valid():
            profile_form.save()
            user_form.save()
            messages.success(request, 'Profile updated successfully!')
            
            if user.user_type == 'student':
                return redirect('home:student_dashboard')
            return redirect('home:volunteer_dashboard')
    else:
        profile_form = form_class(instance=profile)
        user_form = UserUpdateForm(instance=user)
    
    return render(request, 'authentication/profile.html', {
        'profile_form': profile_form,
        'user_form': user_form
    })

class CustomPasswordResetView(PasswordResetView):
    form_class = CustomPasswordResetForm
    template_name = 'authentication/forgot_password.html'
    email_template_name = 'authentication/password_reset_email.html'
    success_url = '/login/'
    
    def form_valid(self, form):
        messages.success(self.request, 'Password reset email has been sent!')
        return super().form_valid(form)

@login_required
def profile_view(request):
    user = request.user
    if user.user_type == 'student':
        profile = StudentProfile.objects.get(user=user)
        template = 'home/student_dashboard.html'
    else:
        profile = VolunteerProfile.objects.get(user=user)
        template = 'home/volunteer_dashboard.html'
    
    return render(request, template, {
        'user': user,
        'profile': profile
    })

@login_required
def logout_view(request):
    logout(request)
    messages.success(request, 'Successfully logged out!')
    return redirect('home:index')




@login_required
def student_profile(request):
    if request.user.user_type != 'student':
        messages.error(request, "Access denied. You are not a student.")
        return redirect('home')
    return render(request, 'authentication/student_profile.html')

@login_required
def volunteer_profile(request):
    if request.user.user_type != 'volunteer':
        messages.error(request, "Access denied. You are not a volunteer.")
        return redirect('home')
    return render(request, 'authentication/volunteer_profile.html')
    
def home(request):
    return render(request, 'home.html')  # Render the home page template