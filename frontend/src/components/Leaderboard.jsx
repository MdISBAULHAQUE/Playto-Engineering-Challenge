import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, ArrowUp } from 'lucide-react';
import api from '../api';

const Leaderboard = () => {
    const [users, setUsers] = useState([]);
    
    const fetchLeaderboard = async () => {
        try {
            const res = await api.get('/leaderboard/');
            setUsers(res.data);
        } catch (err) {
            console.error("Failed to fetch leaderboard", err);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        const interval = setInterval(fetchLeaderboard, 30000); // 30s pull
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex items-center space-x-2 mb-4">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <h2 className="text-lg font-bold text-gray-900">Leaderboard</h2>
            </div>
            
            <div className="space-y-3">
                {users.map((user, index) => (
                    <div key={user.username} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition">
                        <div className="flex items-center space-x-3">
                            <span className={`
                                w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold
                                ${index === 0 ? 'bg-yellow-100 text-yellow-700' : 
                                  index === 1 ? 'bg-gray-100 text-gray-700' : 
                                  index === 2 ? 'bg-orange-100 text-orange-700' : 'text-gray-500'}
                            `}>
                                {index + 1}
                            </span>
                            <span className="font-medium text-gray-700">
                                <Link to={`/u/${user.username}`} className="hover:underline">{user.username}</Link>
                            </span>
                        </div>
                        <div className="flex items-center space-x-1 text-green-600">
                            <ArrowUp className="w-3 h-3" />
                            <span className="font-bold text-sm">{user.score}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Leaderboard;
