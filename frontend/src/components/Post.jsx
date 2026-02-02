import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare } from 'lucide-react';
import LikeButton from './LikeButton';

const Post = ({ post, detailed = false }) => {
    return (
        <div className="bg-white rounded-lg shadow-md p-5 mb-4 hover:shadow-lg transition-shadow">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h3 className="text-gray-900 font-bold text-lg">
                        <Link to={`/u/${post.author?.username}`} className="hover:underline hover:text-blue-600">
                            {post.author?.username || 'Anonymous'}
                        </Link>
                    </h3>
                    <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                    </span>
                </div>
            </div>

            <p className="text-gray-800 text-base mb-4 whitespace-pre-wrap leading-relaxed">
                {post.content}
            </p>

            <div className="flex items-center space-x-6 border-t pt-3 border-gray-100">
                <LikeButton 
                    type="post" 
                    id={post.id} 
                    initialCount={post.like_count} 
                    initialLiked={post.user_has_liked} 
                />
                
                {!detailed ? (
                    <Link to={`/posts/${post.id}`} className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm font-medium">{post.comment_count} Comments</span>
                    </Link>
                ) : (
                    <div className="flex items-center space-x-1 text-gray-500">
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm font-medium">{post.comment_count} Comments</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Post;
