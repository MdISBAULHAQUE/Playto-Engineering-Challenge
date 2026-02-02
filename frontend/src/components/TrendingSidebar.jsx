import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, FileText } from 'lucide-react';
import api from '../api';

const TrendingSidebar = () => {
    const [posts, setPosts] = useState([]);

    useEffect(() => {
        const fetchTrending = async () => {
            try {
                const res = await api.get('/trending/');
                setPosts(res.data);
            } catch (err) {
                console.error("Failed to fetch trending", err);
            }
        };
        fetchTrending();
    }, []);

    if (posts.length === 0) return null;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
            <h3 className="font-bold text-gray-800 flex items-center mb-4">
                <TrendingUp className="w-5 h-5 text-pink-500 mr-2" />
                Trending Today
            </h3>
            <div className="space-y-4">
                {posts.map(post => (
                    <Link to={`/posts/${post.id}`} key={post.id} className="block group">
                         <h4 className="text-sm font-medium text-gray-800 group-hover:text-blue-600 line-clamp-2 transition-colors">
                            {post.content}
                         </h4>
                         <p className="text-xs text-gray-500 mt-1 flex items-center">
                            <FileText className="w-3 h-3 mr-1" />
                            {post.like_count} likes · {post.author?.username}
                         </p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default TrendingSidebar;
