import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import api from '../api';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const LikeButton = ({ type, id, initialCount, initialLiked, className }) => {
    const [liked, setLiked] = useState(initialLiked);
    const [count, setCount] = useState(initialCount);
    const [loading, setLoading] = useState(false);

    const handleLike = async (e) => {
        e.stopPropagation(); // Prevent navigation if on a post card
        if (loading) return;

        // Optimistic Update
        const previousLiked = liked;
        const previousCount = count;
        
        setLiked(!liked);
        setCount(liked ? count - 1 : count + 1);
        setLoading(true);

        try {
            if (previousLiked) {
                // DELETE
                await api.delete('/like/', { data: { [type]: id } });
            } else {
                // POST
                await api.post('/like/', { [type]: id });
            }
        } catch (err) {
            console.error(err);
            // Revert
            setLiked(previousLiked);
            setCount(previousCount);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button 
            onClick={handleLike} 
            className={twMerge("flex items-center space-x-1 transition-colors", 
                liked ? "text-red-500" : "text-gray-500 hover:text-red-400",
                className
            )}
        >
            <Heart className={clsx("w-4 h-4", liked && "fill-current")} />
            <span className="text-sm font-medium">{count}</span>
        </button>
    );
};

export default LikeButton;
