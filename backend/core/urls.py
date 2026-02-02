from django.urls import path
from .views import FeedList, PostDetail, LikeView, LeaderboardView, CommentCreate
from .views_auth import RegisterView, CustomAuthToken, ChangeUsernameView
from .views_search import SearchAPIView, TrendingAPIView, ProfileUpdateView
from .views_profile import UserProfileView

urlpatterns = [
    path('feed/', FeedList.as_view(), name='feed'),
    path('posts/<int:id>/', PostDetail.as_view(), name='post-detail'),
    path('comments/', CommentCreate.as_view(), name='create-comment'),
    path('like/', LikeView.as_view(), name='like'),
    path('leaderboard/', LeaderboardView.as_view(), name='leaderboard'),
    
    # Auth
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', CustomAuthToken.as_view(), name='login'),
    path('profile/username/', ChangeUsernameView.as_view(), name='change-username'),
    
    # New Features
    path('search/', SearchAPIView.as_view(), name='search'),
    path('trending/', TrendingAPIView.as_view(), name='trending'),
    path('profile/settings/', ProfileUpdateView.as_view(), name='profile-settings'),
    path('u/<str:username>/', UserProfileView.as_view(), name='public-profile'),
]
