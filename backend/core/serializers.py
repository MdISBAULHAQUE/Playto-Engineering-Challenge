from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Post, Comment, Like, Profile

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    like_count = serializers.IntegerField(read_only=True)
    user_has_liked = serializers.BooleanField(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author', 'post', 'content', 'created_at', 'parent', 'like_count', 'user_has_liked', 'replies']

    def get_replies(self, obj):
        if hasattr(obj, 'precomputed_replies'):
            return CommentSerializer(obj.precomputed_replies, many=True, context=self.context).data
        return []

class PostSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    like_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    user_has_liked = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Post
        fields = ['id', 'author', 'content', 'created_at', 'like_count', 'comment_count', 'user_has_liked']

class PostDetailSerializer(PostSerializer):
    comments = serializers.SerializerMethodField()

    class Meta(PostSerializer.Meta):
        fields = PostSerializer.Meta.fields + ['comments']

    def get_comments(self, obj):
        # We expect the view to attach 'root_comments' to the post object
        if hasattr(obj, 'root_comments'):
            return CommentSerializer(obj.root_comments, many=True, context=self.context).data
        return []

class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = ['post', 'comment']
        
    def validate(self, data):
        post = data.get('post')
        comment = data.get('comment')
        
        if post and comment:
            raise serializers.ValidationError("Cannot like both post and comment at the same time.")
        if not post and not comment:
            raise serializers.ValidationError("Must like either post or comment.")
            
        return data

class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Profile
        fields = ['bio', 'avatar', 'username']

class LeaderboardEntrySerializer(serializers.Serializer):
    username = serializers.CharField(source='target_username')
    score = serializers.IntegerField()
