"use client";
import { Search, Bell, User, LogOut } from 'lucide-react';
import { useAdminAuth } from '@/app/admin/AdminAuthContext';
import { useState, useEffect } from 'react';

export default function AdminHeader() {
  const { user, logout } = useAdminAuth();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div className="px-6 py-4 border-b border-neutral-700 bg-neutral-800/50 backdrop-blur-sm flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Поиск по админке..."
            className="pl-10 pr-4 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="flex items-center space-x-3">
        <button className="relative p-2 text-neutral-400 hover:text-white transition-colors" disabled>
          <Bell className="w-5 h-5" />
        </button>
        <div className="flex items-center space-x-2">
          {user?.avatar ? (
            <img src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full object-cover" />
          ) : (
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          )}
          <span className="text-sm font-medium">{user?.name || user?.username || 'Админ'}</span>
        </div>
        <button className="p-2 text-neutral-400 hover:text-white transition-colors" onClick={logout} title="Выйти">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
} 