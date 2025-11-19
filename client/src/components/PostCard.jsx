import React, { useState } from 'react';
import { Heart, Trash2 } from 'lucide-react'; // Using Heart as a base, but styled as a nose/boop
import { useNavigate } from 'react-router-dom';

const PostCard = ({ post, onBoop, onDelete, isOwner }) => {
  const [isBooped, setIsBooped] = useState(false);
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
        <div className="flex items-center gap-4 mb-3">
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
          <span className="font-bold text-gray-700 dark:text-gray-300">
            {post.boopCount} Boops
          </span>
        </div>

        <p className="text-gray-800 dark:text-gray-200">
          <span className="font-bold mr-2">{post.petName}</span>
          {post.bio}
        </p>
      </div>
    </div>
  );
};

export default PostCard;
