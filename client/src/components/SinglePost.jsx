import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import PostCard from './PostCard';
import { Loader2, ArrowLeft } from 'lucide-react';

const SinglePost = ({ session, onBoop, onDelete }) => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPost();
  }, [postId]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const { data: postData, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;

      // Format post to match PostCard expectation
      const formattedPost = {
        _id: postData.id,
        userId: postData.user_id,
        username: postData.profiles?.username,
        authorAvatar: postData.profiles?.avatar_url,
        petName: postData.pet_name,
        breed: postData.breed,
        humanName: postData.human_name,
        bio: postData.bio,
        imageUrl: postData.image_url,
        boopCount: postData.boop_count
      };

      setPost(formattedPost);
    } catch (error) {
      console.error('Error fetching post:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-boop-brown" /></div>;
  }

  if (!post) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Post not found.</p>
        <button onClick={() => navigate('/')} className="text-boop-brown font-bold mt-4">Go Home</button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto py-6 px-4">
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-boop-brown mb-4 transition-colors"
      >
        <ArrowLeft size={20} />
        Back
      </button>
      <PostCard 
        post={post} 
        onBoop={onBoop} 
        onDelete={() => {
            onDelete(post._id);
            navigate('/');
        }}
        isOwner={session?.user?.id === post.userId}
        session={session} // Pass session for commenting
      />
    </div>
  );
};

export default SinglePost;
