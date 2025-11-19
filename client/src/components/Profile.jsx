import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { User, Save, Loader2, Grid, Edit2, Trash2, X } from 'lucide-react';

export default function Profile({ session }) {
  const { username } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    id: '',
    username: '',
    pet_name: '',
    breed: '',
    human_name: '',
    bio: '',
    avatar_url: ''
  });
  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);

  const isOwnProfile = !username || (session?.user?.id === profile.id);

  useEffect(() => {
    getProfile();
  }, [session, username]);

  const getProfile = async () => {
    try {
      setLoading(true);
      const { user } = session;

      let query = supabase
        .from('profiles')
        .select(`id, username, pet_name, breed, human_name, bio, avatar_url`);

      if (username) {
        query = query.eq('username', username);
      } else {
        query = query.eq('id', user.id);
      }

      let { data, error } = await query.single();

      if (error) {
        if (error.code === 'PGRST116' && username) {
            // Profile not found
            alert("User not found!");
            navigate('/');
            return;
        }
        if (error.code !== 'PGRST116') throw error;
      }

      if (data) {
        setProfile(data);
        getUserPosts(data.id);
        getFollowStats(data.id);
        if (!isOwnProfile) {
          checkIfFollowing(data.id);
        }
      }
    } catch (error) {
      console.warn(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getFollowStats = async (userId) => {
    try {
      // Get followers count
      const { count: followers } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId);
      
      // Get following count
      const { count: following } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId);

      setFollowersCount(followers || 0);
      setFollowingCount(following || 0);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const checkIfFollowing = async (profileId) => {
    try {
      const { data } = await supabase
        .from('follows')
        .select('*')
        .eq('follower_id', session.user.id)
        .eq('following_id', profileId)
        .single();
      
      setIsFollowing(!!data);
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const handleFollowToggle = async () => {
    try {
      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('follows')
          .delete()
          .eq('follower_id', session.user.id)
          .eq('following_id', profile.id);
        
        if (error) throw error;
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        // Follow
        const { error } = await supabase
          .from('follows')
          .insert([
            { follower_id: session.user.id, following_id: profile.id }
          ]);
        
        if (error) throw error;
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);

        // Send Notification
        await supabase
          .from('notifications')
          .insert([{
            type: 'follow',
            sender_id: session.user.id,
            recipient_id: profile.id,
            read: false
          }]);

      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const fetchFollowersList = async () => {
    try {
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select('follower_id')
        .eq('following_id', profile.id);

      if (followsError) throw followsError;

      const followerIds = followsData.map(f => f.follower_id);

      if (followerIds.length === 0) {
        setFollowersList([]);
        setShowFollowersModal(true);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('username, pet_name, avatar_url, id')
        .in('id', followerIds);

      if (profilesError) throw profilesError;

      setFollowersList(profilesData);
      setShowFollowersModal(true);
    } catch (error) {
      console.error('Error fetching followers:', error);
    }
  };

  const fetchFollowingList = async () => {
    try {
      const { data: followsData, error: followsError } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', profile.id);

      if (followsError) throw followsError;

      const followingIds = followsData.map(f => f.following_id);

      if (followingIds.length === 0) {
        setFollowingList([]);
        setShowFollowingModal(true);
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('username, pet_name, avatar_url, id')
        .in('id', followingIds);

      if (profilesError) throw profilesError;

      setFollowingList(profilesData);
      setShowFollowingModal(true);
    } catch (error) {
      console.error('Error fetching following:', error);
    }
  };

  const getUserPosts = async (userId) => {
    try {
      // Note: This requires the 'user_id' column to be added to the 'posts' table
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
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
                <p className="text-gray-500 text-sm">@{profile.username || 'no_username'} • {profile.breed} • {profile.human_name}'s Human</p>
              </div>
              {isOwnProfile && !isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-boop-brown text-boop-brown rounded-full text-sm font-bold hover:bg-boop-cream transition-colors flex items-center gap-2"
                >
                  <Edit2 size={16} />
                  Edit Profile
                </button>
              )}
              {!isOwnProfile && (
                <button 
                  onClick={handleFollowToggle}
                  onMouseEnter={(e) => isFollowing && (e.target.innerText = "Unfollow")}
                  onMouseLeave={(e) => isFollowing && (e.target.innerText = "Following")}
                  className={`px-6 py-2 rounded-full text-sm font-bold transition-all w-32 ${
                    isFollowing 
                      ? 'bg-white border-2 border-gray-200 text-gray-800 hover:border-red-200 hover:text-red-500 hover:bg-red-50' 
                      : 'bg-boop-brown text-white hover:bg-opacity-90 border-2 border-transparent'
                  }`}
                >
                  {isFollowing ? 'Following' : 'Follow'}
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
              <button 
                onClick={fetchFollowersList}
                className="text-center hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
              >
                <span className="block font-bold text-lg text-gray-800">{followersCount}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Followers</span>
              </button>
              <button 
                onClick={fetchFollowingList}
                className="text-center hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors cursor-pointer"
              >
                <span className="block font-bold text-lg text-gray-800">{followingCount}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wide">Following</span>
              </button>
            </div>
          </div>
        </div>

        {/* Followers Modal */}
        {showFollowersModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col shadow-xl relative">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-boop-brown">Followers</h3>
                <button 
                  onClick={() => setShowFollowersModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="overflow-y-auto p-2">
                {followersList.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No followers yet.</p>
                ) : (
                  followersList.map((follower) => (
                    <div 
                      key={follower.id}
                      onClick={() => {
                        navigate(follower.username ? `/u/${follower.username}` : '/');
                        setShowFollowersModal(false);
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-boop-cream rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 bg-boop-cream rounded-full flex items-center justify-center text-boop-brown font-bold overflow-hidden border border-boop-brown/10">
                        {follower.avatar_url ? (
                          <img src={follower.avatar_url} alt={follower.pet_name} className="w-full h-full object-cover" />
                        ) : (
                          follower.pet_name?.[0] || '?'
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{follower.pet_name}</p>
                        <p className="text-xs text-gray-500">@{follower.username || 'user'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Following Modal */}
        {showFollowingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] flex flex-col shadow-xl relative">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-lg text-boop-brown">Following</h3>
                <button 
                  onClick={() => setShowFollowingModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="overflow-y-auto p-2">
                {followingList.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Not following anyone yet.</p>
                ) : (
                  followingList.map((following) => (
                    <div 
                      key={following.id}
                      onClick={() => {
                        navigate(following.username ? `/u/${following.username}` : '/');
                        setShowFollowingModal(false);
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-boop-cream rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 bg-boop-cream rounded-full flex items-center justify-center text-boop-brown font-bold overflow-hidden border border-boop-brown/10">
                        {following.avatar_url ? (
                          <img src={following.avatar_url} alt={following.pet_name} className="w-full h-full object-cover" />
                        ) : (
                          following.pet_name?.[0] || '?'
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-800">{following.pet_name}</p>
                        <p className="text-xs text-gray-500">@{following.username || 'user'}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Form (Conditional) */}
        {isEditing && (
          <div className="bg-boop-cream/30 p-6 border-t border-boop-brown/10">
            <h3 className="font-bold text-boop-brown mb-4">Update Details</h3>
            <form onSubmit={updateProfile} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username (Unique)</label>
                <input
                  type="text"
                  value={profile.username || ''}
                  onChange={(e) => setProfile({ ...profile, username: e.target.value.toLowerCase().replace(/\s/g, '') })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-boop-brown outline-none"
                  placeholder="e.g. boopster"
                />
              </div>
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
                  {isOwnProfile && (
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
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

