import React, { useEffect, useState } from 'react';
import api from '../api';
import Post from '../components/Post';
import { TrendingUp } from 'lucide-react';

const TrendingPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await api.get('/trending/');
                setPosts(res.data);
            } catch (err) {
                console.error("Failed to fetch trending", err);
            } finally {
                setLoading(false);
            }
        };
        fetchTrending();
    }, []);

    if (loading) return <div className="text-center py-10">Loading trending...</div>;

    return (
        <div>
            <div className="mb-6 flex items-center space-x-3">
                <div className="p-3 bg-pink-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-pink-600" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Trending Today</h1>
                    <p className="text-gray-500">Top posts from the community in the last 24h.</p>
                </div>
            </div>

            <div className="space-y-6">
                {posts.map(post => (
                    <Post key={post.id} post={post} />
                ))}
            </div>
        </div>
    );
};

export default TrendingPage;
