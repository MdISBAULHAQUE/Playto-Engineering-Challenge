from django.db import models
from django.contrib.auth.models import User
from django.db.models import CheckConstraint, Q, UniqueConstraint

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Post {self.id} by {self.author}"

class Comment(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Comment {self.id} by {self.author}"

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, null=True, blank=True, on_delete=models.CASCADE, related_name='likes')
    comment = models.ForeignKey(Comment, null=True, blank=True, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        constraints = [
            CheckConstraint(
                condition=(Q(post__isnull=False) & Q(comment__isnull=True)) | 
                          (Q(post__isnull=True) & Q(comment__isnull=False)),
                name='like_target_exclusive'
            ),
            UniqueConstraint(
                fields=['user', 'post'], 
                condition=Q(post__isnull=False), 
                name='unique_post_like'
            ),
            UniqueConstraint(
                fields=['user', 'comment'], 
                condition=Q(comment__isnull=False), 
                name='unique_comment_like'
            ),
        ]
        indexes = [
            models.Index(fields=['created_at']), 
        ]

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True, default='')
    avatar = models.CharField(max_length=100, default='default') # Can be a URL or a color code

    def __str__(self):
        return self.user.username

# Signals to auto-create profile
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
