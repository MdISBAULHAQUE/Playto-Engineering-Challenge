import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import Post from '../components/Post';
import CommentTree from '../components/CommentTree';

const PostPage = () => {
    const { id } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [replyContent, setReplyContent] = useState('');

    const fetchPost = async () => {
        try {
            const res = await api.get(`/posts/${id}/`);
            setPost(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPost();
    }, [id]);

    const handleComment = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        try {
            await api.post('/comments/', { 
                post: id, 
                content: replyContent,
                parent: null // Root comment
            });
            setReplyContent('');
            fetchPost(); // Refresh tree
        } catch (err) {
            alert('Failed to post comment.');
        }
    };

    if (loading) return <div className="text-center mt-10">Loading...</div>;
    if (!post) return <div className="text-center mt-10">Post not found</div>;

    return (
        <div className="max-w-3xl mx-auto">
            <Post post={post} detailed />
            
            <div className="mt-6 mb-8">
                <h3 className="text-lg font-bold mb-4">Discussion</h3>
                
                {/* Comment Box */}
                <form onSubmit={handleComment} className="mb-6">
                    <textarea 
                        className="w-full border p-3 rounded-lg text-sm mb-2" 
                        placeholder="Add to the discussion..." 
                        rows="2"
                        value={replyContent}
                        onChange={(e) => setReplyContent(e.target.value)}
                    />
                    <button 
                        type="submit" 
                        className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-gray-800"
                    >
                        Comment
                    </button>
                </form>

                <CommentTree comments={post.comments} />
            </div>
        </div>
    );
};

export default PostPage;
