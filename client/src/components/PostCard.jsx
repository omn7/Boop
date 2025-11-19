import React, { useState } from 'react';
import { Heart, Trash2 } from 'lucide-react'; // Using Heart as a base, but styled as a nose/boop

const PostCard = ({ post, onBoop, onDelete, isOwner }) => {
  const [isBooped, setIsBooped] = useState(false);

  const handleBoop = () => {
    setIsBooped(true);
    onBoop(post._id);
    // Reset animation state after a short delay
    setTimeout(() => setIsBooped(false), 300);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6 border border-boop-brown/10">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-boop-cream rounded-full flex items-center justify-center text-boop-brown font-bold">
            {post.petName[0]}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{post.petName}</h3>
            <p className="text-xs text-gray-500">{post.breed} • {post.humanName}'s Human</p>
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
      <div className="aspect-square w-full bg-gray-100 relative">
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
                : 'bg-transparent text-boop-brown border-boop-brown hover:bg-boop-cream'
              }
            `}
          >
            <div className={`w-4 h-4 rounded-full ${isBooped ? 'bg-white' : 'bg-boop-brown'}`}></div>
            Boop!
          </button>
          <span className="font-bold text-gray-700">
            {post.boopCount} Boops
          </span>
        </div>

        <p className="text-gray-800">
          <span className="font-bold mr-2">{post.petName}</span>
          {post.bio}
        </p>
      </div>
    </div>
  );
};

export default PostCard;
