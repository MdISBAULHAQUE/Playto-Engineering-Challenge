import React, { useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';
import { User, Save, Camera } from 'lucide-react';

const SettingsPage = ({ user, setUser }) => {
    const [bio, setBio] = useState('');
    const [username, setUsername] = useState(user?.username || '');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/profile/settings/');
                setBio(res.data.bio || '');
                setUsername(res.data.username || user?.username || '');
                setLoading(false);
            } catch (err) {
                toast.error("Failed to load profile");
            }
        };
        fetchProfile();
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.put('/profile/settings/', { bio });
            if (username !== user.username) {
                await api.post('/profile/username/', { username });
                setUser({ ...user, username });
            }
            toast.success("Profile updated!");
        } catch (err) {
            toast.error(err.response?.data?.error || "Update failed");
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto">
             <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-blue-600 h-32 relative">
                    <div className="absolute -bottom-10 left-8">
                        <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                <User className="w-10 h-10" />
                            </div>
                        </div>
                        <button className="absolute bottom-0 right-0 bg-gray-800 text-white p-1.5 rounded-full shadow-md hover:bg-gray-700">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="pt-16 pb-8 px-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h1>
                    
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                            <input 
                                type="text" 
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                            <textarea 
                                className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
                                placeholder="Tell us about yourself..."
                                value={bio}
                                onChange={e => setBio(e.target.value)}
                            />
                        </div>

                        <div className="flex justify-end">
                            <button 
                                type="submit" 
                                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition"
                            >
                                <Save className="w-4 h-4" />
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </form>
                </div>
             </div>
        </div>
    );
};

export default SettingsPage;
