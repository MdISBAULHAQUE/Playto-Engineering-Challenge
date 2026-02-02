import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import Post from '../components/Post';
import { User, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const UserProfilePage = () => {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const res = await api.get(`/u/${username}/`);
                setProfile(res.data.profile);
                setPosts(res.data.posts);
            } catch (err) {
                toast.error("User not found");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    if (loading) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;
    if (!profile) return <div className="p-8 text-center text-red-500">User not found</div>;

    return (
        <div>
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-32"></div>
                <div className="px-8 pb-8 relative">
                    <div className="absolute -top-12 left-8 bg-white p-1 rounded-full shadow-lg">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-gray-400 border-4 border-white shadow overflow-hidden">
                             {/* Placeholder Avatar */}
                             {profile.avatar && profile.avatar !== 'default' ? (
                                <img src={profile.avatar} alt={profile.username} className="w-full h-full object-cover" />
                             ) : ( 
                                <span className="text-3xl font-bold uppercase text-blue-500 bg-blue-50 w-full h-full flex items-center justify-center">
                                    {profile.username[0]}
                                </span>
                             )}
                        </div>
                    </div>
                    
                    <div className="mt-14">
                        <h1 className="text-2xl font-bold text-gray-900">@{profile.username}</h1>
                        <p className="text-gray-600 mt-2">{profile.bio || "No bio yet."}</p>
                    </div>
                </div>
            </div>

            {/* Posts */}
            <h2 className="text-xl font-bold text-gray-800 mb-4">Posts</h2>
            {posts.length === 0 ? (
                <div className="text-center py-10 text-gray-400 bg-white rounded-xl border border-dashed">
                    No posts yet.
                </div>
            ) : (
                <div className="space-y-6">
                    {posts.map(post => (
                        <Post key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default UserProfilePage;
