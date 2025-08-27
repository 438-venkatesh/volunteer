from django.views.generic import TemplateView, CreateView
from django.urls import reverse_lazy
from django.contrib import messages
from django.contrib.auth.mixins import LoginRequiredMixin, UserPassesTestMixin
from .models import ContactMessage
from .forms import ContactForm
from django.shortcuts import render

class HomeView(TemplateView):
    template_name = 'home/index.html'

class AboutUsView(TemplateView):
    template_name = 'home/about.html'

class FeaturesView(TemplateView):
    template_name = 'home/features.html'

class ContactView(CreateView):
    template_name = 'home/contact.html'
    model = ContactMessage
    form_class = ContactForm
    success_url = reverse_lazy('home:contact')

    def form_valid(self, form):
        messages.success(self.request, 'Thank you for your message! We will get back to you soon.')
        return super().form_valid(form)

# Temporarily removed LoginRequiredMixin and UserPassesTestMixin for testing
class StudentDashboardView(TemplateView):
    template_name = 'home/student_dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Add test data for the dashboard
        context.update({
            'recommended_mentors': [
                {'name': 'John Doe', 'expertise': 'Mathematics', 'profile_pic': {'url': 'https://ui-avatars.com/api/?name=John+Doe'}},
                {'name': 'Jane Smith', 'expertise': 'Physics', 'profile_pic': {'url': 'https://ui-avatars.com/api/?name=Jane+Smith'}},
                {'name': 'Mike Johnson', 'expertise': 'Chemistry', 'profile_pic': {'url': 'https://ui-avatars.com/api/?name=Mike+Johnson'}},
            ],
            'upcoming_sessions': [
                {'date': '2025-02-10 14:00', 'mentor_name': 'John Doe'},
                {'date': '2025-02-11 15:30', 'mentor_name': 'Jane Smith'},
            ],
            'forum_questions': [
                {
                    'title': 'How to solve quadratic equations?',
                    'student_name': 'Rahul Sharma',
                    'time_ago': '1hr ago',
                    'preview': 'I\'m having trouble understanding the quadratic formula. Can someone explain step by step?',
                    'upvotes': 12,
                    'downvotes': 2
                },
                {
                    'title': 'Best books for JEE preparation?',
                    'student_name': 'Aditi Verma',
                    'time_ago': '3hr ago',
                    'preview': 'Looking for recommendations on the best books for JEE Physics and Chemistry.',
                    'upvotes': 8,
                    'downvotes': 0
                },
                {
                    'title': 'Help with Integration Problems',
                    'student_name': 'Priya Singh',
                    'time_ago': '5hr ago',
                    'preview': 'Need help with solving integration by parts problems.',
                    'upvotes': 5,
                    'downvotes': 1
                }
            ],
            'notifications': [
                {
                    'type': 'session',
                    'message': 'Your mentor session with Dr. Ramesh starts in 30 min!',
                    'time': '5 min ago'
                },
                {
                    'type': 'forum',
                    'message': 'Someone answered your question on Quadratic Equations',
                    'time': '20 min ago'
                },
                {
                    'type': 'material',
                    'message': 'Volunteer Priya uploaded a PDF on Algebra Basics',
                    'time': '1 hr ago'
                },
                {
                    'type': 'session',
                    'message': 'New session scheduled with Jane Smith for tomorrow',
                    'time': '2 hr ago'
                }
            ],
            'study_materials': [
                {
                    'title': 'Algebra Basics',
                    'type': 'PDF',
                    'uploaded_by': 'Dr. Ramesh',
                    'date': '2025-02-09'
                },
                {
                    'title': 'Physics Formulas',
                    'type': 'DOC',
                    'uploaded_by': 'Jane Smith',
                    'date': '2025-02-08'
                },
                {
                    'title': 'Chemistry Notes',
                    'type': 'PDF',
                    'uploaded_by': 'Mike Johnson',
                    'date': '2025-02-07'
                }
            ]
        })
        return context

# Temporarily removed LoginRequiredMixin and UserPassesTestMixin for testing
class VolunteerDashboardView(TemplateView):
    template_name = 'home/volunteer_dashboard.html'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        
        # Add test data for the dashboard
        context.update({
            'total_sessions': 25,
            'students_helped': 42,
            'rating': 4.8,
            'pending_requests': [
                {'student_name': 'Alice Cooper', 'subject': 'Mathematics', 'session_type': '1-on-1'},
                {'student_name': 'Bob Wilson', 'subject': 'Physics', 'session_type': 'Group'},
            ],
            'upcoming_sessions': [
                {'date': '2025-02-10 14:00', 'student_name': 'Charlie Brown'},
                {'date': '2025-02-11 15:30', 'student_name': 'Diana Prince'},
            ],
            'forum_questions': [
                {'title': 'Need help with Integration'},
                {'title': 'Question about Newton\'s Laws'},
            ],
            'top_mentors': [
                {'name': 'You', 'points': 1250},
                {'name': 'Sarah Connor', 'points': 1100},
                {'name': 'Tony Stark', 'points': 1000},
            ],
            'notifications': [
                {'message': 'New session request', 'time': '30 minutes ago'},
                {'message': 'Student feedback received', 'time': '2 hours ago'},
            ],
        })
        return context

def profile(request):
    return render(request, 'authentication/profile.html')
