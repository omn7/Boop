import React from 'react';
import { Bot, Users, Compass, MoreHorizontal, Shield, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const menuItems = [
    { icon: <Bot size={24} />, label: 'AI Chatbot', path: '/ai-chat' },
    { icon: <Users size={24} />, label: 'Community', path: '/community' },
    { icon: <Compass size={24} />, label: 'Explore', path: '/explore' },
    { icon: <MoreHorizontal size={24} />, label: 'More', path: '/more' },
  ];

  const footerItems = [
    { icon: <Shield size={20} />, label: 'Privacy Policy', path: '/privacy' },
    { icon: <FileText size={20} />, label: 'User Agreement', path: '/terms' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 sticky top-16 h-[calc(100vh-4rem)] p-4 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
      <div className="space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-700 dark:text-gray-200 transition-colors"
          >
            {item.icon}
            <span className="font-medium text-lg">{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
        <div className="space-y-2">
            {footerItems.map((item) => (
            <Link
                key={item.label}
                to={item.path}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-500 dark:text-gray-400 transition-colors text-sm"
            >
                {item.icon}
                <span>{item.label}</span>
            </Link>
            ))}
        </div>
        <p className="text-xs text-gray-400 mt-4 px-2">© 2025 Boop. created by Om Narkhede</p>
      </div>
    </aside>
  );
};

export default Sidebar;
