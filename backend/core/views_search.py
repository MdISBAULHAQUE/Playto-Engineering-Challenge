from rest_framework import generics, views, status, permissions
from rest_framework.response import Response
from django.db.models import Count, Q
from django.contrib.auth.models import User
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from .models import Post, Profile
from .serializers import PostSerializer, UserSerializer, ProfileSerializer

class SearchAPIView(views.APIView):
    def get(self, request):
        query = request.query_params.get('q', '')
        if not query:
            return Response({'users': [], 'posts': []})

        users = User.objects.filter(username__icontains=query)[:5]
        posts = Post.objects.filter(content__icontains=query)[:5]

        return Response({
            'users': UserSerializer(users, many=True).data,
            'posts': PostSerializer(posts, many=True).data
        })

class TrendingAPIView(generics.ListAPIView):
    serializer_class = PostSerializer
    
    def get_queryset(self):
        time_threshold = timezone.now() - relativedelta(hours=24)
        return Post.objects.filter(created_at__gte=time_threshold).annotate(
            like_count=Count('likes')
        ).order_by('-like_count')[:5]

class ProfileUpdateView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user.profile)
        return Response(serializer.data)

    def put(self, request):
        serializer = ProfileSerializer(request.user.profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
