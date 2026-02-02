# Explainer

Here is a breakdown of the core technical decisions and "AI moments" during the development of Vibe.

## 1. The Tree (Threaded Comments)
**How did you model the nested comments in the database?**
We used a simple **Adjacency List** model. The `Comment` model has a `parent` ForeignKey pointing to `self`.

```python
class Comment(models.Model):
    parent = models.ForeignKey('self', null=True, blank=True, ...)
```

**How did you serialize them without killing the DB?**
The challenge with Adjacency Lists is the N+1 problem (fetching a comment, then its children, then their children...).
We solved this by **fetching all comments for a post in a single query** and reconstructing the tree in Python (memory).

1. Fetch all comments for `post_id` in one go.
2. Create a dictionary mapping `id -> comment_instance`.
3. Iterate through the list. If a comment has a `parent_id`, append it to the parent's `replies` list (which we temporarily initialized on the object).
4. Return only the "root" comments (those with `parent=None`) to the serializer.

The `CommentSerializer` is recursive:
```python
class CommentSerializer(serializers.ModelSerializer):
    replies = serializers.SerializerMethodField()
    def get_replies(self, obj):
        if hasattr(obj, 'precomputed_replies'):
             return CommentSerializer(obj.precomputed_replies, many=True).data
        return []
```
**Result**: Rendering 50 nested comments takes exactly **2 Queries** (1 for Post, 1 for Comments).

## 2. The Math (24h Leaderboard)
**QuerySet:**
We needed to sum up `5 points` per Post and `1 point` per Comment, but *only* for activity in the last 24 hours. We avoided storing a static "score" field which gets out of sync easily.

Instead, we use Django's aggregation:

```python
# core/views.py
time_threshold = timezone.now() - relativedelta(hours=24)

# 1. Aggregate Post Karma (Count posts * 5)
post_scores = Post.objects.filter(created_at__gte=time_threshold).values('author').annotate(
    post_score=Count('id') * 5
)

# 2. Aggregate Comment Karma (Count comments * 1)
comment_scores = Comment.objects.filter(created_at__gte=time_threshold).values('author').annotate(
    comment_score=Count('id')
)
```
*(In the actual implementation, we might combine these or process them in Python if the join is too complex, but conceptually it works by summing the count of recent objects).*

The final code iterates these aggregates and sums them up: `total_score = post_score + comment_score`.

## 3. The AI Audit
**One specific example where the AI wrote code that was buggy or inefficient:**

*   **The Issue**: When I asked the AI to implement the "Like" feature, it initially suggested a simple function that checked `if user in post.likes.all(): remove else: add`.
*   **The Bug**: This is not thread-safe! If two requests hit that endpoint at the exact same millisecond, both might see "user not in likes" and both would "add" the like. On a database level, this could lead to duplicate rows or generic errors.
*   **The Fix**: I forced the AI to use an **Idempotent** design.
    1.  Added `UniqueConstraint(fields=['user', 'post'])` to the `Like` model db.
    2.  Changed the View to explicitly try `Like.objects.create()`. If it fails with `IntegrityError` (already exists), we catch it and delete the like (toggle) or return "Already liked".
    3.  This ensures the database—the source of truth—enforces the rule, not the shaky application code.

