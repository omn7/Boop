import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { User, Save, Loader2, Grid, Edit2, Trash2 } from 'lucide-react';

export default function Profile({ session }) {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    pet_name: '',
    breed: '',
    human_name: '',
    bio: '',
    avatar_url: ''
  });
  const [userPosts, setUserPosts] = useState([]);

  useEffect(() => {
    getProfile();
    getUserPosts();
  }, [session]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { user } = session;

      let { data, error } = await supabase
        .from('profiles')
        .select(`pet_name, breed, human_name, bio, avatar_url`)
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.warn(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserPosts = async () => {
    try {
      const { user } = session;
      // Note: This requires the 'user_id' column to be added to the 'posts' table
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUserPosts(data || []);
    } catch (error) {
      console.log('Could not fetch user posts (column might be missing):', error.message);
    }
  };

  const updateProfile = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);
      const { user } = session;

      const updates = {
        id: user.id,
        ...profile,
        updated_at: new Date(),
      };

      let { error } = await supabase.from('profiles').upsert(updates);

      if (error) {
        throw error;
      }
      setIsEditing(false);
    } catch (error) {
      alert(error.message);
    } finally {
      setUpdating(false);
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setUserPosts(userPosts.filter(post => post.id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post');
    }
  };

  if (loading) {
    return <div className="flex justify-center p-10"><Loader2 className="animate-spin text-boop-brown" /></div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-boop-brown/10 overflow-hidden mb-6">
        <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-boop-cream rounded-full flex items-center justify-center text-4xl border-4 border-white shadow-lg text-boop-brown overflow-hidden shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              profile.pet_name ? profile.pet_name[0] : <User />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2">
              <div>
                <h1 className="text-2xl font-bold text-boop-brown">{profile.pet_name || 'New Pet'}</h1>
                <p className="text-gray-500 text-sm">{profile.breed} • {profile.human_name}'s Human</p>
              </div>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-boop-brown text-boop-brown rounded-full text-sm font-bold hover:bg-boop-cream transition-colors flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit Profile
                </button>
              )}
            </div>
            
            <p className="text-gray-700 mt-2">{profile.bio || 'No bio yet.'}</p>

            {/* Stats */}
            <div className="flex items-center justify-center sm:justify-start gap-6 mt-4 pt-4 border-t border-gray-100">
              <div className="text-center">
                <span className="block font-bold text-lg text-gray-800">{userPosts.length}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Posts</span>
              </div>
              <div className="text-center">
                <span className="block font-bold text-lg text-gray-800">0</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Followers</span>
              </div>
              <div className="text-center">
                <span className="block font-bold text-lg text-gray-800">0</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Following</span>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Form (Conditional) */}
        {isEditing && (
          <div className="bg-boop-cream/30 p-6 border-t border-boop-brown/10">
            <h3 className="font-bold text-boop-brown mb-4">Update Details</h3>
            <form onSubmit={updateProfile} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pet Name</label>
                  <input
                    type="text"
                    value={profile.pet_name || ''}
                    onChange={(e) => setProfile({ ...profile, pet_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-boop-brown outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Breed</label>
                  <input
                    type="text"
                    value={profile.breed || ''}
                    onChange={(e) => setProfile({ ...profile, breed: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-boop-brown outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Human's Name</label>
                <input
                  type="text"
                  value={profile.human_name || ''}
                  onChange={(e) => setProfile({ ...profile, human_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-boop-brown outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  rows="3"
                  value={profile.bio || ''}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-boop-brown outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Avatar URL</label>
                <input
                  type="url"
                  value={profile.avatar_url || ''}
                  onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-boop-brown outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 bg-boop-brown text-white font-bold py-2 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-2 border border-gray-300 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Posts Grid */}
      <div>
        <div className="flex items-center gap-2 mb-4 text-boop-brown font-bold text-lg">
          <Grid size={20} />
          <span>Posts</span>
        </div>
        
        {userPosts.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500">No posts yet. Time to boop!</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1 sm:gap-4">
            {userPosts.map((post) => (
              <div key={post.id} className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group">
                <img 
                  src={post.image_url} 
                  alt={post.pet_name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white font-bold">
                  <span>{post.boop_count} Boops</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePost(post.id);
                    }}
                    className="mt-2 p-2 bg-red-500/80 rounded-full hover:bg-red-600 transition-colors"
                    title="Delete Post"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

