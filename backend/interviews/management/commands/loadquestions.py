from django.core.management.base import BaseCommand
from interviews.models import CSQuestion

class Command(BaseCommand):
    help = 'Load sample CS questions into the database'

    def handle(self, *args, **kwargs):
        questions = [
            # Data Structures
            ("Explain the difference between a stack and a queue.", "DS", 2),
            ("What is a B-tree and what are its applications?", "DS", 4),
            ("Explain how a hash table works and what is collision resolution?", "DS", 3),
            ("What is a Red-Black tree and why is it useful?", "DS", 4),
            ("Describe the difference between linked lists and arrays.", "DS", 2),
            ("What is a Trie and when would you use it?", "DS", 3),
            ("Explain how a heap data structure works.", "DS", 3),
            
            # Algorithms
            ("What is the time complexity of binary search?", "ALG", 3),
            ("Explain Dijkstra's algorithm and its applications.", "ALG", 4),
            ("What is dynamic programming and when is it used?", "ALG", 4),
            ("Explain the quicksort algorithm and its time complexity.", "ALG", 3),
            ("What is the difference between DFS and BFS?", "ALG", 3),
            ("Explain the concept of divide and conquer algorithms.", "ALG", 3),
            ("What is the traveling salesman problem and why is it important?", "ALG", 4),
            
            # Databases
            ("Explain the ACID properties in databases.", "DB", 4),
            ("Describe the CAP theorem.", "DB", 4),
            ("What is database normalization and why is it important?", "DB", 3),
            ("Explain the difference between clustered and non-clustered indexes.", "DB", 3),
            ("What is a deadlock in databases and how can it be prevented?", "DB", 4),
            ("Explain the concept of database sharding.", "DB", 4),
            ("What are the differences between NoSQL and SQL databases?", "DB", 3),
            
            # Operating Systems
            ("What is virtual memory?", "OS", 3),
            ("What is a race condition?", "OS", 3),
            ("Explain the difference between processes and threads.", "OS", 3),
            ("What is context switching in operating systems?", "OS", 3),
            ("Explain the concept of deadlock and its prevention.", "OS", 4),
            ("What is paging in operating systems?", "OS", 3),
            ("Describe the producer-consumer problem.", "OS", 4),
            
            # Object-Oriented Programming
            ("What is polymorphism in OOP?", "OOP", 2),
            ("Differentiate between abstraction and encapsulation.", "OOP", 2),
            ("Explain the SOLID principles in OOP.", "OOP", 4),
            ("What is dependency injection and why is it useful?", "OOP", 3),
            ("Explain the concept of inheritance and its types.", "OOP", 2),
            ("What is method overloading vs method overriding?", "OOP", 2),
            ("Describe the singleton pattern and its use cases.", "OOP", 3),
            
            # New Advanced Questions
            ("Explain how eventual consistency works in distributed systems.", "DB", 5),
            ("What is the time complexity of the Floyd-Warshall algorithm?", "ALG", 5),
            ("Describe how virtual memory page replacement algorithms work.", "OS", 5),
            ("Explain the concept of consistent hashing.", "DS", 5),
            ("What are design patterns and explain the MVC pattern.", "OOP", 4),
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