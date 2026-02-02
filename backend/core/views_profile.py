from rest_framework import views, status
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import Post
from .serializers import PostSerializer, ProfileSerializer

class UserProfileView(views.APIView):
    def get(self, request, username):
        user = get_object_or_404(User, username=username)
        profile_data = ProfileSerializer(user.profile).data
        
        # Get user's posts
        posts = Post.objects.filter(author=user).order_by('-created_at')
        posts_data = PostSerializer(posts, many=True, context={'request': request}).data
        
        return Response({
            'profile': profile_data,
            'posts': posts_data
        })
