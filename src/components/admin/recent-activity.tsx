'use client';

import { Clock, Eye, MousePointer, TrendingUp, Users, FileText } from 'lucide-react';

interface ActivityItem {
  id: string;
  type: 'impression' | 'click' | 'user' | 'content' | 'advertisement';
  title: string;
  description: string;
  time: string;
  value?: number;
}

interface RecentActivityProps {
  activities: ActivityItem[];
}

export default function RecentActivity({ activities }: RecentActivityProps) {
  const getIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'impression':
        return <Eye className="w-4 h-4" />;
      case 'click':
        return <MousePointer className="w-4 h-4" />;
      case 'user':
        return <Users className="w-4 h-4" />;
      case 'content':
        return <FileText className="w-4 h-4" />;
      case 'advertisement':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getIconColor = (type: ActivityItem['type']) => {
    switch (type) {
      case 'impression':
        return 'text-blue-400 bg-blue-600/20';
      case 'click':
        return 'text-green-400 bg-green-600/20';
      case 'user':
        return 'text-purple-400 bg-purple-600/20';
      case 'content':
        return 'text-yellow-400 bg-yellow-600/20';
      case 'advertisement':
        return 'text-red-400 bg-red-600/20';
      default:
        return 'text-gray-400 bg-gray-600/20';
    }
  };

  return (
    <div className="bg-neutral-800 rounded-lg border border-neutral-700">
      <div className="p-6 border-b border-neutral-700">
        <h3 className="text-lg font-semibold text-white">Последние действия</h3>
      </div>
      <div className="p-6">
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${getIconColor(activity.type)}`}>
                {getIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm">{activity.title}</p>
                <p className="text-gray-400 text-xs mt-1">{activity.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-gray-500 text-xs">{activity.time}</span>
                  {activity.value && (
                    <span className="text-xs px-2 py-1 bg-neutral-700 rounded">
                      {activity.value}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
