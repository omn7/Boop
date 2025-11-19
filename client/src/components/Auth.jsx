import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { PawPrint } from 'lucide-react';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        if (data.user && !data.session) {
          setMessage({ 
            type: 'success', 
            text: 'Account created! Please check your email to confirm your registration.' 
          });
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setMessage({ type: 'error', text: error.message });
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-boop-cream flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl border border-boop-brown/10 overflow-hidden flex flex-col md:flex-row">
        
        {/* Banner Image - Desktop Only */}
        <div className="hidden md:block w-1/2 bg-gray-100 relative">
          <img 
            src="/bner.png" 
            alt="Welcome to Boop" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Auth Form */}
        <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
          <div className="flex flex-col items-center mb-8">
            <div className="text-boop-brown mb-2">
              <PawPrint size={48} />
            </div>
            <h1 className="text-3xl font-bold text-boop-brown">Boop</h1>
            <p className="text-gray-500">Where pets connect.</p>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {isLogin ? 'Welcome Back!' : 'Join the Pack'}
          </h2>

          {message.text && (
            <div className={`mb-4 p-3 rounded-lg text-sm ${
              message.type === 'error' 
                ? 'bg-red-100 text-red-700 border border-red-200' 
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="human@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-boop-brown focus:border-transparent outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-boop-brown focus:border-transparent outline-none"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-boop-brown text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Loading...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-boop-brown hover:underline text-sm font-medium"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
