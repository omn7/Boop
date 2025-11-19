import React, { useState, useEffect } from 'react';
import { PawPrint, PlusSquare, LogOut, User, Search, Bell, Home, Dog } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const Navbar = ({ session, onNewPostClick, onSignOut, userProfile, darkMode, toggleDarkMode }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.length >= 2) {
        performSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  useEffect(() => {
    if (!session?.user) return;

    fetchNotifications();
    
    // Subscribe to new notifications
    const subscription = supabase
      .channel('notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `recipient_id=eq.${session.user.id}`
      }, (payload) => {
        fetchNotifications(); // Refresh on new notification
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [session]);

  const fetchNotifications = async () => {
    try {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          sender:sender_id (
            pet_name,
            avatar_url,
            username
          )
        `)
        .eq('recipient_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async () => {
    if (unreadCount === 0) return;
    
    try {
      if (!session?.user) return;
      
      await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', session.user.id)
        .eq('read', false);
      
      setUnreadCount(0);
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const performSearch = async () => {
    setIsSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username, pet_name, avatar_url')
        .ilike('username', `%${searchQuery}%`)
        .limit(5);
      
      if (data) setSearchResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const NotificationList = () => (
    <>
      <div className="p-3 border-b border-gray-100 dark:border-gray-800 font-bold text-boop-brown text-sm dark:text-boop-cream">
        Notifications
      </div>
      <div className="max-h-80 overflow-y-auto bg-white dark:bg-zinc-900">
        {notifications.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-6 text-sm">No notifications yet.</p>
        ) : (
          notifications.map((notification) => (
            <div 
              key={notification.id}
              className={`p-3 hover:bg-boop-cream dark:hover:bg-zinc-800 transition-colors flex gap-3 items-start ${!notification.read ? 'bg-boop-cream/30 dark:bg-zinc-800/50' : ''}`}
            >
              <div className="w-8 h-8 bg-boop-cream rounded-full flex items-center justify-center text-boop-brown font-bold text-xs overflow-hidden shrink-0">
                {notification.sender?.avatar_url ? (
                  <img src={notification.sender.avatar_url} alt={notification.sender.pet_name} className="w-full h-full object-cover" />
                ) : (
                  notification.sender?.pet_name?.[0] || '?'
                )}
              </div>
              <div className="text-sm">
                <p className="text-gray-800 dark:text-gray-200">
                  <span className="font-bold">{notification.sender?.pet_name || 'Someone'}</span>
                  {notification.type === 'follow' ? ' started following you.' : ' booped your post!'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(notification.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );

  const SearchResultsList = () => (
    <>
      {searchResults.map((result) => (
        <div 
          key={result.username}
          onClick={() => {
            navigate(`/u/${result.username}`);
            setSearchQuery('');
            setSearchResults([]);
          }}
          className="p-3 hover:bg-boop-cream dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-3 transition-colors bg-white dark:bg-zinc-900"
        >
          <div className="w-8 h-8 bg-boop-cream rounded-full flex items-center justify-center text-boop-brown font-bold text-xs overflow-hidden">
            {result.avatar_url ? (
              <img src={result.avatar_url} alt={result.pet_name} className="w-full h-full object-cover" />
            ) : (
              result.pet_name?.[0] || '?'
            )}
          </div>
          <div>
            <p className="font-bold text-sm text-gray-800 dark:text-gray-200">{result.pet_name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">@{result.username}</p>
          </div>
        </div>
      ))}
    </>
  );

  return (
    <nav className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-boop-brown dark:text-boop-cream font-bold text-2xl cursor-pointer shrink-0">
          <PawPrint size={32} />
          <span className="hidden sm:inline">Boop</span>
        </Link>

        {/* Search Bar (Desktop & Mobile) */}
        <div className="flex-1 max-w-2xl relative mx-4">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="text-gray-400" size={20} />
                </div>
                <input 
                    type="text" 
                    placeholder="Search Boop" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border-none rounded-full leading-5 bg-gray-100 dark:bg-zinc-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-boop-brown sm:text-sm transition-colors"
                />
            </div>
            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
                <div className="absolute top-full left-0 w-full mt-1 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
                  <SearchResultsList />
                </div>
            )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            
            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-4">
                <button
                  onClick={toggleDarkMode}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors"
                  title={darkMode ? "Wake up!" : "Sleep time!"}
                >
                  <Dog size={24} className={`transition-transform duration-300 ${darkMode ? 'rotate-12 text-indigo-400' : 'text-orange-500'}`} />
                  <span className="font-medium hidden md:inline">{darkMode ? 'Dark' : 'Light'}</span>
                </button>

                <Link to="/" className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors" title="Home">
                    <Home size={24} />
                </Link>
                
                <div className="relative">
                    <button 
                        onClick={() => {
                            setShowNotifications(!showNotifications);
                            if (!showNotifications) markAsRead();
                        }}
                        className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full transition-colors relative"
                        title="Notifications"
                    >
                        <Bell size={24} />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                        )}
                    </button>
                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
                            <NotificationList />
                        </div>
                    )}
                </div>

                <button 
                    onClick={onNewPostClick}
                    className="flex items-center gap-2 bg-boop-brown text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition-all font-medium"
                >
                    <PlusSquare size={20} />
                    <span>Create</span>
                </button>

                <div className="relative">
                    <button 
                        onClick={() => setShowProfileMenu(!showProfileMenu)}
                        className="flex items-center gap-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <div className="w-8 h-8 bg-boop-brown rounded-full flex items-center justify-center text-white font-bold overflow-hidden">
                            {userProfile?.avatar_url ? (
                              <img src={userProfile.avatar_url} alt={userProfile.pet_name} className="w-full h-full object-cover" />
                            ) : (
                              userProfile?.pet_name?.[0] || '?'
                            )}
                        </div>
                    </button>
                    {/* Dropdown Menu */}
                    {showProfileMenu && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
                            <Link 
                                to="/profile" 
                                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                                onClick={() => setShowProfileMenu(false)}
                            >
                                <User size={16} /> Profile
                            </Link>
                            <button 
                                onClick={() => {
                                    setShowProfileMenu(false);
                                    onSignOut();
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 flex items-center gap-2"
                            >
                                <LogOut size={16} /> Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Actions (Simplified) */}
            <div className="md:hidden flex items-center gap-2">
                 <button
                    onClick={toggleDarkMode}
                    className="p-2 text-boop-brown dark:text-boop-cream hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full"
                 >
                    <Dog size={24} className={darkMode ? 'text-indigo-400' : 'text-orange-500'} />
                 </button>
                 <button 
                    onClick={onNewPostClick}
                    className="p-2 text-boop-brown dark:text-boop-cream hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full"
                >
                    <PlusSquare size={24} />
                </button>
                <div className="relative">
                    <button
                      onClick={() => {
                        setShowNotifications(!showNotifications);
                        if (!showNotifications) markAsRead();
                      }}
                      className="p-2 text-boop-brown dark:text-boop-cream hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full relative"
                    >
                      <Bell size={24} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                      )}
                    </button>
                     {showNotifications && (
                        <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden z-50">
                            <NotificationList />
                        </div>
                    )}
                </div>
                <Link to="/profile" className="p-2 text-boop-brown dark:text-boop-cream hover:bg-gray-100 dark:hover:bg-zinc-900 rounded-full">
                    <User size={24} />
                </Link>
            </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;
