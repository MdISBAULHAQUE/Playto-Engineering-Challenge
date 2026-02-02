from django.shortcuts import get_object_or_404
from django.db import IntegrityError, transaction
from django.db.models import Count, Exists, OuterRef, Sum, Case, When, IntegerField, Q, F
from django.db.models.functions import Coalesce
from django.utils import timezone
from dateutil.relativedelta import relativedelta
from rest_framework import generics, status, views, permissions
from rest_framework.response import Response
from .models import Post, Comment, Like
from .serializers import PostSerializer, PostDetailSerializer, CommentSerializer, LeaderboardEntrySerializer, LikeSerializer

def get_annotated_posts(user=None):
    qs = Post.objects.select_related('author').annotate(
        like_count=Count('likes'),
        comment_count=Count('comments')
    ).order_by('-created_at')
    
    if user and user.is_authenticated:
        qs = qs.annotate(
             user_has_liked=Exists(
                 Like.objects.filter(post=OuterRef('pk'), user=user)
             )
        )
    else:
        qs = qs.extra(select={'user_has_liked': 'f'})
        
    return qs

def get_annotated_comments(post_id, user=None):
    qs = Comment.objects.filter(post_id=post_id).select_related('author').annotate(
        like_count=Count('likes')
    ).order_by('created_at') # Order by creation for stability
    
    if user and user.is_authenticated:
        qs = qs.annotate(
             user_has_liked=Exists(
                 Like.objects.filter(comment=OuterRef('pk'), user=user)
             )
        )
    else:
         qs = qs.extra(select={'user_has_liked': 'f'})
    return qs

class FeedList(generics.ListCreateAPIView):
    serializer_class = PostSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        return get_annotated_posts(self.request.user)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class PostDetail(generics.RetrieveAPIView):
    serializer_class = PostDetailSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'id'

    def get_queryset(self):
        return get_annotated_posts(self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Optimized Comment Tree Building
        comments = get_annotated_comments(instance.id, request.user)
        comment_dict = {}
        roots = []
        
        # First pass: map and init
        for comment in comments:
            comment.precomputed_replies = []
            comment_dict[comment.id] = comment
            
        # Second pass: tree structure
        for comment in comments:
            if comment.parent_id:
                parent = comment_dict.get(comment.parent_id)
                if parent:
                    parent.precomputed_replies.append(comment)
            else:
                roots.append(comment)
                
        instance.root_comments = roots
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

class LikeView(views.APIView):
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = LikeSerializer(data=request.data)
        if serializer.is_valid():
            post = serializer.validated_data.get('post')
            comment = serializer.validated_data.get('comment')
            
            try:
                # Idempotent creation
                Like.objects.get_or_create(
                    user=request.user,
                    post=post,
                    comment=comment
                )
                return Response({'status': 'liked'}, status=status.HTTP_201_CREATED)
            except IntegrityError:
                 # Should be handled by get_or_create, but extra safety
                 return Response({'status': 'liked'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        # We need to expect post_id or comment_id in data or query params
        # For simplicity, let's use the body same as POST
        post_id = request.data.get('post')
        comment_id = request.data.get('comment')
        
        if not post_id and not comment_id:
            return Response({'error': 'Provide post or comment id'}, status=status.HTTP_400_BAD_REQUEST)

        Like.objects.filter(
            user=request.user, 
            post_id=post_id, 
            comment_id=comment_id
        ).delete()
        
        return Response({'status': 'unliked'}, status=status.HTTP_204_NO_CONTENT)

class CommentCreate(generics.CreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class LeaderboardView(views.APIView):
    def get(self, request):
        # Last 24 hours
        time_threshold = timezone.now() - relativedelta(hours=24)
        
        # Aggregation: Group by Target User (Author of Content), NOT Liker
        # We coalesce post__author__username and comment__author__username
        leaderboard = Like.objects.filter(
            created_at__gte=time_threshold
        ).annotate(
            target_username=Coalesce('post__author__username', 'comment__author__username')
        ).values('target_username').annotate(
            score=Sum(
                Case(
                    When(post__isnull=False, then=5),
                    When(comment__isnull=False, then=1),
                    default=0,
                    output_field=IntegerField()
                )
            )
        ).order_by('-score')[:5]
        
        serializer = LeaderboardEntrySerializer(leaderboard, many=True)
        return Response(serializer.data)
