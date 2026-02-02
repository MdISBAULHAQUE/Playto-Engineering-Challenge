from django.test import TestCase, TransactionTestCase
from django.contrib.auth.models import User
from django.db import connection
from django.db.utils import IntegrityError
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from .models import Post, Comment, Like
from django.utils import timezone
from dateutil.relativedelta import relativedelta
import threading
import time

class QueryOptimizationTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='password')
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)
        self.post = Post.objects.create(author=self.user, content="Root post")

    def test_n_plus_one_comments(self):
        # Create nested comments
        parent = None
        for i in range(50):
            comment = Comment.objects.create(
                author=self.user, 
                post=self.post, 
                parent=parent, 
                content=f"Comment {i}"
            )
            parent = comment # strict nesting

        # Clear queries
        connection.queries_log.clear() # Make sure DEBUG=True 

        # Fetch post detail
        # Expecting 2 queries: 
        # 1. Post + Author (Left Join) + Like Count
        # 2. Comments + Authors + Like Counts (Left Join)
        with self.assertNumQueries(2): 
            response = self.client.get(reverse('post-detail', args=[self.post.id]))
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data['comments']), 1) # Only 1 root node

class ConcurrencyTest(TransactionTestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='concurrent', password='pw')
        self.post_obj = Post.objects.create(author=self.user, content="Post")
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

    def test_concurrent_likes(self):
        def like_post():
            # Use a new DB connection for each thread to simulate real concurrency
            from django.db import connection
            connection.close()
            try:
                Like.objects.get_or_create(user=self.user, post=self.post_obj)
            except IntegrityError:
                pass

        threads = []
        for _ in range(10):
            t = threading.Thread(target=like_post)
            threads.append(t)
            t.start()

        for t in threads:
            t.join()

        self.assertEqual(Like.objects.count(), 1)

class LeaderboardTest(TestCase):
    def setUp(self):
        self.u1 = User.objects.create_user(username='winner')
        self.u2 = User.objects.create_user(username='runnerup')
        self.p1 = Post.objects.create(author=self.u1, content="P1")
        self.c1 = Comment.objects.create(author=self.u2, post=self.p1, content="C1")

    def test_scoring_logic(self):
        # Winner (u1) gets 1 post like (+5) from u2
        Like.objects.create(user=self.u2, post=self.p1)
        
        # Runnerup (u2) gets 3 comment likes (+3)
        Like.objects.create(user=self.u1, comment=self.c1)
        Like.objects.create(user=User.objects.create(username='voter'), comment=self.c1)
        Like.objects.create(user=User.objects.create(username='voter2'), comment=self.c1)

        client = APIClient()
        response = client.get(reverse('leaderboard'))
        
        data = response.data
        self.assertEqual(data[0]['username'], 'winner')
        self.assertEqual(data[0]['score'], 5)
        self.assertEqual(data[1]['username'], 'runnerup')
        self.assertEqual(data[1]['score'], 3)

    def test_time_window(self):
        # Old like (+5) for u2
        old_like = Like.objects.create(user=self.u2, post=self.p1) # u1 gets points
        old_like.created_at = timezone.now() - relativedelta(hours=25)
        old_like.save()

        # New like (+5) for u1
        Like.objects.create(user=User.objects.create(username='newvoter'), post=self.p1)

        client = APIClient()
        response = client.get(reverse('leaderboard'))
        # Should only count the new like for u1. Old like ignored.
        self.assertEqual(response.data[0]['score'], 5) 
