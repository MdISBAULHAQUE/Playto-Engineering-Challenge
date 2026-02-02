import React, { useState } from 'react';
import api from '../api';
import Post from '../components/Post';
import { Search, User } from 'lucide-react';
import toast from 'react-hot-toast';

const SearchPage = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const res = await api.get(`/search/?q=${query}`);
            setResults(res.data);
            if (res.data.users.length === 0 && res.data.posts.length === 0) {
                toast("No results found", { icon: '🔍' });
            }
        } catch (err) {
            toast.error("Search failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <h2 className="text-xl font-bold mb-4">Search</h2>
                <form onSubmit={handleSearch} className="relative">
                    <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
                    <input 
                        type="text" 
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                        placeholder="Search for people or posts..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </form>
            </div>

            {loading && <div className="text-center py-10 text-gray-500">Searching...</div>}

            {results && (
                <div className="space-y-8">
                    {/* Users Section */}
                    {results.users.length > 0 && (
                        <div>
                            <h3 className="font-bold text-gray-600 mb-3 uppercase text-xs tracking-wider">People</h3>
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y">
                                {results.users.map(u => (
                                    <div key={u.id} className="p-4 flex items-center space-x-3">
                                        <div className="bg-gray-200 p-2 rounded-full">
                                            <User className="w-5 h-5 text-gray-600" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">@{u.username}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Posts Section */}
                    {results.posts.length > 0 && (
                        <div>
                            <h3 className="font-bold text-gray-600 mb-3 uppercase text-xs tracking-wider">Posts</h3>
                            {results.posts.map(post => (
                                <Post key={post.id} post={post} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SearchPage;
