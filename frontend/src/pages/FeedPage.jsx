import React, { useEffect, useState } from 'react';
import api from '../api';
import Post from '../components/Post';
import { Send } from 'lucide-react';

const FeedPage = () => {
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchFeed = async () => {
        try {
             // For simplicity, fetching all. Pagination logic would go here.
            const res = await api.get('/feed/');
            setPosts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        try {
            await api.post('/feed/', { content: newPostContent });
            setNewPostContent('');
            fetchFeed(); // Refresh feed
        } catch (err) {
            alert('Failed to create post. Are you logged in?');
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* Create Post Input */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <form onSubmit={handleCreatePost}>
                    <textarea 
                        className="w-full border-gray-200 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="What's on your mind?"
                        rows="3"
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                    />
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-400">Markdown supported</span>
                        <button 
                            type="submit" 
                            className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-bold hover:bg-blue-700 transition flex items-center space-x-2"
                        >
                            <span>Post</span>
                            <Send className="w-3 h-3" />
                        </button>
                    </div>
                </form>
            </div>

            {/* Feed */}
            {loading ? (
                <div className="text-center py-10 text-gray-500">Loading feed...</div>
            ) : (
                <div className="space-y-4">
                    {posts.map(post => (
                        <Post key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default FeedPage;
