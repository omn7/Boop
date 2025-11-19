import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Feed from './components/Feed';
import Auth from './components/Auth';
import Profile from './components/Profile';
import { X } from 'lucide-react';
import { supabase } from './supabaseClient';

function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tableError, setTableError] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [newPost, setNewPost] = useState({
    bio: '',
    imageUrl: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;

      setTableError(false);

      // Fetch author profiles
      const userIds = [...new Set(postsData.map(p => p.user_id).filter(Boolean))];
      let profilesMap = {};
      
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds);
        
        if (!profilesError && profilesData) {
          profilesData.forEach(p => {
            profilesMap[p.id] = p;
          });
        }
      }

      // Map snake_case DB columns to camelCase for components if needed, 
      // or just ensure we use the right keys. 
      // Let's map them to match our existing component expectations.
      const formattedPosts = postsData.map(post => {
        const author = profilesMap[post.user_id] || {};
        return {
          _id: post.id,
          userId: post.user_id, // Added userId
          username: author.username, // Added username
          authorAvatar: author.avatar_url, // Added avatar
          petName: post.pet_name,
          breed: post.breed,
          humanName: post.human_name,
          bio: post.bio,
          imageUrl: post.image_url,
          boopCount: post.boop_count
        };
      });

      setPosts(formattedPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      if (error.code === 'PGRST205' || error.message.includes('Could not find the table')) {
        setTableError(true);
      }
    }
  };

  const fetchUserProfile = async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (data) setUserProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    if (session) {
      fetchPosts();
      fetchUserProfile();
    }
  }, [session]);

  // Handle Boop
  const handleBoop = async (id) => {
    try {
      // 1. Get current count and user_id
      const { data: currentPost, error: fetchError } = await supabase
        .from('posts')
        .select('boop_count, user_id')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;

      // 2. Increment
      const newCount = (currentPost.boop_count || 0) + 1;

      // 3. Update
      const { error: updateError } = await supabase
        .from('posts')
        .update({ boop_count: newCount })
        .eq('id', id);

      if (updateError) throw updateError;

      // 4. Send Notification (if not booping own post)
      if (currentPost.user_id !== session.user.id) {
        await supabase
          .from('notifications')
          .insert([{
            type: 'boop',
            sender_id: session.user.id,
            recipient_id: currentPost.user_id,
            post_id: id,
            read: false
          }]);
      }
      
      // Optimistic update or re-fetch
      setPosts(posts.map(post => 
        post._id === id ? { ...post, boopCount: newCount } : post
      ));
    } catch (error) {
      console.error('Error booping:', error);
    }
  };

  // Handle Delete Post
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;

      setPosts(posts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post');
    }
  };

  // Handle New Post Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userProfile) {
      alert("Please set up your profile first!");
      return;
    }

    try {
      const { error } = await supabase
        .from('posts')
        .insert([
          {
            user_id: session.user.id, // Add user_id to link post to user
            pet_name: userProfile.pet_name || 'Unknown Pet',
            breed: userProfile.breed || 'Unknown Breed',
            human_name: userProfile.human_name || 'Unknown Human',
            bio: newPost.bio,
            image_url: newPost.imageUrl,
            boop_count: 0
          }
        ]);
      
      if (error) throw error;

      setIsModalOpen(false);
      setNewPost({ bio: '', imageUrl: '' });
      fetchPosts();
      navigate('/'); // Go to feed after posting
      
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!session) {
    return <Auth />;
  }

  if (tableError) {
    return (
      <div className="min-h-screen bg-boop-cream flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full border border-boop-brown/10">
          <h2 className="text-2xl font-bold text-boop-brown mb-4">Database Setup Required</h2>
          <p className="mb-4 text-gray-700">
            The <code className="bg-gray-100 px-1 rounded">posts</code> table was not found in your Supabase database.
          </p>
          <p className="mb-2 text-gray-600">
            Please go to the <strong>SQL Editor</strong> in your Supabase Dashboard and run the following query to create the table and set up permissions:
          </p>
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm mb-6 border border-gray-200 font-mono">
{`create table posts (
  id bigint generated by default as identity primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid references auth.users, -- Added user_id
  pet_name text not null,
  breed text not null,
  human_name text not null,
  bio text,
  image_url text not null,
  boop_count bigint default 0
);

-- Enable Row Level Security
alter table posts enable row level security;

-- Allow everyone to view posts
create policy "Public posts are viewable by everyone"
on posts for select
to public
using (true);

-- Allow authenticated users to insert posts
create policy "Authenticated users can insert posts"
on posts for insert
to authenticated
with check (true);

-- Allow authenticated users to update posts (for boops)
create policy "Authenticated users can update posts"
on posts for update
to authenticated
using (true);

-- Create profiles table
create table profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  pet_name text,
  breed text,
  human_name text,
  bio text,
  avatar_url text
);

alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- Trigger to create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, pet_name, human_name)
  values (new.id, 'New Pet', 'Human');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();`}
          </pre>
          <button 
            onClick={fetchPosts}
            className="w-full bg-boop-brown text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-colors"
          >
            I've ran the SQL, try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans text-gray-800 dark:text-gray-100 bg-white dark:bg-black transition-colors duration-300`}>
      <Navbar 
        session={session}
        onNewPostClick={() => setIsModalOpen(true)} 
        onSignOut={handleSignOut}
        userProfile={userProfile}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />
      
      <main>
        <Routes>
          <Route 
            path="/" 
            element={
              <Feed 
                posts={posts} 
                onBoop={handleBoop} 
                onDelete={handleDeletePost}
                currentUserId={session?.user?.id}
              />
            } 
          />
          <Route path="/profile" element={<Profile session={session} />} />
          <Route path="/u/:username" element={<Profile session={session} />} />
        </Routes>
      </main>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-xl">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X size={24} />
            </button>
            
            <h2 className="text-2xl font-bold text-boop-brown mb-6">New Pet Post</h2>
            
            <div className="mb-6 p-4 bg-boop-cream rounded-lg flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-boop-brown font-bold border border-boop-brown/20">
                {userProfile?.pet_name?.[0] || '?'}
              </div>
              <div>
                <p className="font-bold text-boop-brown">{userProfile?.pet_name || 'Loading...'}</p>
                <p className="text-xs text-gray-500">Posting as {userProfile?.breed}</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-boop-brown outline-none"
                  value={newPost.imageUrl}
                  onChange={e => setNewPost({...newPost, imageUrl: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                <textarea 
                  rows="3"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-boop-brown outline-none resize-none"
                  placeholder="What's on your mind?"
                  value={newPost.bio}
                  onChange={e => setNewPost({...newPost, bio: e.target.value})}
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full bg-boop-brown text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Post to Boop
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

