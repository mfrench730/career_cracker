# interviews/models.py
from django.db import models
from django.contrib.auth.models import User

class CSQuestion(models.Model):
    CATEGORY_CHOICES = [
        ('ALG', 'Algorithms'),
        ('DS', 'Data Structures'),
        ('OOP', 'Object-Oriented Programming'),
        ('DB', 'Databases'),
        ('OS', 'Operating Systems'),
        ('NUL', 'None')
    ]
    
    question_text = models.TextField()
    job_title = models.CharField(max_length=255, null=True)
    category = models.CharField(max_length=3, choices=CATEGORY_CHOICES)
    difficulty = models.PositiveSmallIntegerField(default=1)  # 1-5 scale
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question_text[:100]

class Interview(models.Model):
    STATUS_CHOICES = [
        ("IN_PROGRESS", "In Progress"),
        ("COMPLETED", "Completed"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    job_title = models.CharField(max_length=255, null=True)
    interview_number = models.PositiveIntegerField(null=True)
    questions = models.ManyToManyField(CSQuestion)
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="IN_PROGRESS")

    class Meta:
        unique_together = ['user', 'interview_number']

    def save(self, *args, **kwargs):
        if not self.interview_number and self.user:
            last_interview = Interview.objects.filter(user=self.user).order_by('-interview_number').first()
            self.interview_number = (last_interview.interview_number + 1) if last_interview else 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Interview #{self.interview_number} - {self.user.username}"

class InterviewAnswer(models.Model):
    interview = models.ForeignKey(Interview, related_name='answers', on_delete=models.CASCADE)
    question = models.ForeignKey(CSQuestion, on_delete=models.CASCADE)
    user_response = models.TextField()
    ai_feedback = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Answer for Interview {self.interview.id} - Question {self.question.id}"