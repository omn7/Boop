import React, { useState, useEffect } from 'react';
import { Heart, Trash2, MessageCircle, Share2, Send, X } from 'lucide-react'; // Using Heart as a base, but styled as a nose/boop
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const PostCard = ({ post, onBoop, onDelete, isOwner, session }) => {
  const [isBooped, setIsBooped] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const navigate = useNavigate();

  const handleBoop = () => {
    setIsBooped(true);
    onBoop(post._id);
    // Reset animation state after a short delay
    setTimeout(() => setIsBooped(false), 300);
  };

  const handleProfileClick = () => {
    if (post.username) {
      navigate(`/u/${post.username}`);
    }
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/post/${post._id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Check out ${post.petName} on Boop!`,
          text: post.bio,
          url: url,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const fetchComments = async () => {
    if (!showComments && comments.length === 0) {
      setLoadingComments(true);
      try {
        const { data, error } = await supabase
          .from('comments')
          .select(`
            *,
            profiles (
              username,
              pet_name,
              avatar_url
            )
          `)
          .eq('post_id', post._id)
          .order('created_at', { ascending: true });
        
        if (error) throw error;
        setComments(data || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !session?.user) return;

    try {
      const { data, error } = await supabase
        .from('comments')
        .insert([
          {
            post_id: post._id,
            user_id: session.user.id,
            content: newComment.trim()
          }
        ])
        .select(`
            *,
            profiles (
              username,
              pet_name,
              avatar_url
            )
        `)
        .single();

      if (error) throw error;

      setComments([...comments, data]);
      setNewComment('');
      
      // Notify post owner if not self
      if (post.userId !== session.user.id) {
        await supabase
          .from('notifications')
          .insert([{
            type: 'comment',
            sender_id: session.user.id,
            recipient_id: post.userId,
            post_id: post._id,
            read: false
          }]);
      }

    } catch (error) {
      console.error('Error posting comment:', error);
      alert(`Failed to post comment: ${error.message || error.error_description || 'Unknown error'}`);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-sm overflow-hidden mb-6 border border-boop-brown/10 dark:border-gray-800 transition-colors duration-300">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={handleProfileClick}
        >
          <div className="w-10 h-10 bg-boop-cream rounded-full flex items-center justify-center text-boop-brown font-bold overflow-hidden border border-boop-brown/10">
            {post.authorAvatar ? (
              <img src={post.authorAvatar} alt={post.petName} className="w-full h-full object-cover" />
            ) : (
              post.petName[0]
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-800 dark:text-gray-100 hover:text-boop-brown transition-colors">{post.petName}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {post.username ? `@${post.username}` : post.breed} • {post.humanName}'s Human
            </p>
          </div>
        </div>
        
        {isOwner && (
          <button 
            onClick={() => onDelete(post._id)}
            className="text-gray-400 hover:text-red-500 transition-colors p-2"
            title="Delete Post"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Image */}
      <div className="aspect-square w-full bg-gray-100 dark:bg-black relative">
        <img 
          src={post.imageUrl} 
          alt={post.petName}  
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>

      {/* Actions & Content */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-4">
            <button 
                onClick={handleBoop}
                className={`
                flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 font-bold border-2
                ${isBooped 
                    ? 'bg-boop-brown text-white border-boop-brown scale-105' 
                    : 'bg-transparent text-boop-brown dark:text-boop-cream border-boop-brown dark:border-boop-cream hover:bg-boop-cream dark:hover:bg-zinc-800'
                }
                `}
            >
                <div className={`w-4 h-4 rounded-full ${isBooped ? 'bg-white' : 'bg-boop-brown dark:bg-boop-cream'}`}></div>
                Boop!
            </button>
            
            <button 
                onClick={fetchComments}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                title="Comments"
            >
                <MessageCircle size={24} />
            </button>

            <button 
                onClick={handleShare}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-full transition-colors"
                title="Share"
            >
                <Share2 size={24} />
            </button>
          </div>
          
          <span className="font-bold text-gray-700 dark:text-gray-300 text-sm">
            {post.boopCount} Boops
          </span>
        </div>

        <p className="text-gray-800 dark:text-gray-200 mb-2">
          <span className="font-bold mr-2">{post.petName}</span>
          {post.bio}
        </p>

        {/* Comments Section */}
        {showComments && (
            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
                <h4 className="font-bold text-sm text-gray-500 dark:text-gray-400 mb-3">Comments</h4>
                
                {loadingComments ? (
                    <div className="text-center py-4 text-gray-400 text-sm">Loading comments...</div>
                ) : comments.length > 0 ? (
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                        {comments.map((comment) => (
                            <div key={comment.id} className="flex gap-2 items-start text-sm">
                                <span className="font-bold text-gray-800 dark:text-gray-200 shrink-0">
                                    {comment.profiles?.pet_name || 'User'}:
                                </span>
                                <span className="text-gray-600 dark:text-gray-300 break-words">
                                    {comment.content}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm mb-4 italic">No comments yet. Be the first!</p>
                )}

                {/* Add Comment Form */}
                <form onSubmit={handlePostComment} className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Add a comment..." 
                        className="flex-1 bg-gray-100 dark:bg-zinc-800 border-none rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-boop-brown outline-none dark:text-gray-200"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                    />
                    <button 
                        type="submit"
                        disabled={!newComment.trim()}
                        className="p-2 text-boop-brown dark:text-boop-cream hover:bg-boop-cream dark:hover:bg-zinc-800 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        )}
      </div>
    </div>
  );
};

export default PostCard;
