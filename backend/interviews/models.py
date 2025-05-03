from django.db import models
from django.contrib.auth.models import User

# Represents a CS-related interview question stored in the database.
class CSQuestion(models.Model):
    CATEGORY_CHOICES = [
        ('ALG', 'Algorithms'),
        ('DS', 'Data Structures'),
        ('OOP', 'Object-Oriented Programming'),
        ('DB', 'Databases'),
        ('OS', 'Operating Systems'),
        ('NUL', 'None')  # Placeholder if no category fits
    ]
    
    question_text = models.TextField()  # Actual text of the question
    job_title = models.CharField(max_length=255, null=True)  # Optional: related job title
    category = models.CharField(max_length=3, choices=CATEGORY_CHOICES)  # Category tag
    difficulty = models.PositiveSmallIntegerField(default=1)  # 1 to 5 scale
    created_at = models.DateTimeField(auto_now_add=True)  # Auto timestamp when created

    def __str__(self):
        return self.question_text[:100]  # Short preview for admin panel or logs

# Represents a single interview session taken by a user
class Interview(models.Model):
    STATUS_CHOICES = [
        ("IN_PROGRESS", "In Progress"),
        ("COMPLETED", "Completed"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)  # Link to the user
    job_title = models.CharField(max_length=255, null=True)  # Optional: what role they chose
    interview_number = models.PositiveIntegerField(null=True)  # Increments with each new interview
    questions = models.ManyToManyField(CSQuestion)  # Set of questions tied to this interview
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)  # Set when interview is done
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="IN_PROGRESS")

    class Meta:
        unique_together = ['user', 'interview_number']  # Prevents duplicate interview #s per user

    def save(self, *args, **kwargs):
        # Auto-increments interview_number for each user
        if not self.interview_number and self.user:
            last_interview = Interview.objects.filter(user=self.user).order_by('-interview_number').first()
            self.interview_number = (last_interview.interview_number + 1) if last_interview else 1
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Interview #{self.interview_number} - {self.user.username}"

# Stores each answer given by the user during an interview, along with AI feedback
class InterviewAnswer(models.Model):
    interview = models.ForeignKey(Interview, related_name='answers', on_delete=models.CASCADE)
    question = models.ForeignKey(CSQuestion, on_delete=models.CASCADE)
    user_response = models.TextField()  # What the user said or typed
    ai_feedback = models.TextField()  # Response/feedback from the AI
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Answer for Interview {self.interview.id} - Question {self.question.id}"

# Lets users rate specific questions within an interview (like/dislike)
class QuestionRating(models.Model):
    RATING_CHOICES = [
        ('LIKE', 'Like'),
        ('DISLIKE', 'Dislike')
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    question = models.ForeignKey(CSQuestion, on_delete=models.CASCADE)
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE)
    rating = models.CharField(max_length=10, choices=RATING_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ['user', 'question', 'interview']  # Prevents duplicate ratings

    def __str__(self):
        return f"{self.user.username} - {self.rating} - {self.question_id}"

# Stores final feedback given by the user for the whole interview session
class InterviewFeedback(models.Model):
    interview = models.OneToOneField(Interview, on_delete=models.CASCADE, related_name='feedback')
    content = models.TextField()  # What the user had to say overall
    rating = models.PositiveSmallIntegerField(default=0)  # Optional score (e.g., 1 to 5)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback for Interview #{self.interview.interview_number}"
