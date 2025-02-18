from django.core.management.base import BaseCommand
from interviews.models import CSQuestion

class Command(BaseCommand):
    help = 'Load sample CS questions into the database'

    def handle(self, *args, **kwargs):
        questions = [
            ("Explain the difference between a stack and a queue.", "DS", 2),
            ("What is the time complexity of binary search?", "ALG", 3),
            ("Explain the ACID properties in databases.", "DB", 4),
            ("What is virtual memory?", "OS", 3),
            ("What is polymorphism in OOP?", "OOP", 2),
            ("Describe the CAP theorem.", "DB", 4),
            ("Explain Dijkstra's algorithm.", "ALG", 4),
            ("What is a race condition?", "OS", 3),
            ("Differentiate between abstraction and encapsulation.", "OOP", 2),
            ("What is a B-tree?", "DS", 4),
        ]

        created_count = 0
        for q_text, cat, diff in questions:
            _, created = CSQuestion.objects.get_or_create(
                question_text=q_text,
                defaults={
                    'category': cat,
                    'difficulty': diff
                }
            )
            if created:
                created_count += 1

        self.stdout.write(self.style.SUCCESS(
            f'Successfully loaded {created_count} questions. ' 
            f'Skipped {len(questions)-created_count} duplicates.'
        ))