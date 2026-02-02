import React, { useState } from 'react';
import api from '../api';
import { User, Check } from 'lucide-react';

const ProfilePage = ({ user, setUser }) => {
    const [newUsername, setNewUsername] = useState(user?.username || '');
    const [msg, setMsg] = useState('');
    const [error, setError] = useState('');

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/profile/username/', { username: newUsername });
            setUser({ ...user, username: newUsername });
            setMsg('Username updated successfully');
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Update failed');
            setMsg('');
        }
    };

    return (
        <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-lg shadow">
            <div className="flex items-center space-x-3 mb-6">
                <div className="bg-blue-100 p-3 rounded-full">
                    <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                    <h2 className="text-xl font-bold">Profile Settings</h2>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                </div>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <div className="flex space-x-2">
                        <input 
                            type="text" 
                            className="flex-1 border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                            value={newUsername}
                            onChange={e => setNewUsername(e.target.value)}
                        />
                        <button 
                            type="submit" 
                            className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-800"
                        >
                            Update
                        </button>
                    </div>
                </div>
                {msg && <p className="text-green-600 text-sm flex items-center"><Check className="w-4 h-4 mr-1"/> {msg}</p>}
                {error && <p className="text-red-600 text-sm">{error}</p>}
            </form>
        </div>
    );
};

export default ProfilePage;
