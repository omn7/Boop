import React from 'react';
import { PawPrint, PlusSquare, LogOut, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ onNewPostClick, onSignOut }) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-boop-cream border-b-2 border-boop-brown/20 sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 text-boop-brown font-bold text-2xl cursor-pointer">
          <PawPrint size={28} />
          <span>Boop</span>
        </Link>
        <div className="flex items-center gap-3">
          <button 
            onClick={onNewPostClick}
            className="flex items-center gap-2 bg-boop-brown text-white px-4 py-2 rounded-full hover:bg-opacity-90 transition-all font-medium"
          >
            <PlusSquare size={20} />
            <span className="hidden sm:inline">New Post</span>
          </button>
          <button
            onClick={() => navigate('/profile')}
            className="p-2 text-boop-brown hover:bg-boop-brown/10 rounded-full transition-colors"
            title="Profile"
          >
            <User size={20} />
          </button>
          <button
            onClick={onSignOut}
            className="p-2 text-boop-brown hover:bg-boop-brown/10 rounded-full transition-colors"
            title="Sign Out"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
