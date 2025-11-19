import React from 'react';
import PostCard from './PostCard';

const Feed = ({ posts, onBoop, onDelete, currentUserId, session }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500 dark:text-gray-400">
        <p>No pets to boop yet! Be the first to post.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      {posts.map((post) => (
        <PostCard 
          key={post._id} 
          post={post} 
          onBoop={onBoop} 
          onDelete={onDelete}
          isOwner={currentUserId && post.userId === currentUserId}
          session={session}
        />
      ))}
    </div>
  );
};

export default Feed;
