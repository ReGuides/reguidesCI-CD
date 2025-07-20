'use client';

import { useState, useEffect } from 'react';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface Friend {
  _id: string;
  id: string;
  name: string;
  url: string;
  logo: string;
}

export default function FriendsSection() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/friends');
        if (!response.ok) {
          throw new Error('Failed to fetch friends');
        }
        
        const data = await response.json();
        setFriends(data);
      } catch (error) {
        console.error('Error fetching friends:', error);
        setFriends([]); // Устанавливаем пустой массив в случае ошибки
      } finally {
        setLoading(false);
      }
    };

    fetchFriends();
  }, []);

  // Если друзей нет, не показываем секцию
  if (!loading && friends.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto mt-12 sm:mt-16 mb-12 px-4">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Друзья проекта</h2>
        <div className="flex justify-center">
          <LoadingSpinner size="md" className="text-accent" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto mt-12 sm:mt-16 mb-12 px-4">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">Друзья проекта</h2>
      <div className="flex gap-4 sm:gap-8 flex-wrap items-center justify-center">
        {friends.map(friend => (
          <a 
            key={`friend-${friend._id}`} 
            href={friend.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex flex-col items-center gap-2 bg-neutral-800 rounded-xl p-3 sm:p-4 hover:bg-neutral-700 transition shadow"
          >
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white rounded-full flex items-center justify-center">
              <span className="text-neutral-800 font-bold text-sm">{friend.name.charAt(0)}</span>
            </div>
            <span className="text-white font-semibold text-sm sm:text-base text-center">{friend.name}</span>
          </a>
        ))}
      </div>
    </div>
  );
} 