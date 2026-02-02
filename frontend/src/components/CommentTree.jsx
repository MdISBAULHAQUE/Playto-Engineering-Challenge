import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Send } from 'lucide-react';
import LikeButton from './LikeButton';
import api from '../api';

const CommentNode = ({ comment, depth = 0 }) => {
    const [replying, setReplying] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    
    // Limit indentation depth to prevent UI breaking
    const maxDepth = 8;
    const indentationClass = depth > 0 
        ? "border-l-2 border-gray-200 pl-4 ml-2" 
        : "";

    const handleReply = async (e) => {
        e.preventDefault();
        if (!replyContent.trim()) return;

        try {
            await api.post('/comments/', { 
                post: comment.post, // Required now
                parent: comment.id,
                content: replyContent
            });
            setReplying(false);
            setReplyContent('');
            // Optional: trigger refresh -> In a real app we'd use Context or SWR/Query to refresh the tree
            // For now, reload or alert
            window.location.reload(); 
        } catch (err) {
            alert('Failed to post reply.');
        }
    };

    return (
        <div className={`mt-3 ${indentationClass}`}>
            <div className="bg-white p-3 rounded shadow-sm">
                <div className="flex justify-between items-start text-xs text-gray-500 mb-1">
                    <span className="font-semibold text-gray-800">
                        {comment.author?.username || 'Unknown'}
                    </span>
                    <span>
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                    </span>
                </div>
                
                <p className="text-gray-800 text-sm mb-2 whitespace-pre-wrap">
                    {comment.content}
                </p>

                <div className="flex items-center space-x-4">
                    <LikeButton 
                        type="comment" 
                        id={comment.id} 
                        initialCount={comment.like_count} 
                        initialLiked={comment.user_has_liked} 
                    />
                    <button 
                        onClick={() => setReplying(!replying)}
                        className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
                    >
                        <MessageSquare className="w-4 h-4" />
                        <span className="text-sm">Reply</span>
                    </button>
                </div>

                {replying && (
                    <form onSubmit={handleReply} className="mt-3 flex items-center space-x-2">
                         <input 
                            type="text" 
                            autoFocus
                            className="flex-1 border-gray-300 rounded-lg text-sm px-3 py-1 focus:ring-1 focus:ring-blue-500 outline-none border"
                            placeholder="Write a reply..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                         />
                         <button type="submit" className="text-blue-600 hover:text-blue-800 p-1">
                             <Send className="w-4 h-4" />
                         </button>
                    </form>
                )}
            </div>

            {/* Recursive Children */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2">
                    {comment.replies.map(reply => (
                        <CommentNode key={reply.id} comment={reply} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

const CommentTree = ({ comments }) => {
    if (!comments || comments.length === 0) return null;

    return (
        <div className="space-y-4">
            {comments.map(comment => (
                <CommentNode key={comment.id} comment={comment} />
            ))}
        </div>
    );
};

export default CommentTree;
